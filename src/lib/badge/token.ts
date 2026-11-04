import "server-only";
import { encrypt, randomToken, sha256 } from "@/lib/security/crypto";

// QR payload format: "IIEV1.<token>" — a versioned prefix + 256-bit random token.
// Contains no personal data; verifiable only by the server (hash lookup).
export const QR_PREFIX = "IIEV1.";

export function issueBadgeToken() {
  const token = randomToken(32);
  return { token, hash: sha256(token), enc: encrypt(token) };
}

export function qrPayload(token: string) {
  return `${QR_PREFIX}${token}`;
}

/** Extracts the token from scanned text; returns null for foreign codes. */
export function parseQrPayload(text: string): string | null {
  const t = text.trim();
  if (!t.startsWith(QR_PREFIX)) return null;
  const token = t.slice(QR_PREFIX.length);
  return /^[A-Za-z0-9_-]{40,64}$/.test(token) ? token : null;
}
