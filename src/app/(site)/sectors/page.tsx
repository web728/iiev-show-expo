import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Section, CtaBand } from "@/components/ui/layout-blocks";
import { Icon } from "@/components/ui/icons";
import { pageMetadata } from "@/lib/seo/metadata";
import { getSectors } from "@/lib/data/public";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Industry Sectors — EV Value Chain at IIEV Show",
  description: "Electric vehicles, components, motors, batteries, charging, energy storage, manufacturing equipment, fleet software, testing and recycling, and solar-EV integration.",
  path: "/sectors/",
});

export default async function SectorsPage() {
  const sectors = await getSectors();
  const groups = [...new Set(sectors.map((s) => s.group))];
  return (
    <>
      <PageHero image={{ src: "/media/2026/expo-hall-overview.webp" }}
        eyebrow="Sectors"
        title="Industry sectors"
        intro={<p>The show covers the electric-mobility value chain in ten sectors. Each page explains who exhibits, what buyers compare and how to prepare.</p>}
        crumbs={[{ label: "Sectors", href: "/sectors/" }]}
      />
      {groups.map((g, gi) => (
        <Section key={g} tone={gi % 2 ? "mist" : "white"} title={g} headingLevel={2}>
          <ul className="grid gap-5 md:grid-cols-2">
            {sectors.filter((s) => s.group === g).map((s) => {
              const I = Icon[s.icon] ?? Icon.Bolt;
              return (
                <li key={s.slug}>
                  <Link href={`/sectors/${s.slug}/`} className="group flex h-full gap-5 rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-[var(--shadow-lift)]">
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-brand-green/25 text-brand-green group-hover:border-brand-green group-hover:bg-brand-green group-hover:text-white">
                      <I className="size-6" />
                    </span>
                    <span>
                      <span className="block text-lg font-bold text-ink group-hover:text-brand-green">{s.name}</span>
                      <span className="mt-1 block text-[15px] leading-relaxed text-ink-soft">{s.summary}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      ))}
      <CtaBand title="Exhibit in your sector" primary={{ label: "Book Your Stall", href: "/exhibit/book-a-stall/" }} secondary={{ label: "Register as Visitor", href: "/visit/register/" }} />
    </>
  );
}
