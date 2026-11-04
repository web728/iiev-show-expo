
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileSearch,
  MapPin,
} from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPastEditions } from "@/lib/data/public";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Past Editions | India International EV Show",
  description:
    "Explore the history of India International EV Show since 2022, including previous exhibitions, locations, dates and supporting event records.",
  path: "/past-editions/",
});

type Confidence = "high" | "medium" | "low";

const confidenceConfig = {
  high: {
    label: "Verified",
    Icon: CheckCircle2,
    className:
      "border-[#23A455]/25 bg-[#23A455]/10 text-[#16893F]",
  },
  medium: {
    label: "Reported",
    Icon: FileSearch,
    className:
      "border-[#D7E3D9] bg-[#F1F5F1] text-[#425B48]",
  },
  low: {
    label: "Being verified",
    Icon: Clock3,
    className:
      "border-[#E4E8E3] bg-[#F5F6F4] text-[#59665C]",
  },
} as const;

function Status({
  confidence,
}: {
  confidence: Confidence;
}) {
  const config = confidenceConfig[confidence];
  const StatusIcon = config.Icon;

  return (
    <span
      className={`
        inline-flex w-fit items-center gap-2
        rounded-full border px-3 py-1.5
        text-[10px] font-bold
        ${config.className}
      `}
    >
      <StatusIcon
        size={13}
        strokeWidth={2}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

export default async function PastEditionsPage() {
  const editions = await getPastEditions();

  const years = editions
    .map((edition) => Number(edition.year))
    .filter(Number.isFinite);

  const firstYear = years.length
    ? Math.min(...years)
    : null;

  return (
    <>
      {/* SHARED INNER-PAGE HERO */}
      <PageHero
        eyebrow="Our Exhibition History"
        title="The IIEV"
        highlight="Journey"
        description="Explore previous editions of India International EV Show, the cities that hosted them and the industry connections made along the way."
        image="/media/2026/inauguration-gate-group.webp"
        imagePosition="center 45%"
        crumbs={[
          { label: "About", href: "/about/" },
          { label: "Past Editions" },
        ]}
      />

      {/* INTRODUCTION */}
      <section className="overflow-hidden bg-white py-16 sm:py-22 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-4xl text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
              Previous Editions
            </p>

            <h2 className="mt-5 text-[clamp(2rem,4.7vw,4rem)] font-extrabold leading-[1.12] tracking-[-0.055em] text-[#102A1E]">
              A growing platform for
              <span className="text-[#23A455]">
                {" "}electric mobility.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-[740px] text-[14px] leading-8 text-[#4A5750] sm:text-base">
              Across its editions, IIEV has brought
              together businesses working in electric
              vehicles, components, charging infrastructure
              and mobility technologies. Explore the
              exhibition's previous events and their
              available historical records.
            </p>
          </AboutReveal>

          {/* Archive facts */}
          <AboutReveal
            delay={0.1}
            className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[#DFE8E1] bg-[#DFE8E1] sm:grid-cols-3"
          >
            <div className="bg-[#F7FAF7] px-6 py-7 text-center">
              <p className="text-[clamp(1.6rem,3vw,2.5rem)] font-extrabold tracking-tight text-[#102A1E]">
                {editions.length}
              </p>
              <p className="mt-2 text-xs font-medium text-[#627467]">
                Editions in the archive
              </p>
            </div>

            <div className="bg-[#F7FAF7] px-6 py-7 text-center">
              <p className="text-[clamp(1.6rem,3vw,2.5rem)] font-extrabold tracking-tight text-[#102A1E]">
                {firstYear ?? "—"}
              </p>
              <p className="mt-2 text-xs font-medium text-[#627467]">
                Earliest recorded year
              </p>
            </div>

            <div className="bg-[#F7FAF7] px-6 py-7 text-center">
              <p className="text-[clamp(1.6rem,3vw,2.5rem)] font-extrabold tracking-tight text-[#102A1E]">
                {new Set(
                  editions.map((edition) =>
                    edition.city.trim().toLowerCase()
                  )
                ).size}
              </p>
              <p className="mt-2 text-xs font-medium text-[#627467]">
                Cities represented
              </p>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* EDITION TIMELINE */}
      <section className="relative overflow-hidden bg-[#F5F9F5] py-18 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mb-12 max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-[#23A455]" />
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
                Exhibition Archive
              </p>
            </div>

            <h2 className="mt-5 text-[clamp(2rem,4.3vw,3.7rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
              Explore every
              <span className="text-[#23A455]">
                {" "}edition.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#4A5750]">
              Browse past events by year, location and
              edition. Individual records include supporting
              information and sources where available.
            </p>
          </AboutReveal>

          {editions.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div
                aria-hidden="true"
                className="
                  absolute bottom-5 left-[15px] top-5
                  w-px bg-[#CADBCD]
                  sm:left-[27px]
                "
              />

              <ol className="space-y-6 sm:space-y-8">
                {editions.map((edition, index) => (
                  <li
                    key={edition.slug}
                    className="relative pl-10 sm:pl-20"
                  >
                    {/* Timeline marker */}
                    <span
                      aria-hidden="true"
                      className="
                        absolute left-[8px] top-10 z-10
                        flex size-[15px]
                        rounded-full border-[3px]
                        border-[#F5F9F5]
                        bg-[#23A455]
                        ring-1 ring-[#23A455]/40
                        sm:left-[20px]
                      "
                    />

                    <AboutReveal
                      delay={Math.min(index, 3) * 0.05}
                    >
                      <Link
                        href={`/past-editions/${edition.slug}/`}
                        className="
                          group relative block overflow-hidden
                          rounded-[22px]
                          border border-[#DFE8E1]
                          bg-white
                          p-6
                          transition-[border-color,box-shadow,transform]
                          duration-300
                          hover:-translate-y-1
                          hover:border-[#23A455]/50
                          hover:shadow-[0_24px_55px_-38px_rgba(9,27,19,0.45)]
                          focus-visible:outline-2
                          focus-visible:outline-offset-3
                          focus-visible:outline-[#23A455]
                          sm:p-8
                        "
                      >
                        {/* Decorative geometry */}
                        <svg
                          viewBox="0 0 200 200"
                          fill="none"
                          aria-hidden="true"
                          className="
                            pointer-events-none absolute
                            -right-12 -top-16
                            h-48 w-48
                            text-[#23A455]
                            opacity-[0.07]
                            transition-transform duration-500
                            group-hover:-translate-x-2
                          "
                        >
                          <circle
                            cx="100"
                            cy="100"
                            r="83"
                            stroke="currentColor"
                          />
                          <circle
                            cx="100"
                            cy="100"
                            r="58"
                            stroke="currentColor"
                          />
                          <circle
                            cx="100"
                            cy="100"
                            r="30"
                            stroke="currentColor"
                          />
                        </svg>

                        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#16893F]">
                                {edition.editionLabel}
                              </span>

                              <span className="h-1 w-1 rounded-full bg-[#A9B9AD]" />

                              <span className="text-[12px] font-semibold text-[#647368]">
                                {edition.year}
                              </span>
                            </div>

                            <h3
                              className="
                                mt-4 text-[clamp(1.5rem,3vw,2.4rem)]
                                font-extrabold leading-tight
                                tracking-[-0.045em]
                                text-[#102A1E]
                                transition-colors duration-300
                                group-hover:text-[#16893F]
                              "
                            >
                              {edition.city}
                            </h3>

                            <div className="mt-4 flex flex-col gap-2 text-[12px] leading-6 text-[#566A5D] sm:text-[13px]">
                              <span className="flex items-start gap-2">
                                <CalendarDays
                                  size={16}
                                  aria-hidden="true"
                                  className="mt-1 shrink-0 text-[#16893F]"
                                />
                                {edition.dates ??
                                  "Dates being verified"}
                              </span>

                              {edition.venue && (
                                <span className="flex items-start gap-2">
                                  <MapPin
                                    size={16}
                                    aria-hidden="true"
                                    className="mt-1 shrink-0 text-[#16893F]"
                                  />
                                  {edition.venue}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center justify-between gap-5 md:flex-col md:items-end">
                            <Status
                              confidence={
                                edition.confidence as Confidence
                              }
                            />

                            <span
                              className="
                                inline-flex size-11
                                items-center justify-center
                                rounded-full border
                                border-[#DDE8E0]
                                text-[#16893F]
                                transition-all duration-300
                                group-hover:border-[#23A455]
                                group-hover:bg-[#23A455]
                                group-hover:text-white
                              "
                            >
                              <ArrowUpRight
                                size={19}
                                strokeWidth={1.8}
                                aria-hidden="true"
                                className="
                                  transition-transform duration-300
                                  group-hover:translate-x-0.5
                                  group-hover:-translate-y-0.5
                                "
                              />
                            </span>
                          </div>
                        </div>

                        <div className="relative mt-6 flex items-center justify-between border-t border-[#E9EFEA] pt-4">
                          <span className="text-[11px] font-bold text-[#657469]">
                            Historical event record
                          </span>

                          <span
                            className="
                              inline-flex items-center gap-2
                              text-[11px] font-extrabold
                              text-[#16893F]
                              sm:text-[12px]
                            "
                          >
                            View Edition
                            <ArrowRight
                              size={15}
                              aria-hidden="true"
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </span>
                        </div>
                      </Link>
                    </AboutReveal>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#DFE8E1] bg-white p-8 text-center text-sm text-[#4A5750]">
              No historical edition records are currently available.
            </div>
          )}
        </div>
      </section>

      {/* RECORDS AND TRANSPARENCY */}
      <section className="bg-white py-16 sm:py-22">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-16 lg:px-10">
          <AboutReveal>
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-[#23A455]" />
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
                Archive Information
              </p>
            </div>

            <h2 className="mt-5 text-[clamp(1.9rem,4vw,3.3rem)] font-extrabold leading-[1.13] tracking-[-0.05em] text-[#102A1E]">
              Clear records.
              <span className="block text-[#23A455]">
                Reliable context.
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-8 text-[#4A5750]">
              Historical event details are presented with
              their available sources. Where information is
              incomplete or requires further confirmation,
              the record identifies its current status.
            </p>
          </AboutReveal>

          <AboutReveal delay={0.1}>
            <div className="overflow-hidden rounded-[22px] border border-[#DFE8E1] bg-[#F7FAF7]">
              {[
                {
                  icon: CheckCircle2,
                  title: "Verified",
                  text: "Supported by official organiser information or an official document.",
                },
                {
                  icon: FileSearch,
                  title: "Reported",
                  text: "Documented by external publications or event listings, pending organiser confirmation.",
                },
                {
                  icon: Clock3,
                  title: "Being verified",
                  text: "Details remain under review or supporting information is incomplete.",
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={`
                      flex gap-4 px-6 py-6 sm:px-8
                      ${
                        index !== 2
                          ? "border-b border-[#DFE8E1]"
                          : ""
                      }
                    `}
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E5F3E9] text-[#16893F]">
                      <Icon
                        size={20}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <h3 className="text-[14px] font-extrabold text-[#102A1E]">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-[12px] leading-6 text-[#5F7063]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden bg-[#091B13] py-18 text-white sm:py-22">
        <svg
          viewBox="0 0 500 500"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 -top-40 h-[500px] w-[500px] opacity-25"
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
            r="155"
            stroke="#23A455"
          />
          <circle
            cx="250"
            cy="250"
            r="95"
            stroke="#23A455"
            strokeDasharray="5 12"
          />
        </svg>

        <AboutReveal className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/60">
            IIEV 2027
          </p>

          <h2 className="mt-5 text-[clamp(2.1rem,4.7vw,4rem)] font-extrabold leading-[1.12] tracking-[-0.055em]">
            Be part of the
            <span className="text-[#23A455]">
              {" "}next edition.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-8 text-white/70">
            Explore opportunities to exhibit or visit
            India International EV Show 2027 in Pune.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
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
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-6 text-[13px] font-bold text-white transition-colors hover:bg-white/10"
            >
              Register as Visitor
            </Link>
          </div>
        </AboutReveal>
      </section>
    </>
  );
}
