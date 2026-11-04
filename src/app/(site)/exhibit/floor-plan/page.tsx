import type { Metadata } from "next";
import { PageHero, Section, EmptyState, CtaBand } from "@/components/ui/layout-blocks";
import { LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicSettings } from "@/lib/data/edition";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Floor Plan — IIEV Show 2027",
  description: "Hall layout and stall availability for the India International EV Show 2027 at the Auto Cluster Exhibition Centre, Pune.",
  path: "/exhibit/floor-plan/",
});

export default async function FloorPlanPage() {
  const s = await getPublicSettings();
  return (
    <>
      <PageHero image={{ src: "/media/2026/expo-hall-overview.webp" }}
        eyebrow="Exhibit"
        title="Floor plan"
        intro={<p>The approved hall layout for 2027. Stall availability changes daily, so the sales team always confirms current options.</p>}
        crumbs={[{ label: "Exhibit", href: "/exhibit/" }, { label: "Floor Plan", href: "/exhibit/floor-plan/" }]}
      />
      <Section>
        {s.floorPlanUrl ? (
          <div className="grid gap-6">
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-white p-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <Icon.Layers className="size-8 text-brand-green" />
                <div>
                  <p className="font-bold text-ink">IIEV Show 2027 floor plan</p>
                  <p className="text-sm text-ink-muted">Latest approved version · availability subject to confirmation</p>
                </div>
              </div>
              <LinkButton href={s.floorPlanUrl} variant="primary" target="_blank" rel="noopener">
                <Icon.Download className="size-4.5" /> Open floor plan
              </LinkButton>
            </div>
          </div>
        ) : (
          <EmptyState icon="Layers" title="The 2027 floor plan will be published here" action={<LinkButton href="/exhibit/book-a-stall/" arrow>Ask about availability</LinkButton>}>
            Halls are being allocated. Until the plan is published, send a stall enquiry and the sales team will share the spaces currently available for your requirement.
          </EmptyState>
        )}
      </Section>
      <CtaBand title="Want a specific location?" text="Tell us in your enquiry — corner, island or near a particular sector." primary={{ label: "Book Your Stall", href: "/exhibit/book-a-stall/" }} />
    </>
  );
}
