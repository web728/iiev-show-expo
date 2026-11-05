import "server-only";
import { JWT } from "google-auth-library";

export const ENQUIRY_TAB = "Website Enquries"; // preserve the exact tab spelling

let client: JWT | null = null;

export function sanitizeCell(value: unknown): string {
  if (value == null) return "";
  const text = (Array.isArray(value) ? value.join(", ") : String(value))
    .replace(/[\r\n]+/g, " ")
    .slice(0, 2000);
  return /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
}

function credentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_BASE64 is missing");
  const decoded = JSON.parse(Buffer.from(raw.trim(), "base64").toString("utf8")) as {
    client_email?: string;
    private_key?: string;
  };
  if (!decoded.client_email || !decoded.private_key) {
    throw new Error("Service account JSON must contain client_email and private_key");
  }
  return decoded;
}

function jwt() {
  if (!client) {
    const data = credentials();
    client = new JWT({
      email: data.client_email,
      key: data.private_key.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }
  return client;
}

export async function appendWebsiteEnquiry(row: unknown[]): Promise<string> {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId) throw new Error("GOOGLE_SHEETS_ID is missing");
  if (row.length !== 20) throw new Error("Website enquiry must have exactly 20 columns");
  const range = encodeURIComponent(`'${ENQUIRY_TAB}'!A:T`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const result = await jwt().request<{ updates?: { updatedRange?: string } }>({
    url,
    method: "POST",
    data: { values: [row.map(sanitizeCell)] },
  });
  return result.data.updates?.updatedRange ?? "";
}
