import { after, type NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import { isSameOrigin, clientIp } from "@/lib/http";
import { rateLimit } from "@/lib/security/rate-limit";
import { hmac } from "@/lib/security/crypto";
import { verifyRecaptcha } from "@/lib/security/recaptcha";
import {
  finalizeWebsiteDraft,
  deliverWebsiteDraft,
} from "@/lib/website-forms/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILE = "9th_India_International_EV_Show_2027_Brochure.pdf";
const COOKIE = "iiev_brochure_access";
const TTL = 600; // 10 minutes
const filepath = path.join(process.cwd(), "private", "downloads", FILE);

const schema = z.object({
  idempotencyKey: z.string().uuid(),
  fullName: z.string().trim().min(2).max(100),
  company: z.string().trim().min(1).max(160),
  email: z.string().trim().toLowerCase().email().max(160),
  phone: z.string().trim().min(7).max(40),
  // Kept from the existing brochure form: requires an explicit true value.
  // If the UI has no consent checkbox, align this with the actual UI policy.
  privacyAccepted: z.literal(true),
  recaptchaToken: z.string().min(20),
  website_url_confirm: z.string().max(0).optional(),
});

function signingSecret(): string {
  const secret = process.env.BROCHURE_DOWNLOAD_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("Missing brochure signing secret");
  }
  return secret;
}

function sign(body: string): string {
  return createHmac("sha256", signingSecret())
    .update(body)
    .digest("base64url");
}

function makeToken(submissionKey: string): string {
  const payload = {
    submissionKey,
    exp: Math.floor(Date.now() / 1000) + TTL,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function checkToken(token: string): boolean {
  const separator = token.lastIndexOf(".");
  if (separator < 1) return false;

  const body = token.slice(0, separator);
  const expected = Buffer.from(sign(body));
  const received = Buffer.from(token.slice(separator + 1));

  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as { submissionKey?: unknown; exp?: unknown };

    return (
      typeof payload.submissionKey === "string" &&
      typeof payload.exp === "number" &&
      payload.exp > Date.now() / 1000
    );
  } catch {
    return false;
  }
}

function error(status: number, message: string, code?: string) {
  return NextResponse.json(
    { ok: false, code, message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return error(403, "Invalid origin", "BAD_ORIGIN");
  }

  try {
    const ip = clientIp(req);
    const rl = await rateLimit(`brochure:${hmac(ip, "ip")}`, 8, 600);
    if (!rl.ok) {
      return error(429, "Too many requests. Please retry later.", "RATE_LIMITED");
    }

    const raw: unknown = await req.json().catch(() => null);
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return error(422, "Please check your details and try again.", "VALIDATION_FAILED");
    }

    const data = parsed.data;
    const digits = data.phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      return error(422, "Invalid mobile number.", "VALIDATION_FAILED");
    }

    // Check file and signing key before consuming the single-use CAPTCHA token.
    const brochure = await stat(filepath);
    if (!brochure.isFile()) {
      return error(503, "Brochure is unavailable.", "BROCHURE_UNAVAILABLE");
    }
    signingSecret();

    // Google reCAPTCHA v2 verification: call exactly once per submission.
    const captcha = await verifyRecaptcha(data.recaptchaToken, ip);
    if (!captcha.ok) {
      if (captcha.reason === "unconfigured" || captcha.reason === "unavailable") {
        return error(
          503,
          "Security verification is temporarily unavailable. Please try again.",
          "RECAPTCHA_UNAVAILABLE",
        );
      }
      return error(
        422,
        "Please complete the 'I'm not a robot' check again.",
        "RECAPTCHA_FAILED",
      );
    }

    const { idempotencyKey, fullName, company, email, phone } = data;

    // Persist before issuing download permission.
    await finalizeWebsiteDraft({
      submissionKey: idempotencyKey,
      form: "brochure",
      data: { fullName, company, email, phone },
      ref: idempotencyKey,
    });

    after(async () => {
      try {
        await deliverWebsiteDraft(idempotencyKey);
      } catch (cause) {
        console.error("brochure sync", cause);
      }
    });

    const response = NextResponse.json(
      {
        ok: true,
        message: "Brochure request recorded",
        url: "/api/downloads/brochure/",
      },
      { headers: { "Cache-Control": "no-store" } },
    );

    response.cookies.set({
      name: COOKIE,
      value: makeToken(idempotencyKey),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/downloads/brochure/",
      maxAge: TTL,
    });

    return response;
  } catch (cause) {
    console.error("brochure POST", cause);
    return error(503, "Brochure is unavailable. Please retry later.", "SERVICE_UNAVAILABLE");
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE)?.value;
    if (!token || !checkToken(token)) {
      return error(403, "Complete the brochure form first.", "ACCESS_DENIED");
    }

    const pdf = await readFile(filepath);
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
    return error(404, "Brochure is unavailable.", "BROCHURE_UNAVAILABLE");
  }
}
