
import "server-only";

import { connectDb } from "@/lib/db/connect";
import {
  Visitor,
  IntegrationJob,
  type VisitorStatus,
} from "@/models/leads";

import {
  humanRef,
  hmac,
  sha256,
} from "@/lib/security/crypto";

import { issueBadgeToken } from "@/lib/badge/token";

import {
  enqueue,
  enqueueVisitorPipeline,
} from "@/lib/jobs";

import { getCurrentEdition } from "@/lib/data/edition";

import { createBadgeAccessToken } from "@/lib/badge/access";

import type {
  VisitorRegistrationInput,
} from "@/lib/validation/forms";

export class VisitorError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
  }
}

export type RegisterResult =
  | {
      kind: "created";
      ref: string;
      status: VisitorStatus;
      badgeAccess?: string;
    }
  | {
      kind: "duplicate_submission";
      ref: string;
      status: VisitorStatus;
      badgeAccess?: string;
    }
  | {
      kind: "already_registered";
    };

/**
 * Register visitor without a privacy checkbox.
 *
 * - No fabricated consent
 * - Existing badge generation maintained
 * - Same idempotency key prevents duplicate submission
 * - One visitor per email per edition
 * - Existing integration job pipeline maintained
 */
export async function registerVisitor(
  input: VisitorRegistrationInput,
  ip: string
): Promise<RegisterResult> {
  await connectDb();

  const edition = await getCurrentEdition();

  if (!edition.registration.visitorOpen) {
    throw new VisitorError(
      "REGISTRATION_CLOSED",
      "Visitor registration is currently closed."
    );
  }

  // Prevent duplicate submissions from the same browser.
  const same = await Visitor.findOne({
    idempotencyKey: input.idempotencyKey,
  }).lean<{
    _id: unknown;
    ref: string;
    status: VisitorStatus;
    badgeVersion: number;
  }>();

  if (same) {
    const badgeAccess =
      same.status === "approved"
        ? await createBadgeAccessToken(
            String(same._id),
            same.badgeVersion,
            "24h"
          )
        : undefined;

    return {
      kind: "duplicate_submission",
      ref: same.ref,
      status: same.status,
      badgeAccess,
    };
  }

  // One registration per email per edition.
  const exists = await Visitor.exists({
    edition: edition.slug,
    email: input.email,
  });

  if (exists) {
    return {
      kind: "already_registered",
    };
  }

  const autoApprove =
    edition.registration.approvalMode === "auto";

  const badge = autoApprove
    ? issueBadgeToken()
    : null;

  const status: VisitorStatus = autoApprove
    ? "approved"
    : "pending_review";

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const visitor = await Visitor.create({
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

        // Checkbox-free submission.
        // Do not record uncollected consent.
        privacyAccepted: false,

        // No unsolicited marketing opt-in.
        marketingOptIn: false,

        status,

        statusHistory: [
          {
            status: "submitted",
            by: "web",
          },
          {
            status: "validated",
            by: "system",
          },
          {
            status,
            by: autoApprove
              ? "system:auto"
              : "system",
          },
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

      /*
       * No automatic ConsentRecord here.
       *
       * Registration is not equivalent to
       * granting optional marketing consent.
       */

      await enqueueVisitorPipeline(
        visitor._id,
        autoApprove
      );

      const badgeAccess = autoApprove
        ? await createBadgeAccessToken(
            String(visitor._id),
            1,
            "24h"
          )
        : undefined;

      return {
        kind: "created",
        ref: visitor.ref,
        status,
        badgeAccess,
      };
    } catch (err: unknown) {
      const error = err as {
        code?: number;
        keyPattern?: Record<string, unknown>;
      };

      if (
        error.code === 11000 &&
        error.keyPattern?.email
      ) {
        return {
          kind: "already_registered",
        };
      }

      if (
        error.code === 11000 &&
        error.keyPattern?.idempotencyKey
      ) {
        const again = await Visitor.findOne({
          idempotencyKey: input.idempotencyKey,
        }).lean<{
          _id: unknown;
          ref: string;
          status: VisitorStatus;
          badgeVersion: number;
        }>();

        if (again) {
          const badgeAccess =
            again.status === "approved"
              ? await createBadgeAccessToken(
                  String(again._id),
                  again.badgeVersion,
                  "24h"
                )
              : undefined;

          return {
            kind: "duplicate_submission",
            ref: again.ref,
            status: again.status,
            badgeAccess,
          };
        }
      }

      // Retry rare reference collisions.
      if (
        error.code === 11000 &&
        error.keyPattern?.ref
      ) {
        continue;
      }

      throw err;
    }
  }

  throw new Error(
    "Could not allocate a unique reference"
  );
}

type Actor = {
  id: string;
  email: string;
};

async function pushStatus(
  id: string,
  status: VisitorStatus,
  actor: Actor,
  reason?: string,
  extra: Record<string, unknown> = {}
) {
  return Visitor.findByIdAndUpdate(
    id,
    {
      $set: {
        status,
        ...extra,
      },
      $push: {
        statusHistory: {
          status,
          by: actor.email,
          reason,
        },
      },
    },
    {
      returnDocument: "after",
    }
  );
}

/**
 * Approve visitor and issue a new badge.
 */
export async function approveVisitor(
  id: string,
  actor: Actor
) {
  await connectDb();

  const visitor = await Visitor.findById(id)
    .select("+badgeTokenHash");

  if (!visitor) {
    throw new VisitorError(
      "NOT_FOUND",
      "Visitor not found"
    );
  }

  if (
    ![
      "pending_review",
      "rejected",
      "submitted",
      "validated",
    ].includes(visitor.status)
  ) {
    throw new VisitorError(
      "INVALID_STATE",
      `Cannot approve from status ${visitor.status}`
    );
  }

  const badge = issueBadgeToken();
  const version = (visitor.badgeVersion || 0) + 1;

  await pushStatus(
    id,
    "approved",
    actor,
    undefined,
    {
      badgeTokenHash: badge.hash,
      badgeTokenEnc: badge.enc,
      badgeIssuedAt: new Date(),
      badgeVersion: version,
      badgeRevokedAt: null,
    }
  );

  await enqueue(
    "email_badge",
    "Visitor",
    visitor._id,
    undefined,
    `v${version}`
  );
}

/**
 * Reject visitor.
 */
export async function rejectVisitor(
  id: string,
  actor: Actor,
  reason?: string
) {
  await connectDb();

  await pushStatus(
    id,
    "rejected",
    actor,
    reason,
    {
      badgeRevokedAt: new Date(),
    }
  );
}

/**
 * Cancel visitor registration.
 */
export async function cancelVisitor(
  id: string,
  actor: Actor,
  reason?: string
) {
  await connectDb();

  await pushStatus(
    id,
    "cancelled",
    actor,
    reason,
    {
      badgeRevokedAt: new Date(),
    }
  );
}

/**
 * Reissue an approved visitor badge.
 */
export async function reissueBadge(
  id: string,
  actor: Actor,
  sendEmail = true
) {
  await connectDb();

  const visitor = await Visitor.findById(id);

  if (!visitor) {
    throw new VisitorError(
      "NOT_FOUND",
      "Visitor not found"
    );
  }

  if (
    !["approved", "checked_in"].includes(
      visitor.status
    )
  ) {
    throw new VisitorError(
      "INVALID_STATE",
      "Only approved visitors can be reissued a badge"
    );
  }

  const badge = issueBadgeToken();

  const version =
    (visitor.badgeVersion || 0) + 1;

  await Visitor.updateOne(
    { _id: id },
    {
      $set: {
        badgeTokenHash: badge.hash,
        badgeTokenEnc: badge.enc,
        badgeIssuedAt: new Date(),
        badgeVersion: version,
        badgeRevokedAt: null,
      },
      $push: {
        statusHistory: {
          status: visitor.status,
          by: actor.email,
          reason: `badge reissued (v${version})`,
        },
      },
    }
  );

  if (sendEmail) {
    await enqueue(
      "email_badge",
      "Visitor",
      visitor._id,
      undefined,
      `v${version}`
    );
  }

  return version;
}

/**
 * Email-verified badge retrieval.
 * Do not reveal whether the address exists.
 */
export async function requestBadgeLink(
  email: string
) {
  await connectDb();

  const edition = await getCurrentEdition();

  const visitor = await Visitor.findOne({
    edition: edition.slug,
    email: email.toLowerCase(),
    status: {
      $in: ["approved", "checked_in"],
    },
    badgeRevokedAt: null,
  }).select("_id");

  if (!visitor) return;

  const bucket = Math.floor(
    Date.now() / 600_000
  );

  await enqueue(
    "email_badge_link",
    "Visitor",
    visitor._id,
    undefined,
    `b${bucket}`
  );
}

/**
 * Find visitor using secure badge token.
 */
export async function findVisitorByToken(
  token: string
) {
  await connectDb();

  return Visitor.findOne({
    badgeTokenHash: sha256(token),
  });
}

/**
 * Return integration jobs for a visitor.
 */
export async function pendingJobsFor(
  entityId: string
) {
  return IntegrationJob.find({
    entityId,
  })
    .sort({ createdAt: 1 })
    .lean();
}
