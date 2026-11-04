import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero, Section, CtaBand, RelatedLinks } from "@/components/ui/layout-blocks";
import { LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Markdown } from "@/components/ui/markdown";
import { pageMetadata } from "@/lib/seo/metadata";
import { getSector, getSectors, getExhibitors } from "@/lib/data/public";
import { sectors as seed, sectorVisual } from "@/content/sectors";

export const revalidate = 300;

export function generateStaticParams() {
  return seed.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/sectors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSector(slug);
  if (!s) return {};
  return pageMetadata({
    title: s.metaTitle || `${s.name} at IIEV Show 2027`,
    description: s.metaDescription || s.summary,
    path: `/sectors/${s.slug}/`,
  });
}

export default async function SectorPage({ params }: PageProps<"/sectors/[slug]">) {
  const { slug } = await params;
  const s = await getSector(slug);
  if (!s) notFound();
  const [all, exhibitors] = await Promise.all([getSectors(), getExhibitors({ category: s.slug, perPage: 8 })]);
  const related = all.filter((x) => x.slug !== s.slug && x.group === s.group).slice(0, 3);
  return (
    <>
      <PageHero
        image={{ src: sectorVisual(s.slug).src, credit: sectorVisual(s.slug).credit }}
        eyebrow={s.group}
        title={s.name}
        intro={<p>{s.summary}</p>}
        crumbs={[{ label: "Sectors", href: "/sectors/" }, { label: s.name, href: `/sectors/${s.slug}/` }]}
        actions={
          <>
            <LinkButton href="/exhibit/book-a-stall/" variant="secondary" arrow>Exhibit in this sector</LinkButton>
            <LinkButton href="/visit/register/" variant="outline-light">Register to visit</LinkButton>
          </>
        }
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_22rem]">
          <Markdown source={s.body} />
          <div className="grid content-start gap-5">
            <div className="rounded-2xl border border-line bg-mist/60 p-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink-muted">Typical exhibitors</h2>
              <ul className="mt-3 grid gap-2 text-[15px] text-ink-soft">
                {s.exhibitorExamples.map((x) => (
                  <li key={x} className="flex gap-2"><Icon.Check className="mt-0.5 size-4.5 shrink-0 text-brand-green" />{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink-muted">Who visits for this sector</h2>
              <ul className="mt-3 grid gap-2 text-[15px] text-ink-soft">
                {s.relevantVisitors.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </Section>
      <Section tone="mist" eyebrow="Buyer questions" title="What buyers usually ask exhibitors">
        <ul className="grid gap-4 md:grid-cols-2">
          {s.buyerQuestions.map((q) => (
            <li key={q} className="flex gap-3 rounded-2xl border border-line bg-white p-5 text-ink">
              <span className="font-extrabold text-brand-green">Q</span>
              <span className="font-semibold">{q}</span>
            </li>
          ))}
        </ul>
      </Section>
      <Section eyebrow="Directory" title={`${s.name} exhibitors`}>
        {exhibitors.items.length ? (
          <>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {exhibitors.items.map((x) => (
                <li key={x._id}>
                  <Link href={`/exhibitors/${x.slug}/`} className="block rounded-xl border border-line bg-white p-4 font-semibold text-ink hover:border-brand-green">{x.company}</Link>
                </li>
              ))}
            </ul>
            <div className="mt-6"><LinkButton href={`/exhibitors/?category=${s.slug}`} variant="outline" arrow>All {s.name.toLowerCase()} exhibitors</LinkButton></div>
          </>
        ) : (
          <p className="max-w-2xl text-ink-soft">
            Confirmed exhibitors in this sector will be listed here as participation is approved.{" "}
            <Link href="/exhibit/book-a-stall/" className="font-semibold text-brand-blue underline underline-offset-2">Enquire about exhibiting</Link>.
          </p>
        )}
      </Section>
      {related.length ? (
        <Section tone="mist">
          <RelatedLinks title="Related sectors" links={related.map((r) => ({ label: r.name, href: `/sectors/${r.slug}/`, text: r.summary.slice(0, 90) + "…" }))} />
        </Section>
      ) : null}
      <CtaBand title={`Showcase your ${s.name.toLowerCase()} products`} primary={{ label: "Book Your Stall", href: "/exhibit/book-a-stall/" }} secondary={{ label: "All sectors", href: "/sectors/" }} />
    </>
  );
}
