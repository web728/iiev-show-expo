const TZ = "Asia/Kolkata";

export function formatDate(iso: string | Date, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: TZ, ...opts }).format(new Date(iso));
}

export function formatTime(iso: string | Date) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(iso));
}

export function formatDateTime(iso: string | Date) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

/** Date key in Asia/Kolkata, e.g. "2027-11-11" — for grouping agenda days. */
export function istDateKey(iso: string | Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
