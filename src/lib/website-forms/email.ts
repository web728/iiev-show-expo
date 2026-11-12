import "server-only";
import nodemailer from "nodemailer";
import { siteConfig } from "@/config/site";

export type EmailField = [label: string, value: unknown];

const ADDRESS_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function displayValue(value: unknown): string {
  return Array.isArray(value) ? value.map(String).join(", ") : String(value ?? "");
}

function contactTable(rows: EmailField[]): string {
  return rows
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([label, value], index) => {
      const bg = index % 2 ? "#FFFFFF" : "#F6F9F6";
      return `<tr><td style="padding:12px 16px;width:38%;vertical-align:top;background:${bg};font:600 12px Arial,sans-serif;color:#647569;border-bottom:1px solid #E5ECE7">${escapeHtml(label)}</td><td style="padding:12px 16px;vertical-align:top;background:${bg};font:600 13px Arial,sans-serif;line-height:1.6;color:#102A1E;border-bottom:1px solid #E5ECE7;overflow-wrap:anywhere">${escapeHtml(displayValue(value))}</td></tr>`;
    })
    .join("");
}

export function notificationHtml(args: {
  formLabel: string;
  submittedAt: string;
  rows: EmailField[];
}): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const logo = `${base}/brand/iiev-9th-edition-logo-trimmed.png`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>IIEV Show Website Enquiry</title></head>
<body style="margin:0;padding:0;background:#EDF3EE;font-family:Arial,sans-serif;color:#102A1E">
<div style="display:none;max-height:0;overflow:hidden">New ${escapeHtml(args.formLabel)} from IIEV Show website</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#EDF3EE"><tr><td align="center" style="padding:36px 12px">
<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#fff;border-radius:18px;overflow:hidden">
<tr><td style="background:#091B13;padding:26px 30px"><img src="${escapeHtml(logo)}" alt="India International EV Show" width="160" style="display:block;width:160px;height:auto;background:white;border-radius:7px;padding:6px"></td></tr>
<tr><td style="padding:30px 30px 16px"><p style="margin:0 0 12px;color:#188D46;font-size:11px;font-weight:800;letter-spacing:1.7px">IIEV SHOW · WEBSITE ENQUIRY</p><h1 style="margin:0;font-size:26px;line-height:1.25">${escapeHtml(args.formLabel)}</h1><p style="margin:12px 0 0;font-size:13px;color:#657669">A website form was submitted.</p></td></tr>
<tr><td style="padding:8px 30px 28px"><p style="margin:0 0 14px;font-size:12px;font-weight:700;color:#657669">Submitted: ${escapeHtml(args.submittedAt)} IST</p><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;border:1px solid #E5ECE7">${contactTable(args.rows)}</table></td></tr>
<tr><td style="background:#102A1E;padding:20px 30px;font-size:11px;line-height:1.7;color:#BED1C3">India International EV Show · ${escapeHtml(siteConfig.domain)}<br>Handle personal information according to your privacy policy.</td></tr>
</table></td></tr></table></body></html>`;
}

/** Exactly two organiser addresses; prevents sending the same alert twice to one address. */
export function emailRecipients(): [string, string] {
  const addresses = (process.env.NOTIFY_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (
    addresses.length !== 2 ||
    addresses[0].toLowerCase() === addresses[1].toLowerCase() ||
    addresses.some((address) => !ADDRESS_RE.test(address))
  ) {
    throw new Error("NOTIFY_EMAILS must contain two distinct valid email addresses");
  }
  return [addresses[0], addresses[1]];
}

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined;

function smtp(): ReturnType<typeof nodemailer.createTransport> {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) {
    throw new Error("SMTP_HOST, SMTP_USER, SMTP_PASS and EMAIL_FROM are required");
  }
  const port = Number(process.env.SMTP_PORT ?? "465");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid TCP port");
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      pool: true,
      maxConnections: 2,
      maxMessages: 100,
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 30_000,
    });
  }
  return transporter;
}

export function emailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER &&
    process.env.SMTP_PASS && process.env.EMAIL_FROM,
  );
}

export async function sendLeadNotification(args: {
  to: string;
  label: string;
  company: string;
  name: string;
  submittedAt: string;
  rows: EmailField[];
  replyTo?: string;
}): Promise<void> {
  if (!ADDRESS_RE.test(args.to)) throw new Error("Invalid notification recipient");

  const subjectName = (args.company || args.name || "New Enquiry")
    .replace(/[\r\n\x00-\x1f]/g, " ")
    .slice(0, 80);
  const formLabel = args.label.replace(/[\r\n\x00-\x1f]/g, " ").slice(0, 100);
  const subject = `[IIEV Show Website] ${formLabel} — ${subjectName}`;
  const text = [
    subject,
    `Submitted: ${args.submittedAt} IST`,
    "",
    ...args.rows
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([label, value]) => `${label}: ${displayValue(value)}`),
  ].join("\n");

  const sent = await smtp().sendMail({
    from: process.env.EMAIL_FROM,
    to: args.to,
    replyTo: args.replyTo && ADDRESS_RE.test(args.replyTo) ? args.replyTo : undefined,
    subject,
    text,
    html: notificationHtml({ formLabel, submittedAt: args.submittedAt, rows: args.rows }),
  });

  if (sent.rejected.length > 0 || !sent.accepted.length) {
    throw new Error(`SMTP did not accept recipient ${args.to}`);
  }
}
