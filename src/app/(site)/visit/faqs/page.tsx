import type { Metadata } from "next";
import { PageHero, Section, CtaBand } from "@/components/ui/layout-blocks";
import { FaqList } from "@/components/sections/faq-list";
import { pageMetadata } from "@/lib/seo/metadata";
import { getFaqs } from "@/lib/data/public";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Visitor FAQs",
  description: "Answers for visitors to the India International EV Show 2027: registration, badges, entry, timings and getting to the venue in Pimpri-Chinchwad, Pune.",
  path: "/visit/faqs/",
});

export default async function VisitorFaqPage() {
  const items = await getFaqs("visitor");
  return (
    <>
      <PageHero image={{ src: "/media/2026/registration-counter.webp" }} eyebrow="Visit" title="Visitor FAQs" crumbs={[{ label: "Visit", href: "/visit/" }, { label: "Visitor FAQs", href: "/visit/faqs/" }]} />
      <Section>
        <div className="max-w-3xl">
          <FaqList items={items} />
        </div>
      </Section>
      <CtaBand title="Ready to visit?" primary={{ label: "Register as Visitor", href: "/visit/register/" }} secondary={{ label: "Retrieve my badge", href: "/visit/badge/" }} />
    </>
  );
}
