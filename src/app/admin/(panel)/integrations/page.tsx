import { redirect } from "next/navigation";
import { requirePermission, audit } from "@/lib/auth/session";
import { connectDb } from "@/lib/db/connect";
import { IntegrationJob } from "@/models/leads";
import { processDueJobs } from "@/lib/jobs";
import { sheetsConfigured } from "@/lib/sheets";
import { getEmailAdapter, envNotifyRecipients } from "@/lib/email";
import { storageMode } from "@/lib/storage";
import { AdminHeader, Card, Table, Flash, StatusBadge, aBtnPrimary, aBtnSecondary } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Integrations" };

async function runNow() {
  "use server";
  const admin = await requirePermission("integrations.manage");
  const r = await processDueJobs(50);
  await audit(admin, "jobs.run", "IntegrationJob", undefined, JSON.stringify(r));
  redirect(`/admin/integrations/?ok=${encodeURIComponent(`Processed ${r.processed}, failed ${r.failed}`)}`);
}

async function requeueAll(fd: FormData) {
  "use server";
  const admin = await requirePermission("integrations.manage");
  await connectDb();
  const which = fd.get("which") === "skipped" ? "skipped" : "failed";
  const r = await IntegrationJob.updateMany({ status: which }, { $set: { status: "queued", attempts: 0, nextRunAt: new Date() } });
  await audit(admin, "jobs.requeue", "IntegrationJob", undefined, `${which}: ${r.modifiedCount}`);
  const p = await processDueJobs(50);
  redirect(`/admin/integrations/?ok=${encodeURIComponent(`Re-queued ${r.modifiedCount} ${which} jobs; processed ${p.processed}, failed ${p.failed}`)}`);
}

export default async function IntegrationsPage({ searchParams }: PageProps<"/admin/integrations">) {
  await requirePermission("integrations.manage");
  const sp = await searchParams;
  await connectDb();
  const status = typeof sp.status === "string" ? sp.status : "";
  const [jobs, counts] = await Promise.all([
    IntegrationJob.find(status ? { status } : {}).sort({ updatedAt: -1 }).limit(100).lean(),
    IntegrationJob.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);
  const c = (s: string) => counts.find((x) => x._id === s)?.n ?? 0;
  return (
    <>
      <AdminHeader
        title="Integrations & jobs"
        subtitle="MongoDB is the system of record. Sheets and email run as retryable jobs and never block a submission."
        actions={<form action={runNow}><button className={aBtnPrimary}>Run due jobs now</button></form>}
      />
      <Flash sp={sp} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Email (SMTP)"><StatusBadge value={getEmailAdapter().configured() ? "ok" : "pending"} label={getEmailAdapter().configured() ? "configured" : "not configured"} /><p className="mt-2 text-xs text-ink-muted">Env recipients: {envNotifyRecipients().join(", ") || "none"} (CMS settings take precedence)</p></Card>
        <Card title="Google Sheets"><StatusBadge value={sheetsConfigured() ? "ok" : "pending"} label={sheetsConfigured() ? "configured" : "not configured"} /><p className="mt-2 text-xs text-ink-muted">Tabs: Stall Enquiries, Sponsorship, Partners, Speaker Applications, Delegates, Contact, Visitors</p></Card>
        <Card title="Media storage"><StatusBadge value={storageMode() === "s3" ? "ok" : "pending"} label={storageMode()} /></Card>
        <Card title="Job queue">
          <p className="text-sm">queued {c("queued")} · done {c("done")} · <span className="text-danger">failed {c("failed")}</span> · skipped {c("skipped")}</p>
          <div className="mt-2 flex gap-2">
            <form action={requeueAll}><input type="hidden" name="which" value="failed" /><button className={aBtnSecondary}>Retry failed</button></form>
            <form action={requeueAll}><input type="hidden" name="which" value="skipped" /><button className={aBtnSecondary}>Re-run skipped</button></form>
          </div>
        </Card>
      </div>
      <Table head={["Job", "Entity", "Status", "Attempts", "Last error", "Updated"]} empty={!jobs.length}>
        {(jobs as unknown as { _id: string; kind: string; entity: string; entityId: string; status: string; attempts: number; lastError?: string; updatedAt: Date }[]).map((j) => (
          <tr key={String(j._id)}>
            <td className="px-4 py-2.5">{j.kind.replace(/_/g, " ")}</td>
            <td className="px-4 py-2.5 text-xs"><a className="text-brand-blue hover:underline" href={`/admin/${j.entity === "Lead" ? "leads" : "visitors"}/${j.entityId}/`}>{j.entity}</a></td>
            <td className="px-4 py-2.5"><StatusBadge value={j.status} /></td>
            <td className="px-4 py-2.5">{j.attempts}</td>
            <td className="max-w-xs truncate px-4 py-2.5 text-xs text-ink-muted" title={j.lastError}>{j.lastError ?? "—"}</td>
            <td className="px-4 py-2.5 text-xs text-ink-muted">{formatDateTime(j.updatedAt)}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
