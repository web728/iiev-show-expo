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

function registrationMessage(status: string, badgeAccess?: string): string {
  const approved = status === "approved" || status === "checked_in";
  if (!approved) return "Your visitor registration has been received for review.";
  return badgeAccess
    ? "Registration confirmed. Your badge is available below."
    : "Registration confirmed. Retrieve your badge from the website.";
}

export async function POST(req: Request): Promise<Response> {
  return handlePublicSubmission(
    req,
    {
      schema: visitorRegistrationSchema,
      rateKey: "visitor",
      limit: 6,
      windowSec: 600,
      // Retry is permitted only for an already-saved FINAL Visitor.
      existingFinalSubmission: async (raw) => {
        const saved = await findExistingVisitorSubmission(
          raw.idempotencyKey,
          raw.email,
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
          {
            ok: true,
            ref: saved.ref,
            status: saved.status,
            badgeAccess: saved.badgeAccess,
            message: registrationMessage(saved.status, saved.badgeAccess),
          },
          { status: 200, headers: { "Cache-Control": "no-store" } },
        );
      },
    },
    async (data, ip) => {
      try {
        // Requires updated lib/services/visitors.ts accepting this option.
        // Avoids sending the organiser emails twice via the legacy job queue.
        const saved = await registerVisitor(data, ip, {
          skipLegacyPipeline: true,
        });

        if (saved.kind === "already_registered") {
          return apiError(
            409,
            "ALREADY_REGISTERED",
            "This email is already registered for this edition. Please retrieve your existing registration.",
            { email: "Already registered; use badge retrieval." },
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
          {
            ok: true,
            ref: saved.ref,
            status: saved.status,
            badgeAccess: saved.badgeAccess,
            message: registrationMessage(saved.status, saved.badgeAccess),
          },
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
