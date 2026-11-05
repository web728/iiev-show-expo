// import { NextResponse } from "next/server";
// import { handlePublicSubmission } from "@/lib/services/submit";
// import { badgeRetrieveSchema } from "@/lib/validation/forms";
// import { requestBadgeLink } from "@/lib/visitors/service";

// // Adjust the TWO import paths if your existing public guard or visitor service
// // lives elsewhere. Keep existing requestBadgeLink logic for anti-enumeration.
// export const runtime = "nodejs";
// export async function POST(req: Request) {
//   return handlePublicSubmission(req, { schema: badgeRetrieveSchema, rateKey: "badge-retrieve", limit: 5, windowSec: 600 },
//     async (data) => {
//       await requestBadgeLink(data.email);
//       return NextResponse.json({ ok: true, message: "If an approved registration exists, a link will be emailed." });
//     });
// }
