"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission, audit } from "@/lib/auth/session";
import { connectDb } from "@/lib/db/connect";
import { Lead, IntegrationJob, LEAD_STAGES, type LeadStage } from "@/models/leads";
import { processDueJobs } from "@/lib/jobs";

const back = (id: string, msg: string, err = false) => redirect(`/admin/leads/${id}/?${err ? "error" : "ok"}=${encodeURIComponent(msg)}`);

export async function updateLeadAction(id: string, fd: FormData) {
  const admin = await requirePermission("leads.edit");
  await connectDb();
  const lead = await Lead.findById(id);
  if (!lead) back(id, "Lead not found", true);
  const stage = String(fd.get("stage") || "");
  const assignedTo = String(fd.get("assignedTo") || "").trim().toLowerCase();
  const changes: Record<string, unknown> = {};
  if (stage && stage !== lead!.stage && LEAD_STAGES.includes(stage as LeadStage)) {
    changes.stage = { from: lead!.stage, to: stage };
    lead!.stage = stage as LeadStage;
    lead!.stageHistory.push({ stage, by: admin.email, at: new Date() });
  }
  if ((assignedTo || undefined) !== (lead!.assignedTo || undefined)) {
    changes.assignedTo = { from: lead!.assignedTo, to: assignedTo || null };
    lead!.assignedTo = assignedTo || undefined;
  }
  await lead!.save();
  if (Object.keys(changes).length) await audit(admin, "lead.update", "Lead", id, `Updated ${Object.keys(changes).join(", ")}`, changes);
  revalidatePath(`/admin/leads/${id}/`);
  back(id, "Saved");
}

export async function addNoteAction(id: string, fd: FormData) {
  const admin = await requirePermission("leads.edit");
  const body = String(fd.get("body") || "").trim().slice(0, 4000);
  if (!body) back(id, "Note is empty", true);
  await connectDb();
  await Lead.updateOne({ _id: id }, { $push: { notes: { body, by: admin.email, at: new Date() } } });
  await audit(admin, "lead.note", "Lead", id, "Added note");
  back(id, "Note added");
}

export async function addTaskAction(id: string, fd: FormData) {
  const admin = await requirePermission("leads.edit");
  const title = String(fd.get("title") || "").trim().slice(0, 300);
  const due = String(fd.get("dueAt") || "");
  if (!title) back(id, "Task title is required", true);
  await connectDb();
  await Lead.updateOne({ _id: id }, { $push: { tasks: { title, dueAt: due ? new Date(`${due}T09:00:00+05:30`) : undefined, assignee: admin.email, by: admin.email } } });
  await audit(admin, "lead.task_add", "Lead", id, title);
  back(id, "Follow-up task added");
}

export async function toggleTaskAction(id: string, taskId: string) {
  const admin = await requirePermission("leads.edit");
  await connectDb();
  const lead = await Lead.findById(id);
  const t = lead?.tasks.id(taskId);
  if (t) {
    t.done = !t.done;
    await lead!.save();
    await audit(admin, "lead.task_toggle", "Lead", id, `${t.title}: ${t.done ? "done" : "reopened"}`);
  }
  back(id, "Task updated");
}

export async function retryJobsAction(id: string) {
  const admin = await requirePermission("leads.edit");
  await connectDb();
  await IntegrationJob.updateMany({ entityId: id, status: { $in: ["failed", "skipped"] } }, { $set: { status: "queued", nextRunAt: new Date(), attempts: 0 } });
  const r = await processDueJobs(10, id);
  await audit(admin, "lead.retry_integrations", "Lead", id, `processed ${r.processed}, failed ${r.failed}`);
  back(id, `Integrations re-run: ${r.processed} processed, ${r.failed} failed`);
}
