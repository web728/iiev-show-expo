import "server-only";

import mongoose from "mongoose";
import { connectDb } from "@/lib/db/connect";
import { Visitor, IntegrationJob, type VisitorStatus } from "@/models/leads";
import { humanRef, hmac, sha256 } from "@/lib/security/crypto";
import { issueBadgeToken } from "@/lib/badge/token";
import { enqueue, enqueueVisitorPipeline } from "@/lib/jobs";
import { getCurrentEdition } from "@/lib/data/edition";
import { createBadgeAccessToken } from "@/lib/badge/access";
import { log } from "@/lib/log";
import type { VisitorRegistrationInput } from "@/lib/validation/forms";

export class VisitorError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "VisitorError";
  }
}

export type RegisterResult =
  | { kind: "created"; id: string; ref: string; status: VisitorStatus; badgeAccess?: string }
  | { kind: "duplicate_submission"; id: string; ref: string; status: VisitorStatus; badgeAccess?: string }
  | { kind: "already_registered" };

type VisitorLookup = {
  _id: unknown;
  edition: string;
  email: string;
  ref: string;
  status: VisitorStatus;
  badgeVersion?: number;
  badgeRevokedAt?: Date | null;
};

type Actor = { id: string; email: string };

async function findBySubmissionKey(key: string): Promise<VisitorLookup | null> {
  return Visitor.findOne({ idempotencyKey: key })
    .select("_id edition email ref status badgeVersion badgeRevokedAt")
    .lean<VisitorLookup>();
}

/**
 * Only for retry of an already finalised Visitor record.
 * An autosaved draft with the same key does NOT count as submitted.
 */
export async function findExistingVisitorSubmission(
  key: unknown,
  email: unknown,
): Promise<RegisterResult | null> {
  if (typeof key !== "string" || !/^[A-Za-z0-9_-]{8,100}$/.test(key) ||
      typeof email !== "string") return null;
  await connectDb();
  const visitor = await findBySubmissionKey(key);
  if (!visitor || visitor.email.toLowerCase() !== email.trim().toLowerCase()) return null;
  return duplicateResult(visitor, email);
}

