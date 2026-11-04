import "server-only";
import { siteConfig } from "@/config/site";

// Brand-consistent, table-based HTML emails (Montserrat with safe fallbacks).
// Colours from the EV Stylescape.

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function layout(opts: { preheader: string; heading: string; bodyHtml: string; cta?: { label: string; href: string } }) {
  const logo = `${siteConfig.url}/brand/iiev-9th-edition-logo-trimmed.png`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(opts.heading)}</title></head>
<body style="margin:0;background:#f3f6fa;font-family:Montserrat,Segoe UI,Arial,sans-serif;color:#001433">
<span style="display:none;max-height:0;overflow:hidden">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6fa;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="padding:24px 28px;border-bottom:4px solid #1d8043"><img src="${logo}" width="170" alt="India International EV Show — 9th Edition" style="display:block;height:auto"></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#001433">${esc(opts.heading)}</h1>
<div style="font-size:15px;line-height:1.65;color:#33435c">${opts.bodyHtml}</div>
${opts.cta ? `<p style="margin:24px 0 0"><a href="${esc(opts.cta.href)}" style="display:inline-block;background:#1d8043;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px">${esc(opts.cta.label)}</a></p>` : ""}
</td></tr>
<tr><td style="background:#001433;color:#c9d3e3;padding:18px 28px;font-size:12px;line-height:1.6">
India International EV Show · ${esc(siteConfig.url.replace(/^https?:\/\//, ""))}<br>
You are receiving this because you submitted a form on our website. We never sell your data.
</td></tr></table></td></tr></table></body></html>`;
}

export function kvTable(rows: [string, unknown][]) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">${rows
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #dde3ec;color:#5b6a80;width:38%;vertical-align:top">${esc(k)}</td><td style="padding:6px 8px;border-bottom:1px solid #dde3ec;color:#001433">${esc(Array.isArray(v) ? v.join(", ") : v)}</td></tr>`,
    )
    .join("")}</table>`;
}

export function textFromRows(rows: [string, unknown][]) {
  return rows
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
    .join("\n");
}

export { esc };
