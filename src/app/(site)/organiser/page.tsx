
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Globe2,
  MapPin,
  CalendarRange,
} from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { pageMetadata } from "@/lib/seo/metadata";
import { organiser } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Our Organiser | Futurex Trade Fair & Events Pvt. Ltd.",
  description:
    "Learn about Futurex Trade Fair & Events Pvt. Ltd., the New Delhi-based organiser of India International EV Show and B2B trade exhibitions across India, South Asia and East Africa.",
  path: "/organiser/",
});

const stats = [
  { value: "220+", label: "Trade exhibitions" },
  { value: "16,516+", label: "Exhibitors" },
  { value: "25,844+", label: "Brands displayed" },
  { value: "956,484+", label: "Visitors" },
];

const sectors = [
  "Building & Construction",
  "Infrastructure",
  "Power & Energy",
  "Woodworking",
  "Agriculture",
  "Packaging",
  "Electric Mobility",
  "Industrial Technologies",
];

const offices = [
  "New Delhi",
  "Mumbai",
  "Colombo",
  "Kathmandu",
  "Dhaka",
];

export default function OrganiserPage() {
  return (
    <>
      {/* SHARED INNER PAGE HERO */}
      <PageHero
        eyebrow="Behind the Exhibition"
        title="Meet the"
        highlight="Organiser"
        description="Connecting industries, businesses and regional markets through international trade exhibitions."
        image="/media/2026/inauguration-ribbon.webp"
        imagePosition="center 42%"
        crumbs={[{ label: "Organiser" }]}
      />

      {/* COMPANY INTRODUCTION */}
      <section className="bg-white py-18 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D9E8DE] bg-[#F5F9F5] px-4 py-2 text-[11px] font-bold text-[#16893F]">
                <MapPin size={14} />
                New Delhi, India
              </span>
            </div>

            <div className="mx-auto flex w-fit max-w-full items-center justify-center rounded-2xl border border-[#E1E9E2] bg-white px-7 py-6 shadow-[0_15px_45px_-35px_rgba(9,27,19,.3)] sm:px-12">
              <Image
                src={organiser.logo}
                alt="Futurex Trade Fair & Events Pvt. Ltd. logo"
                width={1000}
                height={209}
                sizes="(max-width:640px) 240px, 390px"
                className="h-auto max-h-[90px] w-full max-w-[390px] object-contain"
                priority
              />
            </div>

            <p className="mt-9 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#16893F]">
              International Trade Exhibitions
            </p>

            <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.9rem)] font-extrabold leading-[1.12] tracking-[-0.055em] text-[#102A1E]">
              Futurex Trade Fair
              <span className="block text-[#23A455]">
                & Events Pvt. Ltd.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-3xl text-[14px] leading-8 text-[#4A5750] sm:text-base">
              Established in 2011 and headquartered in New Delhi,
              Futurex Trade Fair & Events Pvt. Ltd. organises
              business-to-business exhibitions and industry events
              across India, South Asia and East Africa.
            </p>

            <p className="mx-auto mt-4 max-w-3xl text-[14px] leading-8 text-[#4A5750] sm:text-base">
              Its exhibitions bring manufacturers, suppliers
              and trade professionals together, helping businesses
              explore regional markets, present their products
              and build industry relationships.
            </p>
          </AboutReveal>
        </div>
      </section>

      {/* COMPANY FIGURES */}
      <section className="relative isolate overflow-hidden bg-[#102A1E] py-18 text-white sm:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-40 h-[480px] w-[480px] rounded-full border border-[#23A455]/20"
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#23A455]">
              Futurex at a Glance
            </p>

            <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.6rem)] font-extrabold leading-[1.12] tracking-[-0.055em]">
              A track record across
              <span className="text-[#23A455]">
                {" "}trade exhibitions.
              </span>
            </h2>
          </AboutReveal>

          <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 lg:grid-cols-4">
            {stats.map((item, index) => (
              <AboutReveal
                key={item.label}
                delay={index * 0.06}
                className="h-full"
              >
                <div className="flex h-full min-h-[165px] flex-col items-center justify-center bg-[#102A1E] px-3 py-7 text-center sm:min-h-[190px]">
                  <p className="text-[clamp(1.6rem,3.4vw,3rem)] font-extrabold tracking-[-0.055em] text-white tabular-nums">
                    {item.value}
                  </p>

                  <span className="mt-3 h-[2px] w-7 bg-[#23A455]" />

                  <p className="mt-4 text-[11px] font-semibold text-white/65 sm:text-[13px]">
                    {item.label}
                  </p>
                </div>
              </AboutReveal>
            ))}
          </div>
        </div>
      </section>

      {/* EXHIBITION PORTFOLIO */}
      <section className="bg-[#F5F9F5] py-18 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
              Exhibition Portfolio
            </p>

            <h2 className="mt-5 text-[clamp(2rem,4.3vw,3.7rem)] font-extrabold leading-[1.12] tracking-[-0.055em] text-[#102A1E]">
              Connecting businesses
              <span className="text-[#23A455]">
                {" "}across industries.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-[#4A5750] sm:text-base">
              Futurex develops specialised trade exhibitions
              across industrial sectors, creating opportunities
              for businesses to reach relevant professional markets.
            </p>
          </AboutReveal>

          <AboutReveal className="mx-auto mt-12 max-w-5xl">
            <div className="grid overflow-hidden rounded-2xl border border-[#DFE8E1] bg-[#DFE8E1] gap-px sm:grid-cols-2 lg:grid-cols-4">
              {sectors.map((sector, index) => (
                <div
                  key={sector}
                  className="group flex min-h-[125px] flex-col justify-between bg-white p-6 transition-colors duration-300 hover:bg-[#EAF6EE]"
                >
                  <span className="text-[11px] font-extrabold text-[#16893F]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <p className="mt-6 text-[13px] font-extrabold leading-6 text-[#102A1E] sm:text-[14px]">
                    {sector}
                  </p>
                </div>
              ))}
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* OPERATIONS */}
      <section className="bg-white py-18 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-20 lg:px-10">
          <AboutReveal>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
              Regional Presence
            </p>

            <h2 className="mt-5 text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-[1.14] tracking-[-0.055em] text-[#102A1E]">
              Based in India.
              <span className="block text-[#23A455]">
                Connected across markets.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-[14px] leading-8 text-[#4A5750] sm:text-base">
              With its headquarters in New Delhi, Futurex
              has an operational presence extending to Mumbai,
              Colombo, Kathmandu and Dhaka. The company
              conducts exhibition activities across India,
              South Asia and East Africa.
            </p>

            <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#DFE8E1] bg-[#F5F9F5] px-5 py-4">
              <Globe2
                size={21}
                className="mt-0.5 shrink-0 text-[#16893F]"
                aria-hidden="true"
              />
              <p className="text-[13px] font-semibold leading-6 text-[#102A1E]">
                Connecting industries and business communities
                through professional exhibitions.
              </p>
            </div>
          </AboutReveal>

          <AboutReveal delay={0.1}>
            <div className="rounded-3xl border border-[#E1E9E2] bg-[#F7FAF7] p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2
                    size={19}
                    className="text-[#23A455]"
                    aria-hidden="true"
                  />
                  <h3 className="text-sm font-extrabold text-[#102A1E]">
                    Key Locations
                  </h3>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-[#16893F]">
                  Regional Presence
                </span>
              </div>

              <div className="space-y-2">
                {offices.map((city, index) => (
                  <div
                    key={city}
                    className="flex items-center justify-between rounded-xl border border-[#E4EAE5] bg-white px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin
                        size={17}
                        className="text-[#23A455]"
                        aria-hidden="true"
                      />
                      <span className="text-[13px] font-bold text-[#102A1E]">
                        {city}
                      </span>
                    </div>

                    {index === 0 ? (
                      <span className="rounded-full bg-[#E5F5E9] px-3 py-1 text-[10px] font-bold text-[#16893F]">
                        Headquarters
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#78877C]">
                        Presence
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* IIEV CONNECTION */}
      <section className="border-y border-[#E1E9E2] bg-[#F5F9F5] py-14 sm:py-18">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-7 px-5 sm:px-8 lg:flex-row lg:items-center lg:px-10">
          <AboutReveal className="max-w-2xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
              India International EV Show
            </p>

            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#102A1E] sm:text-3xl">
              Organiser of IIEV Show
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#4A5750]">
              Futurex Group organises the India International EV
              Show, bringing together businesses across the
              electric vehicle and mobility technology industry.
            </p>
          </AboutReveal>

          <Link
            href="/about/"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-full border border-[#23A455] px-6 text-[13px] font-bold text-[#16893F] transition-all duration-300 hover:bg-[#23A455] hover:text-white lg:self-center"
          >
            About IIEV Show
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* OFFICIAL WEBSITE CTA */}
      <section className="relative isolate overflow-hidden bg-[#091B13] py-18 text-white sm:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full border border-[#23A455]/20"
        />

        <AboutReveal className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <CalendarRange
            size={30}
            className="mx-auto text-[#23A455]"
            strokeWidth={1.5}
            aria-hidden="true"
          />

          <h2 className="mt-6 text-[clamp(2rem,4.4vw,3.7rem)] font-extrabold leading-[1.12] tracking-[-0.055em]">
            Explore Futurex
            <span className="text-[#23A455]">
              {" "}Trade Exhibitions.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-white/70">
            Learn more about the company's exhibition
            portfolio and international trade events.
          </p>

          <a
            href={organiser.website}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#23A455] px-7 text-[13px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#16893F]"
          >
            Visit Official Website
            <ArrowUpRight
              size={17}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
            <span className="sr-only">
              (opens in a new tab)
            </span>
          </a>
        </AboutReveal>
      </section>
    </>
  );
}
