import "server-only";
import { after, type NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { isSupportedCountry, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

import { isSameOrigin, clientIp, readJson } from "@/lib/http";
import { rateLimit } from "@/lib/security/rate-limit";
import { hmac } from "@/lib/security/crypto";
import { verifyRecaptcha } from "@/lib/security/recaptcha";
import {
  finalizeWebsiteDraft, findFinalBrochureSubmission,
  deliverWebsiteDraft, DraftConflictError,
} from "@/lib/website-forms/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const FILE = "9th_India_International_EV_Show_2027_Brochure.pdf";
const FILEPATH = path.join(process.cwd(), "private", "downloads", FILE);
const COOKIE = "iiev_brochure_access";
const TTL_SEC = 600;
const NO_STORE = { "Cache-Control": "no-store" };

const common = z.object({
  idempotencyKey: z.string().uuid(),
  email: z.string().trim().toLowerCase().email().max(160),
});
const schema = common.extend({
  fullName: z.string().trim().min(2).max(100),
  company: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(7).max(35),
  phoneCountry: z.string().trim().toUpperCase().length(2).refine(
    (value) => isSupportedCountry(value as CountryCode), "Invalid phone country"),
  recaptchaToken: z.string().min(20).max(4096),
  website_url_confirm: z.string().max(0).optional(),
});

function signingSecret(): string {
  const secret = process.env.BROCHURE_DOWNLOAD_SECRET;
  if (!secret || secret.length < 32) throw new Error("BROCHURE_DOWNLOAD_SECRET missing or too short");
  return secret;
}
function signature(body: string): string {
  return createHmac("sha256", signingSecret()).update(body).digest("base64url");
}
function createToken(key: string): string {
  const body = Buffer.from(JSON.stringify({ key, exp: Math.floor(Date.now() / 1000) + TTL_SEC }))
    .toString("base64url");
  return `${body}.${signature(body)}`;
}
function tokenValid(token: string): boolean {
  const i = token.lastIndexOf(".");
  if (i < 1 || token.length > 2000) return false;
  const body = token.slice(0, i);
  const expected = Buffer.from(signature(body), "utf8");
  const supplied = Buffer.from(token.slice(i + 1), "utf8");
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return false;
  try {
    const raw: unknown = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
    const payload = raw as Record<string, unknown>;
    return typeof payload.key === "string" && z.string().uuid().safeParse(payload.key).success &&
      typeof payload.exp === "number" &&
      payload.exp > Date.now() / 1000 && payload.exp <= Date.now() / 1000 + TTL_SEC;
  } catch {
    return false;
  }
}
function failure(status: number, code: string, message: string, fieldErrors?: Record<string, string>) {
  return NextResponse.json({ ok: false, code, message, ...(fieldErrors ? { fieldErrors } : {}) },
    { status, headers: NO_STORE });
}
function grantDownload(key: string, status = 200) {
  const response = NextResponse.json({ ok: true, ref: key,
    message: "Brochure request recorded.", url: "/api/downloads/brochure/" },
    { status, headers: NO_STORE });
  response.cookies.set({
    name: COOKIE,
    value: createToken(key),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/downloads/brochure/",
    maxAge: TTL_SEC,
  });
  return response;
}
function schedule(key: string) {
  after(() => deliverWebsiteDraft(key).catch((error: unknown) =>
    console.error("[brochure] Delivery pending", error instanceof Error ? error.message : "unknown")));
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return failure(403, "BAD_ORIGIN", "Submit from the official website.");
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return failure(415, "UNSUPPORTED_MEDIA_TYPE", "JSON expected.");
  }
  try {
    const ip = clientIp(req);
    const limit = await rateLimit(`brochure:${hmac(ip, "ip")}`, 8, 600);
    if (!limit.ok) return failure(429, "RATE_LIMITED", "Too many requests. Please retry later.");
    let raw: unknown;
    try { raw = await readJson(req); }
    catch { return failure(400, "BAD_REQUEST", "Invalid request body."); }
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return failure(400, "BAD_REQUEST", "Invalid form body.");
    }
    const body = raw as Record<string, unknown>;
    if (body.website_url_confirm !== undefined && body.website_url_confirm !== "") {
      return failure(400, "INVALID_SUBMISSION", "Invalid submission.");
    }

    // Verify the file/key before consuming a one-time CAPTCHA response.
    const file = await stat(FILEPATH).catch(() => null);
    if (!file?.isFile()) return failure(503, "BROCHURE_UNAVAILABLE", "Brochure is currently unavailable.");
    signingSecret();

    // A verified, already-final brochure request may be retried without CAPTCHA.
    // A mere autosaved draft is never sufficient for this branch.
    const retry = common.safeParse(body);
    if (retry.success && await findFinalBrochureSubmission(
      retry.data.idempotencyKey, retry.data.email,
    )) {
      schedule(retry.data.idempotencyKey);
      return grantDownload(retry.data.idempotencyKey);
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = Object.fromEntries(parsed.error.issues.map((issue) =>
        [issue.path.join(".") || "_form", issue.message]));
      return failure(422, "VALIDATION_FAILED", "Please check the form fields.", fieldErrors);
    }
    const data = parsed.data;
    const phone = parsePhoneNumberFromString(data.phone, {
      defaultCountry: data.phoneCountry as CountryCode,
      extract: false,
    });
    if (!phone?.isValid() || phone.ext) {
      return failure(422, "VALIDATION_FAILED", "Check your mobile number.",
        { phone: "Enter a valid number for the selected country." });
    }

    const captcha = await verifyRecaptcha(data.recaptchaToken, ip);
    if (!captcha.ok) {
      if (captcha.reason === "unconfigured" || captcha.reason === "unavailable") {
        return failure(503, "RECAPTCHA_UNAVAILABLE", "Security check is temporarily unavailable.");
      }
      return failure(422, "RECAPTCHA_FAILED", "Tick I'm not a robot again.",
        { recaptchaToken: "Security verification has expired or failed." });
    }

    const key = data.idempotencyKey;
    await finalizeWebsiteDraft({
      submissionKey: key,
      form: "brochure",
      data: {
        fullName: data.fullName, company: data.company,
        email: data.email, phone: phone.number, phoneCountry: data.phoneCountry,
        brochureName: FILE,
      },
      ref: key,
    });
    schedule(key);
    return grantDownload(key, 201);
  } catch (error) {
    if (error instanceof DraftConflictError) {
      return failure(409, "KEY_CONFLICT", "This request key is already used. Please retry.");
    }
    console.error("[brochure] Submit failure", error instanceof Error ? error.message : "unknown");
    return failure(503, "SERVICE_UNAVAILABLE", "Request could not be saved. Please retry.");
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE)?.value;
    if (!token || !tokenValid(token)) {
      return failure(403, "ACCESS_DENIED", "Complete the brochure form first.");
    }
    const pdf = await readFile(FILEPATH);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${FILE}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Length": String(pdf.length),
      },
    });
  } catch {
    return failure(404, "BROCHURE_UNAVAILABLE", "Brochure is currently unavailable.");
  }
}
