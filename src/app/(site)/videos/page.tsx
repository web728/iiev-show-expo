
import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowUpRight,
  Clapperboard,
  Film,
  Play,
  Video,
} from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { YouTubeFacade } from "@/components/sections/youtube-facade";
import { TestimonialWall } from "@/components/sections/testimonial-wall";

import { pageMetadata } from "@/lib/seo/metadata";
import { getVideos } from "@/lib/data/public";
import { heroVideo, testimonials } from "@/content/media";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Videos | India International EV Show",
  description:
    "Watch India International EV Show 2026 exhibition footage, exhibitor testimonials and published event videos.",
  path: "/videos/",
});

function SectionEyebrow({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="h-[2px] w-7 bg-[#23A455]"
      />

      <span
        className={`text-[10px] font-extrabold uppercase tracking-[0.18em] sm:text-[11px] ${
          light
            ? "text-[#77DEA0]"
            : "text-[#16893F]"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

export default async function VideosPage() {
  const videos = await getVideos();

  const publishedVideos = videos.filter(
    (video) => Boolean(video.youtubeId)
  );

  const hasShowFloorVideo = Boolean(heroVideo.src);
  const hasTestimonials = testimonials.length > 0;

  return (
    <>
      {/* =========================================
          PAGE HERO
      ========================================= */}
      <PageHero
        eyebrow="IIEV Show Media"
        title="Video"
        highlight="Gallery"
        description="Watch moments from the exhibition floor, exhibitor testimonials and published videos from India International EV Show."
        image="/media/2026/expo-scooter-stage.webp"
        imagePosition="center 48%"
        crumbs={[
          {
            label: "Videos",
          },
        ]}
      />

      {/* =========================================
          INTRODUCTION
      ========================================= */}
      <section className="bg-white pb-11 pt-16 sm:pb-14 sm:pt-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <SectionEyebrow>
                Exhibition Films
              </SectionEyebrow>
            </div>

            <h2 className="mt-5 text-[clamp(2rem,4.6vw,3.8rem)] font-extrabold leading-[1.1] tracking-[-0.055em] text-[#102A1E]">
              Experience the show{" "}
              <span className="text-[#23A455]">
                through video.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-[14px] leading-8 text-[#526357] sm:text-base">
              Explore footage from the 2026 edition
              in Pune, including the exhibition
              floor and recorded exhibitor experiences.
            </p>
          </AboutReveal>
        </div>
      </section>

      {/* =========================================
          FEATURED SHOW FLOOR VIDEO
      ========================================= */}
      {hasShowFloorVideo && (
        <section className="bg-white pb-18 sm:pb-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <AboutReveal>
              <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <SectionEyebrow>
                    Featured Video
                  </SectionEyebrow>

                  <h2 className="mt-4 text-[clamp(1.7rem,3.4vw,2.8rem)] font-extrabold leading-[1.15] tracking-[-0.045em] text-[#102A1E]">
                    IIEV Show{" "}
                    <span className="text-[#23A455]">
                      2026 Highlights
                    </span>
                  </h2>

                  <p className="mt-3 text-[13px] leading-7 text-[#647468]">
                    A look at the 2026 exhibition floor
                    in Pune.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#DBE9DE] bg-[#F5FAF6] px-4 py-2 text-[11px] font-bold text-[#16893F] sm:self-auto">
                  <Film
                    size={15}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  Show Floor Film
                </div>
              </div>

              <div className="overflow-hidden rounded-[22px] border border-[#DAE7DD] bg-[#091B13] shadow-[0_24px_70px_-45px_rgba(9,27,19,0.55)]">
                <div className="relative aspect-video w-full overflow-hidden bg-[#091B13]">
                  <video
                    src={heroVideo.src}
                    poster={heroVideo.poster}
                    controls
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-contain"
                    aria-label="India International EV Show 2026 exhibition floor highlights"
                  >
                    Your browser does not support
                    HTML5 video playback.
                  </video>
                </div>

                <div className="flex flex-col gap-3 border-t border-white/10 bg-[#102A1E] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#74DB9A]">
                      India International EV Show
                    </p>

                    <h3 className="mt-2 text-[15px] font-extrabold text-white sm:text-base">
                      Exhibition Highlights — 2026
                    </h3>
                  </div>

                  <p className="text-[12px] text-white/55">
                    Pune, Maharashtra
                  </p>
                </div>
              </div>
            </AboutReveal>
          </div>
        </section>
      )}

      {/* =========================================
          EXHIBITOR TESTIMONIALS
      ========================================= */}
      {hasTestimonials && (
        <section className="relative overflow-hidden bg-[#091B13] py-18 sm:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-44 -top-44 size-[420px] rounded-full border border-[#23A455]/10"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 size-[270px] rounded-full border border-[#23A455]/10"
          />

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <AboutReveal className="mb-10 max-w-3xl">
              <SectionEyebrow light>
                Exhibitor Testimonials
              </SectionEyebrow>

              <h2 className="mt-5 text-[clamp(2rem,4.4vw,3.5rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-white">
                Hear from the{" "}
                <span className="text-[#48C979]">
                  exhibition floor.
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-[14px] leading-8 text-white/65">
                Recorded exhibitor testimonials
                from India International EV Show 2026.
              </p>
            </AboutReveal>

            <AboutReveal delay={0.1}>
              <TestimonialWall
                items={testimonials}
              />
            </AboutReveal>
          </div>
        </section>
      )}

      {/* =========================================
          MORE PUBLISHED VIDEOS
      ========================================= */}
      {publishedVideos.length > 0 && (
        <section className="bg-[#F6F9F6] py-18 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <AboutReveal className="mb-10 max-w-3xl">
              <SectionEyebrow>
                Video Collection
              </SectionEyebrow>

              <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
                More films &{" "}
                <span className="text-[#23A455]">
                  highlights.
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-[13px] leading-7 text-[#526357] sm:text-sm">
                Additional videos published by the
                event team.
              </p>
            </AboutReveal>

            <div className="grid gap-6 md:grid-cols-2">
              {publishedVideos.map(
                (video, index) => (
                  <AboutReveal
                    key={String(video._id)}
                    delay={Math.min(
                      index * 0.05,
                      0.2
                    )}
                  >
                    <article className="group h-full overflow-hidden rounded-[20px] border border-[#DEE9E0] bg-white shadow-[0_15px_45px_-40px_rgba(9,27,19,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-[#B9D7C2] hover:shadow-[0_25px_55px_-40px_rgba(9,27,19,0.3)]">
                      <div className="aspect-video overflow-hidden bg-[#091B13]">
                        <YouTubeFacade
                          id={video.youtubeId}
                          title={video.title}
                        />
                      </div>

                      <div className="p-6 sm:p-7">
                        {video.edition && (
                          <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#16893F]">
                            {video.edition}
                          </p>
                        )}

                        <h3 className="text-[17px] font-extrabold leading-snug tracking-[-0.025em] text-[#102A1E]">
                          {video.title}
                        </h3>

                        {video.description && (
                          <p className="mt-3 text-[13px] leading-7 text-[#617166]">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </article>
                  </AboutReveal>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* =========================================
          NO PUBLISHED VIDEO FALLBACK
      ========================================= */}
      {!hasShowFloorVideo &&
        !hasTestimonials &&
        publishedVideos.length === 0 && (
          <section className="bg-white pb-24">
            <div className="mx-auto max-w-3xl px-5 text-center">
              <div className="rounded-[24px] border border-[#DDE8DF] bg-[#F7FAF7] px-6 py-14 sm:px-10">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#E9F6EC] text-[#16893F]">
                  <Video
                    size={27}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </span>

                <h2 className="mt-6 text-xl font-extrabold tracking-tight text-[#102A1E]">
                  Videos Coming Soon
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#607165]">
                  Published exhibition videos
                  will appear here when available.
                </p>
              </div>
            </div>
          </section>
        )}

      {/* =========================================
          SIMPLE MEDIA NAVIGATION
      ========================================= */}
      <section className="border-t border-[#DFE9E1] bg-white py-14 sm:py-18">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <AboutReveal className="max-w-xl">
            <SectionEyebrow>
              More Event Media
            </SectionEyebrow>

            <h2 className="mt-4 text-xl font-extrabold tracking-[-0.035em] text-[#102A1E] sm:text-2xl">
              Explore exhibition photographs.
            </h2>

            <p className="mt-3 text-[13px] leading-7 text-[#617166]">
              Browse the photo gallery for
              images from previous editions.
            </p>
          </AboutReveal>

          <Link
            href="/gallery/"
            className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[#23A455] px-7 text-[13px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#16893F] md:self-auto"
          >
            View Photo Gallery

            <ArrowUpRight
              size={17}
              strokeWidth={1.8}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </section>
    </>
  );
}
