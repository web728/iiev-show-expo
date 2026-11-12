import "server-only";
import mongoose, { Schema, Types, type Model } from "mongoose";
import { siteConfig } from "@/config/site";
import { connectDb } from "@/lib/db/connect";
import { emailConfigured, emailRecipients } from "./email";
import { sendWebsiteNotification } from "./website-email";
import {
  assertSubmissionKey,
  sanitizeWebsiteDraftData,
  syncWebsiteDraftToSheet,
  websiteSheetRow,
} from "./sheets-sync";
import { WebsiteDraft, type WebForm, type WebsiteDraftData } from "./draft-model";

// Old frontend aliases remain accepted; saved values use the canonical form names.
export type WebsiteFormName = WebForm | "exhibitor" | "partnership";

export type WebsiteLeadInput = {
  submissionKey: string;
  form: WebsiteFormName;
  fullName: string;
  email: string;
  phone?: string;
  phoneCountry?: string;
  company?: string;
  designation?: string;
  website?: string;
  linkedin?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  areaPreference?: string;
  productDescription?: string;
  industry?: string;
  message?: string;
  segments?: string[];
  sectorInterests?: string[];
  interests?: string[];
  topicsOfInterest?: string[];
  objectives?: string;
  budgetRange?: string;
  partnerType?: string;
  proposal?: string;
  topic?: string;
  topicTitle?: string;
  abstract?: string;
  format?: string;
  bio?: string;
  previousSpeaking?: string;
  notes?: string;
  brochureName?: string;
  attribution?: WebsiteDraftData["attribution"];
  privacyAccepted?: boolean;
  marketingOptIn?: boolean;
  /** Required for a NEW final submission. Autosave must not verify CAPTCHA. */
  recaptchaToken?: string;
};

type WebsiteLeadDoc = WebsiteDraftData & {
  submissionKey: string;
  form: WebForm;
  fullName: string;
  email: string;
  privacyAccepted: boolean;
  marketingOptIn: boolean;
  submittedAt: Date;
  sheetSynced: boolean;
  mail1Sent: boolean;
  mail2Sent: boolean;
};

const websiteLeadSchema = new Schema<WebsiteLeadDoc>(
  {
    submissionKey: { type: String, required: true, unique: true, immutable: true },
    form: {
      type: String,
      enum: ["stall", "visitor", "contact", "sponsorship", "partner", "speaker", "delegate", "media", "brochure"],
      required: true,
      immutable: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: String,
    phoneCountry: String,
    company: String,
    designation: String,
    website: String,
    linkedin: String,
    address: String,
    city: String,
    state: String,
    country: String,
    industry: String,
    areaPreference: String,
    productDescription: String,
    interests: [String],
    topicsOfInterest: [String],
    segments: [String],
    sectorInterests: [String],
    objectives: String,
    budgetRange: String,
    partnerType: String,
    proposal: String,
    topic: String,
    topicTitle: String,
    abstract: String,
    format: String,
    bio: String,
    previousSpeaking: String,
    message: String,
    notes: String,
    brochureName: String,
    attribution: Schema.Types.Mixed,
    // Keep the actual consent value; do not pretend that clicking Submit granted it.
    privacyAccepted: { type: Boolean, default: false },
    marketingOptIn: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
    sheetSynced: { type: Boolean, default: false },
    mail1Sent: { type: Boolean, default: false },
    mail2Sent: { type: Boolean, default: false },
  },
  { collection: "website_enquiries", timestamps: true },
);
websiteLeadSchema.index({ form: 1, submittedAt: -1 });

export const WebsiteLead: Model<WebsiteLeadDoc> =
  (mongoose.models.WebsiteLead as Model<WebsiteLeadDoc> | undefined) ??
  mongoose.model<WebsiteLeadDoc>("WebsiteLead", websiteLeadSchema);

function normalizeForm(form: WebsiteFormName): WebForm {
  const canonical = form === "exhibitor" ? "stall" : form === "partnership" ? "partner" : form;
  const forms: readonly string[] = [
    "stall", "visitor", "contact", "sponsorship", "partner", "speaker", "delegate", "media", "brochure",
  ];
  if (!forms.includes(canonical)) throw new Error("Unknown website form");
  return canonical;
}

function isDuplicateKey(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === 11000);
}

function assertInput(input: WebsiteLeadInput): { form: WebForm; email: string; name: string } {
  assertSubmissionKey(input.submissionKey);
  const form = normalizeForm(input.form);
  const name = input.fullName?.trim();
  const email = input.email?.trim().toLowerCase();
  if (!name || name.length < 2 || name.length > 100) throw new Error("Invalid full name");
  if (!email || email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid email");
  }
  return { form, email, name };
}

type RecaptchaResponse = {
  success?: boolean;
  hostname?: string;
  "error-codes"?: string[];
};

/**
 * Verify Google reCAPTCHA v2 exactly ONCE, only when first creating a final record.
 * If your route calls siteverify already, remove that duplicate call there.
 */
