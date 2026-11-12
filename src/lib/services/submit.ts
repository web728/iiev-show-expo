import "server-only";

import type { z } from "zod";
import { apiError, clientIp, isSameOrigin, readJson } from "@/lib/http";
import { flattenZod } from "@/lib/validation/forms";
import { rateLimit } from "@/lib/security/rate-limit";
import { hmac } from "@/lib/security/crypto";
import { verifyRecaptcha } from "@/lib/security/recaptcha";
import { DatabaseUnavailableError } from "@/lib/db/connect";
import { log } from "@/lib/log";

type PublicSubmissionOptions<S extends z.ZodTypeAny> = {
  schema: S;
  rateKey: string;
  limit?: number;
  windowSec?: number;
};

/**
 * One shared guard for ALL public lead / visitor POST routes.
 * Order matters: same-origin -> request read -> rate-limit -> schema -> captcha -> save.
 * CAPTCHA is never verified on the client, and never skipped by a route.
 */
export async function handlePublicSubmission<S extends z.ZodTypeAny>(
  req: Request,
  opts: PublicSubmissionOptions<S>,
  handle: (data: z.output<S>, ip: string) => Promise<Response>,
): Promise<Response> {
  if (!isSameOrigin(req)) {
    return apiError(403, "BAD_ORIGIN", "Submit this form from the website.");
  }

  let body: unknown;
  try {
    body = await readJson(req);
  } catch (err) {
    const code = err instanceof Error ? err.message : "BAD_REQUEST";
    return apiError(
      code === "PAYLOAD_TOO_LARGE" ? 413 : 400,
      code === "PAYLOAD_TOO_LARGE" ? code : "BAD_REQUEST",
      "Invalid request body.",
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return apiError(400, "BAD_REQUEST", "Invalid form submission.");
  }

  const input = body as Record<string, unknown>;
  const ip = clientIp(req);

  try {
    const rl = await rateLimit(
      `${opts.rateKey}:${hmac(ip, "ip")}`,
      opts.limit ?? 8,
      opts.windowSec ?? 600,
    );
    if (!rl.ok) {
      return apiError(
        429,
        "RATE_LIMITED",
        "Too many submissions. Please try again in a few minutes.",
        undefined,
        { "Retry-After": String(rl.retryAfterSec) },
      );
    }
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return apiError(503, "SERVICE_UNAVAILABLE", "Submissions are temporarily unavailable. Please try again.");
    }
    log.error("form.rate_limit_unavailable", { key: opts.rateKey });
    return apiError(503, "SERVICE_UNAVAILABLE", "Submissions are temporarily unavailable. Please try again.");
  }

  // Never return fake success: a success response must mean a saved record exists.
  if (typeof input.website_url_confirm === "string" && input.website_url_confirm.length > 0) {
    log.warn("form.honeypot_rejected", { key: opts.rateKey });
    return apiError(400, "INVALID_SUBMISSION", "Unable to process this submission.");
  }

  const parsed = opts.schema.safeParse(input);
  if (!parsed.success) {
    return apiError(
      422,
      "VALIDATION_FAILED",
      "Please correct the highlighted fields.",
      flattenZod(parsed.error),
    );
  }

  // Zod strips unrecognized fields (including captchaToken) from form output.
  // Read the token from the raw request, verify once, and never store it in MongoDB.
  const captcha = await verifyRecaptcha(input.recaptchaToken, ip);
  if (!captcha.ok) {
    if (captcha.reason === "unconfigured" || captcha.reason === "unavailable") {
      log.error("form.recaptcha_unavailable", { key: opts.rateKey, reason: captcha.reason });
      return apiError(503, "RECAPTCHA_UNAVAILABLE", "Security verification is temporarily unavailable. Please try again.");
    }

    log.warn("form.recaptcha_rejected", { key: opts.rateKey, reason: captcha.reason });
    return apiError(
      422,
      "RECAPTCHA_FAILED",
      "Security verification failed or expired. Please tick the box again.",
      { recaptchaToken: "Complete the security verification again." },
    );
  }

  try {
    return await handle(parsed.data, ip);
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      log.error("form.db_unavailable", { key: opts.rateKey });
      return apiError(503, "SERVICE_UNAVAILABLE", "We couldn't save your submission. Please try again.");
    }

    log.error("form.unhandled", {
      key: opts.rateKey,
      error: err instanceof Error ? err.message : String(err),
    });
    return apiError(500, "INTERNAL_ERROR", "Something went wrong. Please try again with a new verification.");
  }
}
