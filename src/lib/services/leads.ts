import "server-only";
import { connectDb } from "@/lib/db/connect";
import { Lead, ConsentRecord, type LeadType } from "@/models/leads";
import { humanRef, hmac } from "@/lib/security/crypto";
import { enqueueLeadPipeline } from "@/lib/jobs";
import { getCurrentEdition } from "@/lib/data/edition";

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
  privacyAccepted: true;
  marketingOptIn: boolean;
  attribution?: Record<string, string | undefined>;
};

const COMMON_KEYS = new Set([
  "idempotencyKey", "fullName", "email", "phone", "company", "designation", "city", "state", "country", "website",
  "privacyAccepted", "marketingOptIn", "attribution", "website_url_confirm", "startedAt",
]);

export type CreateLeadResult = { ref: string; id: string; duplicate: boolean };

/**
 * Primary write path. MongoDB is the system of record: the lead is persisted
 * first, then Sheets/email jobs are queued. Re-submitting the same
 * idempotencyKey returns the original reference instead of a duplicate.
 */
export async function createLead(type: LeadType, input: CommonInput & Record<string, unknown>, ip: string): Promise<CreateLeadResult> {
  await connectDb();
  const existing = await Lead.findOne({ idempotencyKey: input.idempotencyKey }).select("ref type").lean<{ _id: unknown; ref: string; type: string }>();
  if (existing) return { ref: existing.ref, id: String(existing._id), duplicate: true };

  const edition = await getCurrentEdition();
  const details = Object.fromEntries(Object.entries(input).filter(([k]) => !COMMON_KEYS.has(k)));

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const lead = await Lead.create({
        ref: humanRef(REF_PREFIX[type], edition.slug),
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
        privacyAccepted: input.privacyAccepted,
        marketingOptIn: input.marketingOptIn,
        attribution: input.attribution,
        stageHistory: [{ stage: "new", by: "web" }],
        ipHash: hmac(ip, "ip"),
      });
      await ConsentRecord.insertMany([
        { subjectEmail: lead.email, entity: "Lead", entityId: String(lead._id), purpose: "privacy_notice", granted: true, noticeVersion: process.env.PRIVACY_NOTICE_VERSION || "draft-2026-10", source: `form:${type}` },
        { subjectEmail: lead.email, entity: "Lead", entityId: String(lead._id), purpose: "marketing", granted: Boolean(input.marketingOptIn), source: `form:${type}` },
      ]);
      await enqueueLeadPipeline(lead._id);
      return { ref: lead.ref, id: String(lead._id), duplicate: false };
    } catch (err: unknown) {
      const e = err as { code?: number; keyPattern?: Record<string, unknown> };
      if (e.code === 11000 && e.keyPattern?.idempotencyKey) {
        const again = await Lead.findOne({ idempotencyKey: input.idempotencyKey }).select("ref").lean<{ _id: unknown; ref: string }>();
        if (again) return { ref: again.ref, id: String(again._id), duplicate: true };
      }
      if (e.code === 11000 && e.keyPattern?.ref) continue; // extremely rare ref collision → retry
      throw err;
    }
  }
  throw new Error("Could not allocate a unique reference");
}
