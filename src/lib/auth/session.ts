import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db/connect";
import { AdminSession, AdminUser, AuditEvent } from "@/models/admin";
import { randomToken, decrypt, hmac } from "@/lib/security/crypto";
import { verifyTotp } from "@/lib/security/totp";
import { rateLimit } from "@/lib/security/rate-limit";
import { can, type Permission, type Role } from "./rbac";

export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-iiev_admin" : "iiev_admin";
const SESSION_HOURS = Number(process.env.ADMIN_SESSION_HOURS || 10);
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

export type AdminContext = {
  id: string;
  sid: string;
  email: string;
  name: string;
  role: Role;
  mfaEnabled: boolean;
};

function jwtKey() {
  const s = process.env.APP_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("APP_SECRET is required in production");
  return new TextEncoder().encode(`${s || "dev-only-insecure-secret"}:admin-session`);
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}

export function passwordPolicyError(pw: string): string | null {
  if (pw.length < 12) return "Password must be at least 12 characters.";
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw)) return "Use upper- and lower-case letters and at least one number.";
  return null;
}

export type LoginOutcome =
  | { ok: true }
  | { ok: false; code: "INVALID" | "LOCKED" | "RATE_LIMITED" | "MFA_REQUIRED" | "MFA_INVALID" | "DB"; message: string };

const GENERIC = "Email or password is incorrect.";

export async function login(email: string, password: string, totp: string | undefined, ip: string, userAgent: string): Promise<LoginOutcome> {
  try {
    await connectDb();
  } catch {
    return { ok: false, code: "DB", message: "Admin service is temporarily unavailable." };
  }
  const ipLimit = await rateLimit(`login:ip:${hmac(ip, "ip")}`, 20, 15 * 60);
  const emailLimit = await rateLimit(`login:email:${hmac(email.toLowerCase(), "email")}`, 10, 15 * 60);
  if (!ipLimit.ok || !emailLimit.ok) return { ok: false, code: "RATE_LIMITED", message: "Too many attempts. Please wait 15 minutes and try again." };

  const user = await AdminUser.findOne({ email: email.toLowerCase().trim() }).select("+mfaSecretEnc");
  // Constant-ish work even when user doesn't exist (timing).
  const hash = user?.passwordHash || "$2a$12$CwTycUXWue0Thq9StjUM0uJ8.dxl3sV5uGkzjKn7Q0bqJ5C5hS9W6";
  const valid = await bcrypt.compare(password, hash);

  if (!user || !user.active || !user.passwordHash) return { ok: false, code: "INVALID", message: GENERIC };
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { ok: false, code: "LOCKED", message: "Account temporarily locked after repeated failures. Try again later or ask a Super Admin." };
  }
  if (!valid) {
    const failed = (user.failedLogins || 0) + 1;
    user.failedLogins = failed;
    if (failed >= MAX_FAILED) {
      user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60_000);
      user.failedLogins = 0;
    }
    await user.save();
    await AuditEvent.create({ actorEmail: user.email, action: "auth.login_failed", entity: "AdminUser", entityId: String(user._id), ip: hmac(ip, "ip") });
    return { ok: false, code: "INVALID", message: GENERIC };
  }
  if (user.mfaEnabled) {
    if (!totp) return { ok: false, code: "MFA_REQUIRED", message: "Enter the 6-digit code from your authenticator app." };
    if (!user.mfaSecretEnc || !verifyTotp(decrypt(user.mfaSecretEnc), totp)) {
      return { ok: false, code: "MFA_INVALID", message: "That authenticator code is not valid." };
    }
  }

  user.failedLogins = 0;
  user.lockedUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  const sid = randomToken(24);
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600_000);
  await AdminSession.create({ sid, userId: user._id, ip: hmac(ip, "ip"), userAgent: userAgent.slice(0, 200), mfaPassed: Boolean(user.mfaEnabled), expiresAt });
  const jwt = await new SignJWT({ sid }).setProtectedHeader({ alg: "HS256" }).setSubject(String(user._id)).setIssuedAt().setExpirationTime(expiresAt).sign(jwtKey());
  (await cookies()).set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  await AuditEvent.create({ actorId: String(user._id), actorEmail: user.email, actorRole: user.role, action: "auth.login", entity: "AdminUser", entityId: String(user._id), ip: hmac(ip, "ip") });
  return { ok: true };
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, jwtKey());
      await connectDb();
      await AdminSession.updateOne({ sid: payload.sid }, { $set: { revokedAt: new Date() } });
    } catch {
      /* ignore */
    }
  }
  jar.delete(SESSION_COOKIE);
}

/** Current admin (validated against DB on every request — revocation is immediate). */
export const getAdmin = cache(async (): Promise<AdminContext | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, jwtKey());
    await connectDb();
    const session = await AdminSession.findOne({ sid: payload.sid, revokedAt: null, expiresAt: { $gt: new Date() } }).lean<{ userId: unknown }>();
    if (!session) return null;
    const user = await AdminUser.findById(session.userId).lean<{ _id: unknown; email: string; name: string; role: Role; active: boolean; mfaEnabled: boolean; passwordChangedAt?: Date }>();
    if (!user || !user.active) return null;
    if (user.passwordChangedAt && payload.iat && user.passwordChangedAt.getTime() / 1000 > payload.iat + 5) return null;
    return { id: String(user._id), sid: String(payload.sid), email: user.email, name: user.name, role: user.role, mfaEnabled: user.mfaEnabled };
  } catch {
    return null;
  }
});

/** For admin pages & server actions: redirect to login / 403 when not allowed. */
export async function requirePermission(permission: Permission): Promise<AdminContext> {
  const admin = await getAdmin();
  if (!admin) {
    const h = await headers();
    const path = h.get("x-iiev-path") || "/admin/";
    redirect(`/admin/login/?next=${encodeURIComponent(path)}`);
  }
  if (!can(admin.role, permission)) redirect("/admin/forbidden/");
  return admin;
}

/** For route handlers: returns admin or null (caller responds 401/403). */
export async function apiPermission(permission: Permission): Promise<{ admin: AdminContext | null; status: 200 | 401 | 403 }> {
  const admin = await getAdmin();
  if (!admin) return { admin: null, status: 401 };
  if (!can(admin.role, permission)) return { admin: null, status: 403 };
  return { admin, status: 200 };
}

export async function audit(admin: AdminContext | null, action: string, entity: string, entityId?: string, summary?: string, diff?: unknown) {
  await connectDb();
  await AuditEvent.create({
    actorId: admin?.id,
    actorEmail: admin?.email,
    actorRole: admin?.role,
    action,
    entity,
    entityId,
    summary,
    diff,
  });
}
