import "server-only";
import { JWT } from "google-auth-library";

export type SheetsResult = { status: "appended"; range?: string } | { status: "not_configured" };

/** Prevent CSV/formula injection when values are opened in Sheets/Excel. */
export function sanitizeCell(value: unknown): string {
  if (value == null) return "";
  let s = Array.isArray(value) ? value.join(", ") : value instanceof Date ? value.toISOString() : String(value);
  s = s.replace(/\r?\n/g, " ").slice(0, 2000);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return s;
}

let client: JWT | null = null;

export function sheetsConfigured(): boolean {
  return Boolean(process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
}

function getClient(): JWT {
  if (!client) {
    client = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      // Keys in env vars usually have escaped newlines.
      key: (process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "").replace(/\\n/g, "\n"),
      // Least privilege: Sheets only (sheet must be shared with the service account).
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }
  return client;
}

/** Append one row to the named tab (e.g. "Stall Enquiries"). */
export async function appendRow(tab: string, row: unknown[]): Promise<SheetsResult> {
  if (!sheetsConfigured()) return { status: "not_configured" };
  const sheetId = process.env.GOOGLE_SHEETS_ID!;
  const range = encodeURIComponent(`'${tab}'!A1`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const res = await getClient().request<{ updates?: { updatedRange?: string } }>({
    url,
    method: "POST",
    data: { values: [row.map(sanitizeCell)] },
  });
  return { status: "appended", range: res.data.updates?.updatedRange };
}
