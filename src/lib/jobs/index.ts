import "server-only";
import type { Types } from "mongoose";
import { connectDb } from "@/lib/db/connect";
import { IntegrationJob, Lead, Visitor, LEAD_TYPE_LABELS, type LeadType } from "@/models/leads";
import { SiteSettings } from "@/models/content";
import { appendRow } from "@/lib/sheets";
import { envNotifyRecipients, getEmailAdapter } from "@/lib/email";
import { layout, kvTable, textFromRows } from "@/lib/email/templates";
import { siteConfig } from "@/config/site";
import { log } from "@/lib/log";
import { renderBadgePdf } from "@/lib/badge/pdf";
import { decrypt } from "@/lib/security/crypto";
import { createBadgeAccessToken } from "@/lib/badge/access";
import { getCurrentEdition } from "@/lib/data/edition";

type JobKind = "sheets_append" | "email_organiser" | "email_ack" | "email_badge" | "email_badge_link";
type EntityName = "Lead" | "Visitor";

const INTEGRATION_FIELD: Partial<Record<JobKind, "sheets" | "organiserEmail" | "ackEmail">> = {
  sheets_append: "sheets",
  email_organiser: "organiserEmail",
  email_ack: "ackEmail",
  email_badge: "ackEmail",
};

export async function enqueue(kind: JobKind, entity: EntityName, entityId: Types.ObjectId | string, payload?: Record<string, unknown>, dedupeSuffix = "") {
  await connectDb();
  const dedupeKey = `${entity}:${entityId}:${kind}${dedupeSuffix ? `:${dedupeSuffix}` : ""}`;
  try {
    return await IntegrationJob.create({ kind, entity, entityId, dedupeKey, payload });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) return IntegrationJob.findOne({ dedupeKey }); // already queued
    throw err;
  }
}

async function organiserRecipients(): Promise<string[]> {
  const s = await SiteSettings.findOne({ key: "global" }).lean<{ notifyRecipients?: string[] }>();
  const fromCms = (s?.notifyRecipients ?? []).filter(Boolean);
  return (fromCms.length ? fromCms : envNotifyRecipients()).slice(0, 2);
}

async function ackEnabled(): Promise<boolean> {
  const s = await SiteSettings.findOne({ key: "global" }).lean<{ sendAcknowledgements?: boolean }>();
  return s?.sendAcknowledgements ?? process.env.SEND_ACKNOWLEDGEMENTS !== "false";
}

/** Queue the standard post-submission pipeline for a lead. */
export async function enqueueLeadPipeline(leadId: Types.ObjectId) {
  await enqueue("sheets_append", "Lead", leadId);
  await enqueue("email_organiser", "Lead", leadId);
  await enqueue("email_ack", "Lead", leadId);
}

export async function enqueueVisitorPipeline(visitorId: Types.ObjectId, approved: boolean) {
  await enqueue("sheets_append", "Visitor", visitorId);
  if (process.env.NOTIFY_ON_VISITOR === "true") await enqueue("email_organiser", "Visitor", visitorId);
  // Approved → badge email (PDF attached). Pending review → acknowledgement only.
  if (approved) await enqueue("email_badge", "Visitor", visitorId, undefined, "v1");
  else await enqueue("email_ack", "Visitor", visitorId);
}

// ---------------------------------------------------------------------------

type Outcome = { status: "done" } | { status: "skipped"; reason: string };

function leadRows(lead: Record<string, unknown>): [string, unknown][] {
  const d = (lead.details ?? {}) as Record<string, unknown>;
  return [
    ["Reference", lead.ref],
    ["Type", LEAD_TYPE_LABELS[lead.type as LeadType]],
    ["Name", lead.fullName],
    ["Designation", lead.designation],
    ["Company", lead.company],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["City", lead.city],
    ["State", lead.state],
    ["Country", lead.country],
    ["Website", lead.website],
    ...Object.entries(d).map(([k, v]) => [humanise(k), v] as [string, unknown]),
    ["Marketing opt-in", lead.marketingOptIn ? "Yes" : "No"],
    ["Submitted", new Date(lead.createdAt as string).toLocaleString("en-IN", { timeZone: siteConfig.timezone })],
  ];
}

function visitorRows(v: Record<string, unknown>): [string, unknown][] {
  return [
    ["Registration ID", v.ref],
    ["Name", v.fullName],
    ["Company", v.company],
    ["Designation", v.designation],
    ["Industry", v.industry],
    ["Email", v.email],
    ["Phone", v.phone],
    ["City", v.city],
    ["State", v.state],
    ["Country", v.country],
    ["Reason for visit", v.reasonForVisit],
    ["Interests", v.sectorInterests],
    ["Status", v.status],
    ["Submitted", new Date(v.createdAt as string).toLocaleString("en-IN", { timeZone: siteConfig.timezone })],
  ];
}

