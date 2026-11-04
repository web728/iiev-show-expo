import "server-only";
import type { AdminResource } from "./resources";
import { slugify } from "@/lib/format";

/** "2027-11-11T10:00" entered in IST → Date. */
export function istLocalToDate(v: string): Date | null {
  if (!v) return null;
  const d = new Date(`${v.length === 16 ? `${v}:00` : v}+05:30`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Date → "2027-11-11T10:00" in IST for <input type="datetime-local">. */
export function dateToIstLocal(d: Date | string | null | undefined): string {
  if (!d) return "";
  const dt = new Date(d);
  const ist = new Date(dt.getTime() + 5.5 * 3600_000);
  return ist.toISOString().slice(0, 16);
}

const SAFE_URL = /^(https?:\/\/|\/)[^\s<>"']*$/i;

export function parseResourceForm(res: AdminResource, fd: FormData): { data: Record<string, unknown>; errors: Record<string, string> } {
  const data: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  for (const f of res.fields) {
    const raw = fd.get(f.name);
    const str = typeof raw === "string" ? raw.trim() : "";
    switch (f.type) {
      case "boolean":
        data[f.name] = raw === "on" || raw === "true";
        break;
      case "number":
        data[f.name] = str === "" ? undefined : Number(str);
        if (str !== "" && Number.isNaN(data[f.name])) errors[f.name] = "Must be a number";
        break;
      case "multiselect":
        data[f.name] = fd.getAll(f.name).map(String).filter(Boolean);
        break;
      case "tags":
        data[f.name] = str.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        break;
      case "lines":
        data[f.name] = str
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => {
            const parts = l.split("|").map((p) => p.trim());
            const obj: Record<string, unknown> = {};
            (f.lineKeys ?? []).forEach((k, i) => {
              const v = parts[i];
              if (v === undefined || v === "") return;
              obj[k] = f.numberKeys?.includes(k) ? Number(v) : v;
            });
            return obj;
          });
        break;
      case "date":
        data[f.name] = str ? new Date(`${str}T00:00:00+05:30`) : undefined;
        break;
      case "datetime":
        data[f.name] = str ? istLocalToDate(str) ?? undefined : undefined;
        if (str && !istLocalToDate(str)) errors[f.name] = "Invalid date/time";
        break;
      case "url":
      case "image":
        data[f.name] = str || undefined;
        if (str && !SAFE_URL.test(str)) errors[f.name] = "Must be an https:// URL or a /path";
        break;
      case "select":
        data[f.name] = str || undefined;
        if (f.name === "statusCode" && str) data[f.name] = Number(str);
        break;
      default:
        data[f.name] = str || undefined;
    }
    if (f.slugFrom && !data[f.name]) {
      const src = fd.get(f.slugFrom);
      if (typeof src === "string" && src.trim()) data[f.name] = slugify(src);
    }
    if (f.name === "slug" && typeof data.slug === "string") data.slug = slugify(data.slug as string);
    if (f.required && (data[f.name] === undefined || data[f.name] === "" || (Array.isArray(data[f.name]) && !(data[f.name] as unknown[]).length))) {
      errors[f.name] = `${f.label} is required`;
    }
  }
  if (res.key === "redirects") {
    const from = String(data.from ?? "");
    if (from && (!from.startsWith("/") || from.startsWith("//"))) errors.from = "Must be a site path starting with a single /";
    const to = String(data.to ?? "");
    const isPath = to.startsWith("/") && !to.startsWith("//") && !to.includes("\\");
    const isHttps = /^https:\/\/[a-z0-9.-]+(\/|$)/i.test(to);
    if (to && !isPath && !isHttps) errors.to = "Must be a site path (/…) or a full https:// URL";
    if (from && to && from.replace(/\/$/, "").toLowerCase() === to.replace(/\/$/, "").toLowerCase()) errors.to = "Destination cannot be the same as the source";
    if (data.statusCode !== undefined && ![301, 302, 308].includes(Number(data.statusCode))) errors.statusCode = "Use 301, 302 or 308";
  }
  return { data, errors };
}
