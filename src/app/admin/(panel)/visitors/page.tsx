import Link from "next/link";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { connectDb } from "@/lib/db/connect";
import { Visitor, VISITOR_STATUSES, type VisitorStatus } from "@/models/leads";
import { getCurrentEdition } from "@/lib/data/edition";
import { AdminHeader, Table, StatusBadge, Pager, Flash, aInput, aBtnPrimary, aBtnSecondary, qsMerge } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { approveAction } from "./actions";

export const metadata = { title: "Visitors" };

export default async function VisitorsPage({ searchParams }: PageProps<"/admin/visitors">) {
  const admin = await requirePermission("visitors.view");
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  await connectDb();
  const e = await getCurrentEdition();
  const q: Record<string, unknown> = { edition: s("edition") || e.slug };
  if (VISITOR_STATUSES.includes(s("status") as VisitorStatus)) q.status = s("status");
  if (s("q")) {
    const rx = new RegExp(s("q").replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 60), "i");
    q.$or = [{ fullName: rx }, { company: rx }, { email: rx }, { ref: rx }, { phone: rx }];
  }
  const page = Math.max(1, Number(s("page") || 1));
  const per = 40;
  const [rows, total] = await Promise.all([
    Visitor.find(q).sort({ createdAt: -1 }).skip((page - 1) * per).limit(per).select("ref fullName company designation industry status checkInCount createdAt").lean(),
    Visitor.countDocuments(q),
  ]);
  const editable = can(admin.role, "visitors.edit");
  return (
    <>
      <AdminHeader
        title="Visitors"
        subtitle={`${total} registrations · approval mode: ${e.registration.approvalMode}`}
        actions={
          <>
            {editable ? <Link href="/admin/visitors/new/" className={aBtnPrimary}>Walk-in registration</Link> : null}
            {can(admin.role, "visitors.export") ? <a href={`/api/admin/export/visitors/${qsMerge(sp, { page: undefined })}`} className={aBtnSecondary}>Export CSV</a> : null}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download from an API route, not a page */}
            {can(admin.role, "visitors.export") ? <a href="/api/admin/export/checkins/" className={aBtnSecondary}>Export check-ins</a> : null}
          </>
        }
      />
      <Flash sp={sp} />
      <form className="mb-4 grid gap-2 rounded-xl border border-line bg-white p-3 sm:grid-cols-[1fr_12rem_auto]">
        <input name="q" defaultValue={s("q")} placeholder="Search name, company, email, phone, VS- ID" className={aInput} aria-label="Search" />
        <select name="status" defaultValue={s("status")} className={aInput} aria-label="Status">
          <option value="">All statuses</option>
          {VISITOR_STATUSES.map((v) => <option key={v} value={v}>{v.replace(/_/g, " ")}</option>)}
        </select>
        <button className={aBtnPrimary}>Filter</button>
      </form>
      <Table head={["ID", "Name", "Company", "Industry", "Status", "Scans", "Registered", ""]} empty={!rows.length}>
        {(rows as unknown as { _id: string; ref: string; fullName: string; company: string; designation: string; industry: string; status: VisitorStatus; checkInCount: number; createdAt: Date }[]).map((v) => (
          <tr key={String(v._id)} className="hover:bg-mist/50">
            <td className="px-4 py-3 font-mono text-xs"><Link className="text-brand-blue hover:underline" href={`/admin/visitors/${v._id}/`}>{v.ref}</Link></td>
            <td className="px-4 py-3"><Link className="font-semibold text-ink hover:text-brand-green" href={`/admin/visitors/${v._id}/`}>{v.fullName}</Link><span className="block text-xs text-ink-muted">{v.designation}</span></td>
            <td className="px-4 py-3">{v.company}</td>
            <td className="px-4 py-3 text-xs">{v.industry}</td>
            <td className="px-4 py-3"><StatusBadge value={v.status} /></td>
            <td className="px-4 py-3">{v.checkInCount}</td>
            <td className="px-4 py-3 text-xs text-ink-muted">{formatDateTime(v.createdAt)}</td>
            <td className="px-4 py-3">
              {editable && v.status === "pending_review" ? (
                <form action={approveAction.bind(null, String(v._id), "/admin/visitors/")}><button className="text-xs font-bold text-brand-green">Approve</button></form>
              ) : null}
            </td>
          </tr>
        ))}
      </Table>
      <Pager page={page} pages={Math.ceil(total / per)} hrefFor={(p) => `/admin/visitors/${qsMerge(sp, { page: p })}`} />
    </>
  );
}
