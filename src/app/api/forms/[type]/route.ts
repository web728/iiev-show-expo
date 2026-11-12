import { after, NextResponse } from "next/server";
import type { z } from "zod";
import {
  stallEnquirySchema,
  sponsorshipEnquirySchema,
  partnerEnquirySchema,
  speakerApplicationSchema,
  delegateRegistrationSchema,
  contactSchema,
} from "@/lib/validation/forms";
import { handlePublicSubmission } from "@/lib/services/submit";
import { createLead, LeadSubmissionConflict } from "@/lib/services/leads";
import { processDueJobs } from "@/lib/jobs";
import { apiError } from "@/lib/http";
import type { LeadType } from "@/models/leads";

const FORMS: Record<string, { type: LeadType; schema: z.ZodTypeAny; message: string }> = {
  stall: {
    type: "stall",
    schema: stallEnquirySchema,
    message: "Our exhibitor sales team will contact you with availability and participation details.",
  },
  sponsorship: {
    type: "sponsorship",
    schema: sponsorshipEnquirySchema,
    message: "Our partnerships team will review your objectives and get in touch.",
  },
  partner: {
    type: "partner",
    schema: partnerEnquirySchema,
    message: "We'll review your proposal and respond.",
  },
  speaker: {
    type: "speaker",
    schema: speakerApplicationSchema,
    message: "The programme committee reviews applications and will contact shortlisted speakers.",
  },
  delegate: {
    type: "delegate",
    schema: delegateRegistrationSchema,
    message: "We'll share conference programme and delegate access details when confirmed.",
  },
  contact: {
    type: "contact",
    schema: contactSchema,
    message: "Thanks for contacting us. We'll reply as soon as possible.",
  },
};

export async function POST(req: Request, ctx: RouteContext<"/api/forms/[type]">) {
  const { type } = await ctx.params;
  const form = FORMS[type];
  if (!form) return apiError(404, "UNKNOWN_FORM", "Unknown form.");

  return handlePublicSubmission(
    req,
    { schema: form.schema, rateKey: `form:${type}` },
    async (data, ip) => {
      try {
        const result = await createLead(
          form.type,
          data as Parameters<typeof createLead>[1],
          ip,
        );

        after(() => processDueJobs(5, result.id).catch(() => undefined));
        return NextResponse.json(
          { ok: true, ref: result.ref, message: form.message },
          { status: result.duplicate ? 200 : 201 },
        );
      } catch (err) {
        if (err instanceof LeadSubmissionConflict) {
          return apiError(409, "KEY_CONFLICT", err.message);
        }
        throw err;
      }
    },
  );
}
