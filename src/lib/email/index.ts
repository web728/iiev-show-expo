import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { log } from "@/lib/log";

export type EmailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer; contentType: string }[];
};

export type EmailResult = { status: "sent"; id?: string } | { status: "not_configured" };

export interface EmailAdapter {
  name: string;
  configured(): boolean;
  send(msg: EmailMessage): Promise<EmailResult>;
}

/**
 * SMTP adapter — works with Gmail (smtp.gmail.com:465 + App Password) as the
 * initial provider, or any transactional provider's SMTP relay (SES, Postmark,
 * SendGrid, Brevo, Zoho ZeptoMail) by changing env vars only.
 */
class SmtpAdapter implements EmailAdapter {
  name = "smtp";
  private transporter: Transporter | null = null;
  configured() {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_FROM);
  }
  private get t() {
    if (!this.transporter) {
      const port = Number(process.env.SMTP_PORT || 465);
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        pool: true,
        maxConnections: 3,
        maxMessages: 100,
      });
    }
    return this.transporter;
  }
  async send(msg: EmailMessage): Promise<EmailResult> {
    if (!this.configured()) return { status: "not_configured" };
    const info = await this.t.sendMail({
      from: process.env.EMAIL_FROM,
      to: msg.to,
      replyTo: msg.replyTo,
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
      attachments: msg.attachments,
    });
    log.info("email.sent", { adapter: this.name, messageId: info.messageId });
    return { status: "sent", id: info.messageId };
  }
}

let adapter: EmailAdapter | null = null;
export function getEmailAdapter(): EmailAdapter {
  if (!adapter) adapter = new SmtpAdapter();
  return adapter;
}

/** Two configurable organiser recipients (env or CMS SiteSettings). */
export function envNotifyRecipients(): string[] {
  return (process.env.NOTIFY_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);
}
