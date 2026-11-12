import "server-only";

/** Google reCAPTCHA v2 checkbox. Never import this module in a client component. */
export type RecaptchaResult =
  | { ok: true }
  | {
      ok: false;
      reason: "missing" | "invalid" | "unconfigured" | "unavailable" | "hostname_mismatch";
    };

type VerificationResponse = {
  success?: boolean;
  hostname?: string;
  "error-codes"?: string[];
};

function allowedHosts(): string[] {
  return (process.env.RECAPTCHA_ALLOWED_HOSTNAMES || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0 && !value.includes(":") && !value.includes("/"));
}

/**
 * Verify once per NEW final submission (not on drafts or on already-persisted retries).
 * A failed Google request is not an accepted CAPTCHA. Fail closed.
 */
export async function verifyRecaptcha(
  token: unknown,
  remoteIp?: string,
): Promise<RecaptchaResult> {
  if (typeof token !== "string" || token.trim().length < 20 || token.length > 4096) {
    return { ok: false, reason: "missing" };
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
  const hosts = allowedHosts();
  if (!secret || hosts.length === 0) return { ok: false, reason: "unconfigured" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const body = new URLSearchParams({ secret, response: token.trim() });
    // Optional: only forward an IP from a trusted proxy header parser.
    if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return { ok: false, reason: "unavailable" };

    const data = (await response.json()) as VerificationResponse;
    if (!data || typeof data !== "object") return { ok: false, reason: "unavailable" };
    if (data.success !== true) {
      // Token replay/expiration, missing token, or bad client response.
      const errors = Array.isArray(data["error-codes"]) ? data["error-codes"] : [];
      if (errors.some((code) => ["invalid-input-secret", "missing-input-secret"].includes(code))) {
        return { ok: false, reason: "unconfigured" };
      }
      return { ok: false, reason: "invalid" };
    }

    if (!data.hostname || !hosts.includes(data.hostname.trim().toLowerCase())) {
      return { ok: false, reason: "hostname_mismatch" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "unavailable" };
  } finally {
    clearTimeout(timer);
  }
}

/** For older imports; do not call both functions for the same token. */
export async function verifyRecaptchaV2(token: unknown, remoteIp?: string): Promise<boolean> {
  return (await verifyRecaptcha(token, remoteIp)).ok;
}
