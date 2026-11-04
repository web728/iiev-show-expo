import Link from "next/link";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { connectDb } from "@/lib/db/connect";
import { Lead, Visitor, CheckIn, IntegrationJob, LEAD_TYPE_LABELS, type LeadType } from "@/models/leads";
import { getCurrentEdition } from "@/lib/data/edition";
import { AdminHeader, Card, Stat, StatusBadge } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { sheetsConfigured } from "@/lib/sheets";
import { getEmailAdapter } from "@/lib/email";
import { storageMode } from "@/lib/storage";

export const metadata = { title: "Dashboard" };

function istDayStart() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 3600_000);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - 5.5 * 3600_000);
}

export default async function Dashboard() {
  const admin = await requirePermission("dashboard.view");
  await connectDb();
  const e = await getCurrentEdition();
  const today = istDayStart();
  const [visitorsTotal, pending, approved, checkedIn, todayCheckins, leadsByType, newLeads, failedJobs, recentLeads] = await Promise.all([
    Visitor.countDocuments({ edition: e.slug }),
    Visitor.countDocuments({ edition: e.slug, status: "pending_review" }),
    Visitor.countDocuments({ edition: e.slug, status: { $in: ["approved", "checked_in"] } }),
    Visitor.countDocuments({ edition: e.slug, status: "checked_in" }),
    CheckIn.countDocuments({ edition: e.slug, result: "ok", createdAt: { $gte: today } }),
    Lead.aggregate<{ _id: LeadType; n: number }>([{ $match: { edition: e.slug } }, { $group: { _id: "$type", n: { $sum: 1 } } }]),
    Lead.countDocuments({ edition: e.slug, stage: "new" }),
    IntegrationJob.countDocuments({ status: "failed" }),
    can(admin.role, "leads.view") ? Lead.find({ edition: e.slug }).sort({ createdAt: -1 }).limit(8).select("ref type company fullName stage createdAt").lean() : Promise.resolve([]),
  ]);
  const leadCount = (t: LeadType) => leadsByType.find((x) => x._id === t)?.n ?? 0;

  return (
    <>
      <AdminHeader title={`Welcome, ${admin.name.split(" ")[0]}`} subtitle={`${e.editionLabel} · ${e.dateLabel} · ${e.venue.name}`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Visitor registrations" value={visitorsTotal} href={can(admin.role, "visitors.view") ? "/admin/visitors/" : undefined} hint={`${approved} approved`} />
        <Stat label="Pending review" value={pending} href={can(admin.role, "visitors.view") ? "/admin/visitors/?status=pending_review" : undefined} />
        <Stat label="Checked in" value={checkedIn} hint={`${todayCheckins} first entries today (IST)`} />
        <Stat label="New leads" value={newLeads} href={can(admin.role, "leads.view") ? "/admin/leads/?stage=new" : undefined} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card title="Enquiries by type">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(LEAD_TYPE_LABELS) as LeadType[]).map((t) => (
              <li key={t} className="rounded-lg bg-mist/70 p-3">
                <p className="text-xs text-ink-muted">{LEAD_TYPE_LABELS[t]}</p>
                <p className="text-xl font-extrabold text-ink">{leadCount(t)}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="System status" actions={can(admin.role, "integrations.manage") ? <Link href="/admin/integrations/" className="text-xs font-semibold text-brand-blue">Details</Link> : undefined}>
          <ul className="grid gap-2 text-sm">
            <li className="flex justify-between"><span>Database</span><StatusBadge value="ok" label="connected" /></li>
            <li className="flex justify-between"><span>Email</span><StatusBadge value={getEmailAdapter().configured() ? "ok" : "pending"} label={getEmailAdapter().configured() ? "configured" : "not configured"} /></li>
            <li className="flex justify-between"><span>Google Sheets</span><StatusBadge value={sheetsConfigured() ? "ok" : "pending"} label={sheetsConfigured() ? "configured" : "not configured"} /></li>
            <li className="flex justify-between"><span>Media storage</span><StatusBadge value={storageMode() === "s3" ? "ok" : "pending"} label={storageMode() === "s3" ? "object storage" : storageMode() === "local" ? "local (dev only)" : "not configured"} /></li>
            <li className="flex justify-between"><span>Failed jobs</span><StatusBadge value={failedJobs ? "failed" : "ok"} label={String(failedJobs)} /></li>
          </ul>
        </Card>
      </div>
      {recentLeads.length ? (
        <div className="mt-6">
          <Card title="Latest enquiries" actions={<Link href="/admin/leads/" className="text-xs font-semibold text-brand-blue">All leads</Link>}>
            <ul className="divide-y divide-line text-sm">
              {(recentLeads as { _id: unknown; ref: string; type: LeadType; company?: string; fullName: string; stage: string; createdAt: Date }[]).map((l) => (
                <li key={String(l._id)} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <Link href={`/admin/leads/${l._id}/`} className="font-semibold text-ink hover:text-brand-green">{l.company || l.fullName}</Link>
                  <span className="text-ink-muted">{LEAD_TYPE_LABELS[l.type]} · {l.ref}</span>
                  <StatusBadge value={l.stage} />
                  <span className="text-xs text-ink-muted">{formatDateTime(l.createdAt)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : null}
    </>
  );
}
