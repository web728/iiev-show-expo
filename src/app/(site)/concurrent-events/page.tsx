
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  BatteryCharging,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Factory,
  MapPin,
  PlugZap,
  Sun,
} from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCurrentEdition } from "@/lib/data/edition";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Concurrent Events | EV, Battery & Solar Exhibitions",
  description:
    "Explore the battery and solar exhibitions associated with India International EV Show. Learn about the 2026 concurrent events and check the confirmation status for 2027.",
  path: "/concurrent-events/",
});

const showContent = {
  battery: {
    number: "01",
    category: "Battery & Energy Storage",
    description:
      "A dedicated exhibition for battery technologies, energy storage and related manufacturing solutions. The platform covers battery cells, packs, battery management systems, production equipment and recycling technologies.",
    areas: [
      "Battery cells & packs",
      "Battery management systems",
      "Energy storage solutions",
      "Manufacturing & recycling",
    ],
    Icon: BatteryCharging,
  },

  solar: {
    number: "02",
    category: "Solar & Renewable Energy",
    description:
      "An industry exhibition focused on solar power technologies and associated energy solutions, including solar PV systems, inverters, storage technologies and supporting infrastructure.",
    areas: [
      "Solar PV technologies",
      "Solar power systems",
      "Inverters & components",
      "Energy storage integration",
    ],
    Icon: Sun,
  },
} as const;

