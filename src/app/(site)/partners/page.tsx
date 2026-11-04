import type { Metadata } from "next";
import Image from "next/image";
import { PageHero, Section, EmptyState, CtaBand } from "@/components/ui/layout-blocks";
import { LinkButton } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCurrentEdition } from "@/lib/data/edition";
import { getPartners } from "@/lib/data/public";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Partners & Supporting Organisations",
  description: "Sponsors, industry associations, media and supporting partners of the India International EV Show 2027.",
  path: "/partners/",
});

const KIND_LABEL: Record<string, string> = { sponsor: "Sponsors", association: "Industry associations", supporting: "Supporting organisations", media: "Media partners", knowledge: "Knowledge partners" };

export default async function PartnersPage() {
  const [e, partners] = await Promise.all([getCurrentEdition(), getPartners()]);
  const kinds = [...new Set(partners.map((p) => p.kind))];
  return (
    <>
      <PageHero image={{ src: "/media/2026/awards-team.webp" }} eyebrow="Partners" title={`Partners ${e.year}`} intro={<p>Organisations confirmed as partners of the {e.editionLabel.toLowerCase()}.</p>} crumbs={[{ label: "Partners", href: "/partners/" }]} />
      {partners.length ? (
        kinds.map((k, i) => (
          <Section key={k} tone={i % 2 ? "mist" : "white"} title={KIND_LABEL[k] ?? k}>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {partners.filter((p) => p.kind === k).map((p) => (
                <li key={p._id} className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white p-5 text-center">
                  {p.logo ? <Image src={p.logo} alt={`${p.name} logo`} width={180} height={90} className="h-16 w-auto object-contain" /> : null}
                  {p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-ink hover:text-brand-green">{p.name}</a> : <span className="text-sm font-semibold text-ink">{p.name}</span>}
                  {p.tier ? <span className="text-xs text-ink-muted">{p.tier}</span> : null}
                </li>
              ))}
            </ul>
          </Section>
        ))
      ) : (
        <Section>
          <EmptyState icon="Handshake" title={`${e.year} partners will be announced here`} action={<LinkButton href="/become-a-partner/" arrow>Become a partner</LinkButton>}>
            We list partners only after their participation for this edition is confirmed. Partners of earlier editions are not carried over.
          </EmptyState>
        </Section>
      )}
      <CtaBand title="Partner with the show" primary={{ label: "Become a partner", href: "/become-a-partner/" }} secondary={{ label: "Sponsorship", href: "/sponsorship/" }} />
    </>
  );
}
