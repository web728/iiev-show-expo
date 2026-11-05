import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { processPendingWebsiteDrafts } from "@/lib/website-forms/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const supplied = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!secret || Buffer.byteLength(secret) !== Buffer.byteLength(supplied) ||
      !timingSafeEqual(Buffer.from(secret), Buffer.from(supplied))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const processed = await processPendingWebsiteDrafts(25);
    return NextResponse.json({ ok: true, processed }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("website sync job failed", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
