import { after, NextResponse } from "next/server";
import { visitorRegistrationSchema } from "@/lib/validation/forms";
import { handlePublicSubmission } from "@/lib/services/submit";
import { registerVisitor, VisitorError } from "@/lib/services/visitors";
import { processDueJobs } from "@/lib/jobs";
import { apiError } from "@/lib/http";
import { connectDb } from "@/lib/db/connect";
import { Visitor } from "@/models/leads";
import { getEmailAdapter } from "@/lib/email";

export async function POST(req: Request) {
  return handlePublicSubmission(req, { schema: visitorRegistrationSchema, rateKey: "visitor", limit: 6, windowSec: 600 }, async (data, ip) => {
    try {
      const r = await registerVisitor(data, ip);
      if (r.kind === "already_registered") {
        // Do not confirm or deny details of the existing record (anti-enumeration).
        return apiError(409, "ALREADY_REGISTERED", "This email address may already be registered for this edition. Use “Retrieve my badge” to get a secure link sent to that inbox.", {
          email: "Already registered? Use “Retrieve my badge” instead.",
        });
      }
      await connectDb();
      const v = await Visitor.findOne({ ref: r.ref }).select("_id").lean<{ _id: unknown }>();
      if (v) after(() => processDueJobs(5, String(v._id)).catch(() => undefined));
      return NextResponse.json(
        {
          ok: true,
          ref: r.ref,
          status: r.status,
          badgeAccess: r.badgeAccess,
          // Only promise an email when an email provider is actually configured.
          message:
            r.status === "approved"
              ? `Your registration is confirmed. Your badge is ready below${getEmailAdapter().configured() ? " and is also being emailed to you" : " — please download or save it now"}.`
              : `Your registration has been received and is being reviewed.${getEmailAdapter().configured() ? " We'll email your badge once it is approved." : " The registration team will contact you once it is approved."}`,
        },
        { status: r.kind === "created" ? 201 : 200 },
      );
    } catch (err) {
      if (err instanceof VisitorError && err.code === "REGISTRATION_CLOSED") return apiError(403, err.code, err.message);
      throw err;
    }
  });
}
