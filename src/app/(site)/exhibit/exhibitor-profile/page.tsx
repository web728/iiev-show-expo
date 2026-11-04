
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BatteryCharging,
  Boxes,
  CarFront,
  Cpu,
  Factory,
  FlaskConical,
  Gauge,
  MapPin,
  Network,
  PlugZap,
  Recycle,
  Sun,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { pageMetadata } from "@/lib/seo/metadata";
import { getSectors } from "@/lib/data/public";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Exhibitor Profile | India International EV Show 2027",
  description:
    "Explore the exhibitor profiles at India International EV Show, covering electric vehicles, EV components, batteries, charging infrastructure, manufacturing equipment and mobility technologies.",
  path: "/exhibit/exhibitor-profile/",
});

const sectorIcons: Record<string, LucideIcon> = {
  "electric-vehicles": CarFront,
  "ev-components": Boxes,
  "motors-drivetrain": Cpu,
  "batteries-cells": BatteryCharging,
  "charging-infrastructure": PlugZap,
  "energy-storage": BatteryCharging,
  "manufacturing-equipment": Factory,
  "fleet-software": Network,
  "testing-recycling": Recycle,
  "clean-mobility": Sun,
};

const groupDescriptions = [
  "Vehicle manufacturers",
  "Component and powertrain suppliers",
  "Battery and charging technology providers",
  "Engineering and manufacturing companies",
  "Mobility software and service providers",
];

