import "server-only";
import { connectDb } from "@/lib/db/connect";
import { CheckIn, Visitor } from "@/models/leads";
import { sha256 } from "@/lib/security/crypto";
import { parseQrPayload } from "@/lib/badge/token";
import { getCurrentEdition } from "@/lib/data/edition";

export type CheckInResult = {
  result: "ok" | "duplicate" | "revoked" | "not_found" | "not_approved" | "wrong_edition";
  message: string;
  visitor?: { id: string; ref: string; fullName: string; company: string; designation?: string; checkInCount: number; firstCheckInAt?: string };
};

type Actor = { id: string; email: string };

/**
 * Server-authoritative check-in. Timestamp is set by the server. A badge can be
 * scanned multiple times across days (re-entry); repeat scans are flagged as
 * "duplicate" with the original time so staff can decide.
 */
export async function checkIn(opts: { qrText?: string; visitorId?: string; station?: string; actor: Actor }): Promise<CheckInResult> {
  await connectDb();
  const edition = await getCurrentEdition();
  const method = opts.qrText ? "qr" : "manual";

  let visitor = null;
  if (opts.qrText) {
    const token = parseQrPayload(opts.qrText);
    if (token) visitor = await Visitor.findOne({ badgeTokenHash: sha256(token) });
    if (!visitor) {
      // A revoked/rotated token no longer matches any hash.
      await CheckIn.create({ edition: edition.slug, result: "not_found", method, station: opts.station, scannedBy: opts.actor.id, scannedByEmail: opts.actor.email });
      return { result: "not_found", message: token ? "Badge not recognised. It may have been reissued or revoked — check ID or search manually." : "This QR code is not an IIEV badge." };
    }
  } else if (opts.visitorId) {
    visitor = await Visitor.findById(opts.visitorId);
    if (!visitor) return { result: "not_found", message: "Visitor not found." };
  } else {
    return { result: "not_found", message: "Nothing to check in." };
  }

  const summary = {
    id: String(visitor._id),
    ref: visitor.ref,
    fullName: visitor.fullName,
    company: visitor.company,
    designation: visitor.designation,
    checkInCount: visitor.checkInCount,
    firstCheckInAt: visitor.checkedInAt?.toISOString(),
  };
  const log = (result: CheckInResult["result"]) =>
    CheckIn.create({ visitorId: visitor._id, visitorRef: visitor.ref, edition: edition.slug, result, method, station: opts.station, scannedBy: opts.actor.id, scannedByEmail: opts.actor.email });

  if (visitor.edition !== edition.slug) {
    await log("wrong_edition");
    return { result: "wrong_edition", message: `This badge is for the ${visitor.edition} edition.`, visitor: summary };
  }
  if (visitor.badgeRevokedAt || ["cancelled", "rejected"].includes(visitor.status)) {
    await log("revoked");
    return { result: "revoked", message: "REVOKED — registration cancelled or badge revoked. Send to help desk.", visitor: summary };
  }
  if (!["approved", "checked_in"].includes(visitor.status)) {
    await log("not_approved");
    return { result: "not_approved", message: "Registration not yet approved. Send to help desk.", visitor: summary };
  }

  const now = new Date();
  // Atomic: the first successful scan sets checkedInAt; concurrent scans still count correctly.
  const updated = await Visitor.findOneAndUpdate(
    { _id: visitor._id },
    {
      $inc: { checkInCount: 1 },
      $set: { status: "checked_in" },
      $min: { checkedInAt: now },
      ...(visitor.status !== "checked_in" ? { $push: { statusHistory: { status: "checked_in", by: opts.actor.email } } } : {}),
    },
    { returnDocument: "after" },
  );
  const wasDuplicate = (updated?.checkInCount ?? 1) > 1;
  await log(wasDuplicate ? "duplicate" : "ok");
  return {
    result: wasDuplicate ? "duplicate" : "ok",
    message: wasDuplicate
      ? `Already checked in (${updated?.checkInCount} scans). First entry ${updated?.checkedInAt?.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}.`
      : "Welcome! Checked in.",
    visitor: { ...summary, checkInCount: updated?.checkInCount ?? 1, firstCheckInAt: updated?.checkedInAt?.toISOString() },
  };
}
