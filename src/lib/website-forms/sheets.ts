import "server-only";
import { JWT } from "google-auth-library";

// Keep the current misspelling by default: this must match the EXISTING tab name.
// Or set GOOGLE_SHEETS_TAB to the exact name of your sheet tab.
export const ENQUIRY_TAB = process.env.GOOGLE_SHEETS_TAB?.trim() || "Website Enquries";

const COLUMN_COUNT = 20;
const KEY_COLUMN = "O"; // 15th column, index 14: stable submissionKey
let client: JWT | undefined;

export function sanitizeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const valueText = (Array.isArray(value) ? value.join(", ") : String(value))
    .replace(/[\r\n\t]+/g, " ")
    .slice(0, 2_000);
  // Sheets writes use RAW; the prefix additionally protects CSV exports.
  if (/^\+[1-9]\d{7,14}$/.test(valueText)) return valueText;
  return /^\s*[=+\-@]/.test(valueText) ? `'${valueText}` : valueText;
}

function credentials(): { client_email: string; private_key: string } {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64?.trim();
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_BASE64 is missing");

  let decoded: unknown;
  try {
    decoded = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
  } catch {
    throw new Error("Invalid base64 service-account JSON");
  }
  if (
    !decoded || typeof decoded !== "object" ||
    !("client_email" in decoded) || !("private_key" in decoded) ||
    typeof decoded.client_email !== "string" ||
    typeof decoded.private_key !== "string" ||
    !decoded.client_email || !decoded.private_key
  ) {
    throw new Error("Service account JSON must contain client_email and private_key");
  }
  return { client_email: decoded.client_email, private_key: decoded.private_key };
}

function jwt(): JWT {
  if (!client) {
    const serviceAccount = credentials();
    client = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }
  return client;
}

function spreadsheetUrl(a1Range: string): string {
  const sheetId = process.env.GOOGLE_SHEETS_ID?.trim();
  if (!sheetId) throw new Error("GOOGLE_SHEETS_ID is missing");
  return `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(a1Range)}`;
}

function sheetRange(columns: string): string {
  const quoted = ENQUIRY_TAB.replace(/'/g, "''");
  return `'${quoted}'!${columns}`;
}

function checkRow(row: unknown[]): string[] {
  if (row.length !== COLUMN_COUNT) {
    throw new Error(`Website enquiry must have exactly ${COLUMN_COUNT} columns`);
  }
  return row.map(sanitizeCell);
}

/** Legacy append API. For draft/final flow use upsertWebsiteEnquiry instead. */
export async function appendWebsiteEnquiry(row: unknown[]): Promise<string> {
  const normalized = checkRow(row);
  const url = `${spreadsheetUrl(sheetRange("A:T"))}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const result = await jwt().request<{ updates?: { updatedRange?: string } }>({
    url,
    method: "POST",
    data: { majorDimension: "ROWS", values: [normalized] },
    timeout: 30_000,
  });
  const updatedRange = result.data.updates?.updatedRange;
  if (!updatedRange) throw new Error("Google Sheets append did not return updatedRange");
  return updatedRange;
}

function rowNumber(a1: string): number | undefined {
  const match = a1.match(/!A(\d+):T(\d+)$/i);
  if (!match || match[1] !== match[2]) return undefined;
  const n = Number(match[1]);
  return Number.isSafeInteger(n) && n >= 1 ? n : undefined;
}

/** Scan the dedicated key column: detects rows appended before a network timeout. */
export async function findWebsiteEnquiryRange(
  submissionKey: string,
): Promise<string | undefined> {
  const result = await jwt().request<{ values?: unknown[][] }>({
    url: spreadsheetUrl(sheetRange(`${KEY_COLUMN}1:${KEY_COLUMN}`)),
    method: "GET",
    timeout: 30_000,
  });
  const rows = result.data.values ?? [];
  for (let index = 0; index < rows.length; index += 1) {
    if (String(rows[index]?.[0] ?? "") === submissionKey) {
      return sheetRange(`A${index + 1}:T${index + 1}`);
    }
  }
  return undefined;
}

async function rangeStillMatchesKey(range: string, submissionKey: string): Promise<boolean> {
  const number = rowNumber(range);
  if (!number) return false;
  const result = await jwt().request<{ values?: unknown[][] }>({
    url: spreadsheetUrl(sheetRange(`${KEY_COLUMN}${number}:${KEY_COLUMN}${number}`)),
    method: "GET",
    timeout: 30_000,
  });
  return String(result.data.values?.[0]?.[0] ?? "") === submissionKey;
}

export async function updateWebsiteEnquiry(row: unknown[], range: string): Promise<void> {
  checkRow(row);
  const number = rowNumber(range);
  if (!number) throw new Error("Invalid Google Sheets row range");
  const expectedRange = sheetRange(`A${number}:T${number}`);
  await jwt().request({
    url: `${spreadsheetUrl(expectedRange)}?valueInputOption=RAW`,
    method: "PUT",
    data: { majorDimension: "ROWS", values: [checkRow(row)] },
    timeout: 30_000,
  });
}

/**
 * One physical Sheet row per submissionKey, as long as all writers use this method
 * and the MongoDB sheet lease. Never use appendWebsiteEnquiry directly for autosave.
 * A crash after Google writes but before Mongo commits is recovered by key lookup.
 */
export async function upsertWebsiteEnquiry(
  row: unknown[],
  submissionKey: string,
  previouslySavedRange?: string,
): Promise<string> {
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(submissionKey)) {
    throw new Error("Invalid submission key");
  }
  const normalized = checkRow(row);
  if (normalized[14] !== submissionKey) {
    throw new Error("Sheet row column O must contain its submissionKey");
  }

  // Do not rely exclusively on stored row coordinates if rows were moved manually.
  let range = previouslySavedRange;
  if (range && !(await rangeStillMatchesKey(range, submissionKey))) range = undefined;
  if (!range) range = await findWebsiteEnquiryRange(submissionKey);

  if (range) {
    await updateWebsiteEnquiry(normalized, range);
    return range;
  }
  return appendWebsiteEnquiry(normalized);
}
