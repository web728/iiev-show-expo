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
  "idempotencyKey", "fullName", "email", "phone", "company", "designation",
  "city", "state", "country", "website", "privacyAccepted", "marketingOptIn",
  "attribution", "website_url_confirm", "startedAt", "recaptchaToken",
]);

export type CreateLeadResult = { ref: string; id: string; duplicate: boolean };

export class LeadSubmissionConflict extends Error {
  constructor() {
    super("This submission key belongs to a different form or event edition. Please retry.");
    this.name = "LeadSubmissionConflict";
  }
}

type ExistingLead = { _id: unknown; ref: string; type: LeadType; edition: string };

async function lookupKey(key: string) {
  return Lead.findOne({ idempotencyKey: key })
    .select("ref type edition")
    .lean<ExistingLead>();
}

function sameLead(existing: ExistingLead, type: LeadType, edition: string): CreateLeadResult {
  if (existing.type !== type || existing.edition !== edition) {
    throw new LeadSubmissionConflict();
  }
  return { ref: existing.ref, id: String(existing._id), duplicate: true };
}

/** A queue failure must NOT make a successfully saved form appear to have failed. */
async function enqueueSafely(id: unknown) {
  try {
    await enqueueLeadPipeline(id as Parameters<typeof enqueueLeadPipeline>[0]);
  } catch (err) {
    // Requires a scheduled reconciliation / queue-repair job (see README).
    log.error("form.lead_pipeline_enqueue_failed", {
      id: String(id),
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function createLead(
  type: LeadType,
  input: CommonInput & Record<string, unknown>,
  ip: string,
): Promise<CreateLeadResult> {
  await connectDb();
  const edition = await getCurrentEdition();
  const existing = await lookupKey(input.idempotencyKey);
  if (existing) {
    const result = sameLead(existing, type, edition.slug);
    await enqueueSafely(existing._id); // Idempotent queue dedupe is required.
    return result;
  }

  const details = Object.fromEntries(
    Object.entries(input).filter(([key]) => !COMMON_KEYS.has(key)),
  );

  for (let attempt = 0; attempt < 3; attempt++) {
    // Using new Model().save() avoids ReturnType<typeof Model.create>
    // which loses the selected overload's document type in TypeScript.
    const ref = humanRef(REF_PREFIX[type], edition.slug);
    try {
      const lead = new Lead({
        ref,
        idempotencyKey: input.idempotencyKey,
        type,
        edition: edition.slug,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        company: input.company,
        designation: input.designation,
        city: input.city,
        state: input.state,
        country: input.country,
        website: input.website,
        details,
        privacyAccepted: false,
        marketingOptIn: false,
        attribution: input.attribution,
        stageHistory: [{ stage: "new", by: "web" }],
        ipHash: hmac(ip, "ip"),
      });

      await lead.save();
      // Only run the queue after MongoDB has successfully saved the document.
      await enqueueSafely(lead._id);
      return { ref, id: String(lead._id), duplicate: false };
    } catch (err) {
      const error = err as { code?: number; keyPattern?: Record<string, unknown> };
      if (error.code === 11000) {
        const again = await lookupKey(input.idempotencyKey);
        if (again) {
          const result = sameLead(again, type, edition.slug);
          await enqueueSafely(again._id);
          return result;
        }
        if (error.keyPattern?.ref) continue; // human-readable reference collision
      }
      throw err;
    }
  }

  throw new Error("Could not allocate a unique reference");
}
