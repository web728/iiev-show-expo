import { NextResponse } from "next/server";
import { processDueJobs } from "@/lib/jobs";
import { safeEqual } from "@/lib/security/crypto";

// Retry runner for queued/failed Sheets & email jobs.
// Call every 5 minutes from a scheduler (Vercel Cron, GitHub Actions, uptime
// pinger) with: Authorization: Bearer <CRON_SECRET>
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET;
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) return NextResponse.json({ ok: false }, { status: 401 });
  const result = await processDueJobs(50);
  return NextResponse.json({ ok: true, ...result });
}