async function safeVisitorPipeline(id: unknown, autoApprove: boolean): Promise<void> {
  try {
    await enqueueVisitorPipeline(
      id as Parameters<typeof enqueueVisitorPipeline>[0],
      autoApprove,
    );
  } catch (error) {
    log.error("form.visitor_pipeline_enqueue_failed", {
      id: String(id),
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function safeBadgeAccess(id: string, version: number): Promise<string | undefined> {
  try {
    return await createBadgeAccessToken(id, version, "24h");
  } catch (error) {
    log.error("form.badge_access_creation_failed", {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
}

function sameIdentity(record: VisitorLookup, email: string): void {
  if (record.email.toLowerCase() !== email.trim().toLowerCase()) {
    throw new VisitorError("KEY_CONFLICT", "Submission key is linked to another request.");
  }
}

async function duplicateResult(visitor: VisitorLookup, email: string): Promise<RegisterResult> {
  sameIdentity(visitor, email);
  const badgeActive =
    (visitor.status === "approved" || visitor.status === "checked_in") &&
    !visitor.badgeRevokedAt &&
    (visitor.badgeVersion ?? 0) > 0;
  const badgeAccess = badgeActive
    ? await safeBadgeAccess(String(visitor._id), visitor.badgeVersion!)
    : undefined;
  return {
    kind: "duplicate_submission",
    id: String(visitor._id),
    ref: visitor.ref,
    status: visitor.status,
    badgeAccess,
  };
}

/**
 * Called after FINAL form Zod + CAPTCHA verification. Safe against concurrent
 * inserts through unique idempotencyKey and (edition,email) MongoDB indexes.
 */
export async function registerVisitor(
  input: VisitorRegistrationInput, ip: string,
  options: { skipLegacyPipeline?: boolean } = {},
): Promise<RegisterResult> {
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(input.idempotencyKey)) {
    throw new VisitorError("INVALID_KEY", "Invalid submission key.");
  }
  const email = input.email.trim().toLowerCase();
  await connectDb();

  // Idempotent retries work even after visitor registration closes or edition
  // changes: the existing visitor keeps their original event edition.
  const existing = await findBySubmissionKey(input.idempotencyKey);
  if (existing) {
    const result = await duplicateResult(existing, email);
    // Repair queue problems on retry (queue layer must have job deduplication).
    if (!options.skipLegacyPipeline) {
      await safeVisitorPipeline(existing._id, existing.status === "approved" || existing.status === "checked_in");
    }
    return result;
  }

  const edition = await getCurrentEdition();
  if (!edition.registration.visitorOpen) {
    throw new VisitorError("REGISTRATION_CLOSED", "Visitor registration is currently closed.");
  }

  if (await Visitor.exists({ edition: edition.slug, email })) {
    // Never let a unique email index error escape to the browser.
    return { kind: "already_registered" };
  }

  const autoApprove = edition.registration.approvalMode === "auto";
  const status: VisitorStatus = autoApprove ? "approved" : "pending_review";

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const ref = humanRef("VS", edition.slug);
    const badge = autoApprove ? issueBadgeToken() : null;
    try {
      const visitor = new Visitor({
        ref,
        idempotencyKey: input.idempotencyKey,
        edition: edition.slug,
        fullName: input.fullName,
        email,
        phone: input.phone,
        phoneCountry: input.phoneCountry,
        company: input.company,
        designation: input.designation,
        industry: input.industry,
        country: input.country,
        // Current public form schemas do not record affirmative consent.
        privacyAccepted: false,
        marketingOptIn: false,
        status,
        statusHistory: [
          { status: "submitted", by: "web" },
          { status: "validated", by: "system" },
          { status, by: autoApprove ? "system:auto" : "system" },
        ],
        ...(badge ? {
          badgeTokenHash: badge.hash,
          badgeTokenEnc: badge.enc,
          badgeIssuedAt: new Date(),
          badgeVersion: 1,
        } : {}),
        attribution: input.attribution,
        ipHash: hmac(ip, "ip"),
      });

      await visitor.save();
      if (!options.skipLegacyPipeline) await safeVisitorPipeline(visitor._id, autoApprove);
      const badgeAccess = autoApprove
        ? await safeBadgeAccess(String(visitor._id), 1)
        : undefined;
      return { kind: "created", id: String(visitor._id), ref, status, badgeAccess };
    } catch (error) {
      const duplicate = error as { code?: number; keyPattern?: Record<string, unknown> };
      if (duplicate?.code === 11000) {
        const winner = await findBySubmissionKey(input.idempotencyKey);
        if (winner) {
          const result = await duplicateResult(winner, email);
          if (!options.skipLegacyPipeline) {
            await safeVisitorPipeline(winner._id, winner.status === "approved" || winner.status === "checked_in");
          }
          return result;
        }
        if (await Visitor.exists({ edition: edition.slug, email })) {
          return { kind: "already_registered" };
        }
        if (duplicate.keyPattern?.ref) continue;
      }
      throw error;
    }
  }
  throw new Error("Could not allocate a unique visitor reference");
}

async function transitionVisitor(
  id: string,
  status: VisitorStatus,
  actor: Actor,
  allowedFrom: VisitorStatus[],
  reason?: string,
  extra: Record<string, unknown> = {},
) {
  const updated = await Visitor.findOneAndUpdate(
    { _id: id, status: { $in: allowedFrom } },
    {
      $set: { status, ...extra },
      $push: { statusHistory: { status, by: actor.email, reason } },
    },
    { new: true, runValidators: true },
  );
  if (updated) return updated;
  const exists = await Visitor.exists({ _id: id });
  if (!exists) throw new VisitorError("NOT_FOUND", "Visitor not found.");
  throw new VisitorError("INVALID_STATE", `Cannot change visitor status to ${status}.`);
}

async function enqueueBadgeSafely(id: unknown, version: number): Promise<void> {
  try {
    await enqueue("email_badge", "Visitor", id as Parameters<typeof enqueue>[2], undefined, `v${version}`);
  } catch (error) {
    // Status/badge is already saved; a reconciliation worker must enqueue later.
    log.error("visitor.badge_email_enqueue_failed", {
      id: String(id), version,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function approveVisitor(id: string, actor: Actor) {
  await connectDb();
  if (!mongoose.isValidObjectId(id)) throw new VisitorError("NOT_FOUND", "Visitor not found.");
  const visitor = await Visitor.findById(id);
  if (!visitor) throw new VisitorError("NOT_FOUND", "Visitor not found.");
  const allowed: VisitorStatus[] = ["submitted", "validated", "pending_review", "rejected"];
  if (!allowed.includes(visitor.status as VisitorStatus)) {
    throw new VisitorError("INVALID_STATE", `Cannot approve from ${visitor.status}.`);
  }

  const badge = issueBadgeToken();
  const currentVersion = visitor.badgeVersion ?? 0;
  const updated = await Visitor.findOneAndUpdate(
    { _id: id, status: { $in: allowed }, badgeVersion: currentVersion },
    {
      $set: {
        status: "approved", badgeTokenHash: badge.hash, badgeTokenEnc: badge.enc,
        badgeIssuedAt: new Date(), badgeRevokedAt: null,
      },
      $inc: { badgeVersion: 1 },
      $push: { statusHistory: { status: "approved", by: actor.email } },
    },
    { new: true, runValidators: true },
  );
  if (!updated) throw new VisitorError("INVALID_STATE", "Visitor was changed by another administrator.");
  await enqueueBadgeSafely(updated._id, currentVersion + 1);
  return updated;
}

export async function rejectVisitor(id: string, actor: Actor, reason?: string) {
  await connectDb();
  return transitionVisitor(
    id, "rejected", actor, ["submitted", "validated", "pending_review"],
    reason, { badgeRevokedAt: new Date() },
  );
}

export async function cancelVisitor(id: string, actor: Actor, reason?: string) {
  await connectDb();
  return transitionVisitor(
    id, "cancelled", actor,
    ["submitted", "validated", "pending_review", "approved", "rejected", "checked_in"],
    reason, { badgeRevokedAt: new Date() },
  );
}

export async function reissueBadge(id: string, actor: Actor, sendEmail = true): Promise<number> {
  await connectDb();
  if (!mongoose.isValidObjectId(id)) throw new VisitorError("NOT_FOUND", "Visitor not found.");
  const visitor = await Visitor.findById(id);
  if (!visitor) throw new VisitorError("NOT_FOUND", "Visitor not found.");
  if (!["approved", "checked_in"].includes(visitor.status) || visitor.badgeRevokedAt) {
    throw new VisitorError("INVALID_STATE", "Only active approved visitors can reissue a badge.");
  }

  const badge = issueBadgeToken();
  const version = (visitor.badgeVersion ?? 0) + 1;
  const updated = await Visitor.findOneAndUpdate(
    {
      _id: id,
      status: { $in: ["approved", "checked_in"] },
      badgeRevokedAt: null,
      badgeVersion: version - 1,
    },
    {
      $set: {
        badgeTokenHash: badge.hash, badgeTokenEnc: badge.enc,
        badgeIssuedAt: new Date(), badgeRevokedAt: null,
      },
      $inc: { badgeVersion: 1 },
      $push: { statusHistory: { status: visitor.status, by: actor.email, reason: `Badge reissued v${version}` } },
    },
    { new: true, runValidators: true },
  );
  if (!updated) throw new VisitorError("INVALID_STATE", "Visitor was modified by another administrator.");
  if (sendEmail) await enqueueBadgeSafely(updated._id, version);
  return version;
}

/** Uniform response; never disclose whether the address has a registration. */
export async function requestBadgeLink(email: string): Promise<void> {
  if (typeof email !== "string" || email.length > 254) return;
  await connectDb();
  const edition = await getCurrentEdition();
  const visitor = await Visitor.findOne({
    edition: edition.slug,
    email: email.trim().toLowerCase(),
    status: { $in: ["approved", "checked_in"] },
    badgeRevokedAt: null,
  }).select("_id");
  if (!visitor) return;

  const bucket = Math.floor(Date.now() / 600_000);
  try {
    await enqueue("email_badge_link", "Visitor", visitor._id, undefined, `b${bucket}`);
  } catch (error) {
    log.error("visitor.badge_link_enqueue_failed", {
      id: String(visitor._id), error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function findVisitorByToken(token: string) {
  if (!token || token.length > 4096) return null;
  await connectDb();
  return Visitor.findOne({
    badgeTokenHash: sha256(token),
    status: { $in: ["approved", "checked_in"] },
    badgeRevokedAt: null,
  });
}

export async function pendingJobsFor(entityId: string) {
  if (!mongoose.isValidObjectId(entityId)) return [];
  await connectDb();
  return IntegrationJob.find({ entityId }).sort({ createdAt: 1 }).lean();
}
