import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { connectDb } from "@/lib/db/connect";
import { Visitor, CheckIn, IntegrationJob, type VisitorStatus } from "@/models/leads";
import { createBadgeAccessToken } from "@/lib/badge/access";
import { AdminHeader, Card, StatusBadge, Flash, aInput, aBtnPrimary, aBtnSecondary, aBtnDanger } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { approveAction, rejectAction, cancelAction, reissueAction, resendAction, correctAction } from "../actions";

export const metadata = { title: "Visitor" };

type V = {
  _id: string; ref: string; edition: string; fullName: string; email: string; phone: string; company: string; designation: string; industry: string;
  city?: string; state?: string; country?: string; reasonForVisit?: string; sectorInterests: string[]; marketingOptIn: boolean; status: VisitorStatus;
  statusHistory: { status: string; by: string; reason?: string; at: Date }[]; badgeVersion: number; badgeIssuedAt?: Date; badgeRevokedAt?: Date;
  checkedInAt?: Date; checkInCount: number; createdAt: Date;
};

export default async function VisitorDetail({ params, searchParams }: PageProps<"/admin/visitors/[id]">) {
  const admin = await requirePermission("visitors.view");
  const { id } = await params;
  const sp = await searchParams;
  if (!isValidObjectId(id)) notFound();
  await connectDb();
  const v = await Visitor.findById(id).lean<V>();
  if (!v) notFound();
  const [scans, jobs] = await Promise.all([
    CheckIn.find({ visitorId: id }).sort({ createdAt: -1 }).limit(20).lean(),
    IntegrationJob.find({ entityId: id }).sort({ createdAt: 1 }).lean(),
  ]);
  const editable = can(admin.role, "visitors.edit");
  const hasBadge = ["approved", "checked_in"].includes(v.status) && !v.badgeRevokedAt;
  const access = hasBadge ? await createBadgeAccessToken(String(v._id), v.badgeVersion, "1h") : null;

  return (
    <>
      <AdminHeader title={v.fullName} subtitle={<><span className="font-mono">{v.ref}</span> · {v.company} · registered {formatDateTime(v.createdAt)}</>} back={{ href: "/admin/visitors/", label: "Visitors" }} actions={<StatusBadge value={v.status} />} />
      <Flash sp={sp} />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="grid content-start gap-6">
          <Card title="Registration">
            <dl className="grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-[10rem_1fr]">
              {([
                ["Email", v.email], ["Phone", v.phone], ["Designation", v.designation], ["Industry", v.industry],
                ["Location", [v.city, v.state, v.country].filter(Boolean).join(", ")], ["Reason", v.reasonForVisit], ["Interests", v.sectorInterests.join(", ")],
                ["Marketing opt-in", v.marketingOptIn ? "Yes" : "No"], ["Edition", v.edition],
              ] as [string, string | undefined][]).map(([k, val]) => (
                <div key={k} className="contents"><dt className="text-ink-muted">{k}</dt><dd className="break-words text-ink">{val || "—"}</dd></div>
              ))}
            </dl>
          </Card>
          {editable ? (
            <Card title="Correct details">
              <form action={correctAction.bind(null, id)} className="grid gap-3 sm:grid-cols-2">
                {(["fullName", "company", "designation", "phone", "city", "state", "country"] as const).map((f) => (
                  <label key={f} className="grid gap-1 text-xs font-semibold text-ink-muted">{f}
                    <input name={f} defaultValue={(v as unknown as Record<string, string>)[f] ?? ""} className={aInput} />
                  </label>
                ))}
                <p className="text-xs text-ink-muted sm:col-span-2">Changing name or company automatically revokes the old QR and issues a new badge.</p>
                <button className={`${aBtnSecondary} justify-self-start`}>Save corrections</button>
              </form>
            </Card>
          ) : null}
          <Card title="Status history">
            <ol className="grid gap-1.5 text-xs text-ink-muted">
              {v.statusHistory.map((h, i) => <li key={i}>{formatDateTime(h.at)} · <span className="font-semibold text-ink">{h.status.replace(/_/g, " ")}</span> · {h.by}{h.reason ? ` — ${h.reason}` : ""}</li>)}
            </ol>
          </Card>
        </div>
        <div className="grid content-start gap-6">
          <Card title="Badge">
            <p className="text-sm text-ink-soft">
              {hasBadge ? <>Version {v.badgeVersion} issued {v.badgeIssuedAt ? formatDateTime(v.badgeIssuedAt) : ""}</> : v.badgeRevokedAt ? `Revoked ${formatDateTime(v.badgeRevokedAt)}` : "No badge issued yet."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {access ? <a className={aBtnSecondary} href={`/api/badge/pdf/?t=${encodeURIComponent(access)}`} target="_blank" rel="noopener">Print badge PDF</a> : null}
              {editable && ["pending_review", "rejected", "submitted", "validated"].includes(v.status) ? <form action={approveAction.bind(null, id, undefined)}><button className={aBtnPrimary}>Approve & issue badge</button></form> : null}
              {editable && hasBadge ? <form action={resendAction.bind(null, id)}><button className={aBtnSecondary}>Email badge link</button></form> : null}
              {editable && hasBadge ? <form action={reissueAction.bind(null, id)}><button className={aBtnSecondary}>Reissue (revoke old QR)</button></form> : null}
            </div>
          </Card>
          {editable && !["rejected", "cancelled"].includes(v.status) ? (
            <Card title="Reject or cancel">
              <form className="grid gap-2">
                <input name="reason" placeholder="Reason (internal)" className={aInput} aria-label="Reason" />
                <div className="flex gap-2">
                  {v.status === "pending_review" ? <button formAction={rejectAction.bind(null, id)} className={aBtnDanger}>Reject</button> : null}
                  <button formAction={cancelAction.bind(null, id)} className={aBtnDanger}>Cancel registration</button>
                </div>
              </form>
            </Card>
          ) : null}
          <Card title={`Entry scans (${v.checkInCount})`}>
            <ul className="grid gap-1.5 text-xs">
              {(scans as unknown as { _id: string; result: string; method: string; station?: string; scannedByEmail?: string; createdAt: Date }[]).map((s) => (
                <li key={String(s._id)} className="flex flex-wrap items-center gap-2"><StatusBadge value={s.result} /> {formatDateTime(s.createdAt)} · {s.method}{s.station ? ` · ${s.station}` : ""} · {s.scannedByEmail}</li>
              ))}
              {!scans.length ? <li className="text-ink-muted">Not scanned yet.</li> : null}
            </ul>
          </Card>
          <Card title="Integrations">
            <ul className="grid gap-1.5 text-xs">
              {(jobs as unknown as { _id: string; kind: string; status: string; lastError?: string }[]).map((j) => (
                <li key={String(j._id)} className="flex items-center justify-between gap-2"><span>{j.kind.replace(/_/g, " ")}{j.lastError ? <span className="block text-ink-muted">{j.lastError}</span> : null}</span><StatusBadge value={j.status} /></li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
