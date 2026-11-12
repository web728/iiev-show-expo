import "server-only";
import { emailRecipients, sendLeadNotification, type EmailField } from "./email";
import { FORM_LABELS, formatIst, websiteSheetRow } from "./sheets-sync";
import type { WebsiteDraftData, WebForm } from "./draft-model";

/** Legacy helper name kept for existing imports. */
export function recipients(): string[] {
  return [...emailRecipients()];
}

/** Called ONLY on final submission; drafts must never trigger organiser emails. */
export async function sendWebsiteNotification(args: {
  recipient: string;
  form: WebForm;
  data: WebsiteDraftData;
  submittedAt: Date;
  ref: string;
}): Promise<void> {
  const { recipient, form, data, submittedAt, ref } = args;
  const row = websiteSheetRow(form, data, "submitted", submittedAt, { finalRef: ref });
  const rows: EmailField[] = [
    ["Reference", ref],
    ["Form", FORM_LABELS[form]],
    ["Submitted", `${formatIst(submittedAt)} IST`],
    ["Company", row[3]],
    ["Contact Person", row[4]],
    ["Designation", row[5]],
    ["Email", row[6]],
    ["Mobile / WhatsApp", row[7]],
    ["Phone Country", row[19]],
    ["Website", row[8]],
    ["Address", row[9]],
    ["Country", row[10]],
    ["Area of Interest", row[11]],
    ["Message / Details", row[13]],
  ];

  await sendLeadNotification({
    to: recipient,
    label: FORM_LABELS[form],
    company: typeof data.company === "string" ? data.company : "",
    name: typeof data.fullName === "string" ? data.fullName : "",
    submittedAt: formatIst(submittedAt),
    rows,
    replyTo: typeof data.email === "string" ? data.email : undefined,
  });
}
