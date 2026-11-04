import { NextResponse } from "next/server";
import { z } from "zod";
import { apiPermission } from "@/lib/auth/session";
import { checkIn } from "@/lib/services/checkin";
import { apiError, isSameOrigin, readJson } from "@/lib/http";
import { connectDb } from "@/lib/db/connect";
import { Visitor } from "@/models/leads";
import { getCurrentEdition } from "@/lib/data/edition";
import { isValidObjectId } from "mongoose";

const body = z.object({
  qrText: z.string().max(200).optional(),
  visitorId: z.string().max(40).optional(),
  station: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return apiError(403, "BAD_ORIGIN", "Bad origin");
  const { admin, status } = await apiPermission("checkin.scan");
  if (!admin) return apiError(status, status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN", "Sign in with a scanner role");
  const parsed = body.safeParse(await readJson(req).catch(() => ({})));
  if (!parsed.success || (!parsed.data.qrText && !parsed.data.visitorId)) return apiError(422, "INVALID", "Nothing to check in");
  if (parsed.data.visitorId && !isValidObjectId(parsed.data.visitorId)) return apiError(422, "INVALID", "Bad id");
  const r = await checkIn({ ...parsed.data, actor: { id: admin.id, email: admin.email } });
  return NextResponse.json({ ok: true, ...r, at: new Date().toISOString() });
}

/** Manual desk search — returns minimal fields only, current edition only. */
export async function GET(req: Request) {
  const { admin, status } = await apiPermission("checkin.scan");
  if (!admin) return apiError(status, "FORBIDDEN", "Not allowed");
  const q = (new URL(req.url).searchParams.get("q") || "").trim().slice(0, 60);
  if (q.length < 3) return NextResponse.json({ ok: true, results: [] });
  await connectDb();
  const e = await getCurrentEdition();
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const rows = await Visitor.find({ edition: e.slug, $or: [{ ref: rx }, { fullName: rx }, { company: rx }, { email: q.toLowerCase() }, { phone: rx }] })
    .limit(15)
    .select("ref fullName company status checkInCount")
    .lean();
  return NextResponse.json({ ok: true, results: rows.map((r) => ({ id: String(r._id), ref: r.ref, fullName: r.fullName, company: r.company, status: r.status, checkInCount: r.checkInCount })) });
}