function SectionLabel({
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
          light ? "text-white/65" : "text-[#16893F]"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

export default async function ConcurrentEventsPage() {
  const edition = await getCurrentEdition();

  const shows = edition.concurrentShows ?? [];
  const anyUnconfirmed = shows.some((show) => !show.approved);

  const venue = [
    edition.venue.name,
    edition.venue.locality,
    edition.venue.city,
    edition.venue.region,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      {/* =====================================
          SHARED PAGE HERO
      ===================================== */}
      <PageHero
        eyebrow="Related Industry Exhibitions"
        title="Concurrent"
        highlight="Events"
        description="Explore the relationship between electric mobility, battery technologies and solar energy through related industry exhibitions."
        image="/media/2026/arrival-banner.webp"
        imagePosition="center 48%"
        crumbs={[
          { label: "About", href: "/about/" },
          { label: "Concurrent Events" },
        ]}
      />

      {/* =====================================
          INTRODUCTION
      ===================================== */}
      <section className="bg-white py-16 sm:py-22 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center">
              <SectionLabel>Connected Industries</SectionLabel>
            </div>

            <h2 className="mt-6 text-[clamp(2rem,4.7vw,4rem)] font-extrabold leading-[1.12] tracking-[-0.055em] text-[#102A1E]">
              Bringing mobility and
              <span className="text-[#23A455]">
                {" "}energy technologies together.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-3xl text-[14px] leading-8 text-[#4A5750] sm:text-base">
              Electric vehicles, battery systems and solar
              energy technologies are closely connected.
              In 2026, the India International EV Show
              took place alongside dedicated battery
              and solar exhibitions in Pune, bringing
              professionals from related industries
              into the same exhibition environment.
            </p>
          </AboutReveal>

          {/* Status information */}
          {anyUnconfirmed && (
            <AboutReveal
              delay={0.1}
              className="mx-auto mt-10 max-w-4xl"
            >
              <div className="flex items-start gap-4 rounded-2xl border border-[#DDE7DF] bg-[#F5F9F5] p-5 sm:p-6">
                <Clock3
                  size={21}
                  strokeWidth={1.8}
                  className="mt-0.5 shrink-0 text-[#16893F]"
                  aria-hidden="true"
                />

                <div>
                  <h3 className="text-[13px] font-extrabold text-[#102A1E]">
                    {edition.year} Event Confirmation
                  </h3>

                  <p className="mt-2 text-[12px] leading-6 text-[#4A5750] sm:text-[13px]">
                    The battery and solar exhibitions were
                    held concurrently with IIEV in 2026.
                    The co-location details for the{" "}
                    {edition.year} edition are subject to
                    organiser confirmation. Individual show
                    statuses are provided below.
                  </p>
                </div>
              </div>
            </AboutReveal>
          )}
        </div>
      </section>

      {/* =====================================
          CONCURRENT SHOWS
      ===================================== */}
      <section className="bg-[#F5F9F5] py-18 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mb-11 max-w-3xl">
            <SectionLabel>Industry Exhibitions</SectionLabel>

            <h2 className="mt-5 text-[clamp(2rem,4.3vw,3.6rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
              Explore the
              <span className="text-[#23A455]">
                {" "}related shows.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#4A5750]">
              Dedicated exhibitions covering technologies
              relevant to electric mobility and the
              broader energy ecosystem.
            </p>
          </AboutReveal>

          {shows.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {shows.map((show, index) => {
                const content =
                  show.key === "battery"
                    ? showContent.battery
                    : showContent.solar;

                const ShowIcon = content.Icon;

                return (
                  <AboutReveal
                    key={show.key}
                    delay={index * 0.08}
                    className="h-full"
                  >
                    <article
                      className="
                        group relative flex h-full flex-col
                        overflow-hidden rounded-[24px]
                        border border-[#DDE7DF]
                        bg-white
                        transition-[border-color,transform,box-shadow]
                        duration-500
                        hover:-translate-y-1
                        hover:border-[#23A455]/45
                        hover:shadow-[0_25px_55px_-38px_rgba(9,27,19,.4)]
                      "
                    >
                      {/* Brand identity */}
                      <div className="relative flex min-h-[225px] flex-col items-center justify-center overflow-hidden border-b border-[#E8EEE9] bg-white px-7 py-9">
                        {/* Decorative SVG */}
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 250 250"
                          fill="none"
                          className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 text-[#23A455] opacity-[0.07]"
                        >
                          <circle
                            cx="125"
                            cy="125"
                            r="104"
                            stroke="currentColor"
                          />
                          <circle
                            cx="125"
                            cy="125"
                            r="76"
                            stroke="currentColor"
                          />
                          <circle
                            cx="125"
                            cy="125"
                            r="46"
                            stroke="currentColor"
                          />
                        </svg>

                        <div className="relative z-10 flex min-h-28 w-full items-center justify-center">
                          <Image
                            src={show.logo}
                            alt={`${show.name} logo`}
                            width={1540}
                            height={620}
                            sizes="(max-width:1024px) 80vw, 480px"
                            className="max-h-[115px] w-auto max-w-full object-contain"
                          />
                        </div>

                        <div className="relative z-10 mt-5 flex flex-wrap items-center justify-center gap-3">
                          <span className="rounded-full border border-[#DDE7DF] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#506659]">
                            {show.editionLabel}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold ${
                              show.approved
                                ? "border-[#23A455]/25 bg-[#23A455]/10 text-[#16893F]"
                                : "border-[#DFE6DF] bg-[#F3F6F3] text-[#596A5E]"
                            }`}
                          >
                            {show.approved ? (
                              <CheckCircle2
                                size={13}
                                aria-hidden="true"
                              />
                            ) : (
                              <Clock3
                                size={13}
                                aria-hidden="true"
                              />
                            )}

                            {show.approved
                              ? `Confirmed for ${edition.year}`
                              : `${edition.year} pending confirmation`}
                          </span>
                        </div>
                      </div>

                      {/* Show information */}
                      <div className="flex flex-1 flex-col p-7 sm:p-9">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <SectionLabel>
                              {content.category}
                            </SectionLabel>

                            <h3 className="mt-4 text-[clamp(1.35rem,2.4vw,1.8rem)] font-extrabold leading-tight tracking-[-0.04em] text-[#102A1E]">
                              {show.name}
                            </h3>
                          </div>

                          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF6EE] text-[#16893F] transition-colors duration-300 group-hover:bg-[#23A455] group-hover:text-white">
                            <ShowIcon
                              size={24}
                              strokeWidth={1.75}
                              aria-hidden="true"
                            />
                          </span>
                        </div>

                        {show.strap && (
                          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#718276]">
                            {show.strap}
                          </p>
                        )}

                        <p className="mt-5 text-[13px] leading-7 text-[#4A5750] sm:text-[14px]">
                          {content.description}
                        </p>

                        <div className="mt-7 border-t border-[#E8EEE9] pt-6">
                          <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#16893F]">
                            Technology Focus
                          </p>

                          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                            {content.areas.map((area) => (
                              <li
                                key={area}
                                className="flex items-start gap-2.5 text-[12px] font-medium leading-6 text-[#304939]"
                              >
                                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#23A455]" />
                                {area}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-auto pt-8">
                          <div className="h-px bg-[#E8EEE9]" />
                          <p className="mt-5 text-[11px] leading-6 text-[#718276]">
                            {show.approved
                              ? `The ${edition.year} concurrent event details have been approved by the organiser.`
                              : `The ${edition.year} co-location and edition details have not yet been confirmed.`}
                          </p>
                        </div>
                      </div>
                    </article>
                  </AboutReveal>
                );
              })}
            </div>
          ) : (
            <AboutReveal>
              <div className="rounded-2xl border border-[#DDE7DF] bg-white p-8 text-sm leading-7 text-[#4A5750]">
                Details of concurrent exhibitions for{" "}
                {edition.year} have not yet been published.
                Information will be updated when confirmed
                by the organiser.
              </div>
            </AboutReveal>
          )}
        </div>
      </section>

      {/* =====================================
          2026 EVENT CONTEXT
      ===================================== */}
      <section className="overflow-hidden bg-white py-18 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-18 lg:px-10">
          <AboutReveal className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[#102A1E]">
              <Image
                src="/media/2026/expo-crowd-hall.webp"
                alt="Visitors at the 2026 IIEV exhibition in Pune"
                fill
                sizes="(max-width:1024px) 100vw, 55vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.04]"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#091B13]/55 via-transparent to-transparent"
              />

              <p className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-[#091B13]/70 px-4 py-2 text-[10px] font-semibold text-white backdrop-blur-md sm:text-xs">
                IIEV · Pune 2026
              </p>
            </div>
          </AboutReveal>

          <AboutReveal delay={0.1}>
            <SectionLabel>Previous Edition</SectionLabel>

            <h2 className="mt-5 text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-[1.13] tracking-[-0.05em] text-[#102A1E]">
              Connected through
              <span className="text-[#23A455]">
                {" "}a common exhibition platform.
              </span>
            </h2>

            <p className="mt-6 text-sm leading-8 text-[#4A5750] sm:text-base">
              The 8th India International EV Show was
              held from 2–4 October 2026 at Auto Cluster
              Exhibition Centre, Pimpri-Chinchwad, Pune.
              It took place concurrently with the India
              International Battery Show and India
              International Solar Show.
            </p>

            <p className="mt-4 text-sm leading-8 text-[#4A5750] sm:text-base">
              The format brought professionals from
              electric mobility, battery manufacturing,
              energy storage, renewable energy and related
              industrial sectors into one exhibition
              environment while retaining each show's
              distinct identity.
            </p>

            <Link
              href="/past-editions/2026-pune/"
              className="group mt-7 inline-flex items-center gap-2 border-b-2 border-[#23A455] pb-2 text-[13px] font-bold text-[#16893F] transition-colors hover:text-[#102A1E]"
            >
              Explore IIEV 2026
              <ArrowUpRight
                size={17}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </AboutReveal>
        </div>
      </section>

      {/* =====================================
          2027 EVENT DETAILS
      ===================================== */}
      <section className="relative isolate overflow-hidden bg-[#102A1E] py-18 text-white sm:py-24">
        <svg
          viewBox="0 0 560 560"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute -right-44 -top-48 h-[540px] w-[540px] opacity-25"
        >
          <circle
            cx="280"
            cy="280"
            r="235"
            stroke="#23A455"
          />
          <circle
            cx="280"
            cy="280"
            r="175"
            stroke="#23A455"
          />
          <circle
            cx="280"
            cy="280"
            r="115"
            stroke="#23A455"
            strokeDasharray="5 12"
          />
        </svg>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center">
              <SectionLabel light>
                India International EV Show
              </SectionLabel>
            </div>

            <h2 className="mt-6 text-[clamp(2rem,4.7vw,4rem)] font-extrabold leading-[1.12] tracking-[-0.055em]">
              Join us for
              <span className="text-[#23A455]">
                {" "}IIEV {edition.year}.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-white/70 sm:text-base">
              The India International EV Show brings
              together professionals across electric
              vehicles, components, charging and mobility
              technology. Explore participation
              opportunities for the upcoming edition.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 text-[12px] font-semibold text-white/80 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <CalendarDays
                  size={17}
                  className="text-[#23A455]"
                  aria-hidden="true"
                />
                {edition.dateLabel}
              </span>

              <span className="inline-flex items-center gap-2">
                <MapPin
                  size={17}
                  className="text-[#23A455]"
                  aria-hidden="true"
                />
                {venue}
              </span>
            </div>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/exhibit/book-a-stall/"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#23A455] px-7 text-[13px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#16893F]"
              >
                Book Your Stall
                <ArrowUpRight
                  size={17}
                  aria-hidden="true"
                />
              </Link>

              <Link
                href="/contact/"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-7 text-[13px] font-bold text-white transition-colors hover:bg-white/10"
              >
                Contact the Organiser
                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </AboutReveal>
        </div>
      </section>
    </>
  );
}
