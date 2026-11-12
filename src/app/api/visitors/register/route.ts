import { after, NextResponse } from "next/server";
import { visitorRegistrationSchema } from "@/lib/validation/forms";
import { handlePublicSubmission } from "@/lib/services/submit";
import { registerVisitor, VisitorError } from "@/lib/services/visitors";
import { processDueJobs } from "@/lib/jobs";
import { apiError } from "@/lib/http";
import { getEmailAdapter } from "@/lib/email";

export async function POST(req: Request) {
  return handlePublicSubmission(
    req,
    { schema: visitorRegistrationSchema, rateKey: "visitor", limit: 6, windowSec: 600 },
    async (data, ip) => {
      try {
        const r = await registerVisitor(data, ip);
        if (r.kind === "already_registered") {
          // Keep the user-facing duplicate path, but do not expose record data.
          return apiError(
            409,
            "ALREADY_REGISTERED",
            "This email may already be registered for the current edition. Try Retrieve my badge.",
            { email: "Already registered? Use Retrieve my badge." },
          );
        }

        after(() => processDueJobs(5, r.id).catch(() => undefined));

        const emailConfigured = getEmailAdapter().configured();
        const approved = r.status === "approved" || r.status === "checked_in";
        const message = approved
          ? r.badgeAccess
            ? `Registration confirmed. Your badge is ready below${emailConfigured ? " and may also be emailed to you" : "; save it now"}.`
            : "Registration confirmed, but your badge link is temporarily unavailable. Use Retrieve my badge or contact the organiser."
          : `Your registration has been received for review.${emailConfigured ? " You'll be notified when it is approved." : " The registration team will contact you after review."}`;

        return NextResponse.json(
          { ok: true, ref: r.ref, status: r.status, badgeAccess: r.badgeAccess, message },
          { status: r.kind === "created" ? 201 : 200 },
        );
      } catch (err) {
        if (err instanceof VisitorError) {
          if (err.code === "REGISTRATION_CLOSED") return apiError(403, err.code, err.message);
          if (err.code === "KEY_CONFLICT") return apiError(409, err.code, err.message);
        }
        throw err;
      }
    },
  );
}
