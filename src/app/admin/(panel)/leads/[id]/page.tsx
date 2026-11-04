import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { connectDb } from "@/lib/db/connect";
import { Lead, IntegrationJob, LEAD_STAGES, LEAD_STAGE_LABELS, LEAD_TYPE_LABELS, type LeadType, type LeadStage } from "@/models/leads";
import { AuditEvent, AdminUser } from "@/models/admin";
import { AdminHeader, Card, StatusBadge, Flash, aInput, aBtnPrimary, aBtnSecondary } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { updateLeadAction, addNoteAction, addTaskAction, toggleTaskAction, retryJobsAction } from "../actions";

export const metadata = { title: "Lead" };

type LeadDoc = {
  _id: string; ref: string; type: LeadType; edition: string; fullName: string; email: string; phone?: string; company?: string; designation?: string;
  city?: string; state?: string; country?: string; website?: string; details: Record<string, unknown>; marketingOptIn: boolean; stage: LeadStage;
  assignedTo?: string; notes: { _id: string; body: string; by: string; at: Date }[]; tasks: { _id: string; title: string; dueAt?: Date; done: boolean; by: string }[];
  stageHistory: { stage: string; by: string; at: Date }[]; attribution?: Record<string, string>; createdAt: Date;
};

const human = (k: string) => k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

