"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { requirePermission, audit } from "@/lib/auth/session";
import { approveVisitor, rejectVisitor, cancelVisitor, reissueBadge, registerVisitor, VisitorError } from "@/lib/services/visitors";
import { enqueue, processDueJobs } from "@/lib/jobs";
import { connectDb } from "@/lib/db/connect";
import { Visitor } from "@/models/leads";
import { visitorRegistrationSchema, flattenZod } from "@/lib/validation/forms";

const go = (path: string, msg: string, err = false) => redirect(`${path}?${err ? "error" : "ok"}=${encodeURIComponent(msg)}`);

async function run(id: string, label: string, fn: (actor: { id: string; email: string }) => Promise<unknown>, returnTo?: string) {
  const admin = await requirePermission("visitors.edit");
  const path = returnTo || `/admin/visitors/${id}/`;
  try {
    await fn({ id: admin.id, email: admin.email });
    await audit(admin, `visitor.${label}`, "Visitor", id);
    await processDueJobs(5, id).catch(() => undefined);
  } catch (e) {
    go(path, e instanceof VisitorError ? e.message : "Action failed", true);
  }
  go(path, `Visitor ${label.replace(/_/g, " ")}`);
}

export async function approveAction(id: string, returnTo?: string) {
  return run(id, "approved", (a) => approveVisitor(id, a), returnTo);
}
export async function rejectAction(id: string, fd: FormData) {
  return run(id, "rejected", (a) => rejectVisitor(id, a, String(fd.get("reason") || "") || undefined));
}
export async function cancelAction(id: string, fd: FormData) {
  return run(id, "cancelled", (a) => cancelVisitor(id, a, String(fd.get("reason") || "") || undefined));
}
export async function reissueAction(id: string) {
  return run(id, "badge_reissued", (a) => reissueBadge(id, a, true));
}
export async function resendAction(id: string) {
  return run(id, "badge_resent", async () => {
    await connectDb();
    const v = await Visitor.findById(id).select("_id status");
    if (!v || !["approved", "checked_in"].includes(v.status)) throw new VisitorError("INVALID_STATE", "Only approved visitors have a badge to resend");
    await enqueue("email_badge_link", "Visitor", v._id, undefined, `r${Date.now()}`);
  });
}

/** Correct visitor details (registration desk). Name/company changes reissue the badge. */
export async function correctAction(id: string, fd: FormData) {
  const admin = await requirePermission("visitors.edit");
  await connectDb();
  const v = await Visitor.findById(id);
  if (!v) go(`/admin/visitors/${id}/`, "Not found", true);
  const fields = ["fullName", "company", "designation", "phone", "city", "state", "country"] as const;
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  for (const f of fields) {
    const val = String(fd.get(f) ?? "").trim();
    if (val && val !== v!.get(f)) {
      diff[f] = { from: "[redacted]", to: "[redacted]" };
      v!.set(f, val.slice(0, 160));
    }
  }
  if (!Object.keys(diff).length) go(`/admin/visitors/${id}/`, "No changes");
  await v!.save();
  await audit(admin, "visitor.corrected", "Visitor", id, `Corrected ${Object.keys(diff).join(", ")}`, diff);
  if ((diff.fullName || diff.company) && ["approved", "checked_in"].includes(v!.status)) {
    await reissueBadge(id, { id: admin.id, email: admin.email }, true);
    await processDueJobs(5, id).catch(() => undefined);
    go(`/admin/visitors/${id}/`, "Details corrected and badge reissued");
  }
  go(`/admin/visitors/${id}/`, "Details corrected");
}

/** On-site walk-in registration by registration staff. */
export async function walkInAction(fd: FormData) {
  const admin = await requirePermission("visitors.edit");
  const payload = {
    fullName: fd.get("fullName"), email: fd.get("email"), phone: fd.get("phone"), company: fd.get("company"), designation: fd.get("designation"),
    industry: fd.get("industry"), city: fd.get("city"), state: fd.get("state") || undefined, country: fd.get("country") || "India",
    reasonForVisit: "Walk-in registration", sectorInterests: fd.getAll("sectorInterests").map(String),
    privacyAccepted: fd.get("privacyAccepted") === "on" ? true : undefined, marketingOptIn: false, idempotencyKey: randomUUID(),
  };
  const parsed = visitorRegistrationSchema.safeParse(payload);
  if (!parsed.success) go("/admin/visitors/new/", Object.values(flattenZod(parsed.error)).join(" · "), true);
  const r = await registerVisitor(parsed.data!, "desk");
  if (r.kind === "already_registered") go("/admin/visitors/new/", "That email is already registered — search for the visitor instead.", true);
  await connectDb();
  const v = await Visitor.findOne({ ref: (r as { ref: string }).ref }).select("_id status");
  await audit(admin, "visitor.walk_in", "Visitor", String(v!._id));
  if (v!.status === "pending_review") await approveVisitor(String(v!._id), { id: admin.id, email: admin.email });
  await processDueJobs(5, String(v!._id)).catch(() => undefined);
  go(`/admin/visitors/${v!._id}/`, "Walk-in registered and approved");
}
