import "server-only";
import { siteConfig } from "@/config/site";

export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** bodyHtml is trusted, server-rendered HTML only; escape all user values first. */
export function layout(opts: {
  preheader: string;
  heading: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
}): string {
  const base = (safeUrl(siteConfig.url) ?? "https://example.invalid").replace(/\/$/, "");
  const logo = `${base}/brand/iiev-9th-edition-logo-trimmed.png`;
  const link = opts.cta && safeUrl(opts.cta.href);
  const button = opts.cta && link
    ? `<p style="margin:24px 0 0"><a href="${esc(link)}" style="display:inline-block;background:#1d8043;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px">${esc(opts.cta.label)}</a></p>`
    : "";
  const displayDomain = new URL(base).hostname;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(opts.heading)}</title></head>
<body style="margin:0;background:#f3f6fa;font-family:Montserrat,'Segoe UI',Arial,sans-serif;color:#001433">
<div style="display:none!important;max-height:0;overflow:hidden;opacity:0">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6fa"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="padding:24px 28px;border-bottom:4px solid #1d8043"><img src="${esc(logo)}" width="170" alt="India International EV Show" style="display:block;width:170px;height:auto"></td></tr>
<tr><td style="padding:28px"><h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#001433">${esc(opts.heading)}</h1>
<div style="font-size:15px;line-height:1.65;color:#33435c">${opts.bodyHtml}</div>${button}</td></tr>
<tr><td style="background:#001433;color:#c9d3e3;padding:18px 28px;font-size:12px;line-height:1.6">
India International EV Show · ${esc(displayDomain)}<br>This is a website form notification. Handle personal information according to the event privacy policy.
</td></tr></table></td></tr></table></body></html>`;
}

function printable(value: unknown): string {
  return Array.isArray(value) ? value.map((v) => String(v ?? "")).join(", ") : String(value ?? "");
}

export function kvTable(rows: [string, unknown][]): string {
  const items = rows.filter(([, v]) => v !== undefined && v !== null && v !== "");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">${items
    .map(([key, value]) => `<tr><td style="padding:8px;border-bottom:1px solid #dde3ec;color:#5b6a80;width:38%;vertical-align:top">${esc(key)}</td><td style="padding:8px;border-bottom:1px solid #dde3ec;color:#001433;overflow-wrap:anywhere;vertical-align:top">${esc(printable(value))}</td></tr>`)
    .join("")}</table>`;
}

export function textFromRows(rows: [string, unknown][]): string {
  return rows.filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([key, value]) => `${key}: ${printable(value)}`).join("\n");
}
