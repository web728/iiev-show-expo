import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/footer";
import { ConsentManager } from "@/components/layout/consent";
import { ScrollProgress, StickyCta } from "@/components/layout/scroll-ui";
import { getCurrentEdition, getPublicSettings } from "@/lib/data/edition";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";

export default async function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  const [edition, settings] = await Promise.all([getCurrentEdition(), getPublicSettings()]);
  const announcement = settings.announcement;

  return (
    <>
      {announcement?.active && announcement.text ? (
        <aside aria-label="Event announcement" className="bg-brand-deep text-center text-xs text-white sm:text-sm">
          <div className="mx-auto max-w-7xl px-5 py-2.5 sm:px-8 lg:px-10">
            {announcement.href ? (
              <Link href={announcement.href} className="font-semibold underline-offset-4 hover:underline">{announcement.text}</Link>
            ) : (
              <span className="font-semibold">{announcement.text}</span>
            )}
          </div>
        </aside>
      ) : null}

      <SiteHeader editionLine={`${edition.editionLabel}, ${edition.dateLabel}, ${edition.venue.city}`} />
      <main id="main" tabIndex={-1} className="min-w-0 outline-none">{children}</main>
      <SiteFooter edition={edition} settings={settings} />
      <ConsentManager />
      <ScrollProgress />
      <StickyCta />
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
    </>
  );
}
