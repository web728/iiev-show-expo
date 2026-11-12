import "server-only";
import { after, NextResponse } from "next/server";
import { visitorRegistrationSchema } from "@/lib/validation/forms";
import { handlePublicSubmission } from "@/lib/services/submit";
import {
  registerVisitor,
  findExistingVisitorSubmission,
  VisitorError,
} from "@/lib/services/visitors";
import { Visitor } from "@/models/leads";
import { apiError } from "@/lib/http";
import {
  finalizeWebsiteDraft,
  deliverWebsiteDraft,
  DraftConflictError,
} from "@/lib/website-forms/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const CONFIRMATION = "Your visitor registration has been received successfully.";

// Final form save must not wait for Google Sheets or organiser SMTP delivery.
// The existing scheduled website-sync worker retries pending deliveries.
function queueDelivery(submissionKey: string): void {
  after(async () => {
    try {
      await deliverWebsiteDraft(submissionKey);
    } catch (error) {
      console.error(
        "[visitor] Website delivery pending:",
        error instanceof Error ? error.message : "unknown",
      );
    }
  });
}

/**
 * Visitor intake ONLY: MongoDB Visitor + WebsiteDraft + organiser Sheets/email.
 * No visitor acknowledgement, QR code, badge creation or badge PDF.
 * The public submission guard performs rate limiting, Zod and reCAPTCHA v2.
 */
export async function POST(req: Request): Promise<Response> {
  return handlePublicSubmission(
    req,
    {
      schema: visitorRegistrationSchema,
      rateKey: "visitor",
      limit: 6,
      windowSec: 600,
      // Only an ALREADY FINALISED Visitor record may bypass a consumed captcha.
      // An autosaved WebsiteDraft alone never qualifies.
      existingFinalSubmission: async (raw) => {
        const saved = await findExistingVisitorSubmission(
          raw.idempotencyKey,
          raw.email,
          { includeBadgeAccess: false },
        );
        if (!saved || saved.kind === "already_registered") return null;

        const visitor = await Visitor.findById(saved.id).lean();
        if (!visitor) return null;

        try {
          await finalizeWebsiteDraft({
            submissionKey: String(raw.idempotencyKey),
            form: "visitor",
            data: {
              fullName: visitor.fullName,
              email: visitor.email,
              phone: visitor.phone,
              phoneCountry: visitor.phoneCountry,
              company: visitor.company,
              designation: visitor.designation,
              industry: visitor.industry,
              country: visitor.country,
              attribution: visitor.attribution,
            },
            ref: saved.ref,
            finalEntity: "Visitor",
            finalEntityId: saved.id,
          });
        } catch (error) {
          if (error instanceof DraftConflictError) {
            return apiError(409, "KEY_CONFLICT", error.message);
          }
          throw error;
        }

        queueDelivery(String(raw.idempotencyKey));
        return NextResponse.json(
          { ok: true, ref: saved.ref, status: saved.status, message: CONFIRMATION },
          { status: 200, headers: { "Cache-Control": "no-store" } },
        );
      },
    },
    async (data, ip) => {
      try {
        // Crucial: do not generate or email a badge for a website visitor.
        // Also avoid the legacy job queue, which can email visitors.
        const saved = await registerVisitor(data, ip, {
          issueBadge: false,
          skipLegacyPipeline: true,
        });

        if (saved.kind === "already_registered") {
          return apiError(
            409,
            "ALREADY_REGISTERED",
            "This email already has a submitted registration for this edition.",
            { email: "This email is already registered." },
          );
        }

        await finalizeWebsiteDraft({
          submissionKey: data.idempotencyKey,
          form: "visitor",
          data,
          ref: saved.ref,
          finalEntity: "Visitor",
          finalEntityId: saved.id,
        });

        queueDelivery(data.idempotencyKey);
        return NextResponse.json(
          { ok: true, ref: saved.ref, status: saved.status, message: CONFIRMATION },
          {
            status: saved.kind === "created" ? 201 : 200,
            headers: { "Cache-Control": "no-store" },
          },
        );
      } catch (error) {
        if (
          error instanceof DraftConflictError ||
          (error instanceof VisitorError && error.code === "KEY_CONFLICT")
        ) {
          return apiError(409, "KEY_CONFLICT", error.message);
        }
        if (error instanceof VisitorError && error.code === "REGISTRATION_CLOSED") {
          return apiError(403, error.code, error.message);
        }
        throw error;
      }
    },
  );
}
