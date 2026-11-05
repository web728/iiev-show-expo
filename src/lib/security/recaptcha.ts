import "server-only";

// Google reCAPTCHA v2 checkbox: server-side verification is mandatory.
// Tokens are single use and expire in approximately two minutes.
type SiteVerifyResponse = { success?: boolean; hostname?: string; "error-codes"?: string[] };
export async function verifyRecaptchaV2(token: unknown): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || typeof token !== "string" || token.length < 20 || token.length > 5000) return false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    let response: Response;
    try {
      response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }),
        cache: "no-store",
        signal: controller.signal,
      });
    } finally { clearTimeout(timeout); }
    if (!response.ok) return false;
    const result = await response.json() as SiteVerifyResponse;
    if (!result.success || !result.hostname) return false;
    const allowed = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES || "")
      .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    // Fail closed if the hostname allowlist was not configured.
    return allowed.length > 0 && allowed.includes(result.hostname.toLowerCase());
  } catch { return false; }
}
