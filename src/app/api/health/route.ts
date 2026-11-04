import { NextResponse } from "next/server";
import { connectDb, isDbConfigured } from "@/lib/db/connect";
import { IntegrationJob } from "@/models/leads";
import { sheetsConfigured } from "@/lib/sheets";
import { getEmailAdapter } from "@/lib/email";

// Liveness/readiness for uptime monitoring. Exposes no secrets or PII.
export async function GET() {
  const checks: Record<string, string | number> = {
    app: "ok",
    sheets: sheetsConfigured() ? "configured" : "not_configured",
    email: getEmailAdapter().configured() ? "configured" : "not_configured",
  };
  let status = 200;
  if (!isDbConfigured()) {
    checks.db = "not_configured";
    status = 503;
  } else {
    try {
      const m = await connectDb();
      await m.connection.db?.admin().ping();
      checks.db = "ok";
      checks.failedJobs = await IntegrationJob.countDocuments({ status: "failed" });
    } catch {
      checks.db = "unreachable";
      status = 503;
    }
  }
  return NextResponse.json({ ok: status === 200, checks, at: new Date().toISOString() }, { status });
}
