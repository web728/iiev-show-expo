import "server-only";
import { after, NextResponse } from "next/server";
import { apiError, clientIp, isSameOrigin, readJson } from "@/lib/http";
import { rateLimit } from "@/lib/security/rate-limit";
import { hmac } from "@/lib/security/crypto";
import {
  saveWebsiteDraft,
  deliverWebsiteDraft,
} from "@/lib/website-forms/pipeline";
import {
  assertSubmissionKey,
  assertWebForm,
} from "@/lib/website-forms/sheets-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Single autosave endpoint. Drafts do not require reCAPTCHA or send emails. */
export async function POST(req: Request): Promise<Response> {
  if (!isSameOrigin(req)) {
    return apiError(403, "BAD_ORIGIN", "Invalid origin.");
  }
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return apiError(415, "UNSUPPORTED_MEDIA_TYPE", "JSON is required.");
  }

  let payload: unknown;
  try {
    payload = await readJson(req);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === "PAYLOAD_TOO_LARGE";
    return apiError(
      tooLarge ? 413 : 400,
      tooLarge ? "PAYLOAD_TOO_LARGE" : "BAD_REQUEST",
      "Invalid draft request.",
    );
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return apiError(400, "BAD_REQUEST", "Invalid draft request.");
  }

  const body = payload as Record<string, unknown>;
  if (body.website_url_confirm !== undefined && body.website_url_confirm !== "") {
    return apiError(400, "INVALID_SUBMISSION", "Invalid draft request.");
  }
  if (
    typeof body.submissionKey !== "string" ||
    typeof body.form !== "string" ||
    !body.data ||
    typeof body.data !== "object" ||
    Array.isArray(body.data)
  ) {
    return apiError(422, "VALIDATION_FAILED", "Invalid draft fields.");
  }

  try {
    assertSubmissionKey(body.submissionKey);
    assertWebForm(body.form);
  } catch {
    return apiError(422, "VALIDATION_FAILED", "Invalid draft form or key.");
  }

  try {
    const ip = clientIp(req);
    const limit = await rateLimit(`website-draft:${hmac(ip, "ip")}`, 90, 600);
    if (!limit.ok) {
      return apiError(
        429,
        "RATE_LIMITED",
        "Too many autosaves.",
        undefined,
        { "Retry-After": String(limit.retryAfterSec) },
      );
    }

    // Keep this as a variable (not an inline object literal). It is compatible
    // with older TypeScript signatures while updated sheets-sync.ts honours
    // syncImmediately:false to avoid waiting for Google Sheets on every draft.
    const draftInput = {
      submissionKey: body.submissionKey,
      form: body.form,
      data: body.data,
      syncImmediately: false,
    };
    const result = await saveWebsiteDraft(draftInput);

    if (result.saved && !result.sheetSynced && result.state === "draft") {
      const key = body.submissionKey;
      after(async () => {
        try {
          await deliverWebsiteDraft(key);
        } catch (error) {
          console.error(
            "[forms] Draft Sheet sync pending:",
            error instanceof Error ? error.message : "unknown",
          );
        }
      });
    }

    return NextResponse.json(
      { ok: true, ...result },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(
      "[forms] Draft save failed:",
      error instanceof Error ? error.message : "unknown",
    );
    return apiError(503, "DRAFT_UNAVAILABLE", "Draft could not be saved. Please retry.");
  }
}
