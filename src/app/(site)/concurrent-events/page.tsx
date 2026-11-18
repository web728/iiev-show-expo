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
  MapPin,
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
    url: "https://www.indiabatteryshow.com/",
    host: "indiabatteryshow.com",
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
    url: "https://www.indiasolarshow.com/",
    host: "indiasolarshow.com",
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

                        {/* Logo -> opens the show's website */}
                        <a
                          href={content.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Visit ${show.name} website (opens in a new tab)`}
                          className="relative z-10 flex min-h-28 w-full items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#23A455]"
                        >
                          <Image
                            src={show.logo}
                            alt={`${show.name} logo`}
                            width={1540}
                            height={620}
                            sizes="(max-width:1024px) 80vw, 480px"
                            className="max-h-[115px] w-auto max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </a>

                      
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

                          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            

                            {/* Visit website button */}
                            <a
                              href={content.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Visit ${show.name} website (opens in a new tab)`}
                              className="group/btn inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#23A455] px-5 text-[12px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#16893F] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#23A455]"
                            >
                              Visit {content.host}
                              <ArrowUpRight
                                size={16}
                                aria-hidden="true"
                                className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                              />
                            </a>
                          </div>
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
              The 9th India International EV Show brings
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