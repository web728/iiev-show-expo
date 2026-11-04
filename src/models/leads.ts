import { Schema } from "mongoose";
import { defineModel } from "./_helpers";

export const LEAD_TYPES = ["stall", "sponsorship", "partner", "speaker", "delegate", "contact", "media"] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  stall: "Stall enquiry",
  sponsorship: "Sponsorship enquiry",
  partner: "Partner enquiry",
  speaker: "Speaker application",
  delegate: "Conference delegate",
  contact: "Contact message",
  media: "Media enquiry",
};

export const LEAD_STAGES = ["new", "contacted", "qualified", "proposal_sent", "negotiating", "confirmed", "closed_lost"] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];
export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal_sent: "Proposal Sent",
  negotiating: "Negotiating",
  confirmed: "Confirmed",
  closed_lost: "Closed / Lost",
};

export const attributionSchema = new Schema(
  {
    referrer: String,
    landingPage: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmTerm: String,
    utmContent: String,
  },
  { _id: false },
);

export const integrationStateSchema = new Schema(
  {
    sheets: { type: String, enum: ["pending", "done", "failed", "skipped"], default: "pending" },
    organiserEmail: { type: String, enum: ["pending", "done", "failed", "skipped"], default: "pending" },
    ackEmail: { type: String, enum: ["pending", "done", "failed", "skipped"], default: "pending" },
  },
  { _id: false },
);

const NoteSchema = new Schema(
  { body: { type: String, required: true }, by: String, at: { type: Date, default: Date.now } },
  { _id: true },
);
const TaskSchema = new Schema(
  { title: String, dueAt: Date, assignee: String, done: { type: Boolean, default: false }, by: String, at: { type: Date, default: Date.now } },
  { _id: true },
);

const LeadSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true }, // human-friendly reference, e.g. ST-27-8K2F9Q
    idempotencyKey: { type: String, required: true, unique: true },
    type: { type: String, enum: LEAD_TYPES, required: true, index: true },
    edition: { type: String, required: true, index: true },
    // Common contact fields
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, index: true },
    phone: String,
    company: String,
    designation: String,
    city: String,
    state: String,
    country: String,
    website: String,
    // Type-specific payload (validated by zod per type before insert)
    details: { type: Schema.Types.Mixed, default: {} },
    // Consent
    privacyAccepted: { type: Boolean, required: true },
    marketingOptIn: { type: Boolean, default: false },
    // CRM
    stage: { type: String, enum: LEAD_STAGES, default: "new", index: true },
    assignedTo: { type: String, index: true },
    notes: [NoteSchema],
    tasks: [TaskSchema],
    stageHistory: [{ stage: String, by: String, at: { type: Date, default: Date.now }, _id: false }],
    attribution: attributionSchema,
    integrations: { type: integrationStateSchema, default: () => ({}) },
    ipHash: String,
  },
  { timestamps: true },
);
LeadSchema.index({ type: 1, edition: 1, createdAt: -1 });
LeadSchema.index({ email: 1, type: 1, edition: 1 });
export const Lead = defineModel("Lead", LeadSchema);

// ---- Visitors & badges ---------------------------------------------------

export const VISITOR_STATUSES = ["submitted", "validated", "pending_review", "approved", "rejected", "cancelled", "checked_in"] as const;
export type VisitorStatus = (typeof VISITOR_STATUSES)[number];

const VisitorSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true }, // e.g. VS-27-4H7K2M (printed on badge)
    idempotencyKey: { type: String, required: true, unique: true },
    edition: { type: String, required: true, index: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    company: { type: String, required: true },
    designation: { type: String, required: true },
    industry: { type: String, required: true },
    city: String,
    state: String,
    country: { type: String, default: "India" },
    reasonForVisit: String,
    sectorInterests: [String],
    privacyAccepted: { type: Boolean, required: true },
    marketingOptIn: { type: Boolean, default: false },
    status: { type: String, enum: VISITOR_STATUSES, default: "submitted", index: true },
    statusHistory: [{ status: String, by: String, reason: String, at: { type: Date, default: Date.now }, _id: false }],
    // Badge token: opaque random value; only its SHA-256 hash is stored.
    badgeTokenHash: { type: String, index: true, sparse: true, select: false },
    // Same token AES-256-GCM encrypted at rest so the badge PDF can be re-rendered
    // without rotating the QR. Rotation (reissue) replaces both.
    badgeTokenEnc: { type: String, select: false },
    badgeIssuedAt: Date,
    badgeVersion: { type: Number, default: 0 },
    badgeRevokedAt: Date,
    checkedInAt: Date,
    checkInCount: { type: Number, default: 0 },
    attribution: attributionSchema,
    integrations: { type: integrationStateSchema, default: () => ({}) },
    ipHash: String,
  },
  { timestamps: true },
);
// One registration per email per edition (dedupe rule; see docs/FORM_WORKFLOWS.md)
VisitorSchema.index({ edition: 1, email: 1 }, { unique: true });
VisitorSchema.index({ edition: 1, createdAt: -1 });
VisitorSchema.index({ fullName: "text", company: "text", email: "text" });
export const Visitor = defineModel("Visitor", VisitorSchema);

const CheckInSchema = new Schema(
  {
    visitorId: { type: Schema.Types.ObjectId, ref: "Visitor", index: true },
    visitorRef: String,
    edition: { type: String, required: true, index: true },
    result: { type: String, enum: ["ok", "duplicate", "revoked", "not_found", "not_approved", "wrong_edition"], required: true },
    method: { type: String, enum: ["qr", "manual"], required: true },
    station: String,
    scannedBy: String,
    scannedByEmail: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
CheckInSchema.index({ edition: 1, createdAt: -1 });
export const CheckIn = defineModel("CheckIn", CheckInSchema);

// ---- Integration jobs (Sheets / email) -----------------------------------

const IntegrationJobSchema = new Schema(
  {
    kind: { type: String, enum: ["sheets_append", "email_organiser", "email_ack", "email_badge", "email_badge_link"], required: true },
    entity: { type: String, enum: ["Lead", "Visitor"], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    // Unique per entity+kind → re-submission cannot double-send.
    dedupeKey: { type: String, required: true, unique: true },
    status: { type: String, enum: ["queued", "running", "done", "failed", "skipped"], default: "queued", index: true },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 6 },
    nextRunAt: { type: Date, default: Date.now, index: true },
    lastError: String,
    payload: Schema.Types.Mixed,
    lockedUntil: Date,
  },
  { timestamps: true },
);
export const IntegrationJob = defineModel("IntegrationJob", IntegrationJobSchema);

const ConsentRecordSchema = new Schema(
  {
    subjectEmail: { type: String, lowercase: true, index: true },
    entity: String,
    entityId: String,
    purpose: { type: String, enum: ["privacy_notice", "marketing", "analytics_cookies"], required: true },
    granted: { type: Boolean, required: true },
    noticeVersion: String,
    source: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
export const ConsentRecord = defineModel("ConsentRecord", ConsentRecordSchema);
