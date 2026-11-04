import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PageHero, Section, CtaBand } from "@/components/ui/layout-blocks";
import { Markdown } from "@/components/ui/markdown";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata, absoluteUrl } from "@/lib/seo/metadata";
import { getSpeaker, getSessions } from "@/lib/data/public";
import { formatDate, formatTime } from "@/lib/format";

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<"/conference/speakers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSpeaker(slug);
  if (!s) return {};
  return pageMetadata({
    title: `${s.name} — Speaker`,
    description: `${s.name}${s.designation ? `, ${s.designation}` : ""}${s.organisation ? ` at ${s.organisation}` : ""}, speaking at the India International EV Show conference.`,
    path: `/conference/speakers/${s.slug}/`,
    image: s.image,
  });
}

export default async function SpeakerPage({ params }: PageProps<"/conference/speakers/[slug]">) {
  const { slug } = await params;
  const s = await getSpeaker(slug);
  if (!s) notFound();
  const sessions = (await getSessions()).filter((x) => x.speakerSlugs?.includes(s.slug));
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Person", name: s.name, jobTitle: s.designation, worksFor: s.organisation ? { "@type": "Organization", name: s.organisation } : undefined, image: s.image ? absoluteUrl(s.image) : undefined, sameAs: s.linkedin ? [s.linkedin] : undefined }} />
      <PageHero eyebrow="Speaker" title={s.name} intro={<p>{[s.designation, s.organisation].filter(Boolean).join(", ")}</p>} crumbs={[{ label: "Conference", href: "/conference/" }, { label: "Speakers", href: "/conference/speakers/" }, { label: s.name, href: `/conference/speakers/${s.slug}/` }]} />
      <Section>
        <div className="grid gap-10 md:grid-cols-[18rem_1fr]">
          {s.image ? (
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-mist">
              <Image src={s.image} alt={`Portrait of ${s.name}`} fill sizes="288px" className="object-cover" priority />
            </div>
          ) : <div />}
          <div>
            {s.bio ? <Markdown source={s.bio} /> : null}
            {s.linkedin ? <p className="mt-4"><a href={s.linkedin} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-blue underline">LinkedIn profile</a></p> : null}
            {sessions.length ? (
              <>
                <h2 className="mt-10 text-xl font-extrabold text-ink">Sessions</h2>
                <ul className="mt-4 grid gap-3">
                  {sessions.map((x) => (
                    <li key={x._id} className="rounded-xl border border-line p-4">
                      <p className="text-sm font-semibold text-brand-green">{formatDate(x.startsAt, { weekday: "short", day: "numeric", month: "short" })} · {formatTime(x.startsAt)} IST{x.room ? ` · ${x.room}` : ""}</p>
                      <p className="font-bold text-ink">{x.title}</p>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </div>
      </Section>
      <CtaBand title="Attend the conference" primary={{ label: "Register as delegate", href: "/conference/register/" }} secondary={{ label: "Full agenda", href: "/conference/agenda/" }} />
    </>
  );
}
