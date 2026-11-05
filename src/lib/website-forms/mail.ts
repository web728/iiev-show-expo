import "server-only";
import nodemailer from "nodemailer";
import { websiteSheetRow } from "./sheets-sync";
import type { WebsiteDraftData, WebForm } from "./draft-model";

const LABEL: Record<WebForm, string> = {
  stall: "Exhibitor Enquiry", visitor: "Visitor Registration", contact: "Contact Enquiry",
  sponsorship: "Sponsorship Enquiry", partner: "Partnership Enquiry", speaker: "Speaker Application",
  delegate: "Delegate Registration", media: "Media Enquiry", brochure: "Brochure Download",
};
const esc = (value: unknown) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
let transport: ReturnType<typeof nodemailer.createTransport> | undefined;
function smtp() {
  if (transport) return transport;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.EMAIL_FROM) throw new Error("SMTP configuration missing");
  const port = Number(process.env.SMTP_PORT || 465);
  transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }, pool: true, maxConnections: 2 });
  return transport;
}
export function recipients(): string[] {
  const list = (process.env.NOTIFY_EMAILS || "").split(",").map((value) => value.trim()).filter(Boolean);
  if (list.length !== 2 || list[0].toLowerCase() === list[1].toLowerCase() || list.some((value) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) {
    throw new Error("NOTIFY_EMAILS must contain two distinct valid email addresses");
  }
  return list;
}
export async function sendWebsiteNotification(args: {
  recipient: string; form: WebForm; data: WebsiteDraftData; submittedAt: Date; ref: string;
}) {
  const { recipient, form, data, submittedAt, ref } = args;
  const label = LABEL[form];
  const contact = data.company || data.fullName || "Website Visitor";
  const subject = `[IIEV Show Website] ${label} — ${contact}`.slice(0, 180).replace(/[\r\n]/g, " ");
  const row = websiteSheetRow(form, data, "submitted", submittedAt);
  const fields: [string, string][] = [
    ["Reference", ref], ["Form", label], ["Date", row[0] ?? ""], ["Company", row[3] ?? ""],
    ["Contact Person", row[4] ?? ""], ["Designation", row[5] ?? ""], ["Email", row[6] ?? ""],
    ["Mobile / WhatsApp", row[7] ?? ""], ["Website", row[8] ?? ""], ["Address", row[9] ?? ""],
    ["Country", row[10] ?? ""], ["Area of Interest", row[11] ?? ""], ["Message / Details", row[13] ?? ""],
  ];
  const filtered = fields.filter(([, value]) => Boolean(value));
  const table = filtered.map(([name, value]) => `<tr><td style="padding:12px 15px;border-bottom:1px solid #e6eee8;color:#68796d;width:37%;vertical-align:top;font-size:12px;font-weight:600">${esc(name)}</td><td style="padding:12px 15px;border-bottom:1px solid #e6eee8;color:#102a1e;font-size:13px;font-weight:600;overflow-wrap:anywhere">${esc(value)}</td></tr>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body style="margin:0;background:#eef4ef;padding:28px 12px;font-family:Arial,Helvetica,sans-serif;color:#102a1e"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:630px;margin:auto;background:white;border:1px solid #dce7de;border-radius:16px;overflow:hidden"><tr><td style="background:#091b13;padding:28px 32px;border-top:4px solid #23a455"><div style="color:#7be19e;font-size:11px;letter-spacing:2px;font-weight:800">INDIA INTERNATIONAL EV SHOW</div><h1 style="color:#ffffff;font-size:24px;line-height:1.3;margin:14px 0 4px">New ${esc(label)}</h1><p style="color:#b1c8b8;font-size:13px;margin:8px 0 0">Submitted through the official IIEV Show website</p></td></tr><tr><td style="padding:28px 28px 8px"><p style="font-size:14px;color:#526357;line-height:1.7;margin:0 0 20px">A new website enquiry has been submitted. Details are listed below.</p><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #e6eee8">${table}</table></td></tr><tr><td style="padding:22px 28px 30px"><div style="padding:14px 17px;background:#f0faf2;color:#376446;font-size:12px;line-height:1.6;border-radius:8px">This email contains personal information. Use it only for the purpose of handling this enquiry.</div></td></tr><tr><td style="background:#102a1e;color:#a8c1b0;padding:18px 28px;font-size:11px">IIEV Show · Official Website Notification</td></tr></table></body></html>`;
  const text = `IIEV Show Website — ${label}\n\n` + filtered.map(([name, value]) => `${name}: ${value}`).join("\n");
  await smtp().sendMail({ from: process.env.EMAIL_FROM, to: recipient, replyTo: data.email || undefined, subject, text, html });
}
