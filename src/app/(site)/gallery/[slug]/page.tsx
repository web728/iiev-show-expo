import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero, Section } from "@/components/ui/layout-blocks";
import { LightboxGrid } from "@/components/sections/lightbox-grid";
import { pageMetadata } from "@/lib/seo/metadata";
import { getAlbum } from "@/lib/data/public";

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<"/gallery/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = await getAlbum(slug);
  if (!a) return {};
  return pageMetadata({ title: `${a.title} — Gallery`, description: a.description || `Photographs: ${a.title}.`, path: `/gallery/${a.slug}/`, image: a.images[0]?.src });
}

export default async function AlbumPage({ params }: PageProps<"/gallery/[slug]">) {
  const { slug } = await params;
  const a = await getAlbum(slug);
  if (!a) notFound();
  return (
    <>
      <PageHero image={a.images[0] ? { src: a.images[0].src } : undefined} eyebrow={a.edition ? `Gallery · ${a.edition}` : "Gallery"} title={a.title} intro={a.description ? <p>{a.description}</p> : undefined} crumbs={[{ label: "Media", href: "/media/" }, { label: "Gallery", href: "/gallery/" }, { label: a.title, href: `/gallery/${a.slug}/` }]} />
      <Section>
        <p className="mb-6 text-sm text-ink-muted">{a.images.length} photographs · tap any photo to view it full screen (use ← → keys on desktop).</p>
        <LightboxGrid images={a.images} />
      </Section>
    </>
  );
}
