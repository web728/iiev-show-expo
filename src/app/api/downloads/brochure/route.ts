import { after, NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { isSameOrigin, clientIp } from "@/lib/http";
import { rateLimit } from "@/lib/security/rate-limit";
import { hmac } from "@/lib/security/crypto";
import { verifyRecaptchaV2 } from "@/lib/security/recaptcha";
import { finalizeWebsiteDraft, deliverWebsiteDraft } from "@/lib/website-forms/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const FILE = "9th_India_International_EV_Show_2027_Brochure.pdf";
const COOKIE = "iiev_brochure_access";
const TTL = 600;
const filepath = path.join(process.cwd(), "private", "downloads", FILE);
const schema = z.object({
  idempotencyKey: z.string().uuid(), fullName: z.string().trim().min(2).max(100),
  company: z.string().trim().min(1).max(160), email: z.string().trim().toLowerCase().email().max(160),
  phone: z.string().trim().min(7).max(40), privacyAccepted: z.literal(true),
  recaptchaToken: z.string().min(20), website_url_confirm: z.string().max(0).optional(),
});
function key() { const k = process.env.BROCHURE_DOWNLOAD_SECRET; if (!k || k.length < 32) throw Error("Missing signing secret"); return k; }
function sign(s: string) { return createHmac("sha256", key()).update(s).digest("base64url"); }
function makeToken(submissionKey: string) {
  const body = Buffer.from(JSON.stringify({ submissionKey, exp: Math.floor(Date.now() / 1000) + TTL })).toString("base64url");
  return `${body}.${sign(body)}`;
}
function checkToken(token: string): boolean {
  const last = token.lastIndexOf("."); if (last < 1) return false;
  const body = token.slice(0, last);
  const expected = Buffer.from(sign(body)); const received = Buffer.from(token.slice(last + 1));
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as { submissionKey?: string; exp?: number };
    return typeof data.submissionKey === "string" && typeof data.exp === "number" && data.exp > Date.now()/1000;
  } catch { return false; }
}
const error = (status: number, message: string) => NextResponse.json({ ok: false, message }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return error(403, "Invalid origin");
  try {
    const ip = clientIp(req);
    const rl = await rateLimit(`brochure:${hmac(ip, "ip")}`, 8, 600);
    if (!rl.ok) return error(429, "Too many requests. Please retry later.");
    const raw = await req.json().catch(() => null);
    const valid = schema.safeParse(raw);
    if (!valid.success) return error(422, "Please check your details and try again.");
    if (!(await verifyRecaptchaV2(valid.data.recaptchaToken))) return error(422, "Please complete the 'I'm not a robot' check again.");
    const digits = valid.data.phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) return error(422, "Invalid mobile number.");
    await stat(filepath); // Fail before saving if brochure is absent.
    key();
    const { idempotencyKey, fullName, company, email, phone } = valid.data;
    const rest = { fullName, company, email, phone };
    // Final MongoDB record is durable before issuing the download permission.
    await finalizeWebsiteDraft({ submissionKey: idempotencyKey, form: "brochure", data: rest, ref: idempotencyKey });
    after(async () => { try { await deliverWebsiteDraft(idempotencyKey); } catch (e) { console.error("brochure sync", e); } });
    const response = NextResponse.json({ ok: true, message: "Brochure request recorded", url: "/api/downloads/brochure/" }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set({ name: COOKIE, value: makeToken(idempotencyKey), httpOnly: true,
      secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/downloads/brochure/", maxAge: TTL });
    return response;
  } catch (e) {
    console.error("brochure POST", e);
    return error(503, "Brochure is unavailable. Please retry later.");
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE)?.value;
    if (!token || !checkToken(token)) return error(403, "Complete the brochure form first.");
    const pdf = await readFile(filepath);
    return new NextResponse(new Uint8Array(pdf), { headers: {
      "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${FILE}"`,
      "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
      "Content-Length": String(pdf.length),
    } });
  } catch { return error(404, "Brochure is unavailable."); }
}
