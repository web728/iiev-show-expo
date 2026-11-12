import "server-only";

/** Server-side Google reCAPTCHA v2 checkbox verification. */
export type RecaptchaResult =
  | { ok: true }
  | { ok: false; reason: "missing" | "invalid" | "unconfigured" | "unavailable" | "hostname_mismatch" };

type GoogleSiteVerify = {
  success?: boolean;
  hostname?: string;
  "error-codes"?: string[];
};

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
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

  // Explicit allowlist prevents accepting a valid token from another host.
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

    if (!result || result.success !== true) {
      return { ok: false, reason: "invalid" };
    }

    if (!result.hostname || !allowedHosts.includes(result.hostname.toLowerCase())) {
      return { ok: false, reason: "hostname_mismatch" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}