function SectorCard({
  sector,
  index,
}: {
  sector: Awaited<ReturnType<typeof getSectors>>[number];
  index: number;
}) {
  const Icon = sectorIcons[sector.slug] ?? Wrench;

  return (
    <AboutReveal
      delay={(index % 2) * 0.07}
      className="h-full"
    >
      <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-[#DFE8E1] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#23A455]/50 hover:shadow-[0_22px_50px_-35px_rgba(9,27,19,0.35)]">
        {/* Heading */}
        <div className="border-b border-[#E9EFEA] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex size-13 items-center justify-center rounded-2xl bg-[#E9F6ED] text-[#16893F] transition-colors duration-300 group-hover:bg-[#23A455] group-hover:text-white">
              <Icon
                size={25}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

           
          </div>

          <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#16893F]">
            {sector.group}
          </p>

          <h3 className="mt-2 text-xl font-extrabold leading-snug tracking-[-0.035em] text-[#102A1E]">
            {sector.name}
          </h3>

          <p className="mt-4 text-[13px] leading-7 text-[#4A5750]">
            {sector.summary}
          </p>
        </div>

        {/* Exhibitors and visitor types */}
        <div className="grid flex-1 gap-7 p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#16893F]">
              Typical Exhibitors
            </p>

            <ul className="mt-4 space-y-3">
              {sector.exhibitorExamples.slice(0, 4).map(
                (example) => (
                  <li
                    key={example}
                    className="flex items-start gap-2.5 text-[12px] leading-6 text-[#405548]"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#23A455]" />
                    {example}
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#16893F]">
              Relevant Visitors
            </p>

            <ul className="mt-4 space-y-3">
              {sector.relevantVisitors.slice(0, 4).map(
                (visitor) => (
                  <li
                    key={visitor}
                    className="flex items-start gap-2.5 text-[12px] leading-6 text-[#405548]"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#23A455]" />
                    {visitor}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
 
      </article>
    </AboutReveal>
  );
}

export default async function ExhibitorProfilePage() {
  const sectors = await getSectors();

  return (
    <>
      <PageHero
        eyebrow="For Exhibitors"
        title="Exhibitor"
        highlight="Profile"
        description="Explore the manufacturers, solution providers and technology businesses relevant to the electric mobility exhibition."
        image="/media/2026/expo-river-stall.webp"
        imagePosition="center 48%"
        crumbs={[
          { label: "Exhibit", href: "/exhibit/" },
          { label: "Exhibitor Profile" },
        ]}
      />

      {/* INTRODUCTION */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-4xl text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
              Who Exhibits at IIEV
            </p>

            <h2 className="mt-5 text-[clamp(2rem,4.5vw,4rem)] font-extrabold leading-[1.12] tracking-[-0.055em] text-[#102A1E]">
              Technologies and expertise
              <span className="text-[#23A455]">
                {" "}across the EV industry.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-sm leading-8 text-[#4A5750] sm:text-base">
              India International EV Show covers
              businesses involved in electric vehicles,
              components, battery technologies, charging,
              mobility systems and manufacturing.
              The profiles below describe the types
              of exhibitors and professional visitors
              relevant to each sector.
            </p>
          </AboutReveal>

          <AboutReveal
            delay={0.1}
            className="mx-auto mt-10 max-w-5xl"
          >
            <div className="flex flex-wrap items-center justify-center gap-2">
              {groupDescriptions.map((group) => (
                <span
                  key={group}
                  className="rounded-full border border-[#DFE8E1] bg-[#F6FAF7] px-4 py-2 text-[11px] font-semibold text-[#365541]"
                >
                  {group}
                </span>
              ))}
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* DYNAMIC SECTOR PROFILES */}
      <section className="bg-[#F5F9F5] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mb-11">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-7 bg-[#23A455]" />
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
                Industry Categories
              </p>
            </div>

            <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <h2 className="max-w-2xl text-[clamp(2rem,4.2vw,3.6rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
                Find your place in the
                <span className="text-[#23A455]">
                  {" "}EV value chain.
                </span>
              </h2>

              <p className="max-w-sm text-[13px] leading-7 text-[#4A5750]">
                Detailed categories help exhibitors
                identify their segment and understand
                the professional audiences relevant
                to their solutions.
              </p>
            </div>
          </AboutReveal>

          {sectors.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {sectors.map((sector, index) => (
                <SectorCard
                  key={sector.slug}
                  sector={sector}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#DFE8E1] bg-white p-8 text-sm text-[#4A5750]">
              Detailed exhibitor categories are currently
              being updated. Please contact the organiser
              for guidance on your product segment.
            </div>
          )}

          <AboutReveal className="mt-10">
            <div className="rounded-2xl border border-[#DCE7DE] bg-white p-6 sm:p-8">
              <p className="text-[13px] leading-7 text-[#4A5750]">
                These are sector and audience profiles,
                not a list of confirmed exhibitors or
                registered visitors for 2027.
                Individual company participation is
                confirmed separately by the organiser.
              </p>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* EXHIBITION EXPERIENCE */}
      <section className="overflow-hidden bg-[#102A1E] py-16 text-white sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-16 lg:px-10">
          <AboutReveal>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#23A455]">
              Industry Exchange
            </p>

            <h2 className="mt-5 text-[clamp(2rem,4.3vw,3.6rem)] font-extrabold leading-[1.12] tracking-[-0.05em]">
              Showcase your expertise.
              <span className="block text-[#23A455]">
                Start relevant conversations.
              </span>
            </h2>

            <p className="mt-6 text-sm leading-8 text-white/70 sm:text-base">
              Exhibiting allows companies to demonstrate
              products, discuss technical requirements
              and connect with businesses across
              electric mobility and supporting industries.
            </p>

            <Link
              href="/exhibit/why-exhibit/"
              className="group mt-7 inline-flex items-center gap-2 border-b-2 border-[#23A455] pb-2 text-[13px] font-bold text-white transition-colors hover:text-[#23A455]"
            >
              Why Exhibit at IIEV
              <ArrowUpRight
                size={17}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          </AboutReveal>

          <AboutReveal delay={0.1}>
            <div className="relative aspect-[5/4] overflow-hidden rounded-[24px] bg-[#091B13]">
              <Image
                src="/media/2026/expo-two-wheeler-crowd.webp"
                alt="Visitors viewing electric mobility products at IIEV Show 2026"
                fill
                sizes="(max-width:1024px) 100vw, 55vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.04]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#091B13]/65 via-transparent to-transparent" />

              
            </div>
          </AboutReveal>
        </div>
      </section>

    
    </>
  );
}
