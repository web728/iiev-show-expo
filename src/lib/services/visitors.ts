import "server-only";
import { connectDb } from "@/lib/db/connect";
import { Visitor, ConsentRecord, IntegrationJob, type VisitorStatus } from "@/models/leads";
import { humanRef, hmac, sha256 } from "@/lib/security/crypto";
import { issueBadgeToken } from "@/lib/badge/token";
import { enqueue, enqueueVisitorPipeline } from "@/lib/jobs";
import { getCurrentEdition } from "@/lib/data/edition";
import { createBadgeAccessToken } from "@/lib/badge/access";
import type { VisitorRegistrationInput } from "@/lib/validation/forms";

export class VisitorError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export type RegisterResult =
  | { kind: "created"; ref: string; status: VisitorStatus; badgeAccess?: string }
  | { kind: "duplicate_submission"; ref: string; status: VisitorStatus; badgeAccess?: string }
  | { kind: "already_registered" };

/**
 * Visitor registration. Dedupe rule: one registration per email per edition.
 * If the email already exists we do NOT reveal registration details (anti-
 * enumeration) — the user is pointed to the email-verified badge retrieval flow.
 */
export async function registerVisitor(input: VisitorRegistrationInput, ip: string): Promise<RegisterResult> {
  await connectDb();
  const edition = await getCurrentEdition();
  if (!edition.registration.visitorOpen) throw new VisitorError("REGISTRATION_CLOSED", "Visitor registration is currently closed.");

  // Same browser re-submitting (double-click, network retry): return original result.
  const same = await Visitor.findOne({ idempotencyKey: input.idempotencyKey }).lean<{ _id: unknown; ref: string; status: VisitorStatus; badgeVersion: number }>();
  if (same) {
    const badgeAccess = same.status === "approved" ? await createBadgeAccessToken(String(same._id), same.badgeVersion, "24h") : undefined;
    return { kind: "duplicate_submission", ref: same.ref, status: same.status, badgeAccess };
  }

  const exists = await Visitor.exists({ edition: edition.slug, email: input.email });
  if (exists) return { kind: "already_registered" };

  const autoApprove = edition.registration.approvalMode === "auto";
  const badge = autoApprove ? issueBadgeToken() : null;
  const status: VisitorStatus = autoApprove ? "approved" : "pending_review";

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const v = await Visitor.create({
        ref: humanRef("VS", edition.slug),
        idempotencyKey: input.idempotencyKey,
        edition: edition.slug,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        company: input.company,
        designation: input.designation,
        industry: input.industry,
        city: input.city,
        state: input.state,
        country: input.country,
        reasonForVisit: input.reasonForVisit,
        sectorInterests: input.sectorInterests,
        privacyAccepted: input.privacyAccepted,
        marketingOptIn: input.marketingOptIn,
        status,
        statusHistory: [
          { status: "submitted", by: "web" },
          { status: "validated", by: "system" },
          { status, by: autoApprove ? "system:auto" : "system" },
        ],
        ...(badge ? { badgeTokenHash: badge.hash, badgeTokenEnc: badge.enc, badgeIssuedAt: new Date(), badgeVersion: 1 } : {}),
        attribution: input.attribution,
        ipHash: hmac(ip, "ip"),
      });
      await ConsentRecord.insertMany([
        { subjectEmail: v.email, entity: "Visitor", entityId: String(v._id), purpose: "privacy_notice", granted: true, noticeVersion: process.env.PRIVACY_NOTICE_VERSION || "draft-2026-10", source: "form:visitor" },
        { subjectEmail: v.email, entity: "Visitor", entityId: String(v._id), purpose: "marketing", granted: Boolean(input.marketingOptIn), source: "form:visitor" },
      ]);
      await enqueueVisitorPipeline(v._id, autoApprove);
      const badgeAccess = autoApprove ? await createBadgeAccessToken(String(v._id), 1, "24h") : undefined;
      return { kind: "created", ref: v.ref, status, badgeAccess };
    } catch (err: unknown) {
      const e = err as { code?: number; keyPattern?: Record<string, unknown> };
      if (e.code === 11000 && e.keyPattern?.email) return { kind: "already_registered" };
      if (e.code === 11000 && e.keyPattern?.idempotencyKey) {
        const again = await Visitor.findOne({ idempotencyKey: input.idempotencyKey }).lean<{ ref: string; status: VisitorStatus }>();
        if (again) return { kind: "duplicate_submission", ref: again.ref, status: again.status };
      }
      if (e.code === 11000 && e.keyPattern?.ref) continue;
      throw err;
    }
  }
  throw new Error("Could not allocate a unique reference");
}

