import "server-only";
import { connectDb } from "@/lib/db/connect";
import {
  WEB_FORMS,
  WebsiteDraft,
  type WebForm,
  type WebsiteDraftData,
} from "./draft-model";
import { upsertWebsiteEnquiry } from "./sheets";

export const FORM_LABELS: Record<WebForm, string> = {
  stall: "Exhibitor Enquiry",
  visitor: "Visitor Registration",
  contact: "Contact Enquiry",
  sponsorship: "Sponsorship Enquiry",
  partner: "Partnership Enquiry",
  speaker: "Speaker Application",
  delegate: "Delegate Registration",
  media: "Media Enquiry",
  brochure: "Brochure Download",
};

const STRING_FIELDS = [
  "fullName", "email", "phone", "phoneCountry", "company", "designation",
  "country", "city", "state", "address", "website", "industry",
  "areaPreference", "productDescription", "objectives", "budgetRange",
  "partnerType", "proposal", "topic", "topicTitle", "abstract", "format",
  "bio", "previousSpeaking", "linkedin", "message", "notes", "brochureName",
] as const;
const ARRAY_FIELDS = [
  "interests", "topicsOfInterest", "segments", "sectorInterests",
] as const;
const ATTRIBUTION_FIELDS = [
  "referrer", "landingPage", "utmSource", "utmMedium", "utmCampaign",
  "utmTerm", "utmContent",
] as const;

export function assertSubmissionKey(submissionKey: string): void {
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(submissionKey)) {
    throw new Error("Invalid submission key");
  }
}

export function assertWebForm(form: string): asserts form is WebForm {
  if (!(WEB_FORMS as readonly string[]).includes(form)) {
    throw new Error("Invalid website form");
  }
}

/** Whitelist user-supplied draft fields. Do not store arbitrary objects in Mixed. */
export function sanitizeWebsiteDraftData(source: unknown): WebsiteDraftData {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw new Error("Form data must be an object");
  }
  const input = source as Record<string, unknown>;
  const data: WebsiteDraftData = {};
  for (const key of STRING_FIELDS) {
    const value = input[key];
    if (typeof value === "string") {
      const limit = key === "message" ? 3_000 :
        key === "abstract" ? 2_000 :
        ["productDescription", "objectives", "proposal"].includes(key) ? 1_500 :
        1_000;
      data[key] = value.trim().slice(0, limit);
    }
  }
  if (typeof data.email === "string") data.email = data.email.toLowerCase();
  if (typeof data.phoneCountry === "string") {
    data.phoneCountry = data.phoneCountry.toUpperCase().slice(0, 2);
  }
  for (const key of ARRAY_FIELDS) {
    const value = input[key];
    if (Array.isArray(value)) {
      data[key] = value.filter((item): item is string => typeof item === "string")
        .slice(0, 30)
        .map((item) => item.trim().slice(0, 200));
    }
  }
  const rawAttribution = input.attribution;
  if (rawAttribution && typeof rawAttribution === "object" && !Array.isArray(rawAttribution)) {
    const sourceAttr = rawAttribution as Record<string, unknown>;
    const attribution: Record<string, string> = {};
    for (const key of ATTRIBUTION_FIELDS) {
      if (typeof sourceAttr[key] === "string") {
        attribution[key] = sourceAttr[key].slice(0, 500);
      }
    }
    data.attribution = attribution;
  }
  return data;
}

function value(data: WebsiteDraftData, key: string): string {
  const item = data[key];
  if (Array.isArray(item)) return item.filter((v) => typeof v === "string").join(", ");
  return typeof item === "string" ? item : "";
}

export function formatIst(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
  }).format(date);
}

/**
 * Fixed 20 columns (A:T). Column O uniquely identifies this form instance.
 * P = draft/submitted; Q = last update; R = final reference.
 */
export function websiteSheetRow(
  form: WebForm,
  data: WebsiteDraftData,
  state: "draft" | "submitted",
  at: Date,
  metadata: {
    submissionKey?: string;
    finalRef?: string;
    updatedAt?: Date;
    privacyAccepted?: boolean;
  } = {},
): string[] {
  const interest = [
    value(data, "areaPreference"), value(data, "industry"),
    value(data, "segments"), value(data, "sectorInterests"),
    value(data, "interests"), value(data, "topicsOfInterest"),
    value(data, "budgetRange"), value(data, "partnerType"),
  ].filter(Boolean).join(" | ");

  const details = [
    value(data, "brochureName") && `Document: ${value(data, "brochureName")}`,
    value(data, "productDescription") && `Products & Services: ${value(data, "productDescription")}`,
    value(data, "objectives") && `Objectives: ${value(data, "objectives")}`,
    value(data, "proposal") && `Proposal: ${value(data, "proposal")}`,
    value(data, "topic") && `Topic: ${value(data, "topic")}`,
    value(data, "topicTitle") && `Proposed Topic: ${value(data, "topicTitle")}`,
    value(data, "abstract") && `Abstract: ${value(data, "abstract")}`,
    value(data, "format") && `Format: ${value(data, "format")}`,
    value(data, "bio") && `Bio: ${value(data, "bio")}`,
    value(data, "previousSpeaking") && `Previous speaking: ${value(data, "previousSpeaking")}`,
    value(data, "message"), value(data, "notes"),
  ].filter(Boolean).join(" | ");

  const address = [value(data, "address"), value(data, "city"), value(data, "state")]
    .filter(Boolean).join(", ");
  return [
    formatIst(at),
    "IIEV Show Website",
    FORM_LABELS[form],
    value(data, "company"),
    value(data, "fullName"),
    value(data, "designation"),
    value(data, "email"),
    value(data, "phone"),
    value(data, "website") || value(data, "linkedin"),
    address,
    value(data, "country"),
    interest,
    "Website",
    details,
    metadata.submissionKey ?? "",         // O -- NEVER remove from autosave flow
    state,                                // P
    formatIst(metadata.updatedAt ?? at), // Q
    metadata.finalRef ?? "",             // R
    metadata.privacyAccepted === true ? "yes" : "no", // S
    value(data, "phoneCountry"),        // T
  ];
}

