import type { Metadata } from "next";
import { PageHero, Section, CtaBand } from "@/components/ui/layout-blocks";
import { FaqList } from "@/components/sections/faq-list";
import { JsonLd } from "@/components/seo/json-ld";
import { faqSchema } from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { getFaqs } from "@/lib/data/public";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description: "Frequently asked questions about the India International EV Show 2027 — dates, venue, organiser, exhibiting, visiting and the conference.",
  path: "/faq/",
});

const GROUPS = [
  { key: "general", title: "About the show" },
  { key: "exhibitor", title: "Exhibiting" },
  { key: "visitor", title: "Visiting" },
  { key: "conference", title: "Conference" },
] as const;

export default async function FaqPage() {
  const all = await getFaqs();
  return (
    <>
      <PageHero image={{ src: "/media/2026/expo-aisle-walk.webp" }} eyebrow="Help" title="Frequently asked questions" crumbs={[{ label: "FAQ", href: "/faq/" }]} />
      <JsonLd data={faqSchema(all)} />
      <Section>
        <div className="grid max-w-3xl gap-12">
          {GROUPS.map((g) => {
            const items = all.filter((f) => f.audience === g.key);
            if (!items.length) return null;
            return (
              <section key={g.key} aria-labelledby={`faq-${g.key}`}>
                <h2 id={`faq-${g.key}`} className="mb-4 text-xl font-extrabold text-ink">{g.title}</h2>
                <FaqList items={items} />
              </section>
            );
          })}
        </div>
      </Section>
      <CtaBand title="Still have a question?" primary={{ label: "Contact us", href: "/contact/" }} />
    </>
  );
}
