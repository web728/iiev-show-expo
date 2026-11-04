import { after, NextResponse } from "next/server";
import { badgeRetrieveSchema } from "@/lib/validation/forms";
import { handlePublicSubmission } from "@/lib/services/submit";
import { requestBadgeLink } from "@/lib/services/visitors";
import { processDueJobs } from "@/lib/jobs";

// Always responds identically whether or not the email is registered.
export async function POST(req: Request) {
  return handlePublicSubmission(req, { schema: badgeRetrieveSchema, rateKey: "badge-link", limit: 5, windowSec: 900 }, async (data) => {
    await requestBadgeLink(data.email);
    after(() => processDueJobs(3).catch(() => undefined));
    return NextResponse.json({
      ok: true,
      message: "If an approved registration exists for that email, we've sent a secure link to view your badge. It expires in 7 days. Check your spam folder if it doesn't arrive within a few minutes.",
    });
  });
}
