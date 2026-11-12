import { COUNTRIES } from "@/config/options";
import type { FieldDef } from "./smart-form";

const commonContact: FieldDef[] = [
  { kind: "text", name: "fullName", label: "Full Name", required: true, autoComplete: "name", maxLength: 100 },
  { kind: "email", name: "email", label: "Email Address", required: true, autoComplete: "email", maxLength: 160 },
  // The phone code is rendered as a separate selector by SmartForm.
  { kind: "tel", name: "phone", label: "Mobile Number", required: true, maxLength: 24, placeholder: "98765 43210" },
];
const businessContact: FieldDef[] = [
  { kind: "text", name: "designation", label: "Designation", required: true, autoComplete: "organization-title", maxLength: 100 },
  { kind: "text", name: "company", label: "Company / Organisation", required: true, autoComplete: "organization", maxLength: 160 },
];
const countryField: FieldDef = {
  kind: "select", name: "country", label: "Country", required: true, options: COUNTRIES,
};

export const visitorFields: FieldDef[] = [
  ...commonContact, ...businessContact,
  { kind: "text", name: "industry", label: "Business / Industry", maxLength: 80 },
  countryField,
];
export const stallFields: FieldDef[] = [
  ...commonContact, ...businessContact, countryField,
  { kind: "textarea", name: "productDescription", label: "Products & Services", required: true, maxLength: 1500, rows: 5 },
  { kind: "text", name: "areaPreference", label: "Stall Area Preference", maxLength: 40 },
];
export const sponsorshipFields: FieldDef[] = [
  ...commonContact, ...businessContact,
  { kind: "location" },
  { kind: "url", name: "website", label: "Website", maxLength: 200, placeholder: "example.com" },
  { kind: "checkboxes", name: "interests", label: "Sponsorship Interests", required: true,
    options: ["Title Sponsorship", "Conference Sponsorship", "Brand Visibility", "Digital Promotion", "Other"] },
  { kind: "textarea", name: "objectives", label: "Sponsorship Objectives", required: true, maxLength: 1500, rows: 5 },
  { kind: "text", name: "budgetRange", label: "Approximate Budget", maxLength: 60 },
];
export const partnerFields: FieldDef[] = [
  ...commonContact, ...businessContact,
  { kind: "location" },
  { kind: "url", name: "website", label: "Website", maxLength: 200, placeholder: "example.com" },
  { kind: "text", name: "partnerType", label: "Partnership Type", required: true, maxLength: 60 },
  { kind: "textarea", name: "proposal", label: "Partnership Proposal", required: true, maxLength: 1500, rows: 5 },
];
export const speakerFields: FieldDef[] = [
  ...commonContact, ...businessContact,
  { kind: "location" },
  { kind: "url", name: "linkedin", label: "LinkedIn Profile URL", maxLength: 200, placeholder: "linkedin.com/in/your-name" },
  { kind: "text", name: "topicTitle", label: "Proposed Topic", required: true, maxLength: 160 },
  { kind: "textarea", name: "abstract", label: "Session Abstract", required: true, maxLength: 2000, rows: 6 },
  { kind: "text", name: "format", label: "Preferred Session Format", required: true, maxLength: 40 },
  { kind: "textarea", name: "bio", label: "Short Bio", required: true, maxLength: 1200, rows: 5 },
  { kind: "textarea", name: "previousSpeaking", label: "Previous Speaking Experience", maxLength: 800, rows: 3 },
];
export const delegateFields: FieldDef[] = [
  ...commonContact, ...businessContact,
  { kind: "location" },
  { kind: "checkboxes", name: "topicsOfInterest", label: "Topics of Interest",
    options: ["Electric Vehicles", "Charging Infrastructure", "Battery Technology", "Policy & Regulations", "Fleet Electrification"] },
  { kind: "textarea", name: "notes", label: "Notes", maxLength: 800, rows: 3 },
];
export const contactFields: FieldDef[] = [
  { kind: "text", name: "fullName", label: "Full Name", required: true, autoComplete: "name", maxLength: 100 },
  { kind: "email", name: "email", label: "Email Address", required: true, autoComplete: "email", maxLength: 160 },
  { kind: "tel", name: "phone", label: "Phone Number", maxLength: 24, placeholder: "Mobile number" },
  { kind: "text", name: "company", label: "Company / Organisation", maxLength: 160 },
  { kind: "text", name: "topic", label: "Enquiry Topic", required: true, maxLength: 60 },
  { kind: "textarea", name: "message", label: "Message", required: true, maxLength: 3000, rows: 6 },
];
