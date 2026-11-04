"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { login, logout, hashPassword, passwordPolicyError, getAdmin, audit } from "@/lib/auth/session";
import { connectDb } from "@/lib/db/connect";
import { AdminUser, AdminSession } from "@/models/admin";
import { sha256, randomToken, hmac } from "@/lib/security/crypto";
import { rateLimit } from "@/lib/security/rate-limit";
import { getEmailAdapter } from "@/lib/email";
import { layout } from "@/lib/email/templates";
import { siteConfig } from "@/config/site";

export type FormState = { error?: string; ok?: string; mfa?: boolean } | null;

function safeNext(next: unknown) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/admin") && !n.startsWith("//") ? n : "/admin/";
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || "0.0.0.0";
  const parsed = z.object({ email: z.string().email(), password: z.string().min(1).max(200), totp: z.string().max(10).optional() }).safeParse({
    email: fd.get("email"),
    password: fd.get("password"),
    totp: fd.get("totp") || undefined,
  });
  if (!parsed.success) return { error: "Enter your email and password." };
  const r = await login(parsed.data.email, parsed.data.password, parsed.data.totp, ip, h.get("user-agent") || "");
  if (!r.ok) return { error: r.message, mfa: r.code === "MFA_REQUIRED" || r.code === "MFA_INVALID" };
  redirect(safeNext(fd.get("next")));
}

export async function logoutAction() {
  const admin = await getAdmin();
  await logout();
  if (admin) await audit(admin, "auth.logout", "AdminUser", admin.id);
  redirect("/admin/login/");
}

/** Accept an invite or complete a password reset (both are one-time hashed tokens). */
export async function setPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const token = String(fd.get("token") || "");
  const kind = fd.get("kind") === "reset" ? "reset" : "invite";
  const pw = String(fd.get("password") || "");
  if (pw !== String(fd.get("confirm") || "")) return { error: "Passwords don't match." };
  const policy = passwordPolicyError(pw);
  if (policy) return { error: policy };
  await connectDb();
  const field = kind === "reset" ? "resetTokenHash" : "inviteTokenHash";
  const expField = kind === "reset" ? "resetExpires" : "inviteExpires";
  const user = await AdminUser.findOne({ [field]: sha256(token), [expField]: { $gt: new Date() }, active: true });
  if (!user) return { error: "This link is invalid or has expired. Ask a Super Admin for a new one." };
  user.passwordHash = await hashPassword(pw);
  user.passwordChangedAt = new Date();
  user.set(field, undefined);
  user.set(expField, undefined);
  user.failedLogins = 0;
  user.lockedUntil = undefined;
  await user.save();
  await AdminSession.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  await audit({ id: String(user._id), sid: "", email: user.email, name: user.name, role: user.role, mfaEnabled: user.mfaEnabled }, kind === "reset" ? "auth.password_reset" : "auth.invite_accepted", "AdminUser", String(user._id));
  return { ok: "Password set. You can now sign in." };
}

/** Self-service reset request. Same response whether or not the account exists. */
export async function requestResetAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") || "").toLowerCase().trim();
  const generic: FormState = { ok: "If an active admin account exists for that email, a reset link has been sent. It expires in 1 hour." };
  if (!z.string().email().safeParse(email).success) return { error: "Enter a valid email." };
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || "0.0.0.0";
  await connectDb();
  const rl = await rateLimit(`reset:${hmac(ip, "ip")}`, 5, 3600);
  if (!rl.ok) return generic;
  const user = await AdminUser.findOne({ email, active: true });
  if (!user) return generic;
  const token = randomToken(32);
  user.resetTokenHash = sha256(token);
  user.resetExpires = new Date(Date.now() + 3600_000);
  await user.save();
  const link = `${siteConfig.url}/admin/set-password/?kind=reset&token=${token}`;
  await getEmailAdapter()
    .send({
      to: user.email,
      subject: "Reset your IIEV admin password",
      text: `Use this link within 1 hour to set a new password: ${link}\n\nIf you didn't request this, ignore this email.`,
      html: layout({ preheader: "Password reset", heading: "Reset your admin password", bodyHtml: "<p>Use the button below within 1 hour to set a new password. If you didn't request this, you can ignore this email.</p>", cta: { label: "Set new password", href: link } }),
    })
    .catch(() => undefined);
  await audit(null, "auth.reset_requested", "AdminUser", String(user._id));
  return generic;
}
