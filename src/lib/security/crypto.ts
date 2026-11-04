import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/** Cryptographically strong, URL-safe opaque token (default 32 bytes = 256 bits). */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Keyed hash (e.g. IP addresses) so raw values are never stored. */
export function hmac(value: string, purpose = "generic"): string {
  const secret = process.env.APP_SECRET || "dev-only-insecure-secret";
  return createHmac("sha256", `${secret}:${purpose}`).update(value).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

// Crockford-like alphabet without ambiguous characters (no 0/O, 1/I/L).
const REF_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
/** Human-readable reference e.g. VS-27-4H7K2M. Not a secret; never used for authorisation. */
export function humanRef(prefix: string, edition: string, length = 6): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
  return `${prefix}-${edition.slice(-2)}-${out}`;
}

function encryptionKey(): Buffer {
  const raw = process.env.APP_ENCRYPTION_KEY;
  if (!raw) {
    if (process.env.NODE_ENV === "production") throw new Error("APP_ENCRYPTION_KEY is required in production");
    return createHash("sha256").update("dev-only-encryption-key").digest();
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("APP_ENCRYPTION_KEY must be 32 bytes, base64-encoded");
  return key;
}

/** AES-256-GCM for small secrets at rest (e.g. MFA seeds). */
export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), enc.toString("base64url")].join(".");
}

export function decrypt(payload: string): string {
  const [iv, tag, enc] = payload.split(".");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(enc, "base64url")), decipher.final()]).toString("utf8");
}