export async function verifyRecaptchaV2(token: string): Promise<void> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) throw new Error("RECAPTCHA_SECRET_KEY is missing");
  if (!token || typeof token !== "string" || token.length > 4096) {
    throw new Error("Please complete the CAPTCHA verification");
  }
  const allowedFromEnv = process.env.RECAPTCHA_ALLOWED_HOSTNAMES
    ?.split(",").map((hostname) => hostname.trim().toLowerCase()).filter(Boolean) ?? [];
  const configuredHost = new URL(siteConfig.url).hostname.toLowerCase();
  const allowedHosts = new Set(allowedFromEnv.length ? allowedFromEnv : [configuredHost]);

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error("CAPTCHA verification service unavailable");
  const data = (await response.json()) as RecaptchaResponse;
  if (!data.success || !data.hostname || !allowedHosts.has(data.hostname.toLowerCase())) {
    throw new Error("CAPTCHA verification failed. Please try again");
  }
}

/** Old helper kept for existing caller imports; now uses the same 20-column layout. */
export function toWebsiteSheetRow(lead: WebsiteLeadDoc): string[] {
  return websiteSheetRow(lead.form, lead, "submitted", lead.submittedAt, {
    submissionKey: lead.submissionKey,
    privacyAccepted: lead.privacyAccepted,
  });
}

async function ensureFinalDraft(
  lead: WebsiteLeadDoc & { _id: Types.ObjectId },
): Promise<void> {
  const submissionKey = lead.submissionKey;
  const finalRef = String(lead._id);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const draft = await WebsiteDraft.findOne({ submissionKey }).lean();
    if (draft && draft.form !== lead.form) {
      throw new Error("Submission key belongs to another form");
    }
    if (draft?.state === "submitted" && draft.finalRef === finalRef) return;
    if (draft?.state === "submitted") {
      if (draft.finalRef && draft.finalRef !== finalRef) {
        throw new Error("Submission key is linked to another final record");
      }
      // Migration path for older submitted drafts that had no finalRef.
      const fixed = await WebsiteDraft.updateOne(
        { _id: draft._id, finalRef: { $exists: false } },
        { $set: { finalRef }, $inc: { revision: 1 } },
      );
      if (fixed.modifiedCount === 1) return;
      continue;
    }

    const safeData = sanitizeWebsiteDraftData({ ...(draft?.data ?? {}), ...lead });
    if (draft) {
      const updated = await WebsiteDraft.updateOne(
        { _id: draft._id, state: "draft" },
        {
          $set: {
            state: "submitted",
            data: safeData,
            submittedAt: lead.submittedAt,
            finalRef,
            privacyAccepted: lead.privacyAccepted,
            marketingOptIn: lead.marketingOptIn,
          },
          $inc: { revision: 1 },
        },
      );
      if (updated.modifiedCount === 1) return;
      // Another final submit may have won this race; re-read next iteration.
      continue;
    }

    try {
      await WebsiteDraft.create({
        submissionKey,
        form: lead.form,
        state: "submitted",
        data: safeData,
        privacyAccepted: lead.privacyAccepted,
        marketingOptIn: lead.marketingOptIn,
        finalRef,
        submittedAt: lead.submittedAt,
        revision: 1,
      });
      return;
    } catch (error) {
      if (!isDuplicateKey(error)) throw error;
    }
  }
  const current = await WebsiteDraft.findOne({ submissionKey }).lean();
  if (current?.state === "submitted" && current.finalRef === finalRef) return;
  throw new Error("Final submission state is not yet consistent; please retry");
}

async function sendOnce(args: {
  lead: WebsiteLeadDoc & { _id: Types.ObjectId };
  recipient: string;
  number: 1 | 2;
}): Promise<"sent" | "already_sent" | "busy"> {
  const { lead, recipient, number } = args;
  const sentField = number === 1 ? "mail1Sent" : "mail2Sent";
  const leaseField = number === 1 ? "mail1LeaseUntil" : "mail2LeaseUntil";

  if (lead[sentField]) {
    await WebsiteDraft.updateOne(
      { submissionKey: lead.submissionKey },
      { $set: { [sentField]: true } },
    );
    return "already_sent";
  }

  const now = new Date();
  const lease = new Date(now.getTime() + 120_000);
  const claimed = await WebsiteDraft.findOneAndUpdate(
    {
      submissionKey: lead.submissionKey,
      [sentField]: false,
      $or: [
        { [leaseField]: { $exists: false } },
        { [leaseField]: { $lte: now } },
      ],
    },
    { $set: { [leaseField]: lease } },
    { new: true },
  ).lean();
  if (!claimed) {
    const latest = await WebsiteDraft.findOne({ submissionKey: lead.submissionKey }).lean();
    return latest?.[sentField] ? "already_sent" : "busy";
  }

  try {
    await sendWebsiteNotification({
      recipient,
      form: lead.form,
      data: lead,
      submittedAt: lead.submittedAt,
      ref: String(lead._id),
    });
    // The draft flag is authoritative for concurrency; legacy flag is also updated.
    await WebsiteDraft.updateOne(
      { _id: claimed._id, [leaseField]: lease },
      { $set: { [sentField]: true }, $unset: { [leaseField]: "" } },
    );
    await WebsiteLead.updateOne({ _id: lead._id }, { $set: { [sentField]: true } });
    return "sent";
  } catch (error) {
    await WebsiteDraft.updateOne(
      { _id: claimed._id, [leaseField]: lease },
      {
        $set: { lastError: error instanceof Error ? error.message.slice(0, 500) : "Email error" },
        $unset: { [leaseField]: "" },
      },
    );
    throw error;
  }
}

