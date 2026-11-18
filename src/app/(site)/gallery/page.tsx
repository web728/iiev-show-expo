import type { Metadata } from "next";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { MediaGallery } from "@/components/gallery/media-gallery";
import { YouTubeFacade } from "@/components/sections/youtube-facade";
import { TestimonialWall } from "@/components/sections/testimonial-wall";

import { pageMetadata } from "@/lib/seo/metadata";
import { getVideos } from "@/lib/data/public";
import {
  getLocalPhotos,
  getLocalVideos,
} from "@/lib/data/local-media";
import { testimonials } from "@/content/media";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Photo & Video Gallery | India International EV Show",
  description:
    "Browse photographs and videos from India International EV Show exhibitions, including exhibition highlights and exhibitor testimonials.",
  path: "/gallery/",
});

export default async function GalleryPage() {
  const [photos, localVideos, publishedVideos] = await Promise.all([
    getLocalPhotos(),
    getLocalVideos(),
    getVideos(),
  ]);

  const youtube = publishedVideos.filter((video) =>
    Boolean(video.youtubeId)
  );

  const hasTestimonials = testimonials.length > 0;

  // Rendered on the server and shown below the local videos in the Videos tab.
  const videosExtra =
    youtube.length > 0 || hasTestimonials ? (
      <div className="space-y-16 sm:space-y-20">
        {youtube.length > 0 && (
          <section>
            <AboutReveal className="mb-8 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-7 bg-[#23A455]" />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
                  Video Collection
                </span>
              </div>

              <h3 className="mt-4 text-[clamp(1.6rem,3.2vw,2.6rem)] font-extrabold leading-[1.15] tracking-[-0.045em] text-[#102A1E]">
                More films &{" "}
                <span className="text-[#23A455]">highlights.</span>
              </h3>
            </AboutReveal>

            <div className="grid gap-6 md:grid-cols-2">
              {youtube.map((video) => (
                <article
                  key={String(video._id)}
                  className="overflow-hidden rounded-[20px] border border-[#DEE9E0] bg-white shadow-[0_15px_45px_-40px_rgba(9,27,19,.35)]"
                >
                  <div className="aspect-video overflow-hidden bg-[#091B13]">
                    <YouTubeFacade
                      id={video.youtubeId}
                      title={video.title}
                    />
                  </div>

                  <div className="p-6">
                    {video.edition && (
                      <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#16893F]">
                        {video.edition}
                      </p>
                    )}

                    <h4 className="text-[17px] font-extrabold leading-snug tracking-[-0.025em] text-[#102A1E]">
                      {video.title}
                    </h4>

                    {video.description && (
                      <p className="mt-3 text-[13px] leading-7 text-[#617166]">
                        {video.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {hasTestimonials && (
          <section className="rounded-[28px] bg-[#091B13] p-6 sm:p-10">
            <AboutReveal className="mb-8 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-7 bg-[#23A455]" />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#77DEA0]">
                  Exhibitor Testimonials
                </span>
              </div>

              <h3 className="mt-4 text-[clamp(1.6rem,3.2vw,2.6rem)] font-extrabold leading-[1.15] tracking-[-0.045em] text-white">
                Hear from the{" "}
                <span className="text-[#48C979]">
                  exhibition floor.
                </span>
              </h3>
            </AboutReveal>

            <TestimonialWall items={testimonials} />
          </section>
        )}
      </div>
    ) : null;

  return (
    <>
      <PageHero
        eyebrow="IIEV Show Media"
        title="Media"
        highlight="Gallery"
        description="Photographs and videos from India International EV Show, the exhibition floor, exhibitors and visitors."
        image="/media/2026/expo-hall-overview.webp"
        imagePosition="center 50%"
        crumbs={[{ label: "Gallery" }]}
      />

      <MediaGallery
        photos={photos}
        videos={localVideos}
        videosExtra={videosExtra}
      />
    </>
  );
}