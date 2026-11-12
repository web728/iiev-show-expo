import { z } from "zod";
import {
  isSupportedCountry,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

const trimmed = (max: number) =>
  z.string().trim().max(max, `Maximum ${max} characters allowed`);
const required = (label: string, max = 120) =>
  trimmed(max).min(1, `${label} is required`);
const optionalText = (max: number) =>
  trimmed(max).optional().transform((value) => value || undefined);

export const nameField = required("Full name", 100).min(
  2, "Please enter your full name",
);

export const emailField = z.string().trim().toLowerCase()
  .min(1, "Email is required")
  .max(160, "Email is too long")
  .email("Enter a valid email address");

// The browser shows a country dropdown such as India (+91), but sends "IN".
// Existing clients that send +919876543210 (or a plain Indian number) still work.
export const phoneCountryField = z.string().trim().toUpperCase()
  .refine(
    (value) => isSupportedCountry(value as CountryCode),
    "Select a valid phone country",
  )
  .default("IN");

// The definitive country-specific check runs below, after phoneCountry is known.
export const phoneField = z.string().trim()
  .min(1, "Mobile number is required")
  .max(35, "Mobile number is too long")
  .regex(/^\+?[0-9\s().-]+$/, "Enter a valid phone number");

const optionalPhone = z.union([phoneField, z.literal("")])
  .optional()
  .transform((value) => value || undefined);

function toE164(value: string, country: string): string | undefined {
  const input = value.trim();
  if (!/^\+?[0-9\s().-]+$/.test(input)) return undefined;
  try {
    const number = parsePhoneNumberFromString(input, {
      defaultCountry: country as CountryCode,
      extract: false,
    });
    return number?.isValid() && !number.ext ? number.number : undefined;
  } catch {
    return undefined;
  }
}

function validatePhone(
  data: { phone?: string; phoneCountry: string },
  ctx: z.RefinementCtx,
): void {
  if (data.phone && !toE164(data.phone, data.phoneCountry)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phone"],
      message: "Enter a valid mobile/phone number for the selected country",
    });
  }
}

// Keep schema output typed as a string; phone becomes normalized E.164.
function normalizePhone<T extends { phone?: string; phoneCountry: string }>(data: T): T {
  if (data.phone) {
    const normalized = toE164(data.phone, data.phoneCountry);
    if (normalized) data.phone = normalized;
  }
  return data;
}

const optionalUrl = optionalText(200)
  .transform((value) =>
    value && !/^https?:\/\//i.test(value) ? `https://${value}` : value,
  )
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return (
        (url.protocol === "https:" || url.protocol === "http:") &&
        url.hostname.includes(".") &&
        !url.username && !url.password && !/\s/.test(value)
      );
    } catch {
      return false;
    }
  }, "Enter a valid website URL");

// These forms do not currently contain affirmative consent checkboxes.
// Never silently invent privacy/marketing consent from a submit click.
export const consentFields = {
  privacyAccepted: z.unknown().optional().transform(() => false),
  marketingOptIn: z.unknown().optional().transform(() => false),
};

export const attributionSchema = z.object({
  referrer: optionalText(500),
  landingPage: optionalText(500),
  utmSource: optionalText(100),
  utmMedium: optionalText(100),
  utmCampaign: optionalText(150),
  utmTerm: optionalText(150),
  utmContent: optionalText(150),
}).optional();

const meta = {
  // Must be the SAME key as WebsiteDraft.submissionKey.
  idempotencyKey: z.string().uuid("Invalid submission key"),
  attribution: attributionSchema,
  website_url_confirm: z.string().max(0).optional(),
  startedAt: z.number().int().nonnegative().optional(),
  // Only for FINAL submission; autosave uses a separate partial-data schema.
  // A token passing Zod is NOT verification. API must call Google siteverify.
  recaptchaToken: z.string().trim()
    .min(1, "Please complete the I'm not a robot verification")
    .max(4096, "Invalid CAPTCHA token"),
};

const indianStateIsMissing = (data: { country: string; state?: string }) =>
  data.country.trim().toLowerCase() === "india" && !data.state?.trim();

function validateIndianState(
  data: { country: string; state?: string }, ctx: z.RefinementCtx,
): void {
  if (indianStateIsMissing(data)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["state"],
      message: "State / UT is required for India",
    });
  }
}

