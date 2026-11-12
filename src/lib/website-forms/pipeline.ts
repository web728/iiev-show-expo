import "server-only";

import { connectDb } from "@/lib/db/connect";
import { Types } from "mongoose";
import { WebsiteDraft, type WebForm, type WebsiteDraftData } from "@/lib/website-forms/draft-model";
import {
  assertSubmissionKey,
  assertWebForm,
  sanitizeWebsiteDraftData,
  syncWebsiteDraftToSheet,
} from "@/lib/website-forms/sheets-sync";
import { emailRecipients } from "@/lib/website-forms/email";
import { sendWebsiteNotification } from "@/lib/website-forms/website-email";

export { saveWebsiteDraft } from "@/lib/website-forms/sheets-sync";

export class DraftConflictError extends Error {
  constructor() {
    super("This submission key belongs to another submission.");
    this.name = "DraftConflictError";
  }
}

function duplicateKey(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === 11000);
}

/**
 * Finalise the SAME autosaved WebsiteDraft after the canonical CRM record exists.
 * No CAPTCHA here: it has already been checked by the public submission guard.
 * This function performs MongoDB writes only; no Google/SMTP wait on submit.
 */
export async function finalizeWebsiteDraft(input: {
  submissionKey: string;
  form: WebForm;
  data: unknown;
  ref: string;
  finalEntity?: "Lead" | "Visitor";
  finalEntityId?: string;
}): Promise<{ ref: string; newlyFinalized: boolean }> {
  assertSubmissionKey(input.submissionKey);
  assertWebForm(input.form);
  if (typeof input.ref !== "string" || !input.ref.trim() || input.ref.length > 120) {
    throw new Error("Missing final reference");
  }
  const data = sanitizeWebsiteDraftData(input.data);
  await connectDb();
  const now = new Date();

  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await WebsiteDraft.findOne({ submissionKey: input.submissionKey }).lean();
    if (existing) {
      if (existing.form !== input.form) throw new DraftConflictError();
      if (existing.state === "submitted") {
        if (existing.finalRef !== input.ref ||
            (existing.data.email && existing.data.email !== data.email)) {
          throw new DraftConflictError();
        }
        return { ref: existing.finalRef, newlyFinalized: false };
      }
      const updated = await WebsiteDraft.findOneAndUpdate(
        { _id: existing._id, form: input.form, state: "draft" },
        {
          $set: {
            state: "submitted",
            data,
            finalRef: input.ref,
            finalEntity: input.finalEntity,
            finalEntityId: input.finalEntityId ? new Types.ObjectId(input.finalEntityId) : undefined,
            submittedAt: now,
            privacyAccepted: false, // Form has no affirmative privacy checkbox.
            marketingOptIn: false,
          },
          $inc: { revision: 1 },
        },
        { new: true, runValidators: true },
      );
      if (updated) return { ref: input.ref, newlyFinalized: true };
      continue;
    }

    try {
      await WebsiteDraft.create({
        submissionKey: input.submissionKey,
        form: input.form,
        state: "submitted",
        data,
        finalRef: input.ref,
        finalEntity: input.finalEntity,
        finalEntityId: input.finalEntityId ? new Types.ObjectId(input.finalEntityId) : undefined,
        submittedAt: now,
        privacyAccepted: false,
        marketingOptIn: false,
        revision: 1,
      });
      return { ref: input.ref, newlyFinalized: true };
    } catch (error) {
      if (!duplicateKey(error)) throw error;
      // A concurrent autosave/final submission won. Re-read before deciding.
    }
  }
  throw new Error("Concurrent draft update; safely retry with the same submission key");
}

export async function findFinalBrochureSubmission(
  submissionKey: unknown,
  email: unknown,
): Promise<boolean> {
  if (typeof submissionKey !== "string" || typeof email !== "string") return false;
  if (!/^[0-9a-f-]{36}$/i.test(submissionKey)) return false;
  await connectDb();
  const draft = await WebsiteDraft.findOne({
    submissionKey,
    form: "brochure",
    state: "submitted",
    "data.email": email.trim().toLowerCase(),
  }).select("_id").lean();
  return Boolean(draft);
}

