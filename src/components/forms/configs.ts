
import type { FieldDef } from "./smart-form";

import {
  COUNTRIES,
  SPONSORSHIP_INTEREST_OPTIONS,
} from "@/config/options";

/* =====================================================
   SHARED CONTACT DETAILS
   Used in sponsorship, partner, speaker and delegate forms
===================================================== */

const sharedContactFields: FieldDef[] = [
  {
    kind: "text",
    name: "fullName",
    label: "Full Name",
    required: true,
    autoComplete: "name",
    placeholder: "Enter your full name",
  },
  {
    kind: "text",
    name: "designation",
    label: "Designation",
    required: true,
    autoComplete: "organization-title",
    placeholder: "Enter your designation",
  },
  {
    kind: "text",
    name: "company",
    label: "Company",
    required: true,
    autoComplete: "organization",
    placeholder: "Enter company name",
  },
  {
    kind: "email",
    name: "email",
    label: "Business Email",
    required: true,
    autoComplete: "email",
    placeholder: "name@company.com",
  },
  {
    kind: "tel",
    name: "phone",
    label: "Mobile Number",
    required: true,
    autoComplete: "tel",
    placeholder: "+91 98765 43210",
  },
];

/* =====================================================
   EXHIBITOR ENQUIRY
   Exactly 8 fields: 7 required, 1 optional
===================================================== */

export const stallFields: FieldDef[] = [
  {
    kind: "text",
    name: "company",
    label: "Company Name",
    required: true,
    autoComplete: "organization",
    placeholder: "Enter company name",
  },
  {
    kind: "text",
    name: "designation",
    label: "Designation",
    required: true,
    autoComplete: "organization-title",
    placeholder: "Enter your designation",
  },
  {
    kind: "text",
    name: "fullName",
    label: "Contact Person",
    required: true,
    autoComplete: "name",
    placeholder: "Enter contact person's name",
  },
  {
    kind: "email",
    name: "email",
    label: "Business Email",
    required: true,
    autoComplete: "email",
    placeholder: "name@company.com",
  },
  {
    kind: "tel",
    name: "phone",
    label: "Mobile / WhatsApp Number",
    required: true,
    autoComplete: "tel",
    placeholder: "+91 98765 43210",
  },
  {
    kind: "select",
    name: "country",
    label: "Country",
    required: true,
    options: COUNTRIES,
    half: true,
  },
  {
    kind: "textarea",
    name: "productDescription",
    label: "Products & Services",
    required: true,
    rows: 4,
    placeholder:
      "Describe the products or services you wish to exhibit...",
  },
  {
    kind: "select",
    name: "areaPreference",
    label: "Preferred Booth Size",
    required: false,
    half: true,
    options: [
      "9 m²",
      "18 m²",
      "27 m²",
      "36 m²",
      "54 m²",
      "72 m²",
      "100 m²",
      "Custom / Free Size",
      "To Be Discussed",
    ],
  },
];

/* =====================================================
   VISITOR REGISTRATION
   Exactly 7 fields: 6 required, 1 optional
===================================================== */

export const visitorFields: FieldDef[] = [
  {
    kind: "text",
    name: "fullName",
    label: "Full Name",
    required: true,
    autoComplete: "name",
    placeholder: "Enter your full name",
  },
  {
    kind: "text",
    name: "company",
    label: "Company / Organisation",
    required: true,
    autoComplete: "organization",
    placeholder: "Enter company or organisation",
  },
  {
    kind: "text",
    name: "designation",
    label: "Designation",
    required: true,
    autoComplete: "organization-title",
    placeholder: "Enter your designation",
  },
  {
    kind: "tel",
    name: "phone",
    label: "Mobile / WhatsApp Number",
    required: true,
    autoComplete: "tel",
    placeholder: "+91 98765 43210",
  },
  {
    kind: "email",
    name: "email",
    label: "Email Address",
    required: true,
    autoComplete: "email",
    placeholder: "name@example.com",
  },
  {
    kind: "text",
    name: "industry",
    label: "Business / Category",
    required: false,
    placeholder: "e.g. Manufacturer, Student, EV Buyer",
  },
  {
    kind: "select",
    name: "country",
    label: "Country",
    required: true,
    options: COUNTRIES,
    half: true,
  },
];

/* =====================================================
   SPONSORSHIP ENQUIRY
===================================================== */

export const sponsorshipFields: FieldDef[] = [
  ...sharedContactFields,
  {
    kind: "url",
    name: "website",
    label: "Company Website",
    placeholder: "https://example.com",
  },
  {
    kind: "location",
  },
  {
    kind: "checkboxes",
    name: "interests",
    label: "Areas of Interest",
    required: true,
    options: SPONSORSHIP_INTEREST_OPTIONS,
  },
  {
    kind: "textarea",
    name: "objectives",
    label: "What Would You Like to Achieve?",
    required: true,
    rows: 4,
    placeholder: "Describe your sponsorship objectives",
    hint:
      "Relevant audiences, launches or brand objectives.",
  },
  {
    kind: "select",
    name: "budgetRange",
    label: "Indicative Budget",
    half: true,
    options: [
      "To be discussed",
      "Under ₹5 lakh",
      "₹5–15 lakh",
      "₹15–30 lakh",
      "Above ₹30 lakh",
    ],
  },
];

