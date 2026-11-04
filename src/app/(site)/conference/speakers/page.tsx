import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero, Section, EmptyState, CtaBand } from "@/components/ui/layout-blocks";
import { LinkButton } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCurrentEdition } from "@/lib/data/edition";
import { getSpeakers } from "@/lib/data/public";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Conference Speakers",
  description: "Confirmed speakers for the India International EV Show 2027 conference programme.",
  path: "/conference/speakers/",
});

export default async function SpeakersPage() {
  const [e, speakers] = await Promise.all([getCurrentEdition(), getSpeakers()]);
  return (
    <>
      <PageHero image={{ src: "/media/2026/conf-speaker.webp" }} eyebrow="Conference" title={`Speakers ${e.year}`} intro={<p>Only speakers who have confirmed their participation and consented to publication are listed.</p>} crumbs={[{ label: "Conference", href: "/conference/" }, { label: "Speakers", href: "/conference/speakers/" }]} />
      <Section>
        {speakers.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {speakers.map((s) => (
              <li key={s._id}>
                <Link href={`/conference/speakers/${s.slug}/`} className="group block overflow-hidden rounded-2xl border border-line bg-white">
                  <div className="relative aspect-[4/5] bg-mist">
                    {s.image ? (
                      <Image src={s.image} alt={`Portrait of ${s.name}`} fill sizes="(min-width:1024px) 280px, (min-width:640px) 45vw, 90vw" className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-5xl font-extrabold text-brand-green/30">{s.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="font-bold text-ink group-hover:text-brand-green">{s.name}</h2>
                    <p className="text-sm text-ink-soft">{[s.designation, s.organisation].filter(Boolean).join(", ")}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon="Mic" title={`${e.year} speakers will be announced here`} action={<LinkButton href="/conference/apply-to-speak/" arrow>Apply to speak</LinkButton>}>
            We publish speakers only after they confirm. Speakers from previous editions are not carried over.
          </EmptyState>
        )}
      </Section>
      <CtaBand title="Register for programme updates" primary={{ label: "Register as delegate", href: "/conference/register/" }} />
    </>
  );
}
