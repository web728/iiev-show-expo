import "server-only";

import { connectDb } from "@/lib/db/connect";
import { Lead, type LeadType } from "@/models/leads";
import { humanRef, hmac } from "@/lib/security/crypto";
import { enqueueLeadPipeline } from "@/lib/jobs";
import { getCurrentEdition } from "@/lib/data/edition";
import { log } from "@/lib/log";

const REF_PREFIX: Record<LeadType, string> = {
  stall: "ST",
  sponsorship: "SP",
  partner: "PT",
  speaker: "SK",
  delegate: "DL",
  contact: "CT",
  media: "MD",
};

type CommonInput = {
  idempotencyKey: string;
  fullName: string;
  email: string;
  phone?: string;
  phoneCountry?: string;
  company?: string;
  designation?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  privacyAccepted?: boolean;
  marketingOptIn?: boolean;
  attribution?: Record<string, string | undefined>;
};

const COMMON_KEYS = new Set([
  "idempotencyKey", "fullName", "email", "phone", "phoneCountry", "company",
  "designation", "city", "state", "country", "website", "privacyAccepted",
  "marketingOptIn", "attribution", "website_url_confirm", "startedAt", "recaptchaToken",
]);

export type CreateLeadResult = { ref: string; id: string; duplicate: boolean };
export class LeadSubmissionConflict extends Error {
  constructor() {
    super("Submission key is associated with a different request.");
    this.name = "LeadSubmissionConflict";
  }
}

type ExistingLead = {
  _id: unknown;
  ref: string;
  type: LeadType;
  edition: string;
  email: string;
};

async function findByKey(key: string): Promise<ExistingLead | null> {
  return Lead.findOne({ idempotencyKey: key })
    .select("_id ref type edition email")
    .lean<ExistingLead>();
}

function matchExisting(existing: ExistingLead, type: LeadType, email: string): CreateLeadResult {
  // Prior submission remains idempotently valid even if the current edition has changed.
  if (existing.type !== type || existing.email.toLowerCase() !== email) {
    throw new LeadSubmissionConflict();
  }
  return { ref: existing.ref, id: String(existing._id), duplicate: true };
}

/**
 * Safe to call from a final-submission route's existingFinalSubmission hook.
 * ONLY final Lead records are searched (not an autosaved WebsiteDraft).
 * A mismatching key/email returns null; never reveal another person's ref.
 */
export async function findExistingLeadSubmission(
  type: LeadType,
  key: unknown,
  email: unknown,
): Promise<CreateLeadResult | null> {
  if (typeof key !== "string" || !/^[A-Za-z0-9_-]{8,100}$/.test(key) ||
      typeof email !== "string" || !email.includes("@")) return null;
  await connectDb();
  const existing = await findByKey(key);
  if (!existing || existing.type !== type ||
      existing.email.toLowerCase() !== email.trim().toLowerCase()) return null;
  return { ref: existing.ref, id: String(existing._id), duplicate: true };
}

/** Queue failures must not turn successfully saved records into failed submissions. */
async function enqueueSafely(id: unknown): Promise<void> {
  try {
    await enqueueLeadPipeline(id as Parameters<typeof enqueueLeadPipeline>[0]);
  } catch (error) {
    log.error("form.lead_pipeline_enqueue_failed", {
      id: String(id),
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/** Called only after Zod and reCAPTCHA verification in the FINAL POST route. */
export async function createLead<T extends CommonInput>(
  type: LeadType,
  input: T,
  ip: string,
  options: { skipLegacyPipeline?: boolean } = {},
): Promise<CreateLeadResult> {
  if (!REF_PREFIX[type]) throw new Error("Unsupported lead type");
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(input.idempotencyKey)) {
    throw new Error("Invalid submission key");
  }
  const email = input.email?.trim().toLowerCase();
  const fullName = input.fullName?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !fullName) {
    throw new Error("Invalid lead contact details");
  }
  await connectDb();

  const existing = await findByKey(input.idempotencyKey);
  if (existing) {
    const response = matchExisting(existing, type, email);
    if (!options.skipLegacyPipeline) await enqueueSafely(existing._id);
    return response;
  }

  const edition = await getCurrentEdition();
  const details = Object.fromEntries(
    Object.entries(input).filter(([key]) => !COMMON_KEYS.has(key)),
  );

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const ref = humanRef(REF_PREFIX[type], edition.slug);
    try {
      const lead = new Lead({
        ref,
        idempotencyKey: input.idempotencyKey,
        type,
        edition: edition.slug,
        fullName,
        email,
        phone: input.phone,
        phoneCountry: input.phoneCountry,
        company: input.company,
        designation: input.designation,
        city: input.city,
        state: input.state,
        country: input.country,
        website: input.website,
        details,
        // Previous public Zod forms have no affirmative consent input.
        privacyAccepted: false,
        marketingOptIn: false,
        attribution: input.attribution,
        stageHistory: [{ stage: "new", by: "web" }],
        ipHash: hmac(ip, "ip"),
      });
      await lead.save();
      if (!options.skipLegacyPipeline) await enqueueSafely(lead._id);
      return { ref, id: String(lead._id), duplicate: false };
    } catch (error) {
      const duplicate = error as { code?: number; keyPattern?: Record<string, unknown> };
      if (duplicate?.code === 11000) {
        const winner = await findByKey(input.idempotencyKey);
        if (winner) {
          const response = matchExisting(winner, type, email);
          if (!options.skipLegacyPipeline) await enqueueSafely(winner._id);
          return response;
        }
        if (duplicate.keyPattern?.ref) continue;
      }
      throw error;
    }
  }
  throw new Error("Could not allocate a unique reference");
}
