"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission, audit } from "@/lib/auth/session";
import { connectDb } from "@/lib/db/connect";
import { Edition, SiteSettings } from "@/models/content";
import { defaultEdition } from "@/config/site";

const go = (msg: string, err = false) => redirect(`/admin/settings/?${err ? "error" : "ok"}=${encodeURIComponent(msg)}`);
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function saveEditionAction(fd: FormData) {
  const admin = await requirePermission("settings.manage");
  await connectDb();
  const slug = str(fd, "slug") || defaultEdition.slug;
  const start = str(fd, "startDate");
  const end = str(fd, "endDate");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || end < start) go("Enter valid start/end dates (end on or after start).", true);
  const forecasts = str(fd, "forecastItems")
    .split(/\r?\n/)
    .map((l) => l.split("|").map((p) => p.trim()))
    .filter((p) => p[0] && p[1])
    .map(([value, label]) => ({ value, label }));
  const shows = defaultEdition.concurrentShows.map((s) => ({ ...s, approved: fd.get(`show_${s.key}`) === "on" }));
  const update = {
    slug,
    editionNumber: Number(str(fd, "editionNumber") || defaultEdition.editionNumber),
    editionLabel: str(fd, "editionLabel") || defaultEdition.editionLabel,
    year: Number(start.slice(0, 4)),
    isCurrent: true,
    startDate: start,
    endDate: end,
    dateLabel: str(fd, "dateLabel"),
    openingHours: str(fd, "openingHours") || undefined,
    venue: {
      name: str(fd, "venueName"), locality: str(fd, "venueLocality"), city: str(fd, "venueCity"), region: str(fd, "venueRegion"),
      country: "IN", countryName: "India", postalCode: str(fd, "venuePostalCode") || undefined, streetAddress: str(fd, "venueStreet") || undefined,
      mapQuery: str(fd, "venueMapQuery") || `${str(fd, "venueName")}, ${str(fd, "venueCity")}`,
    },
    forecasts: { approved: fd.get("forecastsApproved") === "on", items: forecasts, disclaimer: str(fd, "forecastDisclaimer") },
    conference: { name: str(fd, "conferenceName"), titleApproved: fd.get("conferenceTitleApproved") === "on", programmeAnnounced: fd.get("programmeAnnounced") === "on" },
    registration: { visitorOpen: fd.get("visitorOpen") === "on", approvalMode: fd.get("approvalMode") === "review" ? "review" : "auto", admissionNote: str(fd, "admissionNote") || undefined },
    concurrentShows: shows,
    updatedBy: admin.email,
  };
  const before = await Edition.findOne({ slug }).lean();
  await Edition.updateMany({ slug: { $ne: slug } }, { $set: { isCurrent: false } });
  await Edition.updateOne({ slug }, { $set: update }, { upsert: true });
  await audit(admin, "settings.edition", "Edition", slug, "Updated edition settings", { before: before ? "existing" : "new" });
  revalidatePath("/", "layout");
  go("Edition settings saved");
}

export async function saveSiteSettingsAction(fd: FormData) {
  const admin = await requirePermission("settings.manage");
  await connectDb();
  const emails = [str(fd, "notify1"), str(fd, "notify2")].filter(Boolean);
  for (const e of emails) if (!z.string().email().safeParse(e).success) go(`Invalid recipient email: ${e}`, true);
  const contacts = str(fd, "contacts")
    .split(/\r?\n/)
    .map((l) => l.split("|").map((p) => p.trim()))
    .filter((p) => p[0])
    .map(([name, phone, email, role]) => ({ name, phone, email, role }));
  await SiteSettings.updateOne(
    { key: "global" },
    {
      $set: {
        notifyRecipients: emails,
        sendAcknowledgements: fd.get("sendAcknowledgements") === "on",
        announcement: { text: str(fd, "announcementText"), href: str(fd, "announcementHref"), active: fd.get("announcementActive") === "on" },
        contacts,
        address: str(fd, "address"),
        organiserContactsVerified: fd.get("organiserContactsVerified") === "on",
        brochureUrl: str(fd, "brochureUrl") || undefined,
        floorPlanUrl: str(fd, "floorPlanUrl") || undefined,
        exhibitorManualUrl: str(fd, "exhibitorManualUrl") || undefined,
        privacyNoticeVersion: str(fd, "privacyNoticeVersion") || "draft-2026-10",
        retentionDays: { visitors: Number(str(fd, "retentionVisitors") || 730), leads: Number(str(fd, "retentionLeads") || 1095) },
        updatedBy: admin.email,
      },
    },
    { upsert: true },
  );
  await audit(admin, "settings.site", "SiteSettings", "global", "Updated site settings");
  revalidatePath("/", "layout");
  go("Site settings saved");
}
