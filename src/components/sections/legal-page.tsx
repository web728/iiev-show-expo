import { PageHero, Section, Notice } from "@/components/ui/layout-blocks";
import { Markdown } from "@/components/ui/markdown";
import { getCmsPage } from "@/lib/data/public";
import { legalDrafts } from "@/content/legal";
import { formatDate } from "@/lib/format";

/** CMS page if published; otherwise the clearly-labelled draft. */
export async function LegalPage({ slug }: { slug: string }) {
  const cms = await getCmsPage(slug);
  const draft = legalDrafts.find((d) => d.slug === slug)!;
  const title = cms?.title ?? draft.title;
  const body = cms?.body ?? draft.body;
  return (
    <>
      <PageHero eyebrow="Legal" title={title} crumbs={[{ label: title, href: `/${slug}/` }]} />
      <Section>
        {!cms ? (
          <div className="mb-8 max-w-3xl">
            <Notice tone="warn" title="Draft under legal review">This text is a working draft prepared for the website build. It will be replaced by the organiser&apos;s approved version before launch.</Notice>
          </div>
        ) : null}
        <Markdown source={body} />
        {cms?.updatedAt ? <p className="mt-10 text-sm text-ink-muted">Last updated {formatDate(cms.updatedAt)}</p> : null}
      </Section>
    </>
  );
}

export function legalMeta(slug: string) {
  return legalDrafts.find((d) => d.slug === slug)!;
}
