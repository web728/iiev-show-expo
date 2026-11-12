import "server-only";

/** Verified Google reCAPTCHA v2 checkbox result. */
export type RecaptchaResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "missing"
        | "invalid"
        | "unconfigured"
        | "unavailable"
        | "hostname_mismatch";
    };

type GoogleSiteVerify = {
  success?: boolean;
  hostname?: string;
  "error-codes"?: string[];
};

/** Verify a token exactly once, server-side. Tokens cannot be reused. */
export async function verifyRecaptcha(
  token: unknown,
  remoteIp?: string,
): Promise<RecaptchaResult> {
  if (typeof token !== "string" || token.length < 20 || token.length > 5000) {
    return { ok: false, reason: "missing" };
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const allowedHosts = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES ?? "")
    .split(",")
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean);

  if (!secret || allowedHosts.length === 0) {
    return { ok: false, reason: "unconfigured" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) return { ok: false, reason: "unavailable" };

    const result = (await response.json()) as GoogleSiteVerify;
    if (result?.success !== true) return { ok: false, reason: "invalid" };

    if (
      !result.hostname ||
      !allowedHosts.includes(result.hostname.trim().toLowerCase())
    ) {
      return { ok: false, reason: "hostname_mismatch" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Backward compatibility for routes still importing verifyRecaptchaV2.
 * Prefer verifyRecaptcha() for new code, to distinguish invalid vs unavailable.
 * This wrapper calls Google only once; never call both on the same token.
 */
export async function verifyRecaptchaV2(
  token: unknown,
  remoteIp?: string,
): Promise<boolean> {
  const result = await verifyRecaptcha(token, remoteIp);
  return result.ok;
}
