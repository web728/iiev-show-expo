"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission, audit, hashPassword, passwordPolicyError, getAdmin } from "@/lib/auth/session";
import { connectDb } from "@/lib/db/connect";
import { AdminUser, AdminSession } from "@/models/admin";
import { ROLES, type Role } from "@/lib/auth/rbac";
import { randomToken, sha256, encrypt, decrypt } from "@/lib/security/crypto";
import { generateTotpSecret, verifyTotp } from "@/lib/security/totp";
import { getEmailAdapter } from "@/lib/email";
import { layout } from "@/lib/email/templates";
import { siteConfig } from "@/config/site";

const go = (path: string, msg: string, err = false, extra = "") => redirect(`${path}?${err ? "error" : "ok"}=${encodeURIComponent(msg)}${extra}`);

export async function inviteUserAction(fd: FormData) {
  const admin = await requirePermission("users.manage");
  const parsed = z.object({ email: z.string().email(), name: z.string().min(2).max(80), role: z.enum(ROLES) }).safeParse({ email: String(fd.get("email") || "").toLowerCase().trim(), name: fd.get("name"), role: fd.get("role") });
  if (!parsed.success) go("/admin/users/", "Enter a name, valid email and role.", true);
  await connectDb();
  if (await AdminUser.exists({ email: parsed.data!.email })) go("/admin/users/", "A user with that email already exists.", true);
  const token = randomToken(32);
  const u = await AdminUser.create({ ...parsed.data, inviteTokenHash: sha256(token), inviteExpires: new Date(Date.now() + 72 * 3600_000), invitedBy: admin.email });
  const link = `${siteConfig.url}/admin/set-password/?kind=invite&token=${token}`;
  const sent = await getEmailAdapter()
    .send({ to: u.email, subject: "You've been invited to the IIEV Show admin", text: `Set your password within 72 hours: ${link}`, html: layout({ preheader: "Admin invitation", heading: "You've been invited", bodyHtml: `<p>${admin.name} invited you to the India International EV Show admin panel. Set your password within 72 hours.</p>`, cta: { label: "Set password", href: link } }) })
    .catch(() => ({ status: "not_configured" as const }));
  await audit(admin, "users.invite", "AdminUser", String(u._id), `${u.email} as ${u.role}`);
  // When email isn't configured, show the one-time link to the inviting Super Admin once.
  go("/admin/users/", sent.status === "sent" ? `Invitation emailed to ${u.email}` : `User created. Email isn't configured — share this one-time link securely:`, false, sent.status === "sent" ? "" : `&link=${encodeURIComponent(link)}`);
}

export async function updateUserAction(id: string, fd: FormData) {
  const admin = await requirePermission("users.manage");
  await connectDb();
  const u = await AdminUser.findById(id);
  if (!u) go("/admin/users/", "Not found", true);
  const role = String(fd.get("role") || "") as Role;
  const active = fd.get("active") === "on";
  if (String(u!._id) === admin.id && (!active || role !== "super_admin")) go("/admin/users/", "You can't demote or deactivate your own account.", true);
  const changes: Record<string, unknown> = {};
  if (ROLES.includes(role) && role !== u!.role) { changes.role = { from: u!.role, to: role }; u!.role = role; }
  if (active !== u!.active) { changes.active = { from: u!.active, to: active }; u!.active = active; }
  await u!.save();
  if (changes.active || changes.role) await AdminSession.updateMany({ userId: u!._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  await audit(admin, "users.update", "AdminUser", id, u!.email, changes);
  go("/admin/users/", "User updated (their sessions were signed out)");
}

export async function resetLinkAction(id: string) {
  const admin = await requirePermission("users.manage");
  await connectDb();
  const u = await AdminUser.findById(id);
  if (!u) go("/admin/users/", "Not found", true);
  const token = randomToken(32);
  u!.resetTokenHash = sha256(token);
  u!.resetExpires = new Date(Date.now() + 3600_000);
  await u!.save();
  await audit(admin, "users.reset_link", "AdminUser", id, u!.email);
  go("/admin/users/", `One-time reset link for ${u!.email} (valid 1 hour):`, false, `&link=${encodeURIComponent(`${siteConfig.url}/admin/set-password/?kind=reset&token=${token}`)}`);
}

export async function resetMfaAction(id: string) {
  const admin = await requirePermission("users.manage");
  await connectDb();
  await AdminUser.updateOne({ _id: id }, { $set: { mfaEnabled: false }, $unset: { mfaSecretEnc: 1 } });
  await AdminSession.updateMany({ userId: id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  await audit(admin, "users.mfa_reset", "AdminUser", id);
  go("/admin/users/", "MFA reset — the user must enrol again");
}

// ---- Own account ----------------------------------------------------------

export async function changePasswordAction(fd: FormData) {
  const me = await getAdmin();
  if (!me) redirect("/admin/login/");
  const bcrypt = (await import("bcryptjs")).default;
  await connectDb();
  const u = await AdminUser.findById(me.id);
  const current = String(fd.get("current") || "");
  const next = String(fd.get("next") || "");
  if (!u?.passwordHash || !(await bcrypt.compare(current, u.passwordHash))) go("/admin/account/", "Current password is incorrect.", true);
  if (next !== String(fd.get("confirm") || "")) go("/admin/account/", "New passwords don't match.", true);
  const policy = passwordPolicyError(next);
  if (policy) go("/admin/account/", policy, true);
  u!.passwordHash = await hashPassword(next);
  u!.passwordChangedAt = new Date(Date.now() - 10_000);
  await u!.save();
  await AdminSession.updateMany({ userId: u!._id, sid: { $ne: me.sid }, revokedAt: null }, { $set: { revokedAt: new Date() } });
  await audit(me, "auth.password_changed", "AdminUser", me.id);
  go("/admin/account/", "Password changed. Other sessions were signed out.");
}

export async function startMfaAction() {
  const me = await getAdmin();
  if (!me) redirect("/admin/login/");
  await connectDb();
  const secret = generateTotpSecret();
  await AdminUser.updateOne({ _id: me.id }, { $set: { mfaSecretEnc: encrypt(secret), mfaEnabled: false } });
  go("/admin/account/", "Scan the code with your authenticator app, then enter a code to confirm.", false, "&enrol=1");
}

export async function confirmMfaAction(fd: FormData) {
  const me = await getAdmin();
  if (!me) redirect("/admin/login/");
  await connectDb();
  const u = await AdminUser.findById(me.id).select("+mfaSecretEnc");
  if (!u?.mfaSecretEnc || !verifyTotp(decrypt(u.mfaSecretEnc), String(fd.get("code") || ""))) go("/admin/account/", "That code didn't match. Try again.", true, "&enrol=1");
  u!.mfaEnabled = true;
  await u!.save();
  await audit(me, "auth.mfa_enabled", "AdminUser", me.id);
  go("/admin/account/", "Two-factor authentication is on.");
}
