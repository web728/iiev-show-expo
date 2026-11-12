import { z } from "zod";

// Keep Zod error keys in sync with the `name` attribute of each HTML input.
const trimmed = (max: number) => z.string().trim().max(max, `Maximum ${max} characters allowed`);
const required = (label: string, max = 120) =>
  trimmed(max).min(1, `${label} is required`);

const optionalText = (max: number) =>
  trimmed(max).optional().transform((value) => value || undefined);

export const nameField = required("Full name", 100).min(
  2,
  "Please enter your full name",
);

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .max(160, "Email is too long")
  .email("Enter a valid email address");

export const phoneField = z
  .string()
  .trim()
  .min(1, "Mobile number is required")
  .max(24, "Mobile number is too long")
  .transform((value) => value.replace(/[\s().-]/g, ""))
  .refine(
    (value) => /^(?:\+91|0)?[6-9]\d{9}$/.test(value) || /^\+[1-9]\d{7,14}$/.test(value),
    "Enter a valid Indian mobile number or international number with + country code",
  );

const optionalPhone = z.union([
  phoneField,
  z.literal("").transform(() => undefined),
  z.undefined(),
]);

const optionalUrl = optionalText(200)
  .transform((value) =>
    value && !/^https?:\/\//i.test(value) ? `https://${value}` : value,
  )
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return (
        ["http:", "https:"].includes(url.protocol) &&
        (url.hostname.includes(".") || url.hostname === "localhost") &&
        !url.username &&
        !url.password &&
        !/\s/.test(value)
      );
    } catch {
      return false;
    }
  }, "Enter a valid website URL");

// These public forms have no affirmative consent input. Never infer consent from
// pressing Submit, and never trust a client-supplied true value.
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
  idempotencyKey: z.string().uuid("Invalid submission key"),
  attribution: attributionSchema,
  website_url_confirm: z.string().max(0).optional(),
  // Not used as an anti-bot gate. The client clock is untrusted.
  startedAt: z.number().int().nonnegative().optional(),
};

const indianStateIsMissing = (data: { country: string; state?: string }) =>
  data.country.trim().toLowerCase() === "india" && !data.state?.trim();

const stateIssue = {
  code: "custom" as const,
  path: ["state"],
  message: "State / UT is required for India",
};

const location = {
  city: required("City", 80),
  state: optionalText(80),
  country: required("Country", 80),
};

export const stallEnquirySchema = z.object({
  fullName: nameField,
  designation: required("Designation", 100),
  company: required("Company", 160),
  email: emailField,
  phone: phoneField,
  country: required("Country", 80),
  productDescription: required("Products & services", 1500),
  areaPreference: optionalText(40),
  ...consentFields,
  ...meta,
});
export type StallEnquiryInput = z.output<typeof stallEnquirySchema>;

export const visitorRegistrationSchema = z.object({
  fullName: nameField,
  email: emailField,
  phone: phoneField,
  company: required("Company / organisation", 160),
  designation: required("Designation", 100),
  industry: optionalText(80),
  country: required("Country", 80),
  ...consentFields,
  ...meta,
});
export type VisitorRegistrationInput = z.output<typeof visitorRegistrationSchema>;

export const sponsorshipEnquirySchema = z.object({
  fullName: nameField,
  designation: required("Designation", 100),
  company: required("Company", 160),
  email: emailField,
  phone: phoneField,
  ...location,
  website: optionalUrl,
  interests: z.array(required("Area of interest", 80)).min(1, "Choose at least one area of interest"),
  objectives: required("Objectives", 1500).min(10, "Please describe your objectives"),
  budgetRange: optionalText(60),
  ...consentFields,
  ...meta,
}).superRefine((data, ctx) => {
  if (indianStateIsMissing(data)) ctx.addIssue(stateIssue);
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
}).superRefine((data, ctx) => {
  if (indianStateIsMissing(data)) ctx.addIssue(stateIssue);
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
  previousSpeaking: optionalText(800),
  ...consentFields,
  ...meta,
}).superRefine((data, ctx) => {
  if (indianStateIsMissing(data)) ctx.addIssue(stateIssue);
});

export const delegateRegistrationSchema = z.object({
  fullName: nameField,
  designation: required("Designation", 100),
  company: required("Organisation", 160),
  email: emailField,
  phone: phoneField,
  ...location,
  topicsOfInterest: z.array(required("Topic", 80)).optional(),
  notes: optionalText(800),
  ...consentFields,
  ...meta,
}).superRefine((data, ctx) => {
  if (indianStateIsMissing(data)) ctx.addIssue(stateIssue);
});

export const contactSchema = z.object({
  fullName: nameField,
  email: emailField,
  phone: optionalPhone,
  company: optionalText(160),
  topic: required("Topic", 60),
  message: required("Message", 3000).min(10, "Please enter a message"),
  ...consentFields,
  ...meta,
});

// Badge lookup uses its own endpoint, separate from form submission.
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
