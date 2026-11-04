
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  BatteryCharging,
  Building2,
  CalendarDays,
  Check,
  Cpu,
  Factory,
  Handshake,
  MapPin,
  Network,
  PlugZap,
  UsersRound,
  CarFront,
} from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCurrentEdition } from "@/lib/data/edition";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Why IIEV Show 2027 | EV Industry Exhibition in Pune",
  description:
    "Discover why India International EV Show is a focused platform for EV manufacturers, suppliers, buyers and technology providers. Explore industry opportunities at IIEV 2027 in Pune.",
  path: "/why-iiev/",
});

const advantages = [
  {
    number: "01",
    title: "One connected EV ecosystem",
    description:
      "Explore electric vehicles, powertrain systems, charging infrastructure, battery integration and manufacturing technologies within one industry-focused exhibition.",
    icon: Network,
  },
  {
    number: "02",
    title: "Relevant business connections",
    description:
      "Engage with manufacturers, component suppliers, sourcing professionals, dealers, distributors and companies involved in electric mobility.",
    icon: Handshake,
  },
  {
    number: "03",
    title: "Technology you can evaluate",
    description:
      "See products and solutions firsthand, discuss technical requirements and compare technologies directly with their providers.",
    icon: Cpu,
  },
  {
    number: "04",
    title: "An established automotive region",
    description:
      "Meet industry participants in Pune and Pimpri-Chinchwad, an important region for automotive manufacturing, engineering and supply-chain activity.",
    icon: Factory,
  },
];

const sectors = [
  { label: "Electric Vehicles", icon: CarFront },
  { label: "Powertrains & Components", icon: Cpu },
  { label: "EV Battery Integration", icon: BatteryCharging },
  { label: "Charging Infrastructure", icon: PlugZap },
  { label: "Smart Mobility", icon: Network },
  { label: "Manufacturing & Engineering", icon: Factory },
];

const audience = [
  "Vehicle manufacturers & OEMs",
  "Component suppliers & engineers",
  "Dealers & distributors",
  "Fleet & logistics operators",
  "Charging infrastructure companies",
  "Investors, startups & institutions",
];

function Eyebrow({
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
        className="h-[2px] w-7 shrink-0 bg-[#23A455]"
      />
      <p
        className={`text-[10px] font-extrabold uppercase tracking-[0.19em] sm:text-[11px] ${
          light ? "text-white/65" : "text-[#16893F]"
        }`}
      >
        {children}
      </p>
    </div>
  );
}

function BrandArrow() {
  return (
    <ArrowUpRight
      size={17}
      strokeWidth={1.8}
      aria-hidden="true"
      className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
    />
  );
}

