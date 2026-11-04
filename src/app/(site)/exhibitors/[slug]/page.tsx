import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PageHero, Section, CtaBand } from "@/components/ui/layout-blocks";
import { Markdown } from "@/components/ui/markdown";
import { Icon } from "@/components/ui/icons";
import { pageMetadata } from "@/lib/seo/metadata";
import { getExhibitor, getSectors } from "@/lib/data/public";
import { getCurrentEdition } from "@/lib/data/edition";

export const revalidate = 300;

export async function generateMetadata({ params, searchParams }: PageProps<"/exhibitors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const x = await getExhibitor(slug, typeof sp.edition === "string" ? sp.edition : undefined);
  if (!x) return {};
  return pageMetadata({
    title: `${x.company} — Exhibitor ${x.edition}`,
    description: (x.profile || `${x.company} exhibits at the India International EV Show ${x.edition}.`).slice(0, 160),
    path: `/exhibitors/${x.slug}/`,
    image: x.logo,
  });
}

export default async function ExhibitorPage({ params, searchParams }: PageProps<"/exhibitors/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const [x, sectors, current] = await Promise.all([getExhibitor(slug, typeof sp.edition === "string" ? sp.edition : undefined), getSectors(), getCurrentEdition()]);
  if (!x) notFound();
  const sectorName = new Map(sectors.map((s) => [s.slug, s.name]));
  return (
    <>
      <PageHero eyebrow={x.edition === current.slug ? `Exhibitor ${x.edition}` : `Past exhibitor · ${x.edition}`} title={x.company} intro={<p>{[x.city, x.country].filter(Boolean).join(", ")}{x.booth ? ` · Stall ${x.booth}` : ""}</p>} crumbs={[{ label: "Exhibitors", href: "/exhibitors/" }, { label: x.company, href: `/exhibitors/${x.slug}/` }]} />
      <Section>
        <div className="grid gap-10 md:grid-cols-[16rem_1fr]">
          <div className="grid content-start gap-4">
            <div className="flex aspect-square items-center justify-center rounded-2xl border border-line bg-white p-6">
              {x.logo ? <Image src={x.logo} alt={`${x.company} logo`} width={220} height={220} className="max-h-40 w-auto object-contain" /> : <span className="text-5xl font-extrabold text-brand-green/40">{x.company.slice(0, 2).toUpperCase()}</span>}
            </div>
            {x.website ? (
              <a href={x.website} target="_blank" rel="noopener noreferrer nofollow ugc" className="inline-flex items-center gap-2 font-semibold text-brand-blue hover:text-brand-green">
                <Icon.Globe className="size-4.5" /> Company website <Icon.ArrowUpRight className="size-4" />
              </a>
            ) : null}
          </div>
          <div>
            {x.profile ? <Markdown source={x.profile} /> : <p className="text-ink-muted">Company profile coming soon.</p>}
            {x.categories.length ? (
              <>
                <h2 className="mt-8 text-sm font-bold uppercase tracking-[0.14em] text-ink-muted">Sectors</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {x.categories.map((c) => (
                    <li key={c}><Link href={`/sectors/${c}/`} className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:border-brand-green">{sectorName.get(c) ?? c}</Link></li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </div>
      </Section>
      <CtaBand title="Meet them at the show" primary={{ label: "Register as Visitor", href: "/visit/register/" }} secondary={{ label: "All exhibitors", href: "/exhibitors/" }} />
    </>
  );
}
