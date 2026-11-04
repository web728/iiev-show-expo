import type { Metadata } from "next";
import { PageHero, Section, FeatureCard, CtaBand, RelatedLinks } from "@/components/ui/layout-blocks";
import { LinkButton } from "@/components/ui/button";
import { Steps } from "@/components/sections/form-layout";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCurrentEdition } from "@/lib/data/edition";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Exhibit at the India International EV Show 2027",
  description: "Exhibit at IIEV Show 2027 in Pune to meet dealers, fleet operators, OEM buyers and investors. See who exhibits, how to book a stall and what happens next.",
  path: "/exhibit/",
});

export default async function ExhibitPage() {
  const e = await getCurrentEdition();
  return (
    <>
      <PageHero image={{ src: "/media/2026/expo-cars-crowd.webp" }}
        eyebrow="Exhibit"
        title="Exhibit at the India International EV Show"
        intro={<p>Three days in Pune with the people who buy, sell and operate electric vehicles and the technology behind them. {e.dateLabel}, {e.venue.name}.</p>}
        crumbs={[{ label: "Exhibit", href: "/exhibit/" }]}
        actions={
          <>
            <LinkButton href="/exhibit/book-a-stall/" variant="secondary" size="lg" arrow>Book Your Stall</LinkButton>
            <LinkButton href="/exhibit/why-exhibit/" variant="outline-light" size="lg">Why exhibit</LinkButton>
          </>
        }
      />
      <Section eyebrow="Plan your participation" title="Everything exhibitors need, in one place">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon="Gauge" title="Why exhibit" href="/exhibit/why-exhibit/">The business outcomes companies come for — and how to measure them.</FeatureCard>
          <FeatureCard icon="Users" title="Exhibitor profile" href="/exhibit/exhibitor-profile/">Which companies exhibit, and which visitors they are trying to meet.</FeatureCard>
          <FeatureCard icon="Ticket" title="Book a stall" href="/exhibit/book-a-stall/">Send an enquiry and the sales team will share space and terms.</FeatureCard>
          <FeatureCard icon="Layers" title="Floor plan" href="/exhibit/floor-plan/">Hall layout and stall availability once published.</FeatureCard>
          <FeatureCard icon="Info" title="Exhibitor information" href="/exhibit/information/">Process, timelines, manual, logistics and stand rules.</FeatureCard>
          <FeatureCard icon="Handshake" title="Sponsorship" href="/sponsorship/">Raise your profile beyond your stall.</FeatureCard>
        </div>
      </Section>
      <Section tone="mist" eyebrow="How it works" title="From enquiry to show day">
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <Steps
            items={[
              { title: "Send a stall enquiry", text: "Tell us your products, segments and approximate space. It takes about three minutes." },
              { title: "Talk to the sales team", text: "We share available spaces, stall options and participation terms for your requirement." },
              { title: "Confirm your participation", text: "Your stall is reserved once the contract and any payment terms are completed." },
              { title: "Prepare with the exhibitor manual", text: "Deadlines, stand rules, logistics, badges and directory listing." },
              { title: "Exhibit and follow up", text: "Meet visitors over three days and follow up on the leads you collect." },
            ]}
          />
          <RelatedLinks
            title="Useful next steps"
            links={[
              { label: "Exhibitor FAQs", href: "/exhibit/faqs/" },
              { label: "Industry sectors", href: "/sectors/", text: "See where your products fit" },
              { label: "Past editions", href: "/past-editions/" },
            ]}
          />
        </div>
      </Section>
      <CtaBand title="Reserve your space early" text="Prime locations are allocated as participation is confirmed." primary={{ label: "Book Your Stall", href: "/exhibit/book-a-stall/" }} secondary={{ label: "Talk to us", href: "/contact/" }} />
    </>
  );
}
