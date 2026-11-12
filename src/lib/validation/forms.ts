import { z } from "zod";

const trimmed = (max: number) => z.string().trim().max(max);
const required = (label: string, max = 120) => trimmed(max).min(1, `${label} is required`);

export const nameField = required("Full name", 100).min(2, "Please enter your full name");
export const emailField = z.string().trim().toLowerCase().max(160).email("Enter a valid email address");
export const phoneField = z.string().trim().max(24)
  .transform((v) => v.replace(/[\s\-().]/g, ""))
  .refine((v) => /^(\+91|0)?[6-9]\d{9}$/.test(v) || /^\+[1-9]\d{7,14}$/.test(v), {
    message: "Enter a valid mobile number (Indian 10-digit, or international with + country code)",
  });

const optionalUrl = z.string().trim().max(200).optional()
  .transform((v) => (v ? (/^https?:\/\//i.test(v) ? v : `https://${v}`) : undefined))
  .refine((v) => !v || /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(v), { message: "Enter a valid website" });


// Checkbox-free forms: never infer affirmative consent from a Submit click.
// This legacy field remains for compatibility with existing Mongo models and APIs.
// Ignore any client-provided true value rather than recording an invented opt-in.
export const consentFields = {
  privacyAccepted: z.unknown().optional().transform(() => false),
  marketingOptIn: z.unknown().optional().transform(() => false),
};

export const attributionSchema = z.object({
  referrer: trimmed(500).optional(),
  landingPage: trimmed(500).optional(),
  utmSource: trimmed(100).optional(),
  utmMedium: trimmed(100).optional(),
  utmCampaign: trimmed(150).optional(),
  utmTerm: trimmed(150).optional(),
  utmContent: trimmed(150).optional(),
}).partial().optional();

const meta = {
  idempotencyKey: z.string().uuid("Invalid submission key"),
  attribution: attributionSchema,
  website_url_confirm: z.string().max(0).optional(),
  startedAt: z.number().int().optional(),
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
  // City/state and segments are intentionally not collected on the compact form.
  country: required("Country", 80),
  productDescription: required("Products & services", 1500),
  areaPreference: trimmed(40).optional(),
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
  // Business / Category is optional; no city/reason/sectorInterests in this form.
  industry: trimmed(80).optional(),
  country: required("Country", 80),
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
  ...consentFields,
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
