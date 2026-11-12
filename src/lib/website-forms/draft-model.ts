import "server-only";
import mongoose, { Schema, Types, type Model } from "mongoose";

export const WEB_FORMS = [
  "stall", "visitor", "contact", "sponsorship", "partner",
  "speaker", "delegate", "media", "brochure",
] as const;
export type WebForm = (typeof WEB_FORMS)[number];

// Drafts are intentionally partial: users can leave any field empty.
// The API must whitelist allowed keys and apply limits before writing data.
export interface WebsiteDraftData {
  fullName?: string;
  email?: string;
  phone?: string;
  phoneCountry?: string; // ISO code from the dial-code selector: IN, US, GB...
  company?: string;
  designation?: string;
  country?: string;
  city?: string;
  state?: string;
  website?: string;
  industry?: string;
  areaPreference?: string;
  productDescription?: string;
  interests?: string[];
  topicsOfInterest?: string[];
  segments?: string[];
  sectorInterests?: string[];
  objectives?: string;
  budgetRange?: string;
  partnerType?: string;
  proposal?: string;
  topic?: string;
  topicTitle?: string;
  abstract?: string;
  format?: string;
  bio?: string;
  previousSpeaking?: string;
  linkedin?: string;
  message?: string;
  notes?: string;
  attribution?: {
    referrer?: string;
    landingPage?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
  };
  [key: string]: unknown;
}

export interface WebsiteDraftDocument {
  submissionKey: string;
  form: WebForm;
  state: "draft" | "submitted";
  data: WebsiteDraftData;
  privacyAccepted: boolean;
  marketingOptIn: boolean;
  finalRef?: string;
  finalEntity?: "Lead" | "Visitor";
  finalEntityId?: Types.ObjectId;
  submittedAt?: Date;
  // One Sheet row per submissionKey. Autosave updates, not appends.
  sheetRange?: string;
  sheetRevision: number;
  revision: number;
  sheetLeaseUntil?: Date;
  // Legacy names kept for backwards compatibility with current worker.
  mail1Sent: boolean;
  mail2Sent: boolean;
  mail1LeaseUntil?: Date;
  mail2LeaseUntil?: Date;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteDraftSchema = new Schema<WebsiteDraftDocument>(
  {
    submissionKey: { type: String, required: true, unique: true, immutable: true },
    form: { type: String, enum: [...WEB_FORMS], required: true, immutable: true },
    state: {
      type: String,
      enum: ["draft", "submitted"],
      default: "draft",
      index: true,
    },
    data: { type: Schema.Types.Mixed, default: () => ({}) },
    privacyAccepted: { type: Boolean, default: false },
    marketingOptIn: { type: Boolean, default: false },
    finalRef: String,
    finalEntity: { type: String, enum: ["Lead", "Visitor"] },
    finalEntityId: { type: Schema.Types.ObjectId },
    submittedAt: Date,
    sheetRange: String,
    sheetRevision: { type: Number, default: -1, min: -1 },
    revision: { type: Number, default: 0, min: 0 },
    sheetLeaseUntil: Date,
    mail1Sent: { type: Boolean, default: false },
    mail2Sent: { type: Boolean, default: false },
    mail1LeaseUntil: Date,
    mail2LeaseUntil: Date,
    lastError: String,
  },
  { timestamps: true, collection: "website_form_drafts" },
);

WebsiteDraftSchema.index({ form: 1, state: 1, updatedAt: -1 });
WebsiteDraftSchema.index({ state: 1, updatedAt: -1 });

export const WebsiteDraft: Model<WebsiteDraftDocument> =
  (mongoose.models.WebsiteDraft as Model<WebsiteDraftDocument> | undefined) ??
  mongoose.model<WebsiteDraftDocument>("WebsiteDraft", WebsiteDraftSchema);