function isDuplicateKey(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === 11000);
}

/** Called by your AUTOSAVE API only, not by the final-submit endpoint. */
export async function saveWebsiteDraft(input: {
  submissionKey: string;
  form: WebForm;
  data: unknown;
  privacyAccepted?: boolean;
  marketingOptIn?: boolean;
  /** Skip Sheets HTTP request here; the outbox cron or after() will sync it. */
  syncImmediately?: boolean;
}): Promise<{
  saved: boolean;
  state: "draft" | "submitted";
  sheetSynced: boolean;
  revision: number;
}> {
  assertSubmissionKey(input.submissionKey);
  assertWebForm(input.form);
  const data = sanitizeWebsiteDraftData(input.data);
  await connectDb();

  const change = {
    $set: {
      data,
      privacyAccepted: input.privacyAccepted === true,
      marketingOptIn: input.marketingOptIn === true,
    },
    $setOnInsert: { submissionKey: input.submissionKey, form: input.form, state: "draft" },
    $inc: { revision: 1 },
  };

  try {
    await WebsiteDraft.findOneAndUpdate(
      { submissionKey: input.submissionKey, form: input.form, state: "draft" },
      change,
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
    const existing = await WebsiteDraft.findOne({ submissionKey: input.submissionKey }).lean();
    if (!existing || existing.form !== input.form) {
      throw new Error("Submission key is associated with another form");
    }
    if (existing.state === "submitted") {
      return { saved: true, state: "submitted", sheetSynced: Boolean(existing.sheetRange && existing.sheetRevision >= existing.revision), revision: existing.revision };
    }
    await WebsiteDraft.updateOne(
      { _id: existing._id, state: "draft" },
      { $set: change.$set, $inc: change.$inc },
    );
  }

  const current = await WebsiteDraft.findOne({ submissionKey: input.submissionKey }).lean();
  if (!current) throw new Error("Draft was not persisted");
  if (current.form !== input.form) throw new Error("Submission key belongs to another form");
  if (current.state === "submitted") {
    return { saved: true, state: "submitted", sheetSynced: Boolean(current.sheetRange && current.sheetRevision >= current.revision), revision: current.revision };
  }

  if (input.syncImmediately === false) {
    return { saved: true, state: "draft", sheetSynced: false, revision: current.revision };
  }

  try {
    const result = await syncWebsiteDraftToSheet(input.submissionKey);
    return { saved: true, state: "draft", sheetSynced: result.synced, revision: current.revision };
  } catch (error) {
    console.error("[website-draft] Google Sheets pending:", error);
    // MongoDB autosave succeeded. Do not tell the user their form was lost.
    return { saved: true, state: "draft", sheetSynced: false, revision: current.revision };
  }
}

/**
 * Safe to call repeatedly, including from a cron/retry worker.
 * MongoDB lease prevents concurrent writers for one submissionKey.
 */
export async function syncWebsiteDraftToSheet(submissionKey: string): Promise<{
  synced: boolean;
  sheetRange?: string;
}> {
  assertSubmissionKey(submissionKey);
  await connectDb();
  const now = new Date();
  const lease = new Date(now.getTime() + 120_000);

  const current = await WebsiteDraft.findOne({ submissionKey }).lean();
  if (!current) throw new Error("Website draft not found");
  if (current.sheetRange && current.sheetRevision >= current.revision) {
    return { synced: true, sheetRange: current.sheetRange };
  }

  const leased = await WebsiteDraft.findOneAndUpdate(
    {
      _id: current._id,
      $or: [
        { sheetLeaseUntil: { $exists: false } },
        { sheetLeaseUntil: { $lte: now } },
      ],
    },
    { $set: { sheetLeaseUntil: lease } },
    { new: true },
  ).lean();
  if (!leased) return { synced: false, sheetRange: current.sheetRange };

  try {
    const snapshot = await WebsiteDraft.findById(current._id).lean();
    if (!snapshot) throw new Error("Website draft disappeared");
    const row = websiteSheetRow(
      snapshot.form,
      snapshot.data,
      snapshot.state,
      snapshot.submittedAt ?? snapshot.createdAt,
      {
        submissionKey: snapshot.submissionKey,
        finalRef: snapshot.finalRef,
        updatedAt: snapshot.updatedAt,
        privacyAccepted: snapshot.privacyAccepted,
      },
    );
    const sheetRange = await upsertWebsiteEnquiry(
      row, snapshot.submissionKey, snapshot.sheetRange,
    );
    await WebsiteDraft.updateOne(
      { _id: current._id, sheetLeaseUntil: lease },
      {
        $set: { sheetRange, sheetRevision: snapshot.revision },
        $unset: { sheetLeaseUntil: "", lastError: "" },
      },
    );
    // If another autosave arrived while Google was writing, revision will now
    // be higher and a subsequent sync will update the same row.
    const latest = await WebsiteDraft.findById(current._id).lean();
    return {
      synced: Boolean(latest && latest.sheetRevision >= latest.revision),
      sheetRange,
    };
  } catch (error) {
    await WebsiteDraft.updateOne(
      { _id: current._id, sheetLeaseUntil: lease },
      {
        $set: { lastError: error instanceof Error ? error.message.slice(0, 500) : "Sheets sync error" },
        $unset: { sheetLeaseUntil: "" },
      },
    );
    throw error;
  }
}
