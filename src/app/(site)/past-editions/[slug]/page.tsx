
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileSearch,
  Images,
  Info,
  MapPin,
} from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { Markdown } from "@/components/ui/markdown";
import { pageMetadata } from "@/lib/seo/metadata";
import {
  getPastEdition,
  getPastEditions,
} from "@/lib/data/public";
import { pastEditions } from "@/content/history";
import { photos2026 } from "@/content/media";

export const revalidate = 300;

export function generateStaticParams() {
  return pastEditions.map((edition) => ({
    slug: edition.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/past-editions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const edition = await getPastEdition(slug);

  if (!edition) return {};

  return pageMetadata({
    title: `${edition.editionLabel} | ${edition.city} ${edition.year} | IIEV Show`,
    description:
      `${edition.title}. ` +
      `${edition.dates ?? "Historical event record"}` +
      `${edition.venue ? ` at ${edition.venue}` : ""}. ` +
      "Explore edition details, photographs and available sources.",
    path: `/past-editions/${edition.slug}/`,
  });
}

const confidenceConfig = {
  high: {
    label: "Verified",
    description: "Supported by official information.",
    Icon: CheckCircle2,
  },
  medium: {
    label: "Reported",
    description: "Published information awaiting confirmation.",
    Icon: FileSearch,
  },
  low: {
    label: "Being verified",
    description: "Some details remain under review.",
    Icon: Clock3,
  },
} as const;

export default async function PastEditionPage({
  params,
}: PageProps<"/past-editions/[slug]">) {
  const { slug } = await params;

  const [edition, allEditions] = await Promise.all([
    getPastEdition(slug),
    getPastEditions(),
  ]);

  if (!edition) notFound();

  const index = allEditions.findIndex(
    (item) => item.slug === edition.slug
  );

  const newer = index > 0 ? allEditions[index - 1] : null;
  const older =
    index >= 0 && index < allEditions.length - 1
      ? allEditions[index + 1]
      : null;

  const confidence =
    confidenceConfig[
      edition.confidence as keyof typeof confidenceConfig
    ] ?? confidenceConfig.low;

  const ConfidenceIcon = confidence.Icon;

  const gallery =
    edition.slug === "2026-pune"
      ? photos2026
          .filter((photo) =>
            ["inauguration", "expo", "conference", "b2b"].includes(
              photo.group
            )
          )
          .slice(0, 9)
      : [];

  return (
    <>
      {/* COMMON PAGE HERO */}
      <PageHero
        eyebrow={`${edition.editionLabel} · ${edition.year}`}
        title={edition.city}
        highlight={`${edition.year}`}
        description={[
          edition.dates ?? "Dates being verified",
          edition.venue,
        ]
          .filter(Boolean)
          .join(" · ")}
        image={
          edition.slug === "2026-pune"
            ? "/media/2026/inauguration-gate-group.webp"
            : "/media/2026/expo-crowd-hall.webp"
        }
        imagePosition="center 45%"
        crumbs={[
          {
            label: "Past Editions",
            href: "/past-editions/",
          },
          {
            label: `${edition.city} ${edition.year}`,
          },
        ]}
      />

      {/* EDITION OVERVIEW */}
      <section className="bg-white py-16 sm:py-22 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-4xl text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
              Exhibition Archive
            </p>

            <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.8rem)] font-extrabold leading-[1.13] tracking-[-0.055em] text-[#102A1E]">
              {edition.title}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#4A5750]">
              Historical information about this edition
              of India International EV Show.
            </p>
          </AboutReveal>

          {/* Edition data */}
          <AboutReveal
            delay={0.1}
            className="mt-12 grid overflow-hidden rounded-[22px] border border-[#DFE8E1] bg-[#DFE8E1] gap-px sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              {
                label: "Edition",
                value: edition.editionLabel,
                Icon: Info,
              },
              {
                label: "Location",
                value: edition.city,
                Icon: MapPin,
              },
              {
                label: "Event Dates",
                value: edition.dates ?? "Being verified",
                Icon: CalendarDays,
              },
            ].map(({ label, value, Icon }) => (
              <div
                key={label}
                className="flex min-h-[145px] flex-col justify-between bg-[#F7FAF7] p-6"
              >
                <div className="flex items-center gap-2 text-[#16893F]">
                  <Icon
                    size={17}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <dt className="text-[10px] font-extrabold uppercase tracking-[0.13em]">
                    {label}
                  </dt>
                </div>

                <dd className="mt-5 text-[17px] font-extrabold leading-6 text-[#102A1E]">
                  {value}
                </dd>
              </div>
            ))}

            <div className="flex min-h-[145px] flex-col justify-between bg-[#102A1E] p-6 text-white">
              <div className="flex items-center gap-2 text-[#23A455]">
                <ConfidenceIcon
                  size={17}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.13em]">
                  Record Status
                </span>
              </div>

              <div className="mt-5">
                <p className="text-[17px] font-extrabold">
                  {confidence.label}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-white/60">
                  {confidence.description}
                </p>
              </div>
            </div>
          </AboutReveal>

          {edition.venue && (
            <AboutReveal className="mt-4 flex items-start gap-3 rounded-xl border border-[#DFE8E1] bg-white px-5 py-4">
              <MapPin
                size={19}
                className="mt-0.5 shrink-0 text-[#16893F]"
                aria-hidden="true"
              />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#16893F]">
                  Event Venue
                </p>
                <p className="mt-1 text-[13px] font-semibold leading-6 text-[#102A1E]">
                  {edition.venue}
                </p>
              </div>
            </AboutReveal>
          )}
        </div>
      </section>

      {/* EDITION STORY */}
      <section className="bg-[#F5F9F5] py-16 sm:py-22 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
            <div className="min-w-0">
              <AboutReveal>
                <div className="flex items-center gap-3">
                  <span className="h-[2px] w-8 bg-[#23A455]" />
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
                    Edition Overview
                  </p>
                </div>

                <h2 className="mt-5 text-[clamp(1.9rem,3.8vw,3.2rem)] font-extrabold leading-[1.13] tracking-[-0.05em] text-[#102A1E]">
                  A closer look at
                  <span className="text-[#23A455]">
                    {" "}the exhibition.
                  </span>
                </h2>

                {/* Existing Markdown renderer */}
                <div
                  className="
                    mt-8 max-w-none
                    text-[14px] leading-8 text-[#4A5750]
                    [&_h2]:mb-4
                    [&_h2]:mt-9
                    [&_h2]:text-2xl
                    [&_h2]:font-extrabold
                    [&_h2]:tracking-tight
                    [&_h2]:text-[#102A1E]
                    [&_h3]:mb-3
                    [&_h3]:mt-7
                    [&_h3]:text-lg
                    [&_h3]:font-extrabold
                    [&_h3]:text-[#102A1E]
                    [&_p]:mb-5
                    [&_ul]:mb-5
                    [&_ul]:list-disc
                    [&_ul]:space-y-2
                    [&_ul]:pl-6
                    [&_ol]:mb-5
                    [&_ol]:list-decimal
                    [&_ol]:space-y-2
                    [&_ol]:pl-6
                    [&_strong]:font-bold
                    [&_strong]:text-[#102A1E]
                    [&_a]:font-semibold
                    [&_a]:text-[#16893F]
                    [&_a]:underline
                    [&_a]:underline-offset-4
                  "
                >
                  <Markdown
                    source={edition.body || edition.summary}
                  />
                </div>
              </AboutReveal>

              {/* Verified statistics */}
              {edition.verifiedStats?.length ? (
                <AboutReveal className="mt-12">
                  <h3 className="text-xl font-extrabold tracking-tight text-[#102A1E] sm:text-2xl">
                    Documented Figures
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#4A5750]">
                    Figures are displayed only where
                    supporting sources are available.
                  </p>

                  <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {edition.verifiedStats.map((stat) => (
                      <div
                        key={`${stat.label}-${stat.value}`}
                        className="rounded-2xl border border-[#DFE8E1] bg-white p-6"
                      >
                        <dd className="break-words text-[clamp(1.5rem,3vw,2.1rem)] font-extrabold tracking-tight text-[#102A1E] tabular-nums">
                          {stat.value}
                        </dd>

                        <dt className="mt-2 text-[13px] font-semibold text-[#4A5750]">
                          {stat.label}
                        </dt>

                        <p className="mt-4 border-t border-[#EBF0EC] pt-3 text-[11px] leading-5 text-[#718076]">
                          Source: {stat.source}
                        </p>
                      </div>
                    ))}
                  </dl>
                </AboutReveal>
              ) : null}

              {/* Verification notice */}
              {edition.contradictions && (
                <AboutReveal className="mt-10">
                  <div className="rounded-2xl border border-[#DDE5DD] bg-white p-6 sm:p-7">
                    <div className="flex items-center gap-3">
                      <Info
                        size={20}
                        aria-hidden="true"
                        className="shrink-0 text-[#16893F]"
                      />

                      <h3 className="text-[15px] font-extrabold text-[#102A1E]">
                        Verification Note
                      </h3>
                    </div>

                    <p className="mt-4 text-[13px] leading-7 text-[#4A5750]">
                      {edition.contradictions}
                    </p>
                  </div>
                </AboutReveal>
              )}

              {/* Report download */}
              {edition.reportUrl && (
                <AboutReveal className="mt-8">
                  <a
                    href={edition.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[#23A455] bg-white px-6 text-[13px] font-bold text-[#16893F] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#23A455] hover:text-white"
                  >
                    <Download
                      size={17}
                      aria-hidden="true"
                    />
                    View Post-Show Report
                    <ExternalLink
                      size={15}
                      aria-hidden="true"
                    />
                  </a>
                </AboutReveal>
              )}
            </div>

            {/* Sidebar */}
            <AboutReveal
              delay={0.1}
              className="h-fit lg:sticky lg:top-28"
            >
              <div className="overflow-hidden rounded-[22px] border border-[#DFE8E1] bg-white">
                <div className="border-b border-[#DFE8E1] bg-[#102A1E] px-6 py-6 text-white">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#23A455]">
                    Explore the Archive
                  </p>

                  <h3 className="mt-2 text-xl font-extrabold">
                    Other Editions
                  </h3>
                </div>

                <div className="p-4">
                  {newer && (
                    <Link
                      href={`/past-editions/${newer.slug}/`}
                      className="group flex items-center justify-between gap-3 rounded-xl px-3 py-4 transition-colors hover:bg-[#F1F8F3]"
                    >
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#16893F]">
                          Newer Edition
                        </p>

                        <p className="mt-1 text-[13px] font-extrabold text-[#102A1E]">
                          {newer.city} · {newer.year}
                        </p>
                      </div>

                      <ArrowUpRight
                        size={17}
                        aria-hidden="true"
                        className="shrink-0 text-[#16893F]"
                      />
                    </Link>
                  )}

                  {older && (
                    <Link
                      href={`/past-editions/${older.slug}/`}
                      className="group flex items-center justify-between gap-3 rounded-xl px-3 py-4 transition-colors hover:bg-[#F1F8F3]"
                    >
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#16893F]">
                          Earlier Edition
                        </p>

                        <p className="mt-1 text-[13px] font-extrabold text-[#102A1E]">
                          {older.city} · {older.year}
                        </p>
                      </div>

                      <ArrowUpRight
                        size={17}
                        aria-hidden="true"
                        className="shrink-0 text-[#16893F]"
                      />
                    </Link>
                  )}

                  <div className="mt-2 border-t border-[#E9EFEA] pt-3">
                    <Link
                      href="/past-editions/"
                      className="group flex items-center gap-2 rounded-xl px-3 py-3 text-[12px] font-bold text-[#16893F] transition-colors hover:bg-[#F1F8F3]"
                    >
                      <ArrowLeft
                        size={16}
                        aria-hidden="true"
                      />
                      View All Past Editions
                    </Link>
                  </div>
                </div>
              </div>

              <p className="mt-5 px-2 text-[12px] leading-6 text-[#718076]">
                Found an error in this record?{" "}
                <Link
                  href="/contact/"
                  className="font-bold text-[#16893F] underline underline-offset-4 hover:text-[#102A1E]"
                >
                  Contact the team
                </Link>{" "}
                with a supporting source.
              </p>
            </AboutReveal>
          </div>
        </div>
      </section>

      {/* 2026 PHOTO GALLERY */}
      {gallery.length > 0 && (
        <section className="bg-white py-16 sm:py-22 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <AboutReveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-[2px] w-8 bg-[#23A455]" />
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
                    Event Photography
                  </p>
                </div>

                <h2 className="mt-5 text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
                  Moments from
                  <span className="text-[#23A455]">
                    {" "}IIEV 2026.
                  </span>
                </h2>
              </div>

              <Link
                href="/gallery/iiev-2026-pune/"
                className="group inline-flex w-fit items-center gap-2 border-b-2 border-[#23A455] pb-2 text-[13px] font-bold text-[#16893F] transition-colors hover:text-[#102A1E]"
              >
                View Full Gallery
                <ArrowUpRight
                  size={17}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </AboutReveal>

            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
              {gallery.map((photo, index) => (
                <AboutReveal
                  key={photo.slug}
                  delay={(index % 3) * 0.05}
                >
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#102A1E] sm:rounded-2xl">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 30vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.055]"
                    />

                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#091B13]/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />

                    <span
                      aria-hidden="true"
                      className="absolute bottom-4 right-4 flex size-9 items-center justify-center rounded-full bg-[#23A455] text-white opacity-0 transition-all duration-300 group-hover:opacity-100"
                    >
                      <Images size={16} />
                    </span>
                  </div>
                </AboutReveal>
              ))}
            </div>

            <p className="mt-5 text-[12px] text-[#708076]">
              Photographs from the 2026 exhibition.
            </p>
          </div>
        </section>
      )}

      {/* SOURCES */}
      <section
        id="sources"
        className="scroll-mt-28 border-t border-[#DFE8E1] bg-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-[#23A455]" />
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
                References
              </p>
            </div>

            <h2 className="mt-5 text-[clamp(1.9rem,3.8vw,3.2rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
              Sources and
              <span className="text-[#23A455]">
                {" "}documentation.
              </span>
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#4A5750]">
              Historical records are supported by the
              sources listed below. Information may be
              updated as additional documentation becomes
              available.
            </p>
          </AboutReveal>

          {edition.sources.length > 0 ? (
            <div className="mt-9 grid gap-3 md:grid-cols-2">
              {edition.sources.map((source, index) => (
                <AboutReveal
                  key={`${source.url}-${source.label}`}
                  delay={(index % 2) * 0.05}
                >
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="group flex h-full items-start justify-between gap-4 rounded-2xl border border-[#DFE8E1] bg-[#F7FAF7] p-6 transition-all duration-300 hover:border-[#23A455]/50 hover:bg-[#F0F8F2]"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-extrabold leading-6 text-[#102A1E] group-hover:text-[#16893F]">
                        {source.label}
                      </p>

                      <p className="mt-2 text-[11px] leading-5 text-[#718076]">
                        Recorded: {source.capturedAt}
                      </p>
                    </div>

                    <ExternalLink
                      size={17}
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-[#16893F]"
                    />
                  </a>
                </AboutReveal>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-[#DFE8E1] bg-[#F7FAF7] p-6 text-sm text-[#4A5750]">
              No source links are currently published
              for this record.
            </div>
          )}
        </div>
      </section>

      {/* NEXT EDITION CTA */}
      <section className="relative isolate overflow-hidden bg-[#091B13] py-18 text-white sm:py-22">
        <svg
          viewBox="0 0 500 500"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-40 h-[500px] w-[500px] opacity-25"
        >
          <circle
            cx="250"
            cy="250"
            r="215"
            stroke="#23A455"
          />
          <circle
            cx="250"
            cy="250"
            r="150"
            stroke="#23A455"
          />
          <circle
            cx="250"
            cy="250"
            r="85"
            stroke="#23A455"
            strokeDasharray="6 13"
          />
        </svg>

        <AboutReveal className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/55">
            India International EV Show 2027
          </p>

          <h2 className="mt-5 text-[clamp(2.1rem,4.6vw,4rem)] font-extrabold leading-[1.12] tracking-[-0.055em]">
            The next chapter
            <span className="text-[#23A455]">
              {" "}begins in Pune.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-8 text-white/70">
            Join the 9th edition of IIEV Show,
            14–16 October 2027, at Auto Cluster
            Exhibition Centre, Pimpri-Chinchwad, Pune.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/exhibit/book-a-stall/"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#23A455] px-6 text-[13px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#16893F]"
            >
              Book Your Stall
              <ArrowUpRight
                size={17}
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/visit/register/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-6 text-[13px] font-bold text-white transition-colors hover:bg-white/10"
            >
              Register as Visitor
              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </Link>
          </div>
        </AboutReveal>
      </section>
    </>
  );
}
  