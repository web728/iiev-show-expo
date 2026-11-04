
import type { Metadata } from "next";

import { PageHero } from "@/components/ui/page-hero";
import { LightboxGrid } from "@/components/gallery/lightbox-grid";
import { AboutReveal } from "@/components/about/about-motion";

import { pageMetadata } from "@/lib/seo/metadata";
import {
  getAlbums,
  type PublicAlbum,
} from "@/lib/data/public";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Photo Gallery | India International EV Show",
  description:
    "Explore photographs from India International EV Show exhibitions, organised by their published edition year.",
  path: "/gallery/",
});

type GalleryGroup = {
  year: string;
  images: PublicAlbum["images"];
};

function getAlbumYear(
  album: PublicAlbum
): string | null {
  const text = String(
    album.edition ?? album.title ?? ""
  );

  const match = text.match(/\b20\d{2}\b/);

  return match ? match[0] : null;
}

function groupAlbumImages(
  albums: PublicAlbum[]
): GalleryGroup[] {
  const groups = new Map<
    string,
    PublicAlbum["images"]
  >();

  for (const album of albums) {
    const year =
      getAlbumYear(album) ?? "Previous Editions";

    const current = groups.get(year) ?? [];

    // Keep the source image data untouched:
    // src, alt, dimensions, focal point, etc.
    current.push(...album.images);

    groups.set(year, current);
  }

  return [...groups.entries()]
    .map(([year, images]) => ({
      year,
      images,
    }))
    .filter((group) => group.images.length > 0)
    .sort((a, b) => {
      const yearA = Number(a.year);
      const yearB = Number(b.year);

      if (!Number.isNaN(yearA) && !Number.isNaN(yearB)) {
        return yearB - yearA;
      }

      if (!Number.isNaN(yearA)) return -1;
      if (!Number.isNaN(yearB)) return 1;

      return a.year.localeCompare(b.year);
    });
}

export default async function GalleryPage() {
  const albums = await getAlbums();

  const groups = groupAlbumImages(albums);

  return (
    <>
      <PageHero
        eyebrow="IIEV Show Media"
        title="Photo"
        highlight="Gallery"
        description="A visual look at India International EV Show through photographs from its published exhibition editions."
        image="/media/2026/expo-hall-overview.webp"
        imagePosition="center 50%"
        crumbs={[
          { label: "Gallery" },
        ]}
      />

      <main className="bg-white">
        {/* GALLERY INTRO */}
        <section className="pb-8 pt-16 sm:pb-10 sm:pt-24">
          <div className="mx-auto max-w-[1380px] px-4 sm:px-7 lg:px-10">
            <AboutReveal className="mx-auto max-w-3xl text-center">
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-[#23A455]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#16893F]">
                  Exhibition Moments
                </span>
                <span className="h-px w-8 bg-[#23A455]" />
              </div>

              <h2 className="mt-5 text-[clamp(2rem,4.6vw,3.9rem)] font-extrabold leading-[1.1] tracking-[-0.055em] text-[#102A1E]">
                Moments from the{" "}
                <span className="text-[#23A455]">
                  exhibition floor.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-[14px] leading-8 text-[#5B6A60] sm:text-base">
                Explore photographs from previous
                editions of India International EV Show.
                Images are organised by their recorded
                exhibition edition.
              </p>
            </AboutReveal>
          </div>
        </section>

        {/* YEAR GROUPS */}
        {groups.length > 0 ? (
          <div className="mx-auto max-w-[1380px] space-y-16 px-4 pb-20 sm:space-y-20 sm:px-7 sm:pb-28 lg:px-10">
            {groups.map((group) => (
              <section
                key={group.year}
                aria-label={`${group.year} exhibition photos`}
              >
                {/* YEAR IS OUTSIDE THE PHOTOS */}
                <AboutReveal className="mb-7 flex items-center gap-5 sm:mb-9">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#16893F]">
                      India International EV Show
                    </p>
                    <h2 className="mt-2 text-[clamp(1.7rem,3vw,2.5rem)] font-extrabold leading-tight tracking-[-0.04em] text-[#102A1E]">
                      {group.year === "Previous Editions"
                        ? "Previous Editions"
                        : `${group.year} Gallery`}
                    </h2>
                  </div>

                  <div className="h-px flex-1 bg-[#DFE9E1]" />
                </AboutReveal>

                <LightboxGrid
                  images={group.images}
                />
              </section>
            ))}
          </div>
        ) : (
          <section className="mx-auto max-w-3xl px-5 py-24 text-center">
            <div className="rounded-3xl border border-[#DFE9E1] bg-[#F6FAF7] px-7 py-16">
              <h2 className="text-xl font-extrabold text-[#102A1E]">
                Gallery Photos Coming Soon
              </h2>

              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#647469]">
                Photographs will appear here when
                published exhibition albums are available.
              </p>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
