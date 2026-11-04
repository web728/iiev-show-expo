import "server-only";
import { AwsClient } from "aws4fetch";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomToken } from "@/lib/security/crypto";

// Media storage adapter.
//  • S3-compatible object storage (AWS S3, Cloudflare R2, DigitalOcean Spaces,
//    Backblaze B2) when S3_* env vars are set — required for serverless hosts.
//  • Local disk (public/uploads) ONLY outside production, for development.

export const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "application/pdf": "pdf",
};
export const MAX_BYTES = 15 * 1024 * 1024;

export function storageMode(): "s3" | "local" | "none" {
  if (process.env.S3_BUCKET && process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && process.env.S3_PUBLIC_BASE_URL) return "s3";
  if (process.env.NODE_ENV !== "production") return "local";
  return "none";
}

/** Verify magic bytes so a renamed executable can't be uploaded as an image. */
export function sniffType(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "image/webp";
  if (buf.subarray(4, 12).toString().startsWith("ftypavi")) return "image/avif";
  if (buf.subarray(0, 5).toString() === "%PDF-") return "application/pdf";
  return null;
}

/**
 * Images are re-encoded with sharp: auto-rotated, EXIF/GPS metadata stripped
 * (privacy), and capped at 3200px on the long edge.
 */
async function sanitiseImage(buf: Buffer, mime: string): Promise<{ buf: Buffer; width?: number; height?: number }> {
  const sharp = (await import("sharp")).default;
  let img = sharp(buf, { failOn: "error" }).rotate().resize({ width: 3200, height: 3200, fit: "inside", withoutEnlargement: true });
  img = mime === "image/png" ? img.png({ compressionLevel: 9 }) : mime === "image/webp" ? img.webp({ quality: 86 }) : mime === "image/avif" ? img.avif({ quality: 60 }) : img.jpeg({ quality: 86, mozjpeg: true });
  const { data, info } = await img.toBuffer({ resolveWithObject: true });
  return { buf: data, width: info.width, height: info.height };
}

export async function storeFile(rawBuf: Buffer, declaredType: string, folder = "media"): Promise<{ key: string; url: string; mime: string; width?: number; height?: number; bytes: number }> {
  const mime = sniffType(rawBuf);
  if (!mime || !ALLOWED_TYPES[mime]) throw new Error("UNSUPPORTED_TYPE");
  if (declaredType && declaredType !== mime && !(declaredType === "image/jpg" && mime === "image/jpeg")) throw new Error("TYPE_MISMATCH");
  if (rawBuf.length > MAX_BYTES) throw new Error("TOO_LARGE");
  let buf = rawBuf;
  let width: number | undefined;
  let height: number | undefined;
  if (mime.startsWith("image/")) ({ buf, width, height } = await sanitiseImage(rawBuf, mime));
  const ym = new Date().toISOString().slice(0, 7);
  const key = `${folder}/${ym}/${randomToken(12)}.${ALLOWED_TYPES[mime]}`;
  const mode = storageMode();

  if (mode === "s3") {
    const client = new AwsClient({ accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!, service: "s3", region: process.env.S3_REGION || "auto" });
    const endpoint = process.env.S3_ENDPOINT!.replace(/\/$/, "");
    const res = await client.fetch(`${endpoint}/${process.env.S3_BUCKET}/${key}`, {
      method: "PUT",
      body: new Uint8Array(buf),
      headers: { "Content-Type": mime, "Cache-Control": "public, max-age=31536000, immutable" },
    });
    if (!res.ok) throw new Error(`S3_UPLOAD_FAILED_${res.status}`);
    return { key, url: `${process.env.S3_PUBLIC_BASE_URL!.replace(/\/$/, "")}/${key}`, mime, width, height, bytes: buf.length };
  }
  if (mode === "local") {
    const dest = path.join(process.cwd(), "public", "uploads", key);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    return { key, url: `/uploads/${key}`, mime, width, height, bytes: buf.length };
  }
  throw new Error("STORAGE_NOT_CONFIGURED");
}
