import { getCurrentEdition } from "@/lib/data/edition";
import { siteConfig } from "@/config/site";

// iCalendar (.ics) all-day event for the current edition.
export async function GET() {
  const e = await getCurrentEdition();
  const d = (s: string) => s.replace(/-/g, "");
  const end = new Date(`${e.endDate}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 1); // DTEND is exclusive for all-day events
  const endStr = end.toISOString().slice(0, 10).replace(/-/g, "");
  const esc = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//India International EV Show//iievshow.com//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:iiev-${e.slug}@${siteConfig.domain}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART;VALUE=DATE:${d(e.startDate)}`,
    `DTEND;VALUE=DATE:${endStr}`,
    `SUMMARY:${esc(`India International EV Show ${e.year} (${e.editionLabel})`)}`,
    `LOCATION:${esc(`${e.venue.name}, ${e.venue.locality}, ${e.venue.city}, ${e.venue.region}, India`)}`,
    `DESCRIPTION:${esc(`Register: ${siteConfig.url}/visit/register/`)}`,
    `URL:${siteConfig.url}/`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="iiev-show-${e.year}.ics"`,
    },
  });
}
