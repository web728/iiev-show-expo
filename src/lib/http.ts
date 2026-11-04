import "server-only";
import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

export type ApiError = { ok: false; code: string; message: string; fieldErrors?: Record<string, string> };

export function apiError(status: number, code: string, message: string, fieldErrors?: Record<string, string>, headers?: HeadersInit) {
  return NextResponse.json<ApiError>({ ok: false, code, message, ...(fieldErrors ? { fieldErrors } : {}) }, { status, headers });
}

/**
 * Client IP for rate limiting. The left-most X-Forwarded-For entry is supplied by the
 * client and can be forged to dodge rate limits, so we count TRUSTED_PROXY_HOPS entries
 * from the right (default 1: the address seen by the nearest trusted proxy, e.g. Vercel,
 * nginx, Cloudflare→origin). X-Real-IP is preferred when the platform sets it.
 */
export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    const hops = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS || 1));
    return parts[Math.max(0, parts.length - hops)] || "0.0.0.0";
  }
  return "0.0.0.0";
}

/**
 * CSRF defence for JSON endpoints: browsers always send Origin on cross-site
 * POST. Reject when it does not match our host. Combined with SameSite cookies
 * and JSON content-type requirement.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production"; // allow curl/tests outside production
  try {
    const o = new URL(origin);
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    if (host && o.host === host) return true;
    return o.origin === new URL(siteConfig.url).origin;
  } catch {
    return false;
  }
}

export async function readJson(req: Request, maxBytes = 64_000): Promise<unknown> {
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new Error("UNSUPPORTED_MEDIA");
  const text = await req.text();
  if (text.length > maxBytes) throw new Error("PAYLOAD_TOO_LARGE");
  return JSON.parse(text);
}
