import "server-only";
import { timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { processPendingWebsiteDrafts } from "@/lib/website-forms/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization") ?? "";
  const supplied = /^Bearer\s+(.+)$/i.exec(authorization)?.[1] ?? "";
  if (!secret || secret.length < 32 ||
      Buffer.byteLength(secret) !== Buffer.byteLength(supplied)) return false;
  return timingSafeEqual(Buffer.from(secret), Buffer.from(supplied));
}

/** Schedule this URL with Authorization: Bearer $CRON_SECRET. */
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ ok: false },
    { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const processed = await processPendingWebsiteDrafts(8);
    return NextResponse.json({ ok: true, ...processed },
      { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[forms] Sync cron failure", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ ok: false },
      { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
