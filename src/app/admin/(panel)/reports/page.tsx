import { requirePermission } from "@/lib/auth/session";
import { connectDb } from "@/lib/db/connect";
import { Lead, Visitor, CheckIn, LEAD_TYPE_LABELS, LEAD_STAGE_LABELS, type LeadType, type LeadStage } from "@/models/leads";
import { getCurrentEdition } from "@/lib/data/edition";
import { AdminHeader, Card } from "@/components/admin/ui";

export const metadata = { title: "Reports" };

// Aggregated, non-personal reporting (available to Read-only Analysts).

function Bars({ rows, total }: { rows: { label: string; n: number }[]; total: number }) {
  return (
    <ul className="grid gap-2">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(8rem,14rem)_1fr_3rem] items-center gap-3 text-sm">
          <span className="truncate text-ink-soft" title={r.label}>{r.label}</span>
          <span className="h-2.5 rounded-full bg-mist">
            <span className="block h-full rounded-full bg-brand-green" style={{ width: `${total ? Math.max(2, (r.n / total) * 100) : 0}%` }} />
          </span>
          <span className="text-right font-semibold tabular-nums">{r.n}</span>
        </li>
      ))}
      {!rows.length ? <li className="text-sm text-ink-muted">No data yet.</li> : null}
    </ul>
  );
}

export default async function ReportsPage() {
  await requirePermission("reports.view");
  await connectDb();
  const e = await getCurrentEdition();
  const m = { $match: { edition: e.slug } };
  const g = (field: string) => [m, { $group: { _id: field, n: { $sum: 1 } } }, { $sort: { n: -1 as const } }, { $limit: 15 }];
  const [byIndustry, byStatus, byState, bySource, byDay, leadsType, leadsStage, leadsSource, checkins] = await Promise.all([
    Visitor.aggregate(g("$industry")),
    Visitor.aggregate(g("$status")),
    Visitor.aggregate(g("$state")),
    Visitor.aggregate(g({ $ifNull: ["$attribution.utmSource", "(direct / no consent)"] } as unknown as string)),
    Visitor.aggregate([m, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } }, n: { $sum: 1 } } }, { $sort: { _id: -1 } }, { $limit: 21 }]),
    Lead.aggregate(g("$type")),
    Lead.aggregate(g("$stage")),
    Lead.aggregate(g({ $ifNull: ["$attribution.utmSource", "(direct / no consent)"] } as unknown as string)),
    CheckIn.aggregate([m, { $match: { result: "ok" } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } }, n: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
  ]);
  const toRows = (a: { _id: string | null; n: number }[], map?: (k: string) => string) => a.map((x) => ({ label: map ? map(String(x._id)) : String(x._id ?? "—"), n: x.n }));
  const sum = (a: { n: number }[]) => a.reduce((s, x) => s + x.n, 0);
  return (
    <>
      <AdminHeader title="Reports" subtitle={`Edition ${e.slug}. Aggregated counts only. Marketing enquiries ≠ qualified leads ≠ confirmed business ≠ physical attendance.`} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Visitor registrations by day (last 21 days, IST)"><Bars rows={toRows(byDay)} total={Math.max(...byDay.map((x) => x.n), 1)} /></Card>
        <Card title="Visitors by status"><Bars rows={toRows(byStatus)} total={sum(byStatus)} /></Card>
        <Card title="Visitors by industry"><Bars rows={toRows(byIndustry)} total={sum(byIndustry)} /></Card>
        <Card title="Visitors by state"><Bars rows={toRows(byState)} total={sum(byState)} /></Card>
        <Card title="Visitor source (consented UTM)"><Bars rows={toRows(bySource)} total={sum(bySource)} /></Card>
        <Card title="Physical check-ins (first entry) by day"><Bars rows={toRows(checkins)} total={Math.max(...checkins.map((x) => x.n), 1)} /></Card>
        <Card title="Enquiries by type"><Bars rows={toRows(leadsType, (k) => LEAD_TYPE_LABELS[k as LeadType] ?? k)} total={sum(leadsType)} /></Card>
        <Card title="Lead pipeline stage"><Bars rows={toRows(leadsStage, (k) => LEAD_STAGE_LABELS[k as LeadStage] ?? k)} total={sum(leadsStage)} /></Card>
        <Card title="Lead source (consented UTM)"><Bars rows={toRows(leadsSource)} total={sum(leadsSource)} /></Card>
      </div>
    </>
  );
}
