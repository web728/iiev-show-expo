import "server-only";
import { SignJWT, jwtVerify } from "jose";

// Short-lived signed links for viewing/downloading a badge without an account.
// The JWT contains only the internal record id + badge version (no PII), and
// is invalidated automatically when the badge is reissued (version bump).

function key() {
  const secret = process.env.APP_SECRET;
  if (!secret && process.env.NODE_ENV === "production") throw new Error("APP_SECRET is required in production");
  return new TextEncoder().encode(`${secret || "dev-only-insecure-secret"}:badge-access`);
}

export async function createBadgeAccessToken(visitorId: string, badgeVersion: number, ttl = "7d") {
  return new SignJWT({ v: badgeVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(visitorId)
    .setIssuedAt()
    .setExpirationTime(ttl)
    .setAudience("iiev-badge")
    .sign(key());
}

export async function verifyBadgeAccessToken(token: string): Promise<{ visitorId: string; version: number } | null> {
  try {
    const { payload } = await jwtVerify(token, key(), { audience: "iiev-badge" });
    if (!payload.sub) return null;
    return { visitorId: payload.sub, version: Number(payload.v) };
  } catch {
    return null;
  }
}
