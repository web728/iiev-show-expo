import "server-only";
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
import {
  createLead,
  findExistingLeadSubmission,
  LeadSubmissionConflict,
} from "@/lib/services/leads";
import { Lead, type LeadType } from "@/models/leads";
import { apiError } from "@/lib/http";
import {
  crmRecordToDraftData,
  deliverWebsiteDraft,
  DraftConflictError,
  finalizeWebsiteDraft,
} from "@/lib/website-forms/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type FormConfig = {
  type: LeadType;
  schema: z.ZodTypeAny;
  message: string;
};

const FORMS: Record<string, FormConfig> = {
  stall: {
    type: "stall",
    schema: stallEnquirySchema,
    message: "Your stall enquiry has been received.",
  },
  sponsorship: {
    type: "sponsorship",
    schema: sponsorshipEnquirySchema,
    message: "Your sponsorship enquiry has been received.",
  },
  partner: {
    type: "partner",
    schema: partnerEnquirySchema,
    message: "Your partnership enquiry has been received.",
  },
  speaker: {
    type: "speaker",
    schema: speakerApplicationSchema,
    message: "Your speaker application has been received.",
  },
  delegate: {
    type: "delegate",
    schema: delegateRegistrationSchema,
    message: "Your delegate enquiry has been received.",
  },
  contact: {
    type: "contact",
    schema: contactSchema,
    message: "Your message has been received.",
  },
};

function queueDelivery(submissionKey: string): void {
  after(async () => {
    try {
      await deliverWebsiteDraft(submissionKey);
    } catch (error) {
      console.error(
        "[forms] Website delivery pending:",
        error instanceof Error ? error.message : "unknown",
      );
    }
  });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ type: string }> },
): Promise<Response> {
  const { type } = await ctx.params;
  const form = FORMS[type];
  if (!form) {
    return apiError(404, "UNKNOWN_FORM", "Unknown form.");
  }

  return handlePublicSubmission(
    req,
    {
      schema: form.schema,
      rateKey: `form:${type}`,
      // Only an existing FINAL Lead may skip another single-use CAPTCHA check.
      existingFinalSubmission: async (raw) => {
        const existing = await findExistingLeadSubmission(
          form.type,
          raw.idempotencyKey,
          raw.email,
        );
        if (!existing) return null;

        const savedLead = await Lead.findById(existing.id).lean();
        if (!savedLead) return null;

        try {
          await finalizeWebsiteDraft({
            submissionKey: String(raw.idempotencyKey),
            form: form.type,
            data: crmRecordToDraftData(savedLead),
            ref: existing.ref,
            finalEntity: "Lead",
            finalEntityId: existing.id,
          });
        } catch (error) {
          if (error instanceof DraftConflictError) {
            return apiError(409, "KEY_CONFLICT", error.message);
          }
          throw error;
        }

        queueDelivery(String(raw.idempotencyKey));
        return NextResponse.json(
          { ok: true, ref: existing.ref, message: form.message },
          { status: 200, headers: { "Cache-Control": "no-store" } },
        );
      },
    },
    async (parsedData, ip) => {
      // Record<string, FormConfig> erases the concrete Zod output type.
      // The shared guard has already validated parsedData with form.schema.
      // This cast restores the common fields required by createLead().
      const data = parsedData as Parameters<typeof createLead>[1];

      try {
        // This fourth argument REQUIRES the matching updated lib/services/leads.ts.
        // Do not remove it: the legacy pipeline would duplicate Sheets/email jobs.
        const saved = await createLead(form.type, data, ip, {
          skipLegacyPipeline: true,
        });

        await finalizeWebsiteDraft({
          submissionKey: data.idempotencyKey,
          form: form.type,
          data,
          ref: saved.ref,
          finalEntity: "Lead",
          finalEntityId: saved.id,
        });

        queueDelivery(data.idempotencyKey);
        return NextResponse.json(
          { ok: true, ref: saved.ref, message: form.message },
          {
            status: saved.duplicate ? 200 : 201,
            headers: { "Cache-Control": "no-store" },
          },
        );
      } catch (error) {
        if (
          error instanceof LeadSubmissionConflict ||
          error instanceof DraftConflictError
        ) {
          return apiError(409, "KEY_CONFLICT", error.message);
        }
        // CRM may have been saved before an outbox error. Keep the UUID on retry.
        throw error;
      }
    },
  );
}
