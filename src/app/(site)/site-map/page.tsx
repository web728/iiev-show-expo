import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Section } from "@/components/ui/layout-blocks";
import { pageMetadata } from "@/lib/seo/metadata";
import { STATIC_ROUTES, dynamicRoutes } from "@/lib/seo/routes";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Site Map",
  description: "All pages on the India International EV Show website.",
  path: "/site-map/",
});

export default async function SiteMapPage() {
  const all = [...STATIC_ROUTES, ...(await dynamicRoutes())];
  const groups = [...new Set(all.map((r) => r.group))];
  return (
    <>
      <PageHero eyebrow="Help" title="Site map" crumbs={[{ label: "Site map", href: "/site-map/" }]} />
      <Section>
        <div className="columns-1 gap-10 sm:columns-2 lg:columns-3">
          {groups.map((g) => (
            <section key={g} className="mb-8 break-inside-avoid">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-ink-muted">{g}</h2>
              <ul className="grid gap-1.5">
                {all.filter((r) => r.group === g).map((r) => (
                  <li key={r.path}><Link href={r.path} className="text-[15px] text-brand-blue hover:text-brand-green hover:underline">{r.label}</Link></li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Section>
    </>
  );
}
