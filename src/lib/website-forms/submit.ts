import "server-only";
import mongoose, { Schema, type Model } from "mongoose";
import { appendWebsiteEnquiry } from "./sheets";
import { emailConfigured, emailRecipients, sendLeadNotification, type EmailField } from "./email";

// Change this ONE import if your existing connectDb() helper has a different path.
import { connectDb } from "@/lib/db";

export type WebsiteFormName =
  | "brochure"
  | "visitor"
  | "exhibitor"
  | "contact"
  | "sponsorship"
  | "partnership"
  | "speaker"
  | "delegate";

const FORM_LABELS: Record<WebsiteFormName, string> = {
  brochure: "Brochure Download",
  visitor: "Visitor Registration",
  exhibitor: "Exhibitor Enquiry",
  contact: "Contact Enquiry",
  sponsorship: "Sponsorship Enquiry",
  partnership: "Partnership Enquiry",
  speaker: "Speaker Application",
  delegate: "Delegate Registration",
};

export type WebsiteLeadInput = {
  submissionKey: string;
  form: WebsiteFormName;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  designation?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  areaPreference?: string;
  productDescription?: string;
  industry?: string;
  message?: string;
  segments?: string[];
  sectorInterests?: string[];
  interests?: string[];
  topicsOfInterest?: string[];
  objectives?: string;
  proposal?: string;
  topicTitle?: string;
  privacyAccepted: boolean;
  brochureName?: string;
};

type WebsiteLeadDoc = WebsiteLeadInput & {
  submittedAt: Date;
  sheetSynced: boolean;
  mail1Sent: boolean;
  mail2Sent: boolean;
};

const websiteLeadSchema = new Schema<WebsiteLeadDoc>(
  {
    submissionKey: { type: String, required: true, unique: true },
    form: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    company: String,
    designation: String,
    website: String,
    address: String,
    city: String,
    state: String,
    country: String,
    areaPreference: String,
    productDescription: String,
    industry: String,
    message: String,
    segments: [String],
    sectorInterests: [String],
    interests: [String],
    topicsOfInterest: [String],
    objectives: String,
    proposal: String,
    topicTitle: String,
    brochureName: String,
    privacyAccepted: { type: Boolean, required: true },
    submittedAt: { type: Date, default: Date.now },
    sheetSynced: { type: Boolean, default: false },
    mail1Sent: { type: Boolean, default: false },
    mail2Sent: { type: Boolean, default: false },
  },
  { collection: "website_enquiries", timestamps: true }
);

// Production: provision the unique submissionKey index during deployment.
const WebsiteLead: Model<WebsiteLeadDoc> =
  (mongoose.models.WebsiteLead as Model<WebsiteLeadDoc> | undefined) ??
  mongoose.model<WebsiteLeadDoc>("WebsiteLead", websiteLeadSchema);

const compact = (value: unknown) => Array.isArray(value) ? value.filter(Boolean).join(", ") : String(value ?? "");

export function toWebsiteSheetRow(lead: WebsiteLeadDoc): string[] {
  const interest = [
    compact(lead.areaPreference),
    compact(lead.industry),
    compact(lead.segments),
    compact(lead.sectorInterests),
    compact(lead.interests),
    compact(lead.topicsOfInterest),
  ].filter(Boolean).join(" | ");

  const message = [
    lead.brochureName ? `Document: ${lead.brochureName}` : "",
    lead.productDescription ? `Products & Services: ${lead.productDescription}` : "",
    lead.objectives ? `Objectives: ${lead.objectives}` : "",
    lead.proposal ? `Proposal: ${lead.proposal}` : "",
    lead.topicTitle ? `Topic: ${lead.topicTitle}` : "",
    lead.message ?? "",
  ].filter(Boolean).join(" | ");

  const address = [lead.address, lead.city, lead.state].filter(Boolean).join(", ");
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata", dateStyle: "short", timeStyle: "medium", hour12: true,
  }).format(lead.submittedAt);

  return [
    date,                          // A Date
    "IIEV Show Website",           // B Platform
    FORM_LABELS[lead.form],        // C Register As
    lead.company ?? "",            // D Company Name
    lead.fullName,                 // E Contact Person
    lead.designation ?? "",        // F Designation
    lead.email,                    // G Email Id
    lead.phone ?? "",              // H Mobile No.
    lead.website ?? "",            // I Website
    address,                       // J Address
    lead.country ?? "",            // K Country
    interest,                      // L Area of Interest
    "Website",                    // M Info. Get From
    message,                       // N Message
    "",                           // O Corrections
    "", "", "", "", "",             // P–T STATUS 1–5
  ];
}

