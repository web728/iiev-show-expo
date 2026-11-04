import { connectDb } from "@/lib/db/connect";
import { Visitor } from "@/models/leads";
import { verifyBadgeAccessToken } from "@/lib/badge/access";
import { renderBadgePdf } from "@/lib/badge/pdf";
import { decrypt } from "@/lib/security/crypto";
import { getCurrentEdition } from "@/lib/data/edition";
import { apiError } from "@/lib/http";

// GET /api/badge/pdf/?t=<signed access token>
export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get("t") || "";
  const access = await verifyBadgeAccessToken(t);
  if (!access) return apiError(401, "LINK_INVALID", "This badge link is invalid or has expired. Request a new one from “Retrieve my badge”.");
  await connectDb();
  const v = await Visitor.findById(access.visitorId).select("+badgeTokenEnc").lean<{
    ref: string; fullName: string; company: string; designation?: string; status: string; badgeVersion: number; badgeTokenEnc?: string; badgeRevokedAt?: Date;
  }>();
  if (!v || v.badgeVersion !== access.version || !v.badgeTokenEnc || v.badgeRevokedAt || !["approved", "checked_in"].includes(v.status)) {
    return apiError(410, "BADGE_NOT_AVAILABLE", "This badge is no longer valid. It may have been reissued — check your latest email or request a new link.");
  }
  const edition = await getCurrentEdition();
  const pdf = await renderBadgePdf({ visitor: v, token: decrypt(v.badgeTokenEnc), edition });
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="IIEV-${edition.year}-Badge-${v.ref}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
