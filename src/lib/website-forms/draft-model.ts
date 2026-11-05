import "server-only";
import mongoose, { Schema } from "mongoose";

export const WEB_FORMS = ["stall", "visitor", "contact", "sponsorship", "partner", "speaker", "delegate", "media", "brochure"] as const;
export type WebForm = typeof WEB_FORMS[number];

export interface WebsiteDraftData {
  fullName?: string;
  email?: string;
  phone?: string;
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
  proposal?: string;
  topic?: string;
  topicTitle?: string;
  message?: string;
  notes?: string;
  [key: string]: string | string[] | undefined;
}

const WebsiteDraftSchema = new Schema({
  submissionKey: { type: String, required: true, unique: true },
  form: { type: String, enum: WEB_FORMS, required: true },
  state: { type: String, enum: ["draft", "submitted"], default: "draft" },
  data: { type: Schema.Types.Mixed, default: {} },
  privacyAccepted: { type: Boolean, default: false },
  finalRef: String,
  submittedAt: Date,
  sheetRange: String,
  sheetRevision: { type: Number, default: -1 },
  revision: { type: Number, default: 0 },
  sheetLeaseUntil: Date,
  mail1Sent: { type: Boolean, default: false },
  mail2Sent: { type: Boolean, default: false },
  mail1LeaseUntil: Date,
  mail2LeaseUntil: Date,
  lastError: String,
}, { timestamps: true, collection: "website_form_drafts" });

export const WebsiteDraft =
  (mongoose.models.WebsiteDraft as mongoose.Model<mongoose.InferSchemaType<typeof WebsiteDraftSchema>> | undefined)
  ?? mongoose.model("WebsiteDraft", WebsiteDraftSchema);
