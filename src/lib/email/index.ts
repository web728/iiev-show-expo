import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { log } from "@/lib/log";

export type EmailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType: string;
  }[];
};

export type EmailResult =
  | { status: "sent"; id?: string }
  | { status: "not_configured" };

export interface EmailAdapter {
  name: string;
  configured(): boolean;
  send(msg: EmailMessage): Promise<EmailResult>;
}

const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
const validEmail = (value: string): boolean => EMAIL_RE.test(value) && value.length <= 254;

/** Compatible with Gmail app-password SMTP and transactional SMTP relays. */
class SmtpAdapter implements EmailAdapter {
  readonly name = "smtp";
  private transporter: Transporter | null = null;

  configured(): boolean {
    const port = Number(process.env.SMTP_PORT || 465);
    return Boolean(
      process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim() &&
      process.env.EMAIL_FROM?.trim() &&
      Number.isSafeInteger(port) && port >= 1 && port <= 65535,
    );
  }

  private getTransporter(): Transporter {
    if (!this.configured()) throw new Error("SMTP configuration incomplete");
    if (!this.transporter) {
      const port = Number(process.env.SMTP_PORT || 465);
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST!.trim(),
        port,
        secure: port === 465,
        requireTLS: port !== 465,
        auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
        pool: true,
        maxConnections: 2,
        maxMessages: 100,
        connectionTimeout: 15_000,
        greetingTimeout: 15_000,
        socketTimeout: 30_000,
      });
    }
    return this.transporter;
  }

  async send(msg: EmailMessage): Promise<EmailResult> {
    if (!this.configured()) return { status: "not_configured" };
    const recipients = Array.isArray(msg.to) ? msg.to : [msg.to];
    if (!recipients.length || recipients.length > 20 || !recipients.every(validEmail)) {
      throw new Error("Invalid email recipient list");
    }
    if (msg.replyTo && !validEmail(msg.replyTo)) throw new Error("Invalid reply-to email");
    const subject = msg.subject.replace(/[\r\n\u0000-\u001f\u007f]/g, " ").trim().slice(0, 180);
    if (!subject || !msg.text || !msg.html) throw new Error("Email subject, text and HTML are required");

    const attachments = msg.attachments ?? [];
    if (attachments.length > 5 || attachments.some((a) =>
      !Buffer.isBuffer(a.content) || a.content.length > 10_000_000 ||
      !a.filename || /[\r\n\/\\]/.test(a.filename) || !a.contentType,
    )) throw new Error("Invalid email attachments");

    // Sender must be verified by the SMTP provider. Never use user email as `from`.
    const info = await this.getTransporter().sendMail({
      from: process.env.EMAIL_FROM,
      to: recipients.join(", "),
      replyTo: msg.replyTo,
      subject,
      text: msg.text,
      html: msg.html,
      attachments,
    });
    if (info.rejected?.length) throw new Error("SMTP rejected one or more recipients");
    log.info("email.sent", { adapter: this.name, messageId: info.messageId });
    return { status: "sent", id: info.messageId };
  }
}

let adapter: EmailAdapter | null = null;
export function getEmailAdapter(): EmailAdapter {
  if (!adapter) adapter = new SmtpAdapter();
  return adapter;
}

/** Exactly two different, valid organiser addresses, or an error. */
export function envNotifyRecipients(): string[] {
  const items = (process.env.NOTIFY_EMAILS ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  if (items.length !== 2 || items[0].toLowerCase() === items[1].toLowerCase() ||
      !items.every(validEmail)) {
    throw new Error("NOTIFY_EMAILS must contain exactly two distinct valid addresses");
  }
  return items;
}
