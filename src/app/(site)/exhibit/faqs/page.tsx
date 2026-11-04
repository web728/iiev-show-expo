import type { Metadata } from "next";
import { PageHero, Section, CtaBand } from "@/components/ui/layout-blocks";
import { FaqList } from "@/components/sections/faq-list";
import { pageMetadata } from "@/lib/seo/metadata";
import { getFaqs } from "@/lib/data/public";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Exhibitor FAQs",
  description: "Answers for exhibitors at the India International EV Show 2027: booking a stall, rates, floor plan, stall types, directory listing and launches.",
  path: "/exhibit/faqs/",
});

export default async function ExhibitorFaqPage() {
  const items = await getFaqs("exhibitor");
  return (
    <>
      <PageHero image={{ src: "/media/2026/expo-aisle-walk.webp" }} eyebrow="Exhibit" title="Exhibitor FAQs" crumbs={[{ label: "Exhibit", href: "/exhibit/" }, { label: "Exhibitor FAQs", href: "/exhibit/faqs/" }]} />
      <Section>
        <div className="max-w-3xl">
          <FaqList items={items} />
        </div>
      </Section>
      <CtaBand title="Didn't find your answer?" primary={{ label: "Book Your Stall", href: "/exhibit/book-a-stall/" }} secondary={{ label: "Contact us", href: "/contact/" }} />
    </>
  );
}
