import "server-only";
import { mainNav, footerNav } from "@/config/site";
import { getSectors, getFaqs, getPastEditions } from "./public";
import { readOrFallback } from "@/lib/db/connect";
import { Post, ExhibitorListing } from "@/models/content";
import { getCurrentEdition } from "./edition";

export type SearchHit = { title: string; href: string; snippet: string; type: string };

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

/** Site search across static pages, sectors, FAQs, history, posts and published exhibitors. */
export async function siteSearch(raw: string): Promise<SearchHit[]> {
  const q = norm(raw.trim()).slice(0, 80);
  if (q.length < 2) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const match = (...fields: (string | undefined)[]) => {
    const hay = norm(fields.filter(Boolean).join(" "));
    return terms.every((t) => hay.includes(t));
  };

  const hits: SearchHit[] = [];
  const pages = [...mainNav.flatMap((n) => [n, ...(n.children ?? [])]), ...footerNav.flatMap((c) => c.links)];
  const seen = new Set<string>();
  for (const p of pages) {
    if (seen.has(p.href)) continue;
    seen.add(p.href);
    if (match(p.label, p.description)) hits.push({ title: p.label, href: p.href, snippet: p.description ?? "", type: "Page" });
  }
  for (const s of await getSectors()) if (match(s.name, s.summary, s.body, s.exhibitorExamples.join(" "))) hits.push({ title: s.name, href: `/sectors/${s.slug}/`, snippet: s.summary, type: "Sector" });
  for (const f of await getFaqs()) if (match(f.question, f.answer)) hits.push({ title: f.question, href: f.audience === "exhibitor" ? "/exhibit/faqs/" : f.audience === "visitor" ? "/visit/faqs/" : "/faq/", snippet: f.answer.slice(0, 160), type: "FAQ" });
  for (const e of await getPastEditions()) if (match(e.title, e.city, String(e.year), e.summary)) hits.push({ title: e.title, href: `/past-editions/${e.slug}/`, snippet: e.summary.slice(0, 160), type: "Past edition" });

  const rx = new RegExp(terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");
  const edition = await getCurrentEdition();
  const [posts, companies] = await Promise.all([
    readOrFallback(() => Post.find({ status: "published", $or: [{ title: rx }, { excerpt: rx }] }).select("kind slug title excerpt").limit(10).lean(), []),
    readOrFallback(() => ExhibitorListing.find({ status: "published", edition: edition.slug, company: rx }).select("slug company city").limit(10).lean(), []),
  ]);
  for (const p of posts as { kind: string; slug: string; title: string; excerpt?: string }[])
    hits.push({ title: p.title, href: `/${p.kind === "news" ? "news" : "insights"}/${p.slug}/`, snippet: p.excerpt ?? "", type: p.kind === "news" ? "News" : "Insight" });
  for (const c of companies as { slug: string; company: string; city?: string }[])
    hits.push({ title: c.company, href: `/exhibitors/${c.slug}/`, snippet: c.city ?? "", type: "Exhibitor" });
  return hits.slice(0, 40);
}