async function sendOrganiserOnce(
  key: string,
  index: 0 | 1,
  recipient: string,
): Promise<"sent" | "already_sent" | "busy"> {
  const sentKey = index === 0 ? "mail1Sent" : "mail2Sent";
  const leaseKey = index === 0 ? "mail1LeaseUntil" : "mail2LeaseUntil";
  const now = new Date();
  const leaseUntil = new Date(now.getTime() + 120_000);
  const claimed = await WebsiteDraft.findOneAndUpdate(
    {
      submissionKey: key,
      state: "submitted",
      [sentKey]: false,
      $or: [
        { [leaseKey]: { $exists: false } },
        { [leaseKey]: { $lte: now } },
      ],
    },
    { $set: { [leaseKey]: leaseUntil } },
    { new: true },
  ).lean();
  if (!claimed) {
    const latest = await WebsiteDraft.findOne({ submissionKey: key })
      .select(`${sentKey} ${leaseKey}`).lean();
    return latest?.[sentKey] ? "already_sent" : "busy";
  }

  try {
    await sendWebsiteNotification({
      recipient,
      form: claimed.form,
      data: claimed.data,
      submittedAt: claimed.submittedAt ?? claimed.updatedAt,
      ref: claimed.finalRef ?? key,
    });
    await WebsiteDraft.updateOne(
      { _id: claimed._id, [leaseKey]: leaseUntil },
      { $set: { [sentKey]: true }, $unset: { [leaseKey]: "", lastError: "" } },
    );
    return "sent";
  } catch (error) {
    await WebsiteDraft.updateOne(
      { _id: claimed._id, [leaseKey]: leaseUntil },
      {
        $set: { lastError: error instanceof Error ? error.message.slice(0, 400) : "Email delivery failed" },
        $unset: { [leaseKey]: "" },
      },
    );
    throw error;
  }
}

/**
 * One retryable outbox worker. Drafts sync to Sheet, but NEVER send emails.
 * Final submissions update the same Sheet row and email both organisers.
 * Uses DB leases and flags to avoid normal concurrent duplicates.
 */
export async function deliverWebsiteDraft(submissionKey: string): Promise<{
  sheetSynced: boolean;
  emailsPending: number;
  failures: string[];
}> {
  assertSubmissionKey(submissionKey);
  await connectDb();
  const original = await WebsiteDraft.findOne({ submissionKey }).lean();
  if (!original) throw new Error("Draft does not exist");
  const failures: string[] = [];

  try {
    const result = await syncWebsiteDraftToSheet(submissionKey);
    if (!result.synced) failures.push("sheet_pending");
  } catch (error) {
    failures.push("sheets");
    console.error("[forms] Sheet sync pending", error instanceof Error ? error.message : "unknown");
  }

  if (original.state === "submitted") {
    try {
      const [first, second] = emailRecipients();
      const results = await Promise.allSettled([
        sendOrganiserOnce(submissionKey, 0, first),
        sendOrganiserOnce(submissionKey, 1, second),
      ]);
      for (const [index, result] of results.entries()) {
        if (result.status === "rejected") {
          failures.push(`email${index + 1}`);
          console.error(`[forms] Email ${index + 1} pending`,
            result.reason instanceof Error ? result.reason.message : "unknown");
        }
      }
    } catch (error) {
      failures.push("email_configuration");
      console.error("[forms] Email configuration pending",
        error instanceof Error ? error.message : "unknown");
    }
  }

  const latest = await WebsiteDraft.findOne({ submissionKey }).lean();
  if (!latest) throw new Error("Draft disappeared");
  return {
    sheetSynced: latest.sheetRevision >= latest.revision,
    emailsPending: latest.state === "submitted"
      ? Number(!latest.mail1Sent) + Number(!latest.mail2Sent)
      : 0,
    failures,
  };
}

/** Called by an authorised CRON, not from a public website request. */
export async function processPendingWebsiteDrafts(max = 25) {
  await connectDb();
  const limit = Math.min(50, Math.max(1, Math.floor(max)));
  const pending = await WebsiteDraft.find({
    $or: [
      { $expr: { $lt: ["$sheetRevision", "$revision"] } },
      { state: "submitted", mail1Sent: false },
      { state: "submitted", mail2Sent: false },
    ],
  })
    .sort({ updatedAt: 1 })
    .limit(limit)
    .select("submissionKey")
    .lean();

  let completed = 0;
  let stillPending = 0;
  let cursor = 0;
  // Limit external API concurrency; avoid a long sequential cron timeout.
  async function worker() {
    while (cursor < pending.length) {
      const record = pending[cursor++];
      try {
        const delivered = await deliverWebsiteDraft(record.submissionKey);
        if (delivered.sheetSynced && delivered.emailsPending === 0) completed++;
        else stillPending++;
      } catch (error) {
        stillPending++;
        console.error("[forms] Pending draft delivery", error instanceof Error ? error.message : "unknown");
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, pending.length) }, () => worker()));
  return { examined: pending.length, completed, stillPending };
}

/** Used for existing saved Lead/Visitor retries: prefer persisted CRM values. */
export function crmRecordToDraftData(record: {
  fullName?: string; email?: string; phone?: string; phoneCountry?: string;
  company?: string; designation?: string; city?: string; state?: string;
  country?: string; website?: string; industry?: string;
  details?: unknown; attribution?: unknown;
}): WebsiteDraftData {
  const details = record.details && typeof record.details === "object" && !Array.isArray(record.details)
    ? record.details as Record<string, unknown> : {};
  return sanitizeWebsiteDraftData({ ...details, ...record, details: undefined });
}
