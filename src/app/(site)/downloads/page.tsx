import type { Metadata } from "next";
import { PageHero, Section, EmptyState } from "@/components/ui/layout-blocks";
import { DownloadLink } from "@/components/sections/download-link";
import { Icon } from "@/components/ui/icons";
import { pageMetadata } from "@/lib/seo/metadata";
import { getDownloads } from "@/lib/data/public";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Downloads — Brochures, Reports & Manuals",
  description: "Download India International EV Show brochures, post-show reports, exhibitor manuals and media kits.",
  path: "/downloads/",
});

const CAT: Record<string, string> = { brochure: "Brochures", report: "Reports", manual: "Exhibitor manuals", "floor-plan": "Floor plans", "media-kit": "Media kits", other: "Other documents" };

export default async function DownloadsPage() {
  const items = await getDownloads();
  const cats = [...new Set(items.map((d) => d.category || "other"))];
  return (
    <>
      <PageHero eyebrow="Resources" title="Downloads" intro={<p>Official documents from the organiser. Each file is labelled with the edition it applies to.</p>} crumbs={[{ label: "Media", href: "/media/" }, { label: "Downloads", href: "/downloads/" }]} />
      <Section>
        {items.length ? (
          <div className="grid gap-10">
            {cats.map((c) => (
              <section key={c} aria-labelledby={`dl-${c}`}>
                <h2 id={`dl-${c}`} className="mb-4 text-xl font-extrabold text-ink">{CAT[c] ?? c}</h2>
                <ul className="grid gap-3 md:grid-cols-2">
                  {items.filter((d) => (d.category || "other") === c).map((d) => (
                    <li key={d._id} className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5">
                      <div className="flex items-start gap-4">
                        <Icon.Download className="mt-0.5 size-6 shrink-0 text-brand-green" />
                        <div>
                          <p className="font-bold text-ink">{d.title}</p>
                          <p className="text-sm text-ink-muted">{[d.edition, d.fileType, d.fileSizeLabel].filter(Boolean).join(" · ")}</p>
                          {d.description ? <p className="mt-1 text-sm text-ink-soft">{d.description}</p> : null}
                        </div>
                      </div>
                      <DownloadLink href={d.fileUrl} title={d.title} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState icon="Download" title="Documents for 2027 are being prepared">The brochure, exhibitor manual and floor plan will be published here once approved.</EmptyState>
        )}
      </Section>
    </>
  );
}
