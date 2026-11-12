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
  /**
   * Optional safe retry path. Must only return Response for an ALREADY FINALIZED
   * MongoDB record after matching stable key, email, form and edition.
   * A saved draft alone NEVER counts. Called before CAPTCHA/schema since the
   * original token may have expired or been used; this callback must not write.
   */
  existingFinalSubmission?: (
    input: Readonly<Record<string, unknown>>,
    ip: string,
  ) => Promise<Response | null>;
};

/** One shared guard for lead/visitor final POST routes; never use for autosave. */
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
    const large = err instanceof Error && err.message === "PAYLOAD_TOO_LARGE";
    return apiError(large ? 413 : 400, large ? "PAYLOAD_TOO_LARGE" : "BAD_REQUEST", "Invalid request body.");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return apiError(400, "BAD_REQUEST", "Invalid form submission.");
  }

  const input = body as Record<string, unknown>;
  const ip = clientIp(req);
  try {
    const limited = await rateLimit(
      `${opts.rateKey}:${hmac(ip, "ip")}`,
      opts.limit ?? 8,
      opts.windowSec ?? 600,
    );
    if (!limited.ok) {
      return apiError(
        429, "RATE_LIMITED", "Too many requests. Please retry later.", undefined,
        { "Retry-After": String(limited.retryAfterSec) },
      );
    }
  } catch {
    log.error("form.rate_limit_unavailable", { key: opts.rateKey });
    return apiError(503, "SERVICE_UNAVAILABLE", "Form submissions are temporarily unavailable.");
  }

  if (input.website_url_confirm !== undefined && input.website_url_confirm !== "") {
    return apiError(400, "INVALID_SUBMISSION", "Unable to process this submission.");
  }

  // Must be an already-saved FINAL record, NEVER an autosaved draft.
  // The route-specific callback must verify identity and form; key alone is insufficient.
  if (opts.existingFinalSubmission) {
    try {
      const alreadySaved = await opts.existingFinalSubmission(input, ip);
      if (alreadySaved) return alreadySaved;
    } catch (error) {
      if (error instanceof DatabaseUnavailableError) {
        return apiError(503, "SERVICE_UNAVAILABLE", "Please retry shortly.");
      }
      log.error("form.retry_lookup_failed", { key: opts.rateKey });
      return apiError(503, "SERVICE_UNAVAILABLE", "Please retry shortly.");
    }
  }

  const parsed = opts.schema.safeParse(input);
  if (!parsed.success) {
    return apiError(422, "VALIDATION_FAILED", "Please correct the highlighted fields.", flattenZod(parsed.error));
  }

  // A token can survive Zod transforms or be stripped; use original input.
  // Verify exactly once; downstream handle() MUST NOT verify again.
  const captcha = await verifyRecaptcha(input.recaptchaToken, ip);
  if (!captcha.ok) {
    if (captcha.reason === "unconfigured" || captcha.reason === "unavailable") {
      log.error("form.recaptcha_unavailable", { key: opts.rateKey, reason: captcha.reason });
      return apiError(503, "RECAPTCHA_UNAVAILABLE", "Security verification is temporarily unavailable.");
    }
    log.warn("form.recaptcha_rejected", { key: opts.rateKey, reason: captcha.reason });
    return apiError(
      422, "RECAPTCHA_FAILED", "Security check failed or expired. Please tick the checkbox again.",
      { recaptchaToken: "Complete the security verification again." },
    );
  }

  try {
    return await handle(parsed.data, ip);
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return apiError(503, "SERVICE_UNAVAILABLE", "We could not save your submission. Please retry.");
    }
    log.error("form.submission_failed", {
      key: opts.rateKey,
      error: error instanceof Error ? error.message : String(error),
    });
    return apiError(500, "INTERNAL_ERROR", "Submission could not be processed. Please retry.");
  }
}