export default async function WhyIievPage() {
  const edition = await getCurrentEdition();

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
        eyebrow="The IIEV Advantage"
        title="Why Choose"
        highlight="IIEV Show?"
        description="A focused meeting place for the businesses, technologies and professionals shaping electric mobility."
        image="/media/2026/expo-crowd-hall.webp"
        imagePosition="center 48%"
        crumbs={[
          { label: "About", href: "/about/" },
          { label: "Why IIEV Show" },
        ]}
      />

      {/* =====================================
          INTRODUCTION
      ===================================== */}
      <section className="relative overflow-hidden bg-white py-18 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          <AboutReveal className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center">
              <Eyebrow>Why IIEV</Eyebrow>
            </div>

            <h2 className="mt-6 text-[clamp(2rem,4.7vw,4.1rem)] font-extrabold leading-[1.12] tracking-[-0.055em] text-[#102A1E]">
              Where industry meets
              <span className="text-[#23A455]">
                {" "}opportunity.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-[760px] text-[14px] leading-8 text-[#4A5750] sm:text-base">
              The India International EV Show brings together
              the businesses developing, manufacturing,
              supplying and adopting electric mobility
              technologies. It offers an environment for
              exploring products, understanding industry
              requirements and building professional
              relationships.
            </p>
          </AboutReveal>

          {/* Factual positioning strip */}
          <AboutReveal
            delay={0.12}
            className="mt-12 grid overflow-hidden rounded-2xl border border-[#DFE8E1] bg-[#DFE8E1] gap-px sm:grid-cols-3"
          >
            <div className="bg-[#F7FAF7] px-6 py-8 text-center">
              <p className="text-3xl font-extrabold tracking-[-0.05em] text-[#102A1E]">
                9th
              </p>
              <p className="mt-2 text-xs font-semibold text-[#647368]">
                Edition in 2027
              </p>
            </div>

            <div className="bg-[#F7FAF7] px-6 py-8 text-center">
              <p className="text-3xl font-extrabold tracking-[-0.05em] text-[#102A1E]">
                3 Days
              </p>
              <p className="mt-2 text-xs font-semibold text-[#647368]">
                Of industry engagement
              </p>
            </div>

            <div className="bg-[#F7FAF7] px-6 py-8 text-center">
              <p className="text-3xl font-extrabold tracking-[-0.05em] text-[#102A1E]">
                Pune
              </p>
              <p className="mt-2 text-xs font-semibold text-[#647368]">
                Maharashtra, India
              </p>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* =====================================
          FOUR REASONS
      ===================================== */}
      <section className="bg-[#F5F9F5] py-18 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          <AboutReveal className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-[690px]">
              <Eyebrow>What Makes IIEV Relevant</Eyebrow>

              <h2 className="mt-5 text-[clamp(2rem,4.3vw,3.7rem)] font-extrabold leading-[1.12] tracking-[-0.055em] text-[#102A1E]">
                Built around
                <span className="text-[#23A455]">
                  {" "}real industry needs.
                </span>
              </h2>
            </div>

            <p className="max-w-[340px] text-[13px] leading-7 text-[#4A5750] sm:text-sm">
              A place to discover solutions, speak with
              industry professionals and explore
              potential commercial opportunities.
            </p>
          </AboutReveal>

          {/* Premium grid with restrained hover effects */}
          <div className="grid gap-4 md:grid-cols-2">
            {advantages.map((item, index) => {
              const Icon = item.icon;

              return (
                <AboutReveal
                  key={item.number}
                  delay={(index % 2) * 0.08}
                  className="h-full"
                >
                  <article
                    className="
                      group relative flex h-full min-h-[280px]
                      flex-col justify-between overflow-hidden
                      rounded-[22px] border border-[#DEE8E0]
                      bg-white p-7
                      transition-[border-color,transform,box-shadow]
                      duration-500
                      hover:-translate-y-1
                      hover:border-[#23A455]/50
                      hover:shadow-[0_24px_50px_-35px_rgba(9,27,19,.35)]
                      sm:p-9
                    "
                  >
                    {/* Decorative corner geometry */}
                    <svg
                      viewBox="0 0 160 160"
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-7 -top-7 h-36 w-36 text-[#23A455] opacity-[0.07] transition-all duration-500 group-hover:-translate-x-2 group-hover:translate-y-2 group-hover:opacity-[0.14]"
                      fill="none"
                    >
                      <circle
                        cx="80"
                        cy="80"
                        r="65"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="43"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>

                    <div className="flex items-start justify-between">
                      <div
                        className="
                          flex size-14 items-center justify-center
                          rounded-2xl bg-[#EAF6EE]
                          text-[#23A455]
                          transition-colors duration-300
                          group-hover:bg-[#23A455]
                          group-hover:text-white
                        "
                      >
                        <Icon
                          size={27}
                          strokeWidth={1.65}
                          aria-hidden="true"
                        />
                      </div>

                      <span className="text-xs font-extrabold text-[#8A9B8F]">
                        {item.number} / 04
                      </span>
                    </div>

                    <div className="relative mt-10">
                      <h3 className="max-w-md text-xl font-extrabold leading-snug tracking-[-0.035em] text-[#102A1E] sm:text-2xl">
                        {item.title}
                      </h3>

                      <p className="mt-4 max-w-lg text-[13px] leading-7 text-[#4A5750] sm:text-sm">
                        {item.description}
                      </p>
                    </div>
                  </article>
                </AboutReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================
          EV VALUE CHAIN
      ===================================== */}
      <section className="relative isolate overflow-hidden bg-[#091B13] py-20 text-white sm:py-26">

        {/* Static brand SVG: lightweight and decorative */}
        <svg
          aria-hidden="true"
          viewBox="0 0 700 700"
          fill="none"
          className="pointer-events-none absolute -right-56 -top-48 h-[650px] w-[650px] opacity-40"
        >
          <circle
            cx="350"
            cy="350"
            r="270"
            stroke="#23A455"
            strokeOpacity=".3"
          />
          <circle
            cx="350"
            cy="350"
            r="210"
            stroke="#23A455"
            strokeOpacity=".22"
          />
          <circle
            cx="350"
            cy="350"
            r="145"
            stroke="#23A455"
            strokeOpacity=".24"
            strokeDasharray="5 12"
          />
          <path
            d="M350 80V140M350 560V620M80 350H140M560 350H620"
            stroke="#23A455"
            strokeWidth="2"
            strokeOpacity=".4"
          />
          <circle cx="350" cy="80" r="5" fill="#23A455" />
        </svg>

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          <AboutReveal className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <Eyebrow light>Across the Value Chain</Eyebrow>
            </div>

            <h2 className="mt-6 text-[clamp(2.1rem,4.7vw,4rem)] font-extrabold leading-[1.12] tracking-[-0.055em]">
              Different technologies.
              <span className="block text-[#23A455]">
                One industry platform.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-white/65 sm:text-base">
              From complete electric vehicles to the
              technologies used to manufacture, power
              and connect them, IIEV represents
              important areas of the EV ecosystem.
            </p>
          </AboutReveal>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sectors.map((sector, index) => {
              const Icon = sector.icon;

              return (
                <AboutReveal
                  key={sector.label}
                  delay={(index % 3) * 0.06}
                  className="h-full"
                >
                  <div
                    className="
                      group flex h-full min-h-[105px]
                      items-center gap-4 rounded-xl
                      border border-white/15 bg-white/[0.04]
                      px-5 py-5 backdrop-blur-sm
                      transition-[background-color,border-color,transform]
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-[#23A455]/65
                      hover:bg-white/[0.09]
                    "
                  >
                    <span
                      className="
                        flex size-12 shrink-0
                        items-center justify-center rounded-xl
                        bg-[#23A455]/15
                        text-[#23A455]
                        transition-colors duration-300
                        group-hover:bg-[#23A455]
                        group-hover:text-white
                      "
                    >
                      <Icon
                        size={23}
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                    </span>

                    <h3 className="text-[13px] font-bold leading-6 text-white sm:text-sm">
                      {sector.label}
                    </h3>
                  </div>
                </AboutReveal>
              );
            })}
          </div>

          <AboutReveal className="mt-10 flex justify-center">
            <Link
              href="/sectors/"
              className="group inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 px-6 text-[13px] font-bold text-white transition-all duration-300 hover:border-[#23A455] hover:bg-[#23A455]"
            >
              Explore Industry Sectors
              <BrandArrow />
            </Link>
          </AboutReveal>
        </div>
      </section>

      {/* =====================================
          WHY PUNE
      ===================================== */}
      <section className="overflow-hidden bg-white py-18 sm:py-24 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-20 lg:px-10">

          <AboutReveal className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[#102A1E]">
              <Image
                src="/media/2026/expo-crowd-hall.webp"
                alt="Exhibition visitors at the 2026 India International EV Show in Pune"
                fill
                sizes="(max-width:1024px) 100vw, 55vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.04]"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#091B13]/50 via-transparent to-transparent"
              />

              <p className="absolute bottom-5 left-5 rounded-full border border-white/25 bg-[#091B13]/65 px-4 py-2 text-[10px] font-semibold text-white backdrop-blur-md sm:text-xs">
                IIEV Show · Pune 2026
              </p>
            </div>

            <div
              aria-hidden="true"
              className="absolute -bottom-4 -right-4 -z-10 h-36 w-36 rounded-3xl border-2 border-[#23A455]/35"
            />
          </AboutReveal>

          <AboutReveal delay={0.1}>
            <Eyebrow>The Pune Advantage</Eyebrow>

            <h2 className="mt-5 text-[clamp(2rem,4.1vw,3.7rem)] font-extrabold leading-[1.13] tracking-[-0.055em] text-[#102A1E]">
              Close to the
              <span className="text-[#23A455]">
                {" "}automotive ecosystem.
              </span>
            </h2>

            <p className="mt-6 text-[14px] leading-8 text-[#4A5750] sm:text-base">
              Pune and Pimpri-Chinchwad are established
              centres for automotive engineering and
              manufacturing. The region offers access
              to vehicle manufacturers, component suppliers,
              engineering companies and technology providers.
            </p>

            <p className="mt-4 text-[14px] leading-8 text-[#4A5750] sm:text-base">
              Hosting IIEV here creates a practical
              meeting point for EV businesses
              seeking industrial connections and
              opportunities across Maharashtra
              and other markets.
            </p>

            <div className="mt-8 border-t border-[#DFE8E1] pt-6">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF6EE] text-[#16893F]">
                  <MapPin
                    size={21}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#16893F]">
                    IIEV 2027 Venue
                  </p>

                  <p className="mt-2 text-[13px] font-semibold leading-7 text-[#102A1E]">
                    {venue}
                  </p>
                </div>
              </div>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* =====================================
          PROFESSIONAL AUDIENCE
      ===================================== */}
      <section className="bg-[#F5F9F5] py-18 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          <AboutReveal className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <Eyebrow>Industry Participation</Eyebrow>
            </div>

            <h2 className="mt-5 text-[clamp(2rem,4.4vw,3.8rem)] font-extrabold leading-[1.12] tracking-[-0.055em] text-[#102A1E]">
              Connect with people
              <span className="text-[#23A455]">
                {" "}across the industry.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-[#4A5750] sm:text-base">
              IIEV is designed for professional engagement
              across automotive manufacturing, distribution,
              infrastructure, mobility services and research.
            </p>
          </AboutReveal>

          <div className="mt-12 grid overflow-hidden rounded-2xl border border-[#DFE8E1] bg-[#DFE8E1] gap-px sm:grid-cols-2 lg:grid-cols-3">
            {audience.map((item, index) => (
              <AboutReveal
                key={item}
                delay={(index % 3) * 0.04}
                className="h-full"
              >
                <div className="group flex h-full min-h-[115px] items-center gap-4 bg-white px-6 py-6 transition-colors duration-300 hover:bg-[#EBF6EE] sm:px-7">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#23A455]/30 bg-[#EAF6EE] text-[#16893F]">
                    <Check
                      size={16}
                      strokeWidth={2.3}
                      aria-hidden="true"
                    />
                  </div>

                  <p className="text-[13px] font-bold leading-6 text-[#102A1E]">
                    {item}
                  </p>
                </div>
              </AboutReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================
          PREVIOUS EDITION: FACTUAL CONTEXT
      ===================================== */}
      <section className="bg-white py-18 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          <AboutReveal className="grid items-center gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">

            <div>
              <Eyebrow>Previous Edition</Eyebrow>

              <h2 className="mt-5 text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.13] tracking-[-0.05em] text-[#102A1E]">
                A platform for
                <span className="text-[#23A455]">
                  {" "}industry exchange.
                </span>
              </h2>

              <p className="mt-6 text-sm leading-8 text-[#4A5750] sm:text-base">
                The 8th India International EV Show was
                held from 2–4 October 2026 at Auto Cluster
                Exhibition Centre in Pune.
              </p>

              <p className="mt-4 text-sm leading-8 text-[#4A5750] sm:text-base">
                Held alongside battery and solar exhibitions,
                the event brought together businesses
                involved in electric vehicles, manufacturing,
                charging infrastructure and related
                energy technologies.
              </p>

              <Link
                href="/past-editions/"
                className="group mt-7 inline-flex items-center gap-2 border-b-2 border-[#23A455] pb-2 text-[13px] font-extrabold text-[#16893F] transition-colors hover:text-[#102A1E]"
              >
                Explore Past Editions
                <BrandArrow />
              </Link>
            </div>

            <div className="relative">
              <div className="relative aspect-[5/3.7] overflow-hidden rounded-[24px] bg-[#102A1E]">
                <Image
                  src="/media/2026/inauguration-ribbon.webp"
                  alt="Inauguration of the 2026 India International EV Show"
                  fill
                  sizes="(max-width:1024px) 100vw, 58vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.035]"
                />
              </div>

              <div className="absolute -bottom-4 left-4 rounded-xl bg-[#102A1E] px-5 py-3 text-white shadow-lg sm:left-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#23A455]">
                  IIEV Show 2026
                </p>
                <p className="mt-1 text-[11px] font-semibold">
                  8th Edition · Pune
                </p>
              </div>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* =====================================
          CTA
      ===================================== */}
      <section className="relative isolate overflow-hidden bg-[#102A1E] py-18 text-white sm:py-24">

        {/* Decorative SVG */}
        <svg
          viewBox="0 0 500 500"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-44 h-[500px] w-[500px] opacity-30"
        >
          <circle
            cx="250"
            cy="250"
            r="220"
            stroke="#23A455"
            strokeWidth="2"
          />
          <circle
            cx="250"
            cy="250"
            r="160"
            stroke="#23A455"
            strokeWidth="2"
          />
          <path
            d="M250 30V90M250 410V470M30 250H90M410 250H470"
            stroke="#23A455"
            strokeWidth="2"
          />
        </svg>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          <AboutReveal className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center">
              <Eyebrow light>Take Part in IIEV 2027</Eyebrow>
            </div>

            <h2 className="mt-6 text-[clamp(2.2rem,5vw,4.5rem)] font-extrabold leading-[1.12] tracking-[-0.055em]">
              Find your place in the
              <span className="text-[#23A455]">
                {" "}EV industry.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-[14px] leading-8 text-white/70 sm:text-base">
              Showcase your solutions, explore new
              technologies and connect with professionals
              across the electric mobility sector
              at IIEV 2027.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">

              <Link
                href="/exhibit/"
                className="
                  group inline-flex min-h-12
                  items-center justify-center gap-2
                  rounded-full bg-[#23A455]
                  px-7 text-[13px] font-extrabold text-white
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#16893F]
                  hover:shadow-[0_14px_35px_-15px_rgba(35,164,85,.5)]
                "
              >
                Explore Exhibiting
                <BrandArrow />
              </Link>

              <Link
                href="/visit/"
                className="
                  group inline-flex min-h-12
                  items-center justify-center gap-2
                  rounded-full border border-white/30
                  px-7 text-[13px] font-bold text-white
                  transition-all duration-300
                  hover:border-[#23A455]
                  hover:bg-white/10
                "
              >
                Plan Your Visit
                <ArrowRight
                  size={17}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-3 border-t border-white/10 pt-7 text-[12px] font-medium text-white/60">
              <span className="inline-flex items-center gap-2">
                <CalendarDays
                  size={16}
                  className="text-[#23A455]"
                  aria-hidden="true"
                />
                {edition.dateLabel}
              </span>

              <span className="inline-flex items-center gap-2">
                <MapPin
                  size={16}
                  className="text-[#23A455]"
                  aria-hidden="true"
                />
                {edition.venue.city}, {edition.venue.region}
              </span>
            </div>
          </AboutReveal>
        </div>
      </section>
    </>
  );
}
