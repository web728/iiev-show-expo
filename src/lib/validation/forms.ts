import { z } from "zod";
import { SECTOR_OPTIONS } from "@/config/options";

// Shared field rules. Server-side validation is authoritative; the client
// reuses the same schemas for inline feedback.

const trimmed = (max: number) => z.string().trim().max(max);
const required = (label: string, max = 120) => trimmed(max).min(1, `${label} is required`);

export const nameField = required("Full name", 100).min(2, "Please enter your full name");
export const emailField = z.string().trim().toLowerCase().max(160).email("Enter a valid email address");

// India: 10 digits starting 6–9, optional +91/0. International: E.164-ish 8–15 digits.
export const phoneField = z
  .string()
  .trim()
  .max(24)
  .transform((v) => v.replace(/[\s\-().]/g, ""))
  .refine((v) => /^(\+91|0)?[6-9]\d{9}$/.test(v) || /^\+[1-9]\d{7,14}$/.test(v), {
    message: "Enter a valid mobile number (Indian 10-digit, or international with + country code)",
  });

const optionalUrl = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((v) => (v ? (/^https?:\/\//i.test(v) ? v : `https://${v}`) : undefined))
  .refine((v) => !v || /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(v), { message: "Enter a valid website" });

const sectorValues = SECTOR_OPTIONS.map((s) => s.value) as [string, ...string[]];

export const consentFields = {
  privacyAccepted: z.literal(true, { message: "Please accept the privacy notice to continue" }),
  marketingOptIn: z.boolean().default(false),
};

export const attributionSchema = z
  .object({
    referrer: trimmed(500).optional(),
    landingPage: trimmed(500).optional(),
    utmSource: trimmed(100).optional(),
    utmMedium: trimmed(100).optional(),
    utmCampaign: trimmed(150).optional(),
    utmTerm: trimmed(150).optional(),
    utmContent: trimmed(150).optional(),
  })
  .partial()
  .optional();

const meta = {
  idempotencyKey: z.string().uuid("Invalid submission key"),
  attribution: attributionSchema,
  // Honeypot: must be empty. Bots that fill every field are silently rejected.
  website_url_confirm: z.string().max(0).optional(),
  startedAt: z.number().int().optional(), // ms timestamp when form rendered (bot timing check)
};

const location = {
  city: required("City", 80),
  state: trimmed(80).optional(),
  country: required("Country", 80),
};

export const stallEnquirySchema = z.object({
  fullName: nameField,
  designation: required("Designation", 100),
  company: required("Company", 160),
  email: emailField,
  phone: phoneField,
  ...location,
  website: optionalUrl,
  segments: z.array(z.enum(sectorValues)).min(1, "Choose at least one segment"),
  productDescription: required("Product description", 1500).min(10, "Tell us a little more about your products"),
  areaPreference: required("Area preference", 40),
  stallType: trimmed(40).optional(),
  notes: trimmed(1500).optional(),
  ...consentFields,
  ...meta,
});
export type StallEnquiryInput = z.infer<typeof stallEnquirySchema>;

export const visitorRegistrationSchema = z.object({
  fullName: nameField,
  email: emailField,
  phone: phoneField,
  company: required("Company / organisation", 160),
  designation: required("Designation", 100),
  industry: required("Industry", 80),
  ...location,
  reasonForVisit: required("Reason for visit", 80),
  sectorInterests: z.array(z.enum(sectorValues)).min(1, "Choose at least one area of interest"),
  ...consentFields,
  ...meta,
});
export type VisitorRegistrationInput = z.infer<typeof visitorRegistrationSchema>;

export const sponsorshipEnquirySchema = z.object({
  fullName: nameField,
  designation: required("Designation", 100),
  company: required("Company", 160),
  email: emailField,
  phone: phoneField,
  ...location,
  website: optionalUrl,
  interests: z.array(trimmed(80)).min(1, "Choose at least one area of interest"),
  objectives: required("Objectives", 1500).min(10, "Please describe your objectives"),
  budgetRange: trimmed(60).optional(),
  ...consentFields,
  ...meta,
});

export const partnerEnquirySchema = z.object({
  fullName: nameField,
  designation: required("Designation", 100),
  company: required("Organisation", 160),
  email: emailField,
  phone: phoneField,
  ...location,
  website: optionalUrl,
  partnerType: required("Partnership type", 60),
  proposal: required("Proposal", 1500).min(10, "Please describe the proposed partnership"),
  ...consentFields,
  ...meta,
});

export const speakerApplicationSchema = z.object({
  fullName: nameField,
  designation: required("Designation", 100),
  company: required("Organisation", 160),
  email: emailField,
  phone: phoneField,
  ...location,
  linkedin: optionalUrl,
  topicTitle: required("Proposed topic", 160),
  abstract: required("Abstract", 2000).min(50, "Please provide an abstract of at least 50 characters"),
  format: required("Preferred format", 40),
  bio: required("Short bio", 1200).min(30, "Please provide a short bio"),
  previousSpeaking: trimmed(800).optional(),
  ...consentFields,
  ...meta,
});

export const delegateRegistrationSchema = z.object({
  fullName: nameField,
  designation: required("Designation", 100),
  company: required("Organisation", 160),
  email: emailField,
  phone: phoneField,
  ...location,
  topicsOfInterest: z.array(trimmed(80)).optional(),
  notes: trimmed(800).optional(),
  ...consentFields,
  ...meta,
});

export const contactSchema = z.object({
  fullName: nameField,
  email: emailField,
  phone: phoneField.optional().or(z.literal("").transform(() => undefined)),
  company: trimmed(160).optional(),
  topic: required("Topic", 60),
  message: required("Message", 3000).min(10, "Please enter a message"),
  privacyAccepted: z.literal(true, { message: "Please accept the privacy notice to continue" }),
  marketingOptIn: z.boolean().default(false),
  ...meta,
});

export const badgeRetrieveSchema = z.object({
  email: emailField,
  website_url_confirm: z.string().max(0).optional(),
});

export type FieldErrors = Record<string, string>;

export function flattenZod(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