/* =====================================================
   PARTNERSHIP ENQUIRY
===================================================== */

export const partnerFields: FieldDef[] = [
  ...sharedContactFields.map((field): FieldDef =>
    "name" in field && field.name === "company"
      ? { ...field, label: "Organisation" }
      : field
  ),
  {
    kind: "url",
    name: "website",
    label: "Website",
    placeholder: "https://example.com",
  },
  {
    kind: "location",
  },
  {
    kind: "select",
    name: "partnerType",
    label: "Type of Partnership",
    required: true,
    options: [
      "Industry association",
      "Media partner",
      "Knowledge / research partner",
      "Government or public body",
      "Supporting organisation",
      "Other",
    ],
  },
  {
    kind: "textarea",
    name: "proposal",
    label: "Proposed Partnership",
    required: true,
    rows: 4,
    placeholder: "Describe your partnership proposal",
    hint:
      "Explain the proposed collaboration.",
  },
];

/* =====================================================
   SPEAKER APPLICATION
===================================================== */

export const speakerFields: FieldDef[] = [
  {
    kind: "heading",
    label: "About You",
  },
  ...sharedContactFields.map((field): FieldDef =>
    "name" in field && field.name === "company"
      ? { ...field, label: "Organisation" }
      : field
  ),
  {
    kind: "url",
    name: "linkedin",
    label: "LinkedIn Profile",
    placeholder: "https://linkedin.com/in/your-profile",
  },
  {
    kind: "location",
  },
  {
    kind: "textarea",
    name: "bio",
    label: "Short Bio",
    required: true,
    rows: 4,
    placeholder: "Write your professional biography",
    hint:
      "60–150 words, written in the third person.",
  },
  {
    kind: "heading",
    label: "Your Proposal",
  },
  {
    kind: "text",
    name: "topicTitle",
    label: "Proposed Session Title",
    required: true,
    half: false,
    placeholder: "Enter the proposed session title",
  },
  {
    kind: "textarea",
    name: "abstract",
    label: "Abstract",
    required: true,
    rows: 6,
    placeholder: "Describe the proposed session",
    hint:
      "Explain what the audience will learn.",
  },
  {
    kind: "select",
    name: "format",
    label: "Preferred Format",
    required: true,
    half: true,
    options: [
      "Keynote",
      "Panel discussion",
      "Presentation",
      "Workshop / masterclass",
      "Any",
    ],
  },
  {
    kind: "textarea",
    name: "previousSpeaking",
    label: "Previous Speaking Experience",
    rows: 3,
    placeholder:
      "Mention relevant speaking experience, if any",
  },
];

/* =====================================================
   DELEGATE REGISTRATION
===================================================== */

export const delegateFields: FieldDef[] = [
  ...sharedContactFields.map((field): FieldDef =>
    "name" in field && field.name === "company"
      ? { ...field, label: "Organisation" }
      : field
  ),
  {
    kind: "location",
  },
  {
    kind: "checkboxes",
    name: "topicsOfInterest",
    label: "Topics of Interest",
    options: [
      "Vehicle technology",
      "Batteries & cells",
      "Charging & energy",
      "Manufacturing & supply chain",
      "Financing & business models",
      "Policy & regulation",
      "Fleets & logistics",
    ],
  },
  {
    kind: "textarea",
    name: "notes",
    label: "Questions or Notes",
    rows: 3,
    placeholder:
      "Any questions or information to share",
  },
];

/* =====================================================
   CONTACT FORM

   This named export fixes:
   Export contactFields doesn't exist in target module
===================================================== */

export const contactFields: FieldDef[] = [
  {
    kind: "text",
    name: "fullName",
    label: "Full Name",
    required: true,
    autoComplete: "name",
    placeholder: "Enter your full name",
  },
  {
    kind: "email",
    name: "email",
    label: "Email Address",
    required: true,
    autoComplete: "email",
    placeholder: "name@example.com",
  },
  {
    kind: "tel",
    name: "phone",
    label: "Phone Number",
    required: false,
    autoComplete: "tel",
    placeholder: "+91 98765 43210",
  },
  {
    kind: "text",
    name: "company",
    label: "Company",
    required: false,
    autoComplete: "organization",
    placeholder: "Enter your company name",
  },
  {
    kind: "select",
    name: "topic",
    label: "Enquiry Topic",
    required: true,
    options: [
      "Exhibiting",
      "Visiting",
      "Conference",
      "Sponsorship & partnerships",
      "Media & press",
      "My registration or badge",
      "Other",
    ],
  },
  {
    kind: "textarea",
    name: "message",
    label: "Your Message",
    required: true,
    rows: 6,
    maxLength: 3000,
    placeholder: "How can we help you?",
  },
];
