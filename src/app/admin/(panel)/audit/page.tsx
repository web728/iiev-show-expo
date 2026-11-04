import { requirePermission } from "@/lib/auth/session";
import { connectDb } from "@/lib/db/connect";
import { AuditEvent } from "@/models/admin";
import { AdminHeader, Table, Pager, aInput, aBtnSecondary, qsMerge } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Audit log" };

export default async function AuditPage({ searchParams }: PageProps<"/admin/audit">) {
  await requirePermission("audit.view");
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  await connectDb();
  const q: Record<string, unknown> = {};
  if (s("action")) q.action = new RegExp(`^${s("action").replace(/[^a-z._]/gi, "")}`);
  if (s("actor")) q.actorEmail = s("actor").toLowerCase();
  const page = Math.max(1, Number(s("page") || 1));
  const per = 50;
  const [rows, total] = await Promise.all([AuditEvent.find(q).sort({ createdAt: -1 }).skip((page - 1) * per).limit(per).lean(), AuditEvent.countDocuments(q)]);
  return (
    <>
      <AdminHeader title="Audit log" subtitle={`${total} events. Retained for accountability; personal values are redacted.`} />
      <form className="mb-4 grid gap-2 rounded-xl border border-line bg-white p-3 sm:grid-cols-[1fr_1fr_auto]">
        <input name="action" defaultValue={s("action")} placeholder="Action prefix (e.g. visitor., auth., content.)" className={aInput} aria-label="Action" />
        <input name="actor" defaultValue={s("actor")} placeholder="Actor email" className={aInput} aria-label="Actor" />
        <button className={aBtnSecondary}>Filter</button>
      </form>
      <Table head={["Time (IST)", "Actor", "Action", "Entity", "Summary"]} empty={!rows.length}>
        {(rows as unknown as { _id: string; createdAt: Date; actorEmail?: string; actorRole?: string; action: string; entity?: string; entityId?: string; summary?: string }[]).map((r) => (
          <tr key={String(r._id)}>
            <td className="whitespace-nowrap px-4 py-2.5 text-xs text-ink-muted">{formatDateTime(r.createdAt)}</td>
            <td className="px-4 py-2.5 text-xs">{r.actorEmail ?? "system"}<span className="block text-ink-muted">{r.actorRole}</span></td>
            <td className="px-4 py-2.5 font-mono text-xs">{r.action}</td>
            <td className="px-4 py-2.5 text-xs">{r.entity}{r.entityId ? <span className="block font-mono text-ink-muted">{r.entityId}</span> : null}</td>
            <td className="px-4 py-2.5 text-xs">{r.summary}</td>
          </tr>
        ))}
      </Table>
      <Pager page={page} pages={Math.ceil(total / per)} hrefFor={(p) => `/admin/audit/${qsMerge(sp, { page: p })}`} />
    </>
  );
}