export async function submitWebsiteLead(input: WebsiteLeadInput) {
  if (!input.privacyAccepted) throw new Error("Privacy consent is required");
  if (!input.fullName || !input.email) throw new Error("Full name and email are required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) throw new Error("Invalid email");
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(input.submissionKey)) throw new Error("Invalid submission key");
  if (!emailConfigured()) throw new Error("Email is not configured");
  const recipients = emailRecipients();
  if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
    throw new Error("Google Sheets is not configured");
  }

  await connectDb();
  // setOnInsert avoids overwriting an earlier form submission on a retry.
  let lead: WebsiteLeadDoc & { _id: mongoose.Types.ObjectId };
  try {
    lead = (await WebsiteLead.findOneAndUpdate(
      { submissionKey: input.submissionKey },
      { $setOnInsert: { ...input, submittedAt: new Date(), sheetSynced: false, mail1Sent: false, mail2Sent: false } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean()) as WebsiteLeadDoc & { _id: mongoose.Types.ObjectId };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      lead = (await WebsiteLead.findOne({ submissionKey: input.submissionKey }).lean()) as WebsiteLeadDoc & { _id: mongoose.Types.ObjectId };
    } else throw error;
  }
  if (!lead || lead.form !== input.form || lead.email !== input.email) {
    throw new Error("Submission key already belongs to another request");
  }

  const row = toWebsiteSheetRow(lead);
  const rows: EmailField[] = [
    ["Form", FORM_LABELS[lead.form]],
    ["Company Name", lead.company],
    ["Contact Person", lead.fullName],
    ["Designation", lead.designation],
    ["Email", lead.email],
    ["Mobile / WhatsApp", lead.phone],
    ["Website", lead.website],
    ["Address", row[9]],
    ["Country", lead.country],
    ["Area of Interest", row[11]],
    ["Message / Details", row[13]],
  ];
  const submittedAt = row[0];

  // Partial failures stay recorded in MongoDB; a retry with the same
  // submissionKey only reattempts destinations not marked completed.
  const failures: string[] = [];
  if (!lead.sheetSynced) {
    try {
      await appendWebsiteEnquiry(row);
      await WebsiteLead.updateOne({ _id: lead._id }, { $set: { sheetSynced: true } });
      lead.sheetSynced = true;
    } catch (error) {
      console.error("[website-lead] sheets", error);
      failures.push("sheets");
    }
  }
  for (const [index, recipient] of recipients.entries()) {
    const field = index === 0 ? "mail1Sent" : "mail2Sent";
    if (lead[field]) continue;
    try {
      await sendLeadNotification({
        to: recipient,
        label: FORM_LABELS[lead.form],
        company: lead.company ?? "",
        name: lead.fullName,
        submittedAt,
        rows,
      });
      await WebsiteLead.updateOne({ _id: lead._id }, { $set: { [field]: true } });
      lead[field] = true;
    } catch (error) {
      console.error(`[website-lead] email ${index + 1}`, error);
      failures.push(`email${index + 1}`);
    }
  }
  return {
    ok: failures.length === 0,
    reference: String(lead._id),
    failures,
  };
}
