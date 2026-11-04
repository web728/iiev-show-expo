import Link from "next/link";
import Image from "next/image";
import { PageHero, Section, EmptyState, CtaBand, RelatedLinks } from "@/components/ui/layout-blocks";
import { LinkButton } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { JsonLd } from "@/components/seo/json-ld";
import { articleSchema } from "@/lib/seo/schema";
import type { PublicPost } from "@/lib/data/public";
import { formatDate } from "@/lib/format";

const LABEL = { news: { plural: "News", path: "/news/" }, insight: { plural: "Insights", path: "/insights/" } };

export function PostIndex({ kind, items, page, pages, intro }: { kind: "news" | "insight"; items: PublicPost[]; page: number; pages: number; intro: string }) {
  const l = LABEL[kind];
  return (
    <>
      <PageHero eyebrow="Media" title={l.plural} intro={<p>{intro}</p>} crumbs={[{ label: "Media", href: "/media/" }, { label: l.plural, href: l.path }]} />
      <Section>
        {items.length ? (
          <>
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <li key={p._id}>
                  <Link href={`${l.path}${p.slug}/`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white hover:shadow-[var(--shadow-lift)]">
                    {p.coverImage ? (
                      <div className="relative aspect-[16/9] bg-mist">
                        <Image src={p.coverImage} alt={p.coverAlt || ""} fill sizes="(min-width:1024px) 400px, (min-width:768px) 50vw, 100vw" className="object-cover" />
                      </div>
                    ) : <div className="h-1.5 bg-brand-gradient" />}
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-sm text-ink-muted">
                        {p.category ? <span className="font-semibold text-brand-green">{p.category}</span> : null}
                        {p.category && p.publishedAt ? " · " : ""}
                        {p.publishedAt ? <time dateTime={p.publishedAt}>{formatDate(p.publishedAt)}</time> : null}
                      </p>
                      <h2 className="mt-2 text-lg font-bold leading-snug text-ink group-hover:text-brand-green">{p.title}</h2>
                      {p.excerpt ? <p className="mt-2 line-clamp-3 text-[15px] text-ink-soft">{p.excerpt}</p> : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {pages > 1 ? (
              <nav aria-label="Pagination" className="mt-10 flex items-center justify-between">
                {page > 1 ? <LinkButton href={`${l.path}${page > 2 ? `?page=${page - 1}` : ""}`} variant="outline" size="sm">Newer</LinkButton> : <span />}
                <span className="text-sm text-ink-muted">Page {page} of {pages}</span>
                {page < pages ? <LinkButton href={`${l.path}?page=${page + 1}`} variant="outline" size="sm">Older</LinkButton> : <span />}
              </nav>
            ) : null}
          </>
        ) : (
          <EmptyState icon="News" title={`No ${l.plural.toLowerCase()} published yet`}>
            {kind === "news" ? "Show announcements and updates for 2027 will appear here." : "Editorially reviewed articles on the electric-mobility industry will appear here."}
          </EmptyState>
        )}
      </Section>
    </>
  );
}

export function PostArticle({ post }: { post: PublicPost }) {
  const l = LABEL[post.kind];
  const path = `${l.path}${post.slug}/`;
  return (
    <>
      <JsonLd data={articleSchema({ title: post.title, description: post.excerpt, path, published: post.publishedAt, modified: post.updatedAt, author: post.author, image: post.coverImage })} />
      <PageHero eyebrow={post.category || l.plural} title={post.title} crumbs={[{ label: "Media", href: "/media/" }, { label: l.plural, href: l.path }, { label: post.title.length > 40 ? post.title.slice(0, 40) + "…" : post.title, href: path }]} />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_18rem]">
          <article>
            <p className="text-sm text-ink-muted">
              {post.author ? <>By <span className="font-semibold text-ink">{post.author}</span> · </> : null}
              {post.publishedAt ? <>Published <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time></> : null}
              {post.updatedAt && post.publishedAt && new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > 86_400_000 ? <> · Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time></> : null}
            </p>
            {post.coverImage ? (
              <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-mist">
                <Image src={post.coverImage} alt={post.coverAlt || ""} fill sizes="(min-width:1024px) 760px, 100vw" className="object-cover" priority />
              </div>
            ) : null}
            <div className="mt-8"><Markdown source={post.body} /></div>
            {post.sourceUrl ? (
              <p className="mt-8 rounded-xl bg-mist p-4 text-sm text-ink-soft">
                Source: <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-brand-blue underline">{post.sourceName || post.sourceUrl}</a>
              </p>
            ) : null}
          </article>
          <RelatedLinks links={[{ label: `All ${l.plural.toLowerCase()}`, href: l.path }, { label: "Register as visitor", href: "/visit/register/" }, { label: "Book a stall", href: "/exhibit/book-a-stall/" }]} />
        </div>
      </Section>
      <CtaBand title="Be there in November" primary={{ label: "Register as Visitor", href: "/visit/register/" }} secondary={{ label: "Book Your Stall", href: "/exhibit/book-a-stall/" }} />
    </>
  );
}
