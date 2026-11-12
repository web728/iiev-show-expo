
import "server-only";

import { connectDb } from "@/lib/db/connect";
import { Lead, type LeadType } from "@/models/leads";
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

  // No mandatory privacy checkbox.
  privacyAccepted?: boolean;

  // Marketing is not enabled automatically.
  marketingOptIn?: boolean;

  attribution?: Record<string, string | undefined>;
};

const COMMON_KEYS = new Set([
  "idempotencyKey",
  "fullName",
  "email",
  "phone",
  "company",
  "designation",
  "city",
  "state",
  "country",
  "website",
  "privacyAccepted",
  "marketingOptIn",
  "attribution",
  "website_url_confirm",
  "startedAt",
  "recaptchaToken",
]);

export type CreateLeadResult = {
  ref: string;
  id: string;
  duplicate: boolean;
};

/**
 * Saves a website enquiry.
 *
 * Privacy checkbox is not required.
 * No consent is falsely recorded.
 *
 * MongoDB stores the primary lead.
 * Integration jobs handle Sheets/emails.
 */
export async function createLead(
  type: LeadType,
  input: CommonInput & Record<string, unknown>,
  ip: string
): Promise<CreateLeadResult> {
  await connectDb();

  const existing = await Lead.findOne({
    idempotencyKey: input.idempotencyKey,
  })
    .select("ref type")
    .lean<{
      _id: unknown;
      ref: string;
      type: string;
    }>();

  if (existing) {
    if (existing.type !== type) {
      throw new Error(
        "Submission key belongs to another form"
      );
    }

    return {
      ref: existing.ref,
      id: String(existing._id),
      duplicate: true,
    };
  }

  const edition = await getCurrentEdition();

  const details = Object.fromEntries(
    Object.entries(input).filter(
      ([key]) => !COMMON_KEYS.has(key)
    )
  );

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const lead = await Lead.create({
        ref: humanRef(
          REF_PREFIX[type],
          edition.slug
        ),

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

        // Checkbox-free submission:
        // never manufacture privacy consent.
        privacyAccepted: false,

        // No automatic marketing permission.
        marketingOptIn: false,

        attribution: input.attribution,

        stageHistory: [
          {
            stage: "new",
            by: "web",
          },
        ],

        ipHash: hmac(ip, "ip"),
      });

      /*
       * No ConsentRecord.insertMany() here.
       *
       * The visitor did not give explicit
       * privacy/marketing opt-in through a checkbox.
       *
       * Do not store granted: true.
       */

      await enqueueLeadPipeline(lead._id);

      return {
        ref: lead.ref,
        id: String(lead._id),
        duplicate: false,
      };
    } catch (err: unknown) {
      const error = err as {
        code?: number;
        keyPattern?: Record<string, unknown>;
      };

      if (
        error.code === 11000 &&
        error.keyPattern?.idempotencyKey
      ) {
        const again = await Lead.findOne({
          idempotencyKey: input.idempotencyKey,
        })
          .select("ref type")
          .lean<{
            _id: unknown;
            ref: string;
            type: string;
          }>();

        if (again) {
          if (again.type !== type) {
            throw new Error(
              "Submission key belongs to another form"
            );
          }

          return {
            ref: again.ref,
            id: String(again._id),
            duplicate: true,
          };
        }
      }

      // Retry rare human-readable reference collisions.
      if (
        error.code === 11000 &&
        error.keyPattern?.ref
      ) {
        continue;
      }

      throw err;
    }
  }

  throw new Error(
    "Could not allocate a unique reference"
  );
}
