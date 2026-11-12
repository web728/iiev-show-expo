import "server-only";

import mongoose from "mongoose";
import { connectDb } from "@/lib/db/connect";
import { CheckIn, Visitor } from "@/models/leads";
import { sha256 } from "@/lib/security/crypto";
import { parseQrPayload } from "@/lib/badge/token";
import { getCurrentEdition } from "@/lib/data/edition";
import { log } from "@/lib/log";

export type CheckInResult = {
  result: "ok" | "duplicate" | "revoked" | "not_found" | "not_approved" | "wrong_edition";
  message: string;
  visitor?: {
    id: string;
    ref: string;
    fullName: string;
    company: string;
    designation?: string;
    checkInCount: number;
    firstCheckInAt?: string;
  };
};

type Actor = { id: string; email: string };
type Method = "qr" | "manual";

type VisitorDoc = NonNullable<Awaited<ReturnType<typeof Visitor.findOne>>>;

function summarize(visitor: VisitorDoc): NonNullable<CheckInResult["visitor"]> {
  return {
    id: String(visitor._id),
    ref: visitor.ref,
    fullName: visitor.fullName,
    company: visitor.company,
    designation: visitor.designation,
    checkInCount: visitor.checkInCount ?? 0,
    firstCheckInAt: visitor.checkedInAt?.toISOString(),
  };
}

/**
 * Atomic entry counter. A first scan claims status APPROVED with count=0; a
 * concurrent second scan increments to 2 and is marked DUPLICATE. QR token
 * hash and revocation are checked again INSIDE each update predicate.
 */
export async function checkIn(opts: {
  qrText?: string;
  visitorId?: string;
  station?: string;
  actor: Actor;
}): Promise<CheckInResult> {
  await connectDb();
  const edition = await getCurrentEdition();
  const method: Method = opts.qrText ? "qr" : "manual";
  const token = opts.qrText ? parseQrPayload(opts.qrText) : null;
  const badgeHash = token ? sha256(token) : undefined;
  const station = opts.station?.trim().slice(0, 100);
  const actor = opts.actor;

  const audit = async (result: CheckInResult["result"], visitor?: VisitorDoc) => {
    try {
      await CheckIn.create({
        visitorId: visitor?._id,
        visitorRef: visitor?.ref,
        edition: edition.slug,
        result,
        method,
        station,
        scannedBy: actor.id,
        scannedByEmail: actor.email,
      });
    } catch (error) {
      // A successfully saved check-in must not become a false failure merely
      // because the optional audit insert failed. Monitor and repair logs.
      log.error("visitor.checkin_audit_failed", {
        result,
        visitorId: visitor?._id ? String(visitor._id) : undefined,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  let visitor: VisitorDoc | null = null;
  if (opts.qrText) {
    if (!badgeHash) {
      await audit("not_found");
      return { result: "not_found", message: "This QR code is not a valid IIEV badge." };
    }
    visitor = await Visitor.findOne({ badgeTokenHash: badgeHash });
  } else if (opts.visitorId && mongoose.isValidObjectId(opts.visitorId)) {
    visitor = await Visitor.findById(opts.visitorId);
  }
  if (!visitor) {
    await audit("not_found");
    return { result: "not_found", message: "Visitor or badge not found." };
  }

  const respondBlocked = async (record: VisitorDoc): Promise<CheckInResult | null> => {
    let result: CheckInResult["result"];
    let message: string;
    if (record.edition !== edition.slug) {
      result = "wrong_edition";
      message = `This badge belongs to the ${record.edition} edition.`;
    } else if (record.badgeRevokedAt || ["cancelled", "rejected"].includes(record.status)) {
      result = "revoked";
      message = "Registration or badge revoked. Please visit the help desk.";
    } else if (!["approved", "checked_in"].includes(record.status)) {
      result = "not_approved";
      message = "Registration is not yet approved.";
    } else return null;
    await audit(result, record);
    return { result, message, visitor: summarize(record) };
  };

  const blocked = await respondBlocked(visitor);
  if (blocked) return blocked;

  const checkedAt = new Date();
  const scanFilter = {
    _id: visitor._id,
    edition: edition.slug,
    status: { $in: ["approved", "checked_in"] },
    badgeRevokedAt: null,
    ...(badgeHash ? { badgeTokenHash: badgeHash } : {}),
  };

  // First claim requires 0 prior scans. Set date directly instead of $min,
  // because legacy records with checkedInAt:null would not accept $min(Date).
  let updated = await Visitor.findOneAndUpdate(
    { ...scanFilter, status: "approved", checkInCount: { $in: [0, null] } },
    {
      $inc: { checkInCount: 1 },
      $set: { status: "checked_in", checkedInAt: checkedAt },
      $push: { statusHistory: { status: "checked_in", by: actor.email } },
    },
    { new: true, runValidators: true },
  );
  if (updated) {
    await audit("ok", updated);
    return {
      result: "ok",
      message: "Welcome! Checked in.",
      visitor: summarize(updated),
    };
  }

  // Concurrent scans or re-entry on another day: all counted atomically.
  updated = await Visitor.findOneAndUpdate(
    { ...scanFilter, checkInCount: { $gte: 1 } },
    { $inc: { checkInCount: 1 }, $set: { status: "checked_in" } },
    { new: true, runValidators: true },
  );
  if (updated) {
    await audit("duplicate", updated);
    return {
      result: "duplicate",
      message: `Previously checked in (${updated.checkInCount} scans). First entry: ${updated.checkedInAt?.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) ?? "unknown"}.`,
      visitor: summarize(updated),
    };
  }

  // Visitor may have been revoked or their badge rotated between lookup and
  // update. Never count a stale/rotated QR token as a successful check-in.
  const latest = await Visitor.findById(visitor._id);
  if (!latest) {
    await audit("not_found");
    return { result: "not_found", message: "Visitor not found." };
  }
  if (badgeHash) {
    const currentToken = await Visitor.exists({ _id: latest._id, badgeTokenHash: badgeHash });
    if (!currentToken) {
      await audit("not_found", latest);
      return { result: "not_found", message: "Badge was replaced or revoked. Ask for the latest badge." };
    }
  }
  const currentBlock = await respondBlocked(latest);
  if (currentBlock) return currentBlock;
  // Unusual legacy inconsistent state (approved but has nonzero scans / checked-in with zero scans):
  // fail safe rather than count as an unseen first check-in.
  log.error("visitor.checkin_state_inconsistent", { visitorId: String(latest._id) });
  await audit("not_approved", latest);
  return { result: "not_approved", message: "Check-in state needs review at the help desk.", visitor: summarize(latest) };
}
