import "server-only";
import type { z } from "zod";
import { NextResponse } from "next/server";
import { apiError, clientIp, isSameOrigin, readJson } from "@/lib/http";
import { flattenZod } from "@/lib/validation/forms";
import { rateLimit } from "@/lib/security/rate-limit";
import { hmac } from "@/lib/security/crypto";
import { DatabaseUnavailableError } from "@/lib/db/connect";
import { log } from "@/lib/log";

const MIN_FILL_MS = 2500; // humans don't complete these forms in under 2.5 s

/**
 * Shared guard for public POST endpoints: origin check, JSON parsing, rate
 * limit, honeypot + timing bot checks, schema validation. Calls `handle` with
 * validated data and maps failures to stable error codes.
 */
export async function handlePublicSubmission<S extends z.ZodTypeAny>(
  req: Request,
  opts: { schema: S; rateKey: string; limit?: number; windowSec?: number },
  handle: (data: z.infer<S>, ip: string) => Promise<Response>,
): Promise<Response> {
  if (!isSameOrigin(req)) return apiError(403, "BAD_ORIGIN", "This form must be submitted from the website.");
  let body: unknown;
  try {
    body = await readJson(req);
  } catch (e) {
    const code = e instanceof Error ? e.message : "BAD_REQUEST";
    return apiError(code === "PAYLOAD_TOO_LARGE" ? 413 : 400, code, "Invalid request.");
  }
  const ip = clientIp(req);

  try {
    const rl = await rateLimit(`${opts.rateKey}:${hmac(ip, "ip")}`, opts.limit ?? 8, opts.windowSec ?? 600);
    if (!rl.ok) return apiError(429, "RATE_LIMITED", "Too many submissions from your connection. Please try again in a few minutes.", undefined, { "Retry-After": String(rl.retryAfterSec) });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) return apiError(503, "SERVICE_UNAVAILABLE", "We can't accept submissions right now. Please try again shortly or contact us by email.");
    throw err;
  }

  const b = body as Record<string, unknown>;
  const honeypot = typeof b.website_url_confirm === "string" && b.website_url_confirm.length > 0;
  const tooFast = typeof b.startedAt === "number" && Date.now() - b.startedAt < MIN_FILL_MS;
  if (honeypot || tooFast) {
    log.warn("form.bot_rejected", { key: opts.rateKey, honeypot, tooFast });
    // Pretend success to avoid teaching bots; nothing is stored.
    return NextResponse.json({ ok: true, ref: "RECEIVED", message: "Thank you." });
  }

  const parsed = opts.schema.safeParse(body);
  if (!parsed.success) return apiError(422, "VALIDATION_FAILED", "Please correct the highlighted fields.", flattenZod(parsed.error));

  try {
    return await handle(parsed.data, ip);
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      log.error("form.db_unavailable", { key: opts.rateKey });
      return apiError(503, "SERVICE_UNAVAILABLE", "We couldn't save your submission right now. Nothing was sent — please try again shortly.");
    }
    log.error("form.unhandled", { key: opts.rateKey, error: err instanceof Error ? err.message : String(err) });
    return apiError(500, "INTERNAL_ERROR", "Something went wrong on our side. Please try again; if it keeps happening, contact us by email.");
  }
}
