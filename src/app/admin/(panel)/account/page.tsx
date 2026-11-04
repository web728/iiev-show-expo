import QRCode from "qrcode";
import { requirePermission } from "@/lib/auth/session";
import { connectDb } from "@/lib/db/connect";
import { AdminUser } from "@/models/admin";
import { decrypt } from "@/lib/security/crypto";
import { otpauthUrl } from "@/lib/security/totp";
import { ROLE_LABELS } from "@/lib/auth/rbac";
import { AdminHeader, Card, Flash, aInput, aBtnPrimary, aBtnSecondary } from "@/components/admin/ui";
import { changePasswordAction, startMfaAction, confirmMfaAction } from "../users/actions";

export const metadata = { title: "My account" };

export default async function AccountPage({ searchParams }: PageProps<"/admin/account">) {
  const me = await requirePermission("dashboard.view");
  const sp = await searchParams;
  let qrSvg: string | null = null;
  let secret: string | null = null;
  if (sp.enrol === "1" && !me.mfaEnabled) {
    await connectDb();
    const u = await AdminUser.findById(me.id).select("+mfaSecretEnc").lean<{ mfaSecretEnc?: string }>();
    if (u?.mfaSecretEnc) {
      secret = decrypt(u.mfaSecretEnc);
      qrSvg = await QRCode.toString(otpauthUrl(secret, me.email), { type: "svg", margin: 1 });
    }
  }
  return (
    <>
      <AdminHeader title="My account" subtitle={`${me.email} · ${ROLE_LABELS[me.role]}`} />
      <Flash sp={sp} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Change password">
          <form action={changePasswordAction} className="grid gap-3">
            <label className="grid gap-1 text-sm font-semibold">Current password<input name="current" type="password" required autoComplete="current-password" className={aInput} /></label>
            <label className="grid gap-1 text-sm font-semibold">New password<input name="next" type="password" required minLength={12} autoComplete="new-password" className={aInput} /></label>
            <label className="grid gap-1 text-sm font-semibold">Confirm new password<input name="confirm" type="password" required autoComplete="new-password" className={aInput} /></label>
            <button className={`${aBtnPrimary} justify-self-start`}>Update password</button>
          </form>
        </Card>
        <Card title="Two-factor authentication (TOTP)">
          {me.mfaEnabled ? (
            <p className="text-sm text-brand-green">Two-factor authentication is on. Ask a Super Admin to reset it if you lose your device.</p>
          ) : qrSvg ? (
            <div className="grid gap-3">
              <div className="w-44 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
              <p className="break-all font-mono text-xs text-ink-muted">Manual key: {secret}</p>
              <form action={confirmMfaAction} className="flex gap-2">
                <input name="code" inputMode="numeric" maxLength={6} required placeholder="123456" className={`${aInput} max-w-36`} aria-label="Authenticator code" />
                <button className={aBtnPrimary}>Confirm</button>
              </form>
            </div>
          ) : (
            <form action={startMfaAction} className="grid gap-3">
              <p className="text-sm text-ink-soft">Strongly recommended for every account, required for Super Admins in production.</p>
              <button className={`${aBtnSecondary} justify-self-start`}>Set up authenticator app</button>
            </form>
          )}
        </Card>
      </div>
    </>
  );
}
