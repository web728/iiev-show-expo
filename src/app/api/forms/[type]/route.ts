import { after, NextResponse } from "next/server";
import type { z } from "zod";
import {
  stallEnquirySchema, sponsorshipEnquirySchema, partnerEnquirySchema, speakerApplicationSchema,
  delegateRegistrationSchema, contactSchema,
} from "@/lib/validation/forms";
import { handlePublicSubmission } from "@/lib/services/submit";
import { createLead } from "@/lib/services/leads";
import { processDueJobs } from "@/lib/jobs";
import { apiError } from "@/lib/http";
import type { LeadType } from "@/models/leads";

const FORMS: Record<string, { type: LeadType; schema: z.ZodTypeAny; message: string }> = {
  stall: { type: "stall", schema: stallEnquirySchema, message: "Our exhibitor sales team will contact you with availability and participation details." },
  sponsorship: { type: "sponsorship", schema: sponsorshipEnquirySchema, message: "Our partnerships team will review your objectives and get in touch." },
  partner: { type: "partner", schema: partnerEnquirySchema, message: "We'll review your proposal and respond." },
  speaker: { type: "speaker", schema: speakerApplicationSchema, message: "The programme committee reviews every application. We'll contact you if your proposal is shortlisted." },
  delegate: { type: "delegate", schema: delegateRegistrationSchema, message: "We'll email you when the conference programme and delegate access details are confirmed." },
  contact: { type: "contact", schema: contactSchema, message: "Thanks for getting in touch — we'll reply as soon as we can." },
};

export async function POST(req: Request, ctx: RouteContext<"/api/forms/[type]">) {
  const { type } = await ctx.params;
  const form = FORMS[type];
  if (!form) return apiError(404, "UNKNOWN_FORM", "Unknown form.");
  return handlePublicSubmission(req, { schema: form.schema, rateKey: `form:${type}` }, async (data, ip) => {
    const result = await createLead(form.type, data as Parameters<typeof createLead>[1], ip);
    // Primary record is saved. Integrations run after the response; failures are retried by the job runner.
    after(() => processDueJobs(5, result.id).catch(() => undefined));
    return NextResponse.json({ ok: true, ref: result.ref, message: form.message }, { status: result.duplicate ? 200 : 201 });
  });
}
