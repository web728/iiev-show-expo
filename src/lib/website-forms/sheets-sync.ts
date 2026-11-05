import "server-only";
import { JWT } from "google-auth-library";
import type { WebsiteDraftData, WebForm } from "./draft-model";

const TAB = "Website Enquries"; // Intentional: existing tab name
const LABEL: Record<WebForm, string> = {
  stall: "Exhibitor Enquiry", visitor: "Visitor Registration", contact: "Contact Enquiry",
  sponsorship: "Sponsorship Enquiry", partner: "Partnership Enquiry", speaker: "Speaker Application",
  delegate: "Delegate Registration", media: "Media Enquiry", brochure: "Brochure Download",
};
let jwt: JWT | undefined;
function googleClient(): JWT {
  if (jwt) return jwt;
  const encoded = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
  if (!encoded) throw new Error("GOOGLE_SERVICE_ACCOUNT_BASE64 missing");
  const parsed: unknown = JSON.parse(Buffer.from(encoded.trim(), "base64").toString("utf8"));
  if (!parsed || typeof parsed !== "object" || !("client_email" in parsed) || !("private_key" in parsed) ||
      typeof parsed.client_email !== "string" || typeof parsed.private_key !== "string" ||
      !parsed.client_email || !parsed.private_key) throw new Error("Invalid Google service account credentials");
  jwt = new JWT({ email: parsed.client_email, key: parsed.private_key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
  return jwt;
}
function cell(input: unknown): string {
  const value = (Array.isArray(input) ? input.join(", ") : String(input ?? "")).replace(/[\r\n]+/g, " ").slice(0, 2000);
  return /^\s*[=+\-@\t]/.test(value) ? `'${value}` : value;
}
function area(data: WebsiteDraftData): string {
  return [data.industry, data.areaPreference, data.interests, data.sectorInterests, data.topicsOfInterest, data.segments]
    .flatMap((value) => Array.isArray(value) ? value : value ? [value] : []).join(" | ");
}
function detail(label: string, value: unknown): string { return value ? `${label}: ${String(value)}` : ""; }
export function websiteSheetRow(form: WebForm, data: WebsiteDraftData, state: "draft" | "submitted", at: Date): string[] {
  const details = [detail("Products & Services", data.productDescription), detail("Topic", data.topic),
    detail("Objectives", data.objectives), detail("Proposal", data.proposal), detail("Session Title", data.topicTitle),
    detail("Message", data.message), detail("Notes", data.notes)].filter(Boolean).join(" | ");
  return [
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", dateStyle: "short", timeStyle: "medium" }).format(at),
    "IIEV Show Website", LABEL[form], data.company ?? "", data.fullName ?? "", data.designation ?? "",
    data.email ?? "", data.phone ?? "", data.website ?? "", [data.city, data.state].filter(Boolean).join(", "),
    data.country ?? "", area(data), "Website", details, "", state === "draft" ? "DRAFT" : "SUBMITTED", "", "", "", "",
  ].map(cell);
}
function base() {
  const id = process.env.GOOGLE_SHEETS_ID;
  if (!id) throw new Error("GOOGLE_SHEETS_ID missing");
  return `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(id)}/values/`;
}
export async function appendWebsiteRow(row: string[]): Promise<string> {
  if (row.length !== 20) throw new Error("Expected exactly 20 sheet values");
  const range = encodeURIComponent(`'${TAB}'!A:T`);
  const url = `${base()}${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const response = await googleClient().request<{ updates?: { updatedRange?: string } }>({ url, method: "POST", data: { values: [row.map(cell)] } });
  const updatedRange = response.data.updates?.updatedRange;
  if (!updatedRange || !/^'?Website Enquries'?!A\d+:T\d+$/.test(updatedRange)) throw new Error("Google Sheets did not return a valid row range");
  return updatedRange;
}
export async function updateWebsiteRow(range: string, row: string[]): Promise<void> {
  if (row.length !== 20 || !/^'?Website Enquries'?!A\d+:T\d+$/.test(range)) throw new Error("Invalid Google Sheets row range");
  const url = `${base()}${encodeURIComponent(range)}?valueInputOption=RAW`;
  await googleClient().request({ url, method: "PUT", data: { values: [row.map(cell)] } });
}
