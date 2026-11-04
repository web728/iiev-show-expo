import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Section, EmptyState } from "@/components/ui/layout-blocks";
import { buttonClass } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { inputClsServer } from "@/components/ui/input-class";
import { siteSearch } from "@/lib/data/search";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const hits = q ? await siteSearch(q) : [];
  return (
    <>
      <PageHero eyebrow="Search" title={q ? `Results for “${q}”` : "Search the site"} crumbs={[{ label: "Search", href: "/search/" }]} />
      <Section>
        <form role="search" action="/search/" className="flex max-w-2xl gap-3">
          <label htmlFor="q" className="sr-only">Search</label>
          <input id="q" name="q" defaultValue={q} className={inputClsServer} placeholder="Sectors, exhibitors, FAQs, news…" maxLength={80} autoFocus={!q} />
          <button className={buttonClass("primary", "md")}><Icon.Search className="size-4.5" /><span className="sr-only sm:not-sr-only">Search</span></button>
        </form>
        <div className="mt-8 max-w-3xl">
          {q && hits.length ? (
            <ol className="divide-y divide-line">
              {hits.map((h) => (
                <li key={h.href + h.title} className="py-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-green">{h.type}</p>
                  <Link href={h.href} className="text-lg font-bold text-ink hover:text-brand-green">{h.title}</Link>
                  {h.snippet ? <p className="mt-1 text-[15px] text-ink-soft">{h.snippet}</p> : null}
                </li>
              ))}
            </ol>
          ) : q ? (
            <EmptyState icon="Search" title="No results">Try a broader term, or browse <Link href="/sectors/" className="font-semibold text-brand-blue underline">sectors</Link> and the <Link href="/faq/" className="font-semibold text-brand-blue underline">FAQ</Link>.</EmptyState>
          ) : null}
        </div>
      </Section>
    </>
  );
}
