import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero, Section, EmptyState, CtaBand } from "@/components/ui/layout-blocks";
import { LinkButton, buttonClass } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCurrentEdition } from "@/lib/data/edition";
import { getExhibitors, getExhibitorEditions, getSectors } from "@/lib/data/public";
import { inputClsServer } from "@/components/ui/input-class";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: PageProps<"/exhibitors">): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Object.keys(sp).length > 0;
  return pageMetadata({
    title: "Exhibitor Directory",
    description: "Search confirmed exhibitors at the India International EV Show by company, sector and country.",
    path: "/exhibitors/",
    noindex: filtered, // filtered/paginated views are not canonical
  });
}

export default async function ExhibitorsPage({ searchParams }: PageProps<"/exhibitors">) {
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const current = await getCurrentEdition();
  const edition = str("edition") || current.slug;
  const [result, sectors, editions] = await Promise.all([
    getExhibitors({ edition, q: str("q"), category: str("category"), country: str("country"), page: Number(str("page") || 1) }),
    getSectors(),
    getExhibitorEditions(),
  ]);
  const sectorName = new Map(sectors.map((s) => [s.slug, s.name]));
  const qs = (page: number) => {
    const p = new URLSearchParams();
    for (const k of ["q", "category", "country", "edition"]) if (str(k)) p.set(k, str(k)!);
    if (page > 1) p.set("page", String(page));
    const s = p.toString();
    return `/exhibitors/${s ? `?${s}` : ""}`;
  };
  const isPast = edition !== current.slug;

  return (
    <>
      <PageHero image={{ src: "/media/2026/expo-crowd-stall.webp" }} eyebrow="Directory" title={isPast ? `Exhibitors ${edition} (archive)` : "Exhibitor directory"} intro={<p>{isPast ? "Companies that exhibited at a previous edition." : `Confirmed exhibitors at the India International EV Show ${current.year}. Stall numbers appear once allocated.`}</p>} crumbs={[{ label: "Exhibitors", href: "/exhibitors/" }]} />
      <Section>
        <form role="search" action="/exhibitors/" className="grid gap-3 rounded-2xl border border-line bg-mist/60 p-4 sm:grid-cols-[1fr_14rem_auto]">
          <label className="sr-only" htmlFor="q">Search companies</label>
          <input id="q" name="q" defaultValue={str("q")} placeholder="Search by company name" className={inputClsServer} maxLength={60} />
          <label className="sr-only" htmlFor="category">Sector</label>
          <select id="category" name="category" defaultValue={str("category") ?? ""} className={inputClsServer}>
            <option value="">All sectors</option>
            {sectors.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
          {editions.length > 1 ? <input type="hidden" name="edition" value={edition} /> : null}
          <button className={buttonClass("primary", "md")} type="submit"><Icon.Search className="size-4.5" /> Search</button>
        </form>
        {editions.length > 1 ? (
          <p className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="font-semibold text-ink">Edition:</span>
            {[...new Set([current.slug, ...editions])].sort().reverse().map((e) => (
              <Link key={e} href={`/exhibitors/?edition=${e}`} className={`rounded-full px-3 py-1 font-semibold ${e === edition ? "bg-brand-navy text-white" : "border border-line hover:border-brand-green"}`}>{e}</Link>
            ))}
          </p>
        ) : null}

        <div className="mt-8">
          {result.items.length ? (
            <>
              <p className="mb-4 text-sm text-ink-muted" aria-live="polite">{result.total} {result.total === 1 ? "company" : "companies"}</p>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.items.map((x) => (
                  <li key={x._id}>
                    <Link href={`/exhibitors/${x.slug}/${isPast ? `?edition=${edition}` : ""}`} className="group flex h-full gap-4 rounded-2xl border border-line bg-white p-5 hover:shadow-[var(--shadow-lift)]">
                      <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-white">
                        {x.logo ? <Image src={x.logo} alt="" width={64} height={64} className="max-h-12 w-auto object-contain" /> : <span className="text-lg font-extrabold text-brand-green">{x.company.slice(0, 2).toUpperCase()}</span>}
                      </span>
                      <span>
                        <span className="block font-bold text-ink group-hover:text-brand-green">{x.company}</span>
                        <span className="block text-sm text-ink-muted">{[x.city, x.country].filter(Boolean).join(", ")}{x.booth ? ` · Stall ${x.booth}` : ""}</span>
                        <span className="mt-1 block text-xs text-ink-soft">{x.categories.map((c) => sectorName.get(c) ?? c).slice(0, 2).join(" · ")}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {result.pages > 1 ? (
                <nav aria-label="Pagination" className="mt-8 flex items-center justify-between">
                  {result.page > 1 ? <LinkButton href={qs(result.page - 1)} variant="outline" size="sm">Previous</LinkButton> : <span />}
                  <span className="text-sm text-ink-muted">Page {result.page} of {result.pages}</span>
                  {result.page < result.pages ? <LinkButton href={qs(result.page + 1)} variant="outline" size="sm">Next</LinkButton> : <span />}
                </nav>
              ) : null}
            </>
          ) : str("q") || str("category") ? (
            <EmptyState icon="Search" title="No exhibitors match your search" action={<LinkButton href="/exhibitors/" variant="outline">Clear filters</LinkButton>}>Try a different name or sector.</EmptyState>
          ) : (
            <EmptyState icon="Handshake" title={`The ${current.year} directory opens as participation is confirmed`} action={<LinkButton href="/exhibit/book-a-stall/" arrow>Enquire about exhibiting</LinkButton>}>
              Exhibitor profiles are published once the company has confirmed participation and approved its listing.
            </EmptyState>
          )}
        </div>
      </Section>
      <CtaBand title="Want to be listed?" primary={{ label: "Book Your Stall", href: "/exhibit/book-a-stall/" }} secondary={{ label: "Register to visit", href: "/visit/register/" }} />
    </>
  );
}
