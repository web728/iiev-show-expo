import type { Metadata } from "next";
import { PageHero, Section, FeatureCard, CtaBand } from "@/components/ui/layout-blocks";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicSettings } from "@/lib/data/edition";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Media Centre",
  description: "News, insights, photo galleries, videos and downloads from the India International EV Show. Media enquiries welcome.",
  path: "/media/",
});

export default async function MediaPage() {
  const s = await getPublicSettings();
  const c = s.contacts[0];
  return (
    <>
      <PageHero image={{ src: "/media/2026/inauguration-ribbon.webp" }} eyebrow="Media" title="Media centre" intro={<p>Announcements, articles, imagery and documents from the India International EV Show.</p>} crumbs={[{ label: "Media", href: "/media/" }]} />
      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon="News" title="News" href="/news/">Show announcements and press releases.</FeatureCard>
          <FeatureCard icon="Layers" title="Insights" href="/insights/">Articles on the electric-mobility industry.</FeatureCard>
          <FeatureCard icon="Image" title="Gallery" href="/gallery/">Photographs from past editions.</FeatureCard>
          <FeatureCard icon="Play" title="Videos" href="/videos/">Show films and conference highlights.</FeatureCard>
          <FeatureCard icon="Download" title="Downloads" href="/downloads/">Brochures, reports and media kits.</FeatureCard>
          <FeatureCard icon="Mail" title="Media enquiries" href="/contact/">{c?.email ? `Journalists can reach the team at ${c.email}.` : "Journalists can contact the organiser team."}</FeatureCard>
        </div>
      </Section>
      <CtaBand title="Covering the show?" text="Ask us about media registration and interviews." primary={{ label: "Contact the team", href: "/contact/" }} />
    </>
  );
}
