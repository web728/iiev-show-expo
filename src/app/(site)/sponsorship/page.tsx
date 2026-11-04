import type { Metadata } from "next";
import { PageHero, Section, FeatureCard, Notice, CtaBand } from "@/components/ui/layout-blocks";
import { LinkButton } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Sponsorship Opportunities",
  description: "Raise your profile at the India International EV Show 2027 with conference, registration, venue and digital sponsorship. Tell us your objectives and we'll recommend options.",
  path: "/sponsorship/",
});

export default function SponsorshipPage() {
  return (
    <>
      <PageHero image={{ src: "/media/2026/inauguration-gate-group.webp" }}
        eyebrow="Commercial"
        title="Sponsorship"
        intro={<p>Sponsorship puts your brand in front of the show&apos;s audience beyond your stall. We tailor options to what you want to achieve.</p>}
        crumbs={[{ label: "Sponsorship", href: "/sponsorship/" }]}
        actions={<LinkButton href="/sponsorship/enquire/" variant="secondary" size="lg" arrow>Enquire about sponsorship</LinkButton>}
      />
      <Section eyebrow="Opportunity areas" title="Where sponsors can be visible">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon="Mic" title="Conference">Session or track partnership, with an appropriate, non-promotional speaking role where agreed.</FeatureCard>
          <FeatureCard icon="Ticket" title="Registration & badges">Visibility on registration touchpoints that every visitor passes through.</FeatureCard>
          <FeatureCard icon="MapPin" title="Venue branding">Entrance, aisle and directional branding across the halls.</FeatureCard>
          <FeatureCard icon="Users" title="Networking">Hosted networking or hospitality moments for exhibitors and buyers.</FeatureCard>
          <FeatureCard icon="Mail" title="Digital">Website and email visibility in the run-up to the show.</FeatureCard>
          <FeatureCard icon="Bolt" title="Launch support">Help planning a product launch at the show.</FeatureCard>
        </div>
        <div className="mt-8 max-w-3xl">
          <Notice>
            The 2027 sponsorship packages, deliverables and rates are being finalised. We don&apos;t publish prices or guarantee impressions; the team will
            share approved options that match your objectives.
          </Notice>
        </div>
      </Section>
      <CtaBand title="Tell us your goals" text="Audiences, launches, regions — and we'll suggest what fits." primary={{ label: "Enquire about sponsorship", href: "/sponsorship/enquire/" }} secondary={{ label: "Book a stall", href: "/exhibit/book-a-stall/" }} />
    </>
  );
}
