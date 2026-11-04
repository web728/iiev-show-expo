import { NextResponse } from "next/server";
import { apiPermission, audit } from "@/lib/auth/session";
import { storeFile, MAX_BYTES } from "@/lib/storage";
import { apiError, isSameOrigin } from "@/lib/http";
import { connectDb } from "@/lib/db/connect";
import { MediaAsset } from "@/models/content";

const MESSAGES: Record<string, string> = {
  UNSUPPORTED_TYPE: "Only JPEG, PNG, WebP, AVIF images and PDF files are allowed.",
  TYPE_MISMATCH: "The file contents don't match its type.",
  TOO_LARGE: "Files must be 15 MB or smaller.",
  STORAGE_NOT_CONFIGURED: "Media storage isn't configured for this environment (set S3_* variables).",
};

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return apiError(403, "BAD_ORIGIN", "Bad origin");
  const { admin, status } = await apiPermission("media.edit");
  const fallback = !admin ? await apiPermission("content.edit") : null;
  const actor = admin ?? fallback?.admin;
  if (!actor) return apiError(status, "FORBIDDEN", "Not allowed to upload");
  const len = Number(req.headers.get("content-length") || 0);
  if (len > MAX_BYTES + 100_000) return apiError(413, "TOO_LARGE", MESSAGES.TOO_LARGE);
  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File)) return apiError(422, "NO_FILE", "No file");
  try {
    const stored = await storeFile(Buffer.from(await file.arrayBuffer()), file.type);
    await connectDb();
    await MediaAsset.create({ key: stored.key, url: stored.url, mime: stored.mime, bytes: stored.bytes, width: stored.width, height: stored.height, uploadedBy: actor.email, licensingStatus: "pending" });
    await audit(actor, "media.upload", "MediaAsset", stored.key, file.name.slice(0, 120));
    return NextResponse.json({ ok: true, url: stored.url, width: stored.width, height: stored.height });
  } catch (e) {
    const code = e instanceof Error ? e.message : "UPLOAD_FAILED";
    return apiError(422, code, MESSAGES[code] ?? "Upload failed.");
  }
}