type Actor = { id: string; email: string };

async function pushStatus(id: string, status: VisitorStatus, actor: Actor, reason?: string, extra: Record<string, unknown> = {}) {
  return Visitor.findByIdAndUpdate(
    id,
    { $set: { status, ...extra }, $push: { statusHistory: { status, by: actor.email, reason } } },
    { returnDocument: "after" },
  );
}

export async function approveVisitor(id: string, actor: Actor) {
  await connectDb();
  const v = await Visitor.findById(id).select("+badgeTokenHash");
  if (!v) throw new VisitorError("NOT_FOUND", "Visitor not found");
  if (!["pending_review", "rejected", "submitted", "validated"].includes(v.status)) throw new VisitorError("INVALID_STATE", `Cannot approve from status ${v.status}`);
  const badge = issueBadgeToken();
  const version = (v.badgeVersion || 0) + 1;
  await pushStatus(id, "approved", actor, undefined, {
    badgeTokenHash: badge.hash, badgeTokenEnc: badge.enc, badgeIssuedAt: new Date(), badgeVersion: version, badgeRevokedAt: null,
  });
  await enqueue("email_badge", "Visitor", v._id, undefined, `v${version}`);
}

export async function rejectVisitor(id: string, actor: Actor, reason?: string) {
  await connectDb();
  await pushStatus(id, "rejected", actor, reason, { badgeRevokedAt: new Date() });
}

export async function cancelVisitor(id: string, actor: Actor, reason?: string) {
  await connectDb();
  await pushStatus(id, "cancelled", actor, reason, { badgeRevokedAt: new Date() });
}

/** Revoke old QR and issue a new one (lost badge, suspected sharing, corrected name). */
export async function reissueBadge(id: string, actor: Actor, sendEmail = true) {
  await connectDb();
  const v = await Visitor.findById(id);
  if (!v) throw new VisitorError("NOT_FOUND", "Visitor not found");
  if (!["approved", "checked_in"].includes(v.status)) throw new VisitorError("INVALID_STATE", "Only approved visitors can be reissued a badge");
  const badge = issueBadgeToken();
  const version = (v.badgeVersion || 0) + 1;
  await Visitor.updateOne(
    { _id: id },
    {
      $set: { badgeTokenHash: badge.hash, badgeTokenEnc: badge.enc, badgeIssuedAt: new Date(), badgeVersion: version, badgeRevokedAt: null },
      $push: { statusHistory: { status: v.status, by: actor.email, reason: `badge reissued (v${version})` } },
    },
  );
  if (sendEmail) await enqueue("email_badge", "Visitor", v._id, undefined, `v${version}`);
  return version;
}

/**
 * Email-verified badge retrieval. Always returns the same response whether or
 * not the email exists (prevents enumeration); if a matching approved record
 * exists, a time-limited link is emailed.
 */
export async function requestBadgeLink(email: string) {
  await connectDb();
  const edition = await getCurrentEdition();
  const v = await Visitor.findOne({ edition: edition.slug, email: email.toLowerCase(), status: { $in: ["approved", "checked_in"] }, badgeRevokedAt: null }).select("_id");
  if (!v) return;
  // Dedupe per 10-minute bucket so repeated requests cannot spam the inbox.
  const bucket = Math.floor(Date.now() / 600_000);
  await enqueue("email_badge_link", "Visitor", v._id, undefined, `b${bucket}`);
}

export async function findVisitorByToken(token: string) {
  await connectDb();
  return Visitor.findOne({ badgeTokenHash: sha256(token) });
}

export async function pendingJobsFor(entityId: string) {
  return IntegrationJob.find({ entityId }).sort({ createdAt: 1 }).lean();
}
