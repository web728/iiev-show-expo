import { after, NextResponse } from "next/server";
import { apiError, clientIp, isSameOrigin, readJson } from "@/lib/http";
import { rateLimit } from "@/lib/security/rate-limit";
import { hmac } from "@/lib/security/crypto";
import { saveWebsiteDraft, deliverWebsiteDraft } from "@/lib/website-forms/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return apiError(403, "BAD_ORIGIN", "Invalid origin");
  try {
    const ip = clientIp(req);
    const limit = await rateLimit(`website-draft:${hmac(ip, "ip")}`, 75, 600);
    if (!limit.ok) return apiError(429, "RATE_LIMITED", "Too many draft updates");
    const body = await readJson(req) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) return apiError(400, "BAD_REQUEST", "Invalid draft");
    if (typeof body.website_url_confirm === "string" && body.website_url_confirm.length) return apiError(400, "BAD_REQUEST", "Invalid draft");
    const result = await saveWebsiteDraft({ submissionKey: body.idempotencyKey,
      form: body.form, data: body.data, privacyAccepted: body.privacyAccepted });
    if (result.saved && typeof body.idempotencyKey === "string") {
      const key = body.idempotencyKey;
      after(async () => { try { await deliverWebsiteDraft(key); } catch (e) { console.error("draft sync", e); } });
    }
    return NextResponse.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("draft save failed", error);
    return apiError(503, "DRAFT_UNAVAILABLE", "Draft could not be saved at this time");
  }
}
