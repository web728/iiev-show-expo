
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Check,
} from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCurrentEdition } from "@/lib/data/edition";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "About India International EV Show 2027",
  description:
    "Learn about India International EV Show 2027, a dedicated trade exhibition connecting electric vehicle manufacturers, component suppliers, charging providers and industry professionals in Pune.",
  path: "/about/",
});

const focusAreas = [
  "Electric vehicles and mobility solutions",
  "Powertrains and vehicle components",
  "EV battery integration",
  "Charging infrastructure",
  "Smart mobility and digital systems",
  "Manufacturing and engineering solutions",
];

const connections = [
  {
    number: "01",
    title: "Product Discovery",
    text: "Explore EV products, components and technologies from companies working across the industry.",
  },
  {
    number: "02",
    title: "Supplier Engagement",
    text: "Speak directly with manufacturers and technology providers about solutions and applications.",
  },
  {
    number: "03",
    title: "Industry Networking",
    text: "Connect with buyers, distributors, engineers, fleet operators and business decision-makers.",
  },
];

export default async function AboutPage() {
  const edition = await getCurrentEdition();
  const venue = edition.venue;

  return (
    <>
      <PageHero
        eyebrow="India International EV Show"
        title="About the"
        highlight="IIEV Show"
        description="A dedicated business platform connecting companies, technologies and professionals across India's electric mobility value chain."
        image="/media/2026/inauguration-ribbon.webp"
        imagePosition="center 45%"
        crumbs={[{ label: "About the Show" }]}
      />

      {/* INTRODUCTION */}
      <section className="bg-white py-18 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
              About IIEV 2027
            </p>

            <h2 className="mt-5 text-[clamp(2rem,4.4vw,3.8rem)] font-extrabold leading-[1.13] tracking-[-0.055em] text-[#102A1E]">
              Connecting the electric
              <span className="text-[#23A455]">
                {" "}mobility ecosystem.
              </span>
            </h2>

            <p className="mt-6 text-[14px] leading-8 text-[#4A5750] sm:text-base">
              India International EV Show brings together
              vehicle manufacturers, component suppliers,
              charging solution providers, engineering
              companies and technology developers.
              The exhibition creates a focused environment
              for product discovery, supplier engagement
              and professional networking.
            </p>
          </AboutReveal>

          <AboutReveal className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#DFE8E1] bg-[#DFE8E1] sm:grid-cols-3">
            {[
              {
                value: edition.editionLabel,
                label: "2027 Edition",
              },
              {
                value: "3 Days",
                label: "Industry Exhibition",
              },
              {
                value: "Pune",
                label: "Maharashtra, India",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#F7FAF7] px-6 py-7 text-center"
              >
                <p className="text-2xl font-extrabold tracking-tight text-[#102A1E] sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-medium text-[#68766D]">
                  {stat.label}
                </p>
              </div>
            ))}
          </AboutReveal>
        </div>
      </section>

      {/* WHAT TO EXPECT */}
      <section className="bg-[#F5F9F5] py-18 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mb-11 max-w-3xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
              The Exhibition
            </p>

            <h2 className="mt-4 text-[clamp(2rem,4vw,3.6rem)] font-extrabold leading-[1.13] tracking-[-0.05em] text-[#102A1E]">
              One platform.
              <span className="text-[#23A455]">
                {" "}Multiple business opportunities.
              </span>
            </h2>
          </AboutReveal>

          <div className="grid gap-4 md:grid-cols-3">
            {connections.map((item, index) => (
              <AboutReveal
                key={item.number}
                delay={index * 0.07}
                className="h-full"
              >
                <article className="group flex h-full min-h-[230px] flex-col justify-between rounded-2xl border border-[#DFE8E1] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#23A455]/50 hover:shadow-[0_18px_40px_-28px_rgba(9,27,19,0.3)]">
                  <span className="text-xs font-extrabold text-[#16893F]">
                    {item.number} / 03
                  </span>

                  <div className="mt-9">
                    <h3 className="text-lg font-extrabold text-[#102A1E]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[13px] leading-7 text-[#4A5750]">
                      {item.text}
                    </p>
                  </div>
                </article>
              </AboutReveal>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRY FOCUS */}
      <section className="bg-white py-18 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-16 lg:px-10">
          <AboutReveal className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#102A1E]">
              <Image
                src="/images/industry-floor.webp"
                alt="Industry participants at the previous IIEV exhibition"
                fill
                sizes="(max-width:1024px) 100vw, 45vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.035]"
              />
            </div>

            <div className="absolute bottom-4 left-4 rounded-lg bg-[#102A1E]/90 px-4 py-2.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              IIEV 2026 · Exhibition floor
            </div>
          </AboutReveal>

          <AboutReveal delay={0.1}>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
              Industry Focus
            </p>

            <h2 className="mt-4 text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.14] tracking-[-0.05em] text-[#102A1E]">
              Across the
              <span className="text-[#23A455]">
                {" "}EV value chain.
              </span>
            </h2>

            <p className="mt-5 text-sm leading-8 text-[#4A5750]">
              The exhibition covers vehicles, infrastructure,
              components, manufacturing and digital technologies
              relevant to electric mobility.
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {focusAreas.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[13px] font-semibold leading-6 text-[#203A2B]"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#23A455]/10 text-[#16893F]">
                    <Check size={13} strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </AboutReveal>
        </div>
      </section>

      {/* LOCATION AND HISTORY */}
      <section className="bg-[#102A1E] py-18 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-4xl text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/60">
              Pune · Maharashtra
            </p>

            <h2 className="mt-5 text-[clamp(2rem,4.4vw,3.8rem)] font-extrabold leading-[1.12] tracking-[-0.055em]">
              An exhibition in India's
              <span className="text-[#23A455]">
                {" "}automotive manufacturing region.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-white/70 sm:text-base">
              Pune and Pimpri-Chinchwad have an established
              automotive engineering and manufacturing ecosystem.
              IIEV brings companies and industry professionals
              together in this important industrial region.
            </p>
          </AboutReveal>

          <AboutReveal className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-7">
              <div className="flex items-center gap-2 text-[#23A455]">
                <CalendarDays size={19} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Upcoming Edition
                </span>
              </div>

              <p className="mt-4 text-xl font-extrabold">
                {edition.dateLabel}
              </p>

              <p className="mt-2 flex items-start gap-2 text-[13px] leading-7 text-white/65">
                <MapPin size={16} className="mt-1 shrink-0" />
                {[
                  venue.name,
                  venue.locality,
                  venue.city,
                  venue.region,
                ].filter(Boolean).join(", ")}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-[#23A455]">
                Previous Edition
              </p>

              <h3 className="mt-4 text-xl font-extrabold">
                IIEV Show 2026
              </h3>

              <p className="mt-3 text-[13px] leading-7 text-white/65">
                Held from 2–4 October 2026 at Auto Cluster
                Exhibition Centre, Pune, alongside exhibitions
                covering battery and solar technologies.
              </p>

              <Link
                href="/past-editions/"
                className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#23A455] hover:text-white"
              >
                Explore past editions
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-7 px-5 text-center sm:px-8 lg:flex-row lg:px-10 lg:text-left">
          <div>
            <h2 className="text-[clamp(1.7rem,3vw,2.7rem)] font-extrabold tracking-tight text-[#102A1E]">
              Be part of IIEV 2027.
            </h2>
            <p className="mt-2 text-sm text-[#4A5750]">
              Explore exhibiting and visiting opportunities.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/exhibit/book-a-stall/"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#23A455] px-6 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#16893F]"
            >
              Book Your Stall
              <ArrowUpRight size={16} />
            </Link>

            <Link
              href="/visit/register/"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#D9E5DC] px-6 text-[13px] font-bold text-[#102A1E] transition-colors hover:border-[#23A455] hover:bg-[#F5F9F5]"
            >
              Register as Visitor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
