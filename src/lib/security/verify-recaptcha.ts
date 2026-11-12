import "server-only";

export type RecaptchaResult =
  | { ok: true }
  | { ok: false; reason: "missing" | "invalid" | "unconfigured" | "unavailable" };

/** Google reCAPTCHA v2: verify on the server; client token is never trusted by itself. */
export async function verifyRecaptcha(token: unknown, remoteip?: string): Promise<RecaptchaResult> {
  if (typeof token !== "string" || token.length < 10 || token.length > 4096) return { ok: false, reason: "missing" };
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { ok: false, reason: "unconfigured" };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const body = new URLSearchParams({ secret, response: token });
      if (remoteip) body.set("remoteip", remoteip);
      const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) return { ok: false, reason: "unavailable" };
      const data: unknown = await response.json();
      if (!data || typeof data !== "object" || !("success" in data) || data.success !== true)
        return { ok: false, reason: "invalid" };
      return { ok: true };
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
