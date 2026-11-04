import { apiPermission, audit } from "@/lib/auth/session";
import { connectDb } from "@/lib/db/connect";
import { Lead, Visitor, CheckIn, LEAD_TYPES, LEAD_STAGES, VISITOR_STATUSES } from "@/models/leads";
import { getCurrentEdition } from "@/lib/data/edition";
import { sanitizeCell } from "@/lib/sheets";
import { apiError } from "@/lib/http";
import type { Permission } from "@/lib/auth/rbac";

// Permission-checked, audited CSV exports. Cells are sanitised against
// spreadsheet formula injection. No-store caching.

const csv = (rows: unknown[][]) => "﻿" + rows.map((r) => r.map((c) => `"${sanitizeCell(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
const ist = (d?: Date) => (d ? new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "");

const PERMS: Record<string, Permission> = { leads: "leads.export", visitors: "visitors.export", checkins: "visitors.export" };

export async function GET(req: Request, ctx: RouteContext<"/api/admin/export/[kind]">) {
  const { kind } = await ctx.params;
  const perm = PERMS[kind];
  if (!perm) return apiError(404, "NOT_FOUND", "Unknown export");
  const { admin, status } = await apiPermission(perm);
  if (!admin) return apiError(status, status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN", "Not allowed");
  await connectDb();
  const sp = new URL(req.url).searchParams;
  const e = await getCurrentEdition();
  const requested = sp.get("edition") || "";
  const edition = /^[a-z0-9-]{1,40}$/.test(requested) ? requested : e.slug;
  let rows: unknown[][] = [];

  if (kind === "leads") {
    const q: Record<string, unknown> = { edition };
    if (LEAD_TYPES.includes(sp.get("type") as never)) q.type = sp.get("type");
    if (LEAD_STAGES.includes(sp.get("stage") as never)) q.stage = sp.get("stage");
    const docs = await Lead.find(q).sort({ createdAt: -1 }).limit(20000).lean<Record<string, unknown>[]>();
    rows = [["Ref", "Type", "Stage", "Owner", "Name", "Designation", "Company", "Email", "Phone", "City", "State", "Country", "Website", "Details", "Marketing opt-in", "UTM source", "UTM campaign", "Received (IST)"]];
    for (const d of docs) {
      const a = (d.attribution ?? {}) as Record<string, string>;
      rows.push([d.ref, d.type, d.stage, d.assignedTo, d.fullName, d.designation, d.company, d.email, d.phone, d.city, d.state, d.country, d.website, JSON.stringify(d.details ?? {}), d.marketingOptIn ? "yes" : "no", a.utmSource, a.utmCampaign, ist(d.createdAt as Date)]);
    }
  } else if (kind === "visitors") {
    const q: Record<string, unknown> = { edition };
    if (VISITOR_STATUSES.includes(sp.get("status") as never)) q.status = sp.get("status");
    const docs = await Visitor.find(q).sort({ createdAt: -1 }).limit(100000).lean<Record<string, unknown>[]>();
    rows = [["Registration ID", "Status", "Name", "Email", "Phone", "Company", "Designation", "Industry", "City", "State", "Country", "Reason", "Interests", "Marketing opt-in", "Scans", "First check-in (IST)", "Registered (IST)"]];
    for (const d of docs) rows.push([d.ref, d.status, d.fullName, d.email, d.phone, d.company, d.designation, d.industry, d.city, d.state, d.country, d.reasonForVisit, d.sectorInterests, d.marketingOptIn ? "yes" : "no", d.checkInCount, ist(d.checkedInAt as Date), ist(d.createdAt as Date)]);
  } else {
    const docs = await CheckIn.find({ edition }).sort({ createdAt: -1 }).limit(200000).lean<Record<string, unknown>[]>();
    rows = [["Time (IST)", "Registration ID", "Result", "Method", "Station", "Scanned by"]];
    for (const d of docs) rows.push([ist(d.createdAt as Date), d.visitorRef, d.result, d.method, d.station, d.scannedByEmail]);
  }

  await audit(admin, `export.${kind}`, "Export", undefined, `${rows.length - 1} rows, edition ${edition}`);
  return new Response(csv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="iiev-${kind}-${edition}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