export default async function LeadDetail({ params, searchParams }: PageProps<"/admin/leads/[id]">) {
  const admin = await requirePermission("leads.view");
  const { id } = await params;
  const sp = await searchParams;
  if (!isValidObjectId(id)) notFound();
  await connectDb();
  const lead = await Lead.findById(id).lean<LeadDoc>();
  if (!lead) notFound();
  const [jobs, history, staff] = await Promise.all([
    IntegrationJob.find({ entityId: id }).sort({ createdAt: 1 }).lean(),
    AuditEvent.find({ entity: "Lead", entityId: id }).sort({ createdAt: -1 }).limit(30).lean(),
    AdminUser.find({ active: true, role: { $in: ["super_admin", "sales", "conference"] } }).select("email name").lean(),
  ]);
  const editable = can(admin.role, "leads.edit");
  const rows: [string, unknown][] = [
    ["Name", lead.fullName], ["Designation", lead.designation], ["Company", lead.company],
    ["Email", lead.email], ["Phone", lead.phone], ["Website", lead.website],
    ["Location", [lead.city, lead.state, lead.country].filter(Boolean).join(", ")],
    ...Object.entries(lead.details ?? {}).map(([k, v]) => [human(k), v] as [string, unknown]),
    ["Marketing opt-in", lead.marketingOptIn ? "Yes" : "No"],
  ];

  return (
    <>
      <AdminHeader title={lead.company || lead.fullName} subtitle={<>{LEAD_TYPE_LABELS[lead.type]} · <span className="font-mono">{lead.ref}</span> · received {formatDateTime(lead.createdAt)}</>} back={{ href: "/admin/leads/", label: "Leads" }} actions={<StatusBadge value={lead.stage} label={LEAD_STAGE_LABELS[lead.stage]} />} />
      <Flash sp={sp} />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="grid content-start gap-6">
          <Card title="Submission">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[11rem_1fr]">
              {rows.filter(([, v]) => v !== undefined && v !== null && v !== "").map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-ink-muted">{k}</dt>
                  <dd className="whitespace-pre-wrap break-words text-ink">{Array.isArray(v) ? v.join(", ") : String(v)}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
              <a href={`mailto:${lead.email}?subject=${encodeURIComponent(`IIEV Show 2027 — ${lead.ref}`)}`} className={aBtnSecondary}>Email</a>
              {lead.phone ? <a href={`tel:${lead.phone}`} className={aBtnSecondary}>Call</a> : null}
            </div>
          </Card>
          <Card title={`Notes (${lead.notes.length})`}>
            {editable ? (
              <form action={addNoteAction.bind(null, id)} className="mb-4 grid gap-2">
                <label className="sr-only" htmlFor="note">Add note</label>
                <textarea id="note" name="body" rows={3} required className={aInput} placeholder="Call summary, next steps…" />
                <button className={`${aBtnPrimary} justify-self-start`}>Add note</button>
              </form>
            ) : null}
            <ul className="grid gap-3">
              {[...lead.notes].reverse().map((n) => (
                <li key={String(n._id)} className="rounded-lg bg-mist/70 p-3 text-sm">
                  <p className="whitespace-pre-wrap text-ink">{n.body}</p>
                  <p className="mt-1 text-xs text-ink-muted">{n.by} · {formatDateTime(n.at)}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="grid content-start gap-6">
          <Card title="Pipeline">
            {editable ? (
              <form action={updateLeadAction.bind(null, id)} className="grid gap-3">
                <label className="grid gap-1 text-sm font-semibold">Stage
                  <select name="stage" defaultValue={lead.stage} className={aInput}>
                    {LEAD_STAGES.map((s) => <option key={s} value={s}>{LEAD_STAGE_LABELS[s]}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-semibold">Owner
                  <select name="assignedTo" defaultValue={lead.assignedTo ?? ""} className={aInput}>
                    <option value="">Unassigned</option>
                    {(staff as { email: string; name: string }[]).map((u) => <option key={u.email} value={u.email}>{u.name} ({u.email})</option>)}
                  </select>
                </label>
                <button className={`${aBtnPrimary} justify-self-start`}>Save</button>
              </form>
            ) : (
              <p className="text-sm">Owner: {lead.assignedTo ?? "Unassigned"}</p>
            )}
            <ol className="mt-4 grid gap-1 border-t border-line pt-3 text-xs text-ink-muted">
              {lead.stageHistory.map((h, i) => <li key={i}>{LEAD_STAGE_LABELS[h.stage as LeadStage] ?? h.stage} · {h.by} · {formatDateTime(h.at)}</li>)}
            </ol>
          </Card>
          <Card title="Follow-up tasks">
            <ul className="mb-3 grid gap-2 text-sm">
              {lead.tasks.map((t) => (
                <li key={String(t._id)} className="flex items-center justify-between gap-2">
                  <span className={t.done ? "text-ink-muted line-through" : "text-ink"}>{t.title}{t.dueAt ? <span className="text-xs text-ink-muted"> · due {formatDateTime(t.dueAt)}</span> : null}</span>
                  {editable ? <form action={toggleTaskAction.bind(null, id, String(t._id))}><button className="text-xs font-semibold text-brand-blue">{t.done ? "Reopen" : "Done"}</button></form> : null}
                </li>
              ))}
              {!lead.tasks.length ? <li className="text-ink-muted">No tasks.</li> : null}
            </ul>
            {editable ? (
              <form action={addTaskAction.bind(null, id)} className="grid gap-2 border-t border-line pt-3 sm:grid-cols-[1fr_9rem_auto]">
                <input name="title" required placeholder="e.g. Send proposal" className={aInput} aria-label="Task" />
                <input name="dueAt" type="date" className={aInput} aria-label="Due date" />
                <button className={aBtnSecondary}>Add</button>
              </form>
            ) : null}
          </Card>
          <Card title="Integrations" actions={editable ? <form action={retryJobsAction.bind(null, id)}><button className="text-xs font-semibold text-brand-blue">Retry failed/skipped</button></form> : undefined}>
            <ul className="grid gap-2 text-sm">
              {(jobs as unknown as { _id: string; kind: string; status: string; attempts: number; lastError?: string }[]).map((j) => (
                <li key={String(j._id)}>
                  <div className="flex justify-between"><span>{j.kind.replace(/_/g, " ")}</span><StatusBadge value={j.status} /></div>
                  {j.lastError ? <p className="text-xs text-ink-muted">{j.lastError} · attempts {j.attempts}</p> : null}
                </li>
              ))}
            </ul>
          </Card>
          {lead.attribution && Object.values(lead.attribution).some(Boolean) ? (
            <Card title="Attribution (consented)">
              <dl className="grid gap-1 text-xs">
                {Object.entries(lead.attribution).filter(([, v]) => v).map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-ink-muted">{k}</dt><dd className="truncate">{v}</dd></div>)}
              </dl>
            </Card>
          ) : null}
          <Card title="Audit trail">
            <ul className="grid gap-1.5 text-xs text-ink-muted">
              {(history as unknown as { _id: string; action: string; actorEmail?: string; summary?: string; createdAt: Date }[]).map((h) => <li key={String(h._id)}>{formatDateTime(h.createdAt)} · {h.actorEmail ?? "system"} · {h.action}{h.summary ? ` — ${h.summary}` : ""}</li>)}
              {!history.length ? <li>No staff actions yet.</li> : null}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