/** Side effects can be retried safely by an authorised background worker. */
async function runWebsiteLeadIntegrations(
  lead: WebsiteLeadDoc & { _id: Types.ObjectId },
): Promise<string[]> {
  // MongoDB is the source of truth. A Sheets/SMTP outage must not cause the
  // browser to resubmit as a brand new lead.
  const failures: string[] = [];

  try {
    const sheet = await syncWebsiteDraftToSheet(lead.submissionKey);
    if (sheet.synced) {
      await WebsiteLead.updateOne({ _id: lead._id }, { $set: { sheetSynced: true } });
    } else {
      failures.push("sheets_pending");
    }
  } catch (error) {
    console.error("[website-lead] Google Sheets:", error);
    failures.push("sheets");
  }

  if (!emailConfigured()) {
    failures.push("email_config");
  } else {
    let targets: [string, string] | undefined;
    try {
      targets = emailRecipients();
    } catch (error) {
      console.error("[website-lead] NOTIFY_EMAILS:", error);
      failures.push("email_recipients");
    }
    if (targets) {
      for (const [index, recipient] of targets.entries()) {
        try {
          const sent = await sendOnce({
            lead,
            recipient,
            number: index === 0 ? 1 : 2,
          });
          if (sent === "busy") failures.push(`email${index + 1}_pending`);
        } catch (error) {
          console.error(`[website-lead] organiser email ${index + 1}:`, error);
          failures.push(`email${index + 1}`);
        }
      }
    }
  }

  return failures;
}

/** Retry Sheets and organiser notifications for a previously saved final submission. */
export async function retryWebsiteLeadIntegrations(submissionKey: string): Promise<{
  reference: string;
  failures: string[];
  fullySynced: boolean;
}> {
  assertSubmissionKey(submissionKey);
  await connectDb();
  type PersistedLead = WebsiteLeadDoc & { _id: Types.ObjectId };
  const lead = (await WebsiteLead.findOne({ submissionKey }).lean()) as PersistedLead | null;
  if (!lead) throw new Error("Submitted website enquiry not found");
  await ensureFinalDraft(lead);
  const failures = await runWebsiteLeadIntegrations(lead);
  return { reference: String(lead._id), failures, fullySynced: failures.length === 0 };
}

/**
 * Returns ok:true once MongoDB has the final record, even when external
 * integrations are pending. Call this from the FINAL submission API only.
 */
export async function submitWebsiteLead(input: WebsiteLeadInput): Promise<{
  ok: true;
  reference: string;
  failures: string[];
  fullySynced: boolean;
}> {
  const { form, name, email } = assertInput(input);
  await connectDb();

  type PersistedLead = WebsiteLeadDoc & { _id: Types.ObjectId };
  let lead = (await WebsiteLead.findOne({ submissionKey: input.submissionKey }).lean()) as PersistedLead | null;

  if (!lead) {
    // Existing autosaved WebsiteDraft is NOT a final submission.
    // New final submissions must pass server-side CAPTCHA verification.
    await verifyRecaptchaV2(input.recaptchaToken ?? "");
    const safeData = sanitizeWebsiteDraftData({ ...input, fullName: name, email });
    const document = {
      ...safeData,
      submissionKey: input.submissionKey,
      form,
      fullName: name,
      email,
      privacyAccepted: input.privacyAccepted === true,
      marketingOptIn: input.marketingOptIn === true,
      submittedAt: new Date(),
      sheetSynced: false,
      mail1Sent: false,
      mail2Sent: false,
    };

    try {
      lead = (await WebsiteLead.findOneAndUpdate(
        { submissionKey: input.submissionKey },
        { $setOnInsert: document },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      ).lean()) as PersistedLead | null;
    } catch (error) {
      if (!isDuplicateKey(error)) throw error;
      lead = (await WebsiteLead.findOne({ submissionKey: input.submissionKey }).lean()) as PersistedLead | null;
    }
  }

  if (!lead || lead.form !== form || lead.email.toLowerCase() !== email) {
    // Never leak another user's data when a key is reused with a different identity.
    throw new Error("Submission key is associated with another request");
  }

  // MongoDB is the source of truth. Integration failures do not invalidate it.
  await ensureFinalDraft(lead);
  const failures = await runWebsiteLeadIntegrations(lead);

  return {
    ok: true,
    reference: String(lead._id),
    failures,
    fullySynced: failures.length === 0,
  };
}
