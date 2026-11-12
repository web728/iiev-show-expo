import "server-only";
import { NextResponse } from "next/server";
import { connectDb, isDbConfigured } from "@/lib/db/connect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lightweight health endpoint; never returns env values, contact data or keys. */
export async function GET() {
  const checks: Record<string, string> = {
    app: "ok",
    sheets: process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SERVICE_ACCOUNT_BASE64
      ? "configured" : "not_configured",
    email: process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_FROM
      ? "configured" : "not_configured",
    db: "not_configured",
  };
  let status = 200;
  if (!isDbConfigured()) {
    status = 503;
  } else {
    try {
      const mongoose = await connectDb();
      await mongoose.connection.db?.admin().ping();
      checks.db = "ok";
    } catch {
      checks.db = "unreachable";
      status = 503;
    }
  }
  return NextResponse.json({ ok: status === 200, checks, at: new Date().toISOString() },
    { status, headers: { "Cache-Control": "no-store" } });
}
