import "server-only";
import { connectDb } from "@/lib/db/connect";
import { WebsiteDraft, WEB_FORMS, type WebsiteDraftData, type WebForm } from "./draft-model";
import { appendWebsiteRow, updateWebsiteRow, websiteSheetRow } from "./sheets-sync";
import { recipients, sendWebsiteNotification } from "./mail";

export function isWebsiteForm(input: unknown): input is WebForm {
  return typeof input === "string" && WEB_FORMS.some((form) => form === input);
}

function normalizeData(value: unknown): WebsiteDraftData {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  const raw = value as Record<string, unknown>;
  const output: WebsiteDraftData = {};
  const strings = ["fullName", "email", "phone", "company", "designation", "country", "city", "state", "website", "industry", "areaPreference", "productDescription", "objectives", "proposal", "topic", "topicTitle", "message", "notes"] as const;
  const arrays = ["interests", "topicsOfInterest", "segments", "sectorInterests"] as const;
  for (const key of strings) {
    const item = raw[key];
    if (typeof item === "string") output[key] = item.trim().slice(0, 2000);
  }
  for (const key of arrays) {
    const item = raw[key];
    if (Array.isArray(item)) output[key] = item.filter((x): x is string => typeof x === "string").slice(0, 20).map((x) => x.trim().slice(0, 100));
  }
  if (output.email) output.email = output.email.toLowerCase();
  return output;
}

function validKey(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f-]{20,50}$/i.test(value);
}

function duplicateKey(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

export async function saveWebsiteDraft(input: {
  submissionKey: unknown; form: unknown; data: unknown; privacyAccepted: unknown;
}) {
  if (!validKey(input.submissionKey) || !isWebsiteForm(input.form)) throw new Error("Invalid draft identity");
  if (input.privacyAccepted !== true) throw new Error("Privacy acknowledgement required before saving a draft");
  const data = normalizeData(input.data);
  if (![data.fullName, data.email, data.phone].some(Boolean)) return { saved: false, reason: "No contact data yet" };
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new Error("Invalid contact input");
  await connectDb();
  const existing = await WebsiteDraft.findOne({ submissionKey: input.submissionKey }).lean();
  if (existing && existing.form !== input.form) throw new Error("Draft key belongs to a different form");
  if (existing?.state === "submitted") return { saved: true, finalized: true };
  try {
    await WebsiteDraft.findOneAndUpdate(
      { submissionKey: input.submissionKey, state: "draft" },
      { $set: { data, privacyAccepted: true }, $inc: { revision: 1 }, $setOnInsert: { form: input.form, state: "draft" } },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (!duplicateKey(error)) throw error;
    const current = await WebsiteDraft.findOne({ submissionKey: input.submissionKey }).lean();
    if (!current || current.form !== input.form || current.state !== "submitted") throw error;
  }
  return { saved: true };
}

export async function finalizeWebsiteDraft(input: {
  submissionKey: unknown; form: unknown; data: unknown; ref: string;
}) {
  if (!validKey(input.submissionKey) || !isWebsiteForm(input.form)) return;
  const data = normalizeData(input.data);
  await connectDb();
  const old = await WebsiteDraft.findOne({ submissionKey: input.submissionKey }).lean();
  if (old && (old.form !== input.form || old.state === "submitted")) return;
  try {
    await WebsiteDraft.findOneAndUpdate(
      { submissionKey: input.submissionKey, state: "draft" },
      {
        $set: { state: "submitted", data, privacyAccepted: true, finalRef: input.ref, submittedAt: new Date() },
        $inc: { revision: 1 }, $setOnInsert: { form: input.form },
      },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (!duplicateKey(error)) throw error;
    const current = await WebsiteDraft.findOne({ submissionKey: input.submissionKey }).lean();
    if (!current || current.form !== input.form || current.state !== "submitted") throw error;
  }
}

export async function deliverWebsiteDraft(submissionKey: string): Promise<void> {
  await connectDb();
  const doc = await WebsiteDraft.findOne({ submissionKey }).lean();
  if (!doc || !doc.privacyAccepted) return;
  const now = new Date();
  if (doc.sheetRevision < doc.revision) {
    const claimed = await WebsiteDraft.findOneAndUpdate(
      { _id: doc._id, $or: [{ sheetLeaseUntil: { $exists: false } }, { sheetLeaseUntil: { $lt: now } }] },
      { $set: { sheetLeaseUntil: new Date(now.getTime() + 60_000) } },
      { new: true }
    ).lean();
    if (claimed) {
      try {
        const latest = await WebsiteDraft.findById(doc._id).lean();
        if (latest) {
          const at = latest.state === "submitted" ? (latest.submittedAt ?? latest.createdAt) : latest.createdAt;
          const row = websiteSheetRow(latest.form, latest.data, latest.state, at);
          const range = latest.sheetRange || await appendWebsiteRow(row);
          if (latest.sheetRange) await updateWebsiteRow(range, row);
          await WebsiteDraft.updateOne(
            { _id: doc._id },
            { $set: { sheetRange: range, sheetRevision: latest.revision }, $unset: { sheetLeaseUntil: 1, lastError: 1 } }
          );
        }
      } catch (error) {
        await WebsiteDraft.updateOne({ _id: doc._id }, { $set: { lastError: String(error) }, $unset: { sheetLeaseUntil: 1 } });
      }
    }
  }
  const fresh = await WebsiteDraft.findById(doc._id).lean();
  if (!fresh || fresh.state !== "submitted" || !fresh.finalRef) return;
  let targets: string[];
  try {
    targets = recipients();
  } catch (error) {
    await WebsiteDraft.updateOne({ _id: doc._id }, { $set: { lastError: String(error) } });
    return;
  }
  for (const [index, to] of targets.entries()) {
    const doneKey: "mail1Sent" | "mail2Sent" = index === 0 ? "mail1Sent" : "mail2Sent";
    const leaseKey: "mail1LeaseUntil" | "mail2LeaseUntil" = index === 0 ? "mail1LeaseUntil" : "mail2LeaseUntil";
    const current = await WebsiteDraft.findById(doc._id).lean();
    if (!current || current[doneKey]) continue;
    const claim = await WebsiteDraft.findOneAndUpdate(
      { _id: doc._id, [doneKey]: false,
        $or: [{ [leaseKey]: { $exists: false } }, { [leaseKey]: { $lt: new Date() } }] },
      { $set: { [leaseKey]: new Date(Date.now() + 90_000) } },
      { new: true }
    );
    if (!claim) continue;
    try {
      await sendWebsiteNotification({ recipient: to, form: fresh.form, data: fresh.data,
        submittedAt: fresh.submittedAt ?? fresh.updatedAt, ref: fresh.finalRef });
      await WebsiteDraft.updateOne({ _id: doc._id }, { $set: { [doneKey]: true }, $unset: { [leaseKey]: 1 } });
    } catch (error) {
      await WebsiteDraft.updateOne({ _id: doc._id }, { $set: { lastError: String(error) }, $unset: { [leaseKey]: 1 } });
    }
  }
}

export async function processPendingWebsiteDrafts(limit = 25) {
  await connectDb();
  const rows = await WebsiteDraft.find({
    privacyAccepted: true,
    $or: [
      { $expr: { $lt: ["$sheetRevision", "$revision"] } },
      { state: "submitted", $or: [{ mail1Sent: false }, { mail2Sent: false }] },
    ],
  }).sort({ updatedAt: 1 }).limit(limit).select("submissionKey").lean();
  for (const entry of rows) await deliverWebsiteDraft(entry.submissionKey);
  return rows.length;
}