function humanise(k: string) {
  return k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

const SHEET_TABS: Record<string, string> = {
  stall: "Stall Enquiries",
  sponsorship: "Sponsorship",
  partner: "Partners",
  speaker: "Speaker Applications",
  delegate: "Delegates",
  contact: "Contact",
  media: "Media",
  visitor: "Visitors",
};

async function runSheets(entity: EntityName, doc: Record<string, unknown>): Promise<Outcome> {
  // PII minimisation: Sheets receives operational fields only (no IP hash, no attribution detail).
  if (entity === "Lead") {
    const r = await appendRow(SHEET_TABS[doc.type as string] ?? "Other", leadRows(doc).map(([, v]) => v));
    return r.status === "not_configured" ? { status: "skipped", reason: "Google Sheets not configured" } : { status: "done" };
  }
  const r = await appendRow(SHEET_TABS.visitor, visitorRows(doc).map(([, v]) => v));
  return r.status === "not_configured" ? { status: "skipped", reason: "Google Sheets not configured" } : { status: "done" };
}

async function runOrganiserEmail(entity: EntityName, doc: Record<string, unknown>): Promise<Outcome> {
  const to = await organiserRecipients();
  if (!to.length) return { status: "skipped", reason: "No organiser recipients configured" };
  const rows = entity === "Lead" ? leadRows(doc) : visitorRows(doc);
  const label = entity === "Lead" ? LEAD_TYPE_LABELS[doc.type as LeadType] : "Visitor registration";
  const adminLink = `${siteConfig.url}/admin/${entity === "Lead" ? "leads" : "visitors"}/${doc._id}/`;
  const r = await getEmailAdapter().send({
    to,
    replyTo: doc.email as string,
    subject: `[IIEV 2027] New ${label} — ${doc.company || doc.fullName} (${doc.ref})`,
    text: `${label}\n\n${textFromRows(rows)}\n\nOpen in admin: ${adminLink}`,
    html: layout({ preheader: `New ${label}`, heading: `New ${label}`, bodyHtml: kvTable(rows), cta: { label: "Open in admin", href: adminLink } }),
  });
  return r.status === "not_configured" ? { status: "skipped", reason: "Email not configured" } : { status: "done" };
}

const ACK_COPY: Record<string, { subject: string; lead: string }> = {
  stall: { subject: "We've received your stall enquiry", lead: "Thank you for your interest in exhibiting at the India International EV Show 2027. Our exhibitor sales team will review your enquiry and contact you with availability and participation details." },
  sponsorship: { subject: "We've received your sponsorship enquiry", lead: "Thank you for your interest in partnering with the India International EV Show 2027. Our partnerships team will review your objectives and get in touch." },
  partner: { subject: "We've received your partnership proposal", lead: "Thank you for proposing a partnership with the India International EV Show 2027. Our team will review it and respond." },
  speaker: { subject: "We've received your speaker application", lead: "Thank you for applying to speak. The programme committee reviews every application; submission does not guarantee a speaking slot. We will contact you if your proposal is shortlisted." },
  delegate: { subject: "We've received your conference registration", lead: "Thank you for registering your interest in the conference. We will confirm delegate access details once the 2027 programme is announced." },
  contact: { subject: "We've received your message", lead: "Thank you for contacting the India International EV Show team. We will reply as soon as possible." },
  media: { subject: "We've received your media enquiry", lead: "Thank you for your media enquiry. Our media team will be in touch." },
};

async function runAck(entity: EntityName, doc: Record<string, unknown>): Promise<Outcome> {
  if (!(await ackEnabled())) return { status: "skipped", reason: "Acknowledgements disabled" };
  const edition = await getCurrentEdition();
  let subject: string;
  let lead: string;
  if (entity === "Lead") {
    ({ subject, lead } = ACK_COPY[doc.type as string] ?? ACK_COPY.contact);
  } else {
    subject = "Your visitor registration is under review";
    lead = "Thank you for registering to visit the India International EV Show 2027. Your registration is being reviewed. Once approved, we will email your entry badge.";
  }
  const body = `<p>Dear ${String(doc.fullName).split(" ")[0]},</p><p>${lead}</p><p><strong>Your reference:</strong> ${doc.ref}</p><p>${edition.editionLabel} · ${edition.dateLabel} · ${edition.venue.name}, ${edition.venue.locality}, ${edition.venue.city}</p>`;
  const r = await getEmailAdapter().send({
    to: doc.email as string,
    subject: `${subject} — IIEV Show 2027 (${doc.ref})`,
    text: `Dear ${doc.fullName},\n\n${lead}\n\nYour reference: ${doc.ref}\n${edition.dateLabel}, ${edition.venue.name}, ${edition.venue.city}\n\n${siteConfig.url}`,
    html: layout({ preheader: subject, heading: subject, bodyHtml: body }),
  });
  return r.status === "not_configured" ? { status: "skipped", reason: "Email not configured" } : { status: "done" };
}

async function runBadgeEmail(visitorId: string, linkOnly: boolean): Promise<Outcome> {
  const v = await Visitor.findById(visitorId).select("+badgeTokenEnc").lean<Record<string, unknown>>();
  if (!v) return { status: "skipped", reason: "Visitor not found" };
  if (!["approved", "checked_in"].includes(v.status as string) || !v.badgeTokenEnc || v.badgeRevokedAt) {
    return { status: "skipped", reason: "No active badge" };
  }
  const edition = await getCurrentEdition();
  const access = await createBadgeAccessToken(String(v._id), Number(v.badgeVersion));
  const link = `${siteConfig.url}/visit/badge/view/?t=${encodeURIComponent(access)}`;
  const attachments = linkOnly
    ? undefined
    : [{
        filename: `IIEV-2027-Badge-${v.ref}.pdf`,
        content: Buffer.from(await renderBadgePdf({ visitor: v as never, token: decrypt(v.badgeTokenEnc as string), edition })),
        contentType: "application/pdf",
      }];
  const heading = linkOnly ? "Your badge access link" : "Your entry badge for IIEV Show 2027";
  const r = await getEmailAdapter().send({
    to: v.email as string,
    subject: `${heading} (${v.ref})`,
    text: `Dear ${v.fullName},\n\n${linkOnly ? "Use the link below to view and download your badge. The link expires in 7 days." : "Your visitor registration is approved. Your badge is attached as a PDF — print it or show the QR code on your phone at the registration desk."}\n\n${link}\n\nRegistration ID: ${v.ref}\n${edition.dateLabel}, ${edition.venue.name}, ${edition.venue.locality}, ${edition.venue.city}`,
    html: layout({
      preheader: heading,
      heading,
      bodyHtml: `<p>Dear ${String(v.fullName).split(" ")[0]},</p><p>${linkOnly ? "Use the button below to view and download your badge. For your security the link expires in 7 days." : "Your visitor registration is approved. Your badge is attached as a PDF. Print it, or show the QR code on your phone at the registration desk."}</p><p><strong>Registration ID:</strong> ${v.ref}<br>${edition.dateLabel}<br>${edition.venue.name}, ${edition.venue.locality}, ${edition.venue.city}</p><p style="font-size:13px;color:#5b6a80">Keep your QR code private — it is your entry credential.</p>`,
      cta: { label: "View my badge", href: link },
    }),
    attachments,
  });
  return r.status === "not_configured" ? { status: "skipped", reason: "Email not configured" } : { status: "done" };
}

async function execute(job: { kind: JobKind; entity: EntityName; entityId: Types.ObjectId }): Promise<Outcome> {
  if (job.kind === "email_badge" || job.kind === "email_badge_link") {
    return runBadgeEmail(String(job.entityId), job.kind === "email_badge_link");
  }
  const Model = job.entity === "Lead" ? Lead : Visitor;
  const doc = await (Model as typeof Lead).findById(job.entityId).lean<Record<string, unknown>>();
  if (!doc) return { status: "skipped", reason: "Record not found" };
  switch (job.kind) {
    case "sheets_append":
      return runSheets(job.entity, doc);
    case "email_organiser":
      return runOrganiserEmail(job.entity, doc);
    case "email_ack":
      return runAck(job.entity, doc);
  }
}

function backoffMs(attempt: number) {
  return Math.min(60 * 60_000, 30_000 * 2 ** (attempt - 1)); // 30s, 1m, 2m, 4m … capped at 1h
}

/** Claim and run due jobs. Safe to call concurrently (atomic claim with lock). */
export async function processDueJobs(limit = 10, onlyEntityId?: string): Promise<{ processed: number; failed: number }> {
  await connectDb();
  let processed = 0;
  let failed = 0;
  for (let i = 0; i < limit; i++) {
    const now = new Date();
    const job = await IntegrationJob.findOneAndUpdate(
      {
        status: { $in: ["queued", "failed"] },
        nextRunAt: { $lte: now },
        $expr: { $lt: ["$attempts", "$maxAttempts"] },
        $or: [{ lockedUntil: { $exists: false } }, { lockedUntil: null }, { lockedUntil: { $lt: now } }],
        ...(onlyEntityId ? { entityId: onlyEntityId } : {}),
      },
      { $set: { status: "running", lockedUntil: new Date(Date.now() + 120_000) }, $inc: { attempts: 1 } },
      { sort: { nextRunAt: 1 }, returnDocument: "after" },
    );
    if (!job) break;
    processed++;
    const field = INTEGRATION_FIELD[job.kind as JobKind];
    const Model = job.entity === "Lead" ? Lead : Visitor;
    try {
      const outcome = await execute(job as never);
      job.status = outcome.status;
      job.lastError = outcome.status === "skipped" ? outcome.reason : undefined;
      job.lockedUntil = undefined;
      await job.save();
      if (field) await (Model as typeof Lead).updateOne({ _id: job.entityId }, { $set: { [`integrations.${field}`]: outcome.status } });
      log.info("job.complete", { kind: job.kind, entity: job.entity, status: outcome.status });
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : String(err);
      job.status = "failed";
      job.lastError = message.slice(0, 500);
      job.nextRunAt = new Date(Date.now() + backoffMs(job.attempts));
      job.lockedUntil = undefined;
      await job.save();
      if (field) await (Model as typeof Lead).updateOne({ _id: job.entityId }, { $set: { [`integrations.${field}`]: "failed" } });
      log.error("job.failed", { kind: job.kind, entity: job.entity, attempts: job.attempts, error: message });
    }
  }
  return { processed, failed };
}
