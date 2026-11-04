import "server-only";
import { cache } from "react";
import { defaultEdition, organiser, type EditionConfig } from "@/config/site";
import { readOrFallback } from "@/lib/db/connect";
import { Edition, SiteSettings } from "@/models/content";

export type CurrentEdition = EditionConfig;

/** Current edition config: CMS record merged over code defaults. */
export const getCurrentEdition = cache(async (): Promise<CurrentEdition> => {
  return readOrFallback(async () => {
    const doc = await Edition.findOne({ isCurrent: true }).lean<Partial<EditionConfig> & Record<string, unknown>>();
    if (!doc) return defaultEdition;
    return {
      ...defaultEdition,
      ...stripNulls(doc),
      venue: { ...defaultEdition.venue, ...stripNulls(doc.venue ?? {}) },
      forecasts: { ...defaultEdition.forecasts, ...stripNulls(doc.forecasts ?? {}) },
      conference: { ...defaultEdition.conference, ...stripNulls(doc.conference ?? {}) },
      registration: { ...defaultEdition.registration, ...stripNulls(doc.registration ?? {}) },
      concurrentShows: doc.concurrentShows?.length ? doc.concurrentShows : defaultEdition.concurrentShows,
    } as CurrentEdition;
  }, defaultEdition);
});

export type PublicSettings = {
  contacts: { name: string; phone?: string; email?: string; role?: string }[];
  address: string;
  contactsVerified: boolean;
  announcement: { text?: string; href?: string; active?: boolean } | null;
  brochureUrl?: string;
  floorPlanUrl?: string;
  exhibitorManualUrl?: string;
};

const fallbackSettings: PublicSettings = {
  contacts: organiser.contacts,
  address: organiser.address,
  contactsVerified: organiser.contactsVerifiedFor2027,
  announcement: null,
};

export const getPublicSettings = cache(async (): Promise<PublicSettings> => {
  return readOrFallback(async () => {
    const s = await SiteSettings.findOne({ key: "global" }).lean<Record<string, unknown>>();
    if (!s) return fallbackSettings;
    const contacts = (s.contacts as PublicSettings["contacts"]) ?? [];
    return {
      contacts: contacts.length ? contacts : fallbackSettings.contacts,
      address: (s.address as string) || fallbackSettings.address,
      contactsVerified: Boolean(s.organiserContactsVerified),
      announcement: (s.announcement as PublicSettings["announcement"]) ?? null,
      brochureUrl: (s.brochureUrl as string) || undefined,
      floorPlanUrl: (s.floorPlanUrl as string) || undefined,
      exhibitorManualUrl: (s.exhibitorManualUrl as string) || undefined,
    };
  }, fallbackSettings);
});

function stripNulls<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([k, v]) => v !== null && v !== undefined && v !== "" && k !== "_id" && k !== "__v")) as Partial<T>;
}
