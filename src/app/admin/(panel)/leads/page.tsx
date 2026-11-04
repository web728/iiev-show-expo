import Link from "next/link";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { connectDb } from "@/lib/db/connect";
import { Lead, LEAD_TYPES, LEAD_TYPE_LABELS, LEAD_STAGES, LEAD_STAGE_LABELS, type LeadType, type LeadStage } from "@/models/leads";
import { getCurrentEdition } from "@/lib/data/edition";
import { AdminHeader, Table, StatusBadge, Pager, aInput, aBtnSecondary, aBtnPrimary, qsMerge } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Leads" };

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const admin = await requirePermission("leads.view");
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  await connectDb();
  const e = await getCurrentEdition();
  const edition = s("edition") || e.slug;
  const q: Record<string, unknown> = { edition };
  if (LEAD_TYPES.includes(s("type") as LeadType)) q.type = s("type");
  if (LEAD_STAGES.includes(s("stage") as LeadStage)) q.stage = s("stage");
  if (s("assigned") === "me") q.assignedTo = admin.email;
  if (s("q")) {
    const rx = new RegExp(s("q").replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 60), "i");
    q.$or = [{ company: rx }, { fullName: rx }, { email: rx }, { ref: rx }];
  }
  const page = Math.max(1, Number(s("page") || 1));
  const per = 30;
  const [rows, total] = await Promise.all([
    Lead.find(q).sort({ createdAt: -1 }).skip((page - 1) * per).limit(per).select("ref type fullName company email stage assignedTo createdAt integrations").lean(),
    Lead.countDocuments(q),
  ]);
  const exportQs = qsMerge(sp, { page: undefined });

  return (
    <>
      <AdminHeader
        title="Leads & enquiries"
        subtitle={`${total} records · edition ${edition}`}
        actions={can(admin.role, "leads.export") ? <a href={`/api/admin/export/leads/${exportQs}`} className={aBtnSecondary}>Export CSV</a> : undefined}
      />
      <form className="mb-4 grid gap-2 rounded-xl border border-line bg-white p-3 sm:grid-cols-[1fr_11rem_11rem_9rem_auto]">
        <input name="q" defaultValue={s("q")} placeholder="Search company, name, email, ref" className={aInput} aria-label="Search" />
        <select name="type" defaultValue={s("type")} className={aInput} aria-label="Type">
          <option value="">All types</option>
          {LEAD_TYPES.map((t) => <option key={t} value={t}>{LEAD_TYPE_LABELS[t]}</option>)}
        </select>
        <select name="stage" defaultValue={s("stage")} className={aInput} aria-label="Stage">
          <option value="">All stages</option>
          {LEAD_STAGES.map((t) => <option key={t} value={t}>{LEAD_STAGE_LABELS[t]}</option>)}
        </select>
        <select name="assigned" defaultValue={s("assigned")} className={aInput} aria-label="Assignment">
          <option value="">Anyone</option>
          <option value="me">Assigned to me</option>
        </select>
        <button className={aBtnPrimary}>Filter</button>
      </form>
      <Table head={["Ref", "Company / name", "Type", "Stage", "Owner", "Sync", "Received"]} empty={!rows.length}>
        {(rows as unknown as { _id: string; ref: string; type: LeadType; fullName: string; company?: string; email: string; stage: LeadStage; assignedTo?: string; createdAt: Date; integrations?: { sheets?: string; organiserEmail?: string } }[]).map((l) => (
          <tr key={String(l._id)} className="hover:bg-mist/50">
            <td className="px-4 py-3 font-mono text-xs"><Link href={`/admin/leads/${l._id}/`} className="text-brand-blue hover:underline">{l.ref}</Link></td>
            <td className="px-4 py-3"><Link href={`/admin/leads/${l._id}/`} className="font-semibold text-ink hover:text-brand-green">{l.company || l.fullName}</Link><span className="block text-xs text-ink-muted">{l.fullName}</span></td>
            <td className="px-4 py-3">{LEAD_TYPE_LABELS[l.type]}</td>
            <td className="px-4 py-3"><StatusBadge value={l.stage} label={LEAD_STAGE_LABELS[l.stage]} /></td>
            <td className="px-4 py-3 text-xs">{l.assignedTo ?? "—"}</td>
            <td className="px-4 py-3 text-xs"><StatusBadge value={l.integrations?.sheets} label={`sheet: ${l.integrations?.sheets ?? "—"}`} /></td>
            <td className="px-4 py-3 text-xs text-ink-muted">{formatDateTime(l.createdAt)}</td>
          </tr>
        ))}
      </Table>
      <Pager page={page} pages={Math.ceil(total / per)} hrefFor={(p) => `/admin/leads/${qsMerge(sp, { page: p })}`} />
    </>
  );
}
