import "server-only";
import { JWT } from "google-auth-library";
import type { WebsiteDraftData, WebForm } from "./draft-model";

const TAB = "Website Enquries"; // Exact spelling from your existing Google Sheet.
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
  const parsed = JSON.parse(Buffer.from(encoded, "base64").toString("utf8")) as { client_email: string; private_key: string };
  return (jwt = new JWT({ email: parsed.client_email, key: parsed.private_key.replace(/\\n/g, "\n"), scopes: ["https://www.googleapis.com/auth/spreadsheets"] }));
}
function cell(input: unknown): string {
  const s = (Array.isArray(input) ? input.join(", ") : String(input ?? "")).replace(/[\r\n]+/g, " ").slice(0, 2000);
  return /^\s*[=+\-@\t]/.test(s) ? `'${s}` : s;
}
function area(d: WebsiteDraftData): string {
  return [d.industry, d.areaPreference, d.interests, d.sectorInterests, d.topicsOfInterest, d.segments]
    .flatMap((v) => Array.isArray(v) ? v : v ? [v] : []).join(" | ");
}
export function websiteSheetRow(form: WebForm, data: WebsiteDraftData, state: "draft" | "submitted", at: Date): string[] {
  const details = [dValue("Products & Services", data.productDescription), dValue("Topic", data.topic), dValue("Objectives", data.objectives),
    dValue("Proposal", data.proposal), dValue("Session Title", data.topicTitle), dValue("Message", data.message), dValue("Notes", data.notes)]
    .filter(Boolean).join(" | ");
  return [
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", dateStyle: "short", timeStyle: "medium" }).format(at),
    "IIEV Show Website", LABEL[form], data.company ?? "", data.fullName ?? "", data.designation ?? "",
    data.email ?? "", data.phone ?? "", data.website ?? "", [data.city, data.state].filter(Boolean).join(", "),
    data.country ?? "", area(data), "Website", details, "", state === "draft" ? "DRAFT" : "SUBMITTED",
    "", "", "", "",
  ].map(cell);
}
function dValue(label: string, value: unknown) { return value ? `${label}: ${String(value)}` : ""; }
function base() {
  const id = process.env.GOOGLE_SHEETS_ID;
  if (!id) throw new Error("GOOGLE_SHEETS_ID missing");
  return `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(id)}/values/`;
}
export async function appendWebsiteRow(row: string[]): Promise<string> {
  if (row.length !== 20) throw new Error("Expected exactly 20 sheet values");
  const range = encodeURIComponent(`'${TAB}'!A:T`);
  const url = `${base()}${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const response = await googleClient().request<{ updates?: { updatedRange?: string } }>({ url, method: "POST", data: { values: [row] } });
  const updatedRange = response.data.updates?.updatedRange;
  if (!updatedRange || !/!A\d+:T\d+$/.test(updatedRange)) throw new Error("Google Sheets did not return a valid row range");
  return updatedRange;
}
export async function updateWebsiteRow(range: string, row: string[]): Promise<void> {
  if (row.length !== 20 || !/^'?(?:Website Enquries)'?!A\d+:T\d+$/.test(range)) {
    throw new Error("Invalid Google Sheets row range");
  }
  const url = `${base()}${encodeURIComponent(range)}?valueInputOption=RAW`;
  await googleClient().request({ url, method: "PUT", data: { values: [row] } });
}
