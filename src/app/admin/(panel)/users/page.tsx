import { requirePermission } from "@/lib/auth/session";
import { connectDb } from "@/lib/db/connect";
import { AdminUser } from "@/models/admin";
import { ROLES, ROLE_LABELS, ROLE_PERMISSIONS, type Role } from "@/lib/auth/rbac";
import { AdminHeader, Card, Table, Flash, StatusBadge, aInput, aBtnPrimary } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { inviteUserAction, updateUserAction, resetLinkAction, resetMfaAction } from "./actions";

export const metadata = { title: "Users & roles" };

export default async function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  const me = await requirePermission("users.manage");
  const sp = await searchParams;
  await connectDb();
  const users = await AdminUser.find().sort({ active: -1, name: 1 }).lean<{ _id: string; email: string; name: string; role: Role; active: boolean; mfaEnabled: boolean; lastLoginAt?: Date; passwordHash?: string }[]>();
  const link = typeof sp.link === "string" ? sp.link : null;
  return (
    <>
      <AdminHeader title="Users & roles" subtitle="Least-privilege access. Deactivate former staff immediately." />
      <Flash sp={sp} />
      {link ? <p className="mb-5 break-all rounded-lg border border-brand-yellow bg-brand-yellow/10 p-3 font-mono text-xs">{link}</p> : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Table head={["User", "Role", "Status", "MFA", "Last sign-in", ""]}>
          {users.map((u) => (
            <tr key={String(u._id)}>
              <td className="px-4 py-3"><span className="font-semibold">{u.name}</span><span className="block text-xs text-ink-muted">{u.email}</span></td>
              <td className="px-4 py-3" colSpan={2}>
                <form action={updateUserAction.bind(null, String(u._id))} className="flex flex-wrap items-center gap-2">
                  <select name="role" defaultValue={u.role} className={`${aInput} w-auto`} aria-label="Role">{ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}</select>
                  <label className="flex items-center gap-1 text-xs"><input type="checkbox" name="active" defaultChecked={u.active} className="accent-brand-green" /> Active</label>
                  <button className="text-xs font-bold text-brand-blue">Save</button>
                  {!u.passwordHash ? <StatusBadge value="pending" label="invite pending" /> : null}
                </form>
              </td>
              <td className="px-4 py-3"><StatusBadge value={u.mfaEnabled ? "ok" : "skipped"} label={u.mfaEnabled ? "on" : "off"} /></td>
              <td className="px-4 py-3 text-xs text-ink-muted">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "—"}</td>
              <td className="px-4 py-3">
                {String(u._id) !== me.id ? (
                  <div className="flex flex-col gap-1 text-xs">
                    <form action={resetLinkAction.bind(null, String(u._id))}><button className="font-semibold text-brand-blue">Reset link</button></form>
                    {u.mfaEnabled ? <form action={resetMfaAction.bind(null, String(u._id))}><button className="font-semibold text-danger">Reset MFA</button></form> : null}
                  </div>
                ) : <span className="text-xs text-ink-muted">You</span>}
              </td>
            </tr>
          ))}
        </Table>
        <div className="grid content-start gap-6">
          <Card title="Invite a user">
            <form action={inviteUserAction} className="grid gap-3">
              <label className="grid gap-1 text-sm font-semibold">Name<input name="name" required className={aInput} /></label>
              <label className="grid gap-1 text-sm font-semibold">Email<input name="email" type="email" required className={aInput} /></label>
              <label className="grid gap-1 text-sm font-semibold">Role
                <select name="role" defaultValue="analyst" className={aInput}>{ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}</select>
              </label>
              <button className={`${aBtnPrimary} justify-self-start`}>Send invitation</button>
            </form>
          </Card>
          <Card title="Role permissions">
            <ul className="grid gap-2 text-xs">
              {ROLES.map((r) => <li key={r}><span className="font-bold">{ROLE_LABELS[r]}</span><span className="block text-ink-muted">{ROLE_PERMISSIONS[r].join(", ")}</span></li>)}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