const location = {
  city: required("City", 80),
  state: optionalText(80),
  country: required("Country", 80),
};
const requiredPhone = { phone: phoneField, phoneCountry: phoneCountryField };

export const stallEnquirySchema = z.object({
  fullName: nameField,
  designation: required("Designation", 100),
  company: required("Company", 160),
  email: emailField,
  ...requiredPhone,
  country: required("Country", 80),
  productDescription: required("Products & services", 1500),
  areaPreference: optionalText(40),
  ...consentFields,
  ...meta,
}).superRefine(validatePhone).transform(normalizePhone);
export type StallEnquiryInput = z.output<typeof stallEnquirySchema>;

export const visitorRegistrationSchema = z.object({
  fullName: nameField,
  email: emailField,
  ...requiredPhone,
  company: required("Company / organisation", 160),
  designation: required("Designation", 100),
  industry: optionalText(80),
  country: required("Country", 80),
  ...consentFields,
  ...meta,
}).superRefine(validatePhone).transform(normalizePhone);
export type VisitorRegistrationInput = z.output<typeof visitorRegistrationSchema>;

export const sponsorshipEnquirySchema = z.object({
  fullName: nameField,
  designation: required("Designation", 100),
  company: required("Company", 160),
  email: emailField,
  ...requiredPhone,
  ...location,
  website: optionalUrl,
  interests: z.array(required("Area of interest", 80))
    .min(1, "Choose at least one area of interest"),
  objectives: required("Objectives", 1500)
    .min(10, "Please describe your objectives"),
  budgetRange: optionalText(60),
  ...consentFields,
  ...meta,
}).superRefine((data, ctx) => {
  validatePhone(data, ctx);
  validateIndianState(data, ctx);
}).transform(normalizePhone);

export const partnerEnquirySchema = z.object({
  fullName: nameField,
  designation: required("Designation", 100),
  company: required("Organisation", 160),
  email: emailField,
  ...requiredPhone,
  ...location,
  website: optionalUrl,
  partnerType: required("Partnership type", 60),
  proposal: required("Proposal", 1500)
    .min(10, "Please describe the proposed partnership"),
  ...consentFields,
  ...meta,
}).superRefine((data, ctx) => {
  validatePhone(data, ctx);
  validateIndianState(data, ctx);
}).transform(normalizePhone);

export const speakerApplicationSchema = z.object({
  fullName: nameField,
  designation: required("Designation", 100),
  company: required("Organisation", 160),
  email: emailField,
  ...requiredPhone,
  ...location,
  linkedin: optionalUrl,
  topicTitle: required("Proposed topic", 160),
  abstract: required("Abstract", 2000)
    .min(50, "Please provide an abstract of at least 50 characters"),
  format: required("Preferred format", 40),
  bio: required("Short bio", 1200)
    .min(30, "Please provide a short bio"),
  previousSpeaking: optionalText(800),
  ...consentFields,
  ...meta,
}).superRefine((data, ctx) => {
  validatePhone(data, ctx);
  validateIndianState(data, ctx);
}).transform(normalizePhone);

export const delegateRegistrationSchema = z.object({
  fullName: nameField,
  designation: required("Designation", 100),
  company: required("Organisation", 160),
  email: emailField,
  ...requiredPhone,
  ...location,
  topicsOfInterest: z.array(required("Topic", 80)).optional(),
  notes: optionalText(800),
  ...consentFields,
  ...meta,
}).superRefine((data, ctx) => {
  validatePhone(data, ctx);
  validateIndianState(data, ctx);
}).transform(normalizePhone);

export const contactSchema = z.object({
  fullName: nameField,
  email: emailField,
  phone: optionalPhone,
  phoneCountry: phoneCountryField,
  company: optionalText(160),
  topic: required("Topic", 60),
  message: required("Message", 3000)
    .min(10, "Please enter a message"),
  ...consentFields,
  ...meta,
}).superRefine(validatePhone).transform(normalizePhone);

// This is a separate public endpoint and should also have rate limiting.
export const badgeRetrieveSchema = z.object({
  email: emailField,
  website_url_confirm: z.string().max(0).optional(),
  recaptchaToken: z.string().trim()
    .min(1, "Please complete the CAPTCHA")
    .max(4096, "Invalid CAPTCHA token"),
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
