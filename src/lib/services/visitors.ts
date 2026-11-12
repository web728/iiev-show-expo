import "server-only";

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
  constructor(public code: string, message: string) {
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
  ref: string;
  status: VisitorStatus;
  badgeVersion?: number;
  badgeRevokedAt?: Date | null;
};

async function findBySubmissionKey(key: string) {
  return Visitor.findOne({ idempotencyKey: key })
    .select("ref status edition badgeVersion badgeRevokedAt")
    .lean<VisitorLookup>();
}

async function safeVisitorPipeline(id: unknown, autoApprove: boolean) {
  try {
    await enqueueVisitorPipeline(
      id as Parameters<typeof enqueueVisitorPipeline>[0],
      autoApprove,
    );
  } catch (err) {
    log.error("form.visitor_pipeline_enqueue_failed", {
      id: String(id),
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

async function safeBadgeAccess(id: string, version: number) {
  try {
    return await createBadgeAccessToken(id, version, "24h");
  } catch (err) {
    log.error("form.badge_access_creation_failed", {
      id,
      error: err instanceof Error ? err.message : String(err),
    });
    // Registration is already persisted. The user can use badge retrieval later.
    return undefined;
  }
}

async function duplicateResult(
  visitor: VisitorLookup,
  edition: string,
): Promise<RegisterResult> {
  if (visitor.edition !== edition) {
    throw new VisitorError("KEY_CONFLICT", "Submission key belongs to another edition.");
  }

  const canGetBadge =
    (visitor.status === "approved" || visitor.status === "checked_in") &&
    !visitor.badgeRevokedAt &&
    (visitor.badgeVersion ?? 0) > 0;

  const badgeAccess = canGetBadge
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

export async function registerVisitor(
  input: VisitorRegistrationInput,
  ip: string,
): Promise<RegisterResult> {
  await connectDb();
  const edition = await getCurrentEdition();

  // Allow an idempotent retry even if registration closes meanwhile.
  const same = await findBySubmissionKey(input.idempotencyKey);
  if (same) return duplicateResult(same, edition.slug);

  if (!edition.registration.visitorOpen) {
    throw new VisitorError("REGISTRATION_CLOSED", "Visitor registration is currently closed.");
  }

  if (await Visitor.exists({ edition: edition.slug, email: input.email })) {
    return { kind: "already_registered" };
  }

  const autoApprove = edition.registration.approvalMode === "auto";
  const status: VisitorStatus = autoApprove ? "approved" : "pending_review";

  for (let attempt = 0; attempt < 3; attempt++) {
    const badge = autoApprove ? issueBadgeToken() : null;
    // Keep the generated reference in a local string rather than relying
    // on the overloaded Model.create() return type.
    const ref = humanRef("VS", edition.slug);

    try {
      const visitor = new Visitor({
        ref,
        idempotencyKey: input.idempotencyKey,
        edition: edition.slug,
        fullName: input.fullName,
        company: input.company,
        designation: input.designation,
        phone: input.phone,
        email: input.email,
        industry: input.industry,
        country: input.country,
        privacyAccepted: false,
        marketingOptIn: false,
        status,
        statusHistory: [
          { status: "submitted", by: "web" },
          { status: "validated", by: "system" },
          { status, by: autoApprove ? "system:auto" : "system" },
        ],
        ...(badge
          ? {
              badgeTokenHash: badge.hash,
              badgeTokenEnc: badge.enc,
              badgeIssuedAt: new Date(),
              badgeVersion: 1,
            }
          : {}),
        attribution: input.attribution,
        ipHash: hmac(ip, "ip"),
      });

      await visitor.save();
      // Do not turn a saved registration into a false 500 if an integration fails.
      await safeVisitorPipeline(visitor._id, autoApprove);

      const badgeAccess = autoApprove
        ? await safeBadgeAccess(String(visitor._id), 1)
        : undefined;

      return { kind: "created", id: String(visitor._id), ref, status, badgeAccess };
    } catch (err) {
      const error = err as { code?: number; keyPattern?: Record<string, unknown> };
      if (error.code === 11000) {
        const again = await findBySubmissionKey(input.idempotencyKey);
        if (again) return duplicateResult(again, edition.slug);

        if (await Visitor.exists({ edition: edition.slug, email: input.email })) {
          return { kind: "already_registered" };
        }
        if (error.keyPattern?.ref) continue;
      }
      throw err;
    }
  }

  throw new Error("Could not allocate a unique visitor reference");
}

type Actor = { id: string; email: string };

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
  if (!exists) throw new VisitorError("NOT_FOUND", "Visitor not found");
  throw new VisitorError("INVALID_STATE", `Cannot change visitor status to ${status}`);
}

export async function approveVisitor(id: string, actor: Actor) {
  await connectDb();
  const visitor = await Visitor.findById(id);
  if (!visitor) throw new VisitorError("NOT_FOUND", "Visitor not found");

  const allowedFrom: VisitorStatus[] = ["submitted", "validated", "pending_review", "rejected"];
  if (!allowedFrom.includes(visitor.status as VisitorStatus)) {
    throw new VisitorError("INVALID_STATE", `Cannot approve from status ${visitor.status}`);
  }

  const badge = issueBadgeToken();
  const currentVersion = visitor.badgeVersion ?? 0;
  const version = currentVersion + 1;
  const updated = await Visitor.findOneAndUpdate(
    { _id: id, status: { $in: allowedFrom }, badgeVersion: currentVersion },
    {
      $set: {
        status: "approved",
        badgeTokenHash: badge.hash,
        badgeTokenEnc: badge.enc,
        badgeIssuedAt: new Date(),
        badgeRevokedAt: null,
      },
      $inc: { badgeVersion: 1 },
      $push: { statusHistory: { status: "approved", by: actor.email } },
    },
    { new: true, runValidators: true },
  );

  if (!updated) throw new VisitorError("INVALID_STATE", "Visitor was modified by another administrator");
  await enqueue("email_badge", "Visitor", updated._id, undefined, `v${version}`);
  return updated;
}

export async function rejectVisitor(id: string, actor: Actor, reason?: string) {
  await connectDb();
  return transitionVisitor(
    id,
    "rejected",
    actor,
    ["submitted", "validated", "pending_review"],
    reason,
    { badgeRevokedAt: new Date() },
  );
}

export async function cancelVisitor(id: string, actor: Actor, reason?: string) {
  await connectDb();
  return transitionVisitor(
    id,
    "cancelled",
    actor,
    ["submitted", "validated", "pending_review", "approved", "rejected"],
    reason,
    { badgeRevokedAt: new Date() },
  );
}

export async function reissueBadge(id: string, actor: Actor, sendEmail = true) {
  await connectDb();
  const visitor = await Visitor.findById(id);
  if (!visitor) throw new VisitorError("NOT_FOUND", "Visitor not found");
  if (!["approved", "checked_in"].includes(visitor.status)) {
    throw new VisitorError("INVALID_STATE", "Only approved visitors can be reissued a badge");
  }

  const badge = issueBadgeToken();
  const currentVersion = visitor.badgeVersion ?? 0;
  const version = currentVersion + 1;
  const updated = await Visitor.findOneAndUpdate(
    {
      _id: id,
      status: { $in: ["approved", "checked_in"] },
      badgeVersion: currentVersion,
    },
    {
      $set: {
        badgeTokenHash: badge.hash,
        badgeTokenEnc: badge.enc,
        badgeIssuedAt: new Date(),
        badgeRevokedAt: null,
      },
      $inc: { badgeVersion: 1 },
      $push: {
        statusHistory: {
          status: visitor.status,
          by: actor.email,
          reason: `badge reissued (v${version})`,
        },
      },
    },
    { new: true, runValidators: true },
  );

  if (!updated) throw new VisitorError("INVALID_STATE", "Visitor was modified by another administrator");
  if (sendEmail) {
    await enqueue("email_badge", "Visitor", updated._id, undefined, `v${version}`);
  }
  return version;
}

export async function requestBadgeLink(email: string) {
  await connectDb();
  const edition = await getCurrentEdition();
  const visitor = await Visitor.findOne({
    edition: edition.slug,
    email: email.trim().toLowerCase(),
    status: { $in: ["approved", "checked_in"] },
    badgeRevokedAt: null,
  }).select("_id");
  if (!visitor) return; // No account enumeration.

  const bucket = Math.floor(Date.now() / 600_000);
  await enqueue("email_badge_link", "Visitor", visitor._id, undefined, `b${bucket}`);
}

export async function findVisitorByToken(token: string) {
  await connectDb();
  return Visitor.findOne({ badgeTokenHash: sha256(token) });
}

export async function pendingJobsFor(entityId: string) {
  await connectDb();
  return IntegrationJob.find({ entityId }).sort({ createdAt: 1 }).lean();
}
