import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Download, MapPin } from "lucide-react";
import { CompactHero } from "@/components/home/compact-hero";
import {
  Reveal,
  LineHeading,
  ImageReveal,
  EditorialRow,
  HeroEntrance,
  DividerReveal,
  HoverLift,
} from "@/components/home/home-animations";
import { IndustryAudience } from "@/components/home/industry-audience";
import { ShowExperience } from "@/components/home/show-experience";
import { EventEssentials } from "@/components/home/event-essentials";
import { ParticipateSection } from "@/components/home/participate-section";
import { ShowSectors } from "@/components/home/show-sectors";

const website = (process.env.NEXT_PUBLIC_SITE_URL || "https://iievshow.com").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "India International EV Show 2027 | 14–16 October, Pune",
  description:
    "Join the 9th India International EV Show, 14–16 October 2027 at Auto Cluster Exhibition Centre, Pimpri-Chinchwad, Pune. Discover EVs, charging, batteries, manufacturing and mobility technology.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "India International EV Show 2027 | Pune",
    description: "14–16 October 2027 · Auto Cluster Exhibition Centre, Pune. Discover the electric mobility ecosystem in one place.",
  },
};

const sectors = [
  { number: "01", name: "Electric vehicles", desc: "Two- and three-wheelers, cars, buses, cargo vehicles and micro-mobility." },
  { number: "02", name: "Powertrains & components", desc: "Motors, controllers, drive systems, inverters, electronics and vehicle components." },
  { number: "03", name: "Charging infrastructure", desc: "AC/DC chargers, charging stations, connectors, platforms and swapping systems." },
  { number: "04", name: "EV battery integration", desc: "Battery packs, management systems, thermal solutions and on-board charging." },
  { number: "05", name: "Smart mobility", desc: "Telematics, fleet technology, connected vehicles, diagnostics and software." },
  { number: "06", name: "Manufacturing & engineering", desc: "Assembly equipment, automation, precision engineering, testing and design." },
];

const audiences = [
  { title: "Automotive & manufacturing", description: "Vehicle OEMs, component manufacturers, engineering and R&D teams." },
  { title: "Buyers & distribution", description: "Dealers, distributors, sourcing teams and channel partners." },
  { title: "Fleet & transport", description: "Fleet operators, logistics firms and commercial mobility businesses." },
  { title: "Charging & infrastructure", description: "Charge-point operators, EPC companies, utilities and integrators." },
  { title: "Government & institutions", description: "Public-sector organisations, transport authorities and institutional buyers." },
  { title: "Research & investment", description: "Investors, startups, research institutes, universities and consultants." },
];

const experience = [
  { number: "01", title: "Discover", body: "Explore solutions across the electric mobility value chain." },
  { number: "02", title: "Evaluate", body: "Compare technology and speak directly with product teams." },
  { number: "03", title: "Connect", body: "Meet potential buyers, suppliers and industry professionals." },
  { number: "04", title: "Collaborate", body: "Discuss sourcing, manufacturing and business opportunities." },
];

const facts = [
  { label: "Edition", value: "9th" },
  { label: "Event dates", value: "14–16 Oct 2027" },
  { label: "Location", value: "Pimpri-Chinchwad, Pune" },
  { label: "Organiser", value: "Futurex Group" },
];

const headingStyle = "text-[clamp(2.15rem,4.6vw,4.5rem)] font-light leading-[1.07] tracking-[-0.045em]";

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] ${light ? "text-brand" : "text-brand-dark"}`}>
      <span className="h-[2px] w-7 bg-current" aria-hidden="true" />
      {children}
    </p>
  );
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-12 items-center gap-5 rounded-full bg-brand py-2 pl-6 pr-2 text-sm font-bold text-white transition-colors duration-300 hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      {children}
      <span className="grid size-9 place-items-center rounded-full bg-white text-brand-dark transition-transform duration-300 group-hover:rotate-45 group-hover:scale-105">
        <ArrowUpRight size={17} aria-hidden="true" />
      </span>
    </Link>
  );
}

function EventSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ExhibitionEvent",
    "@id": `${website}/#event-2027`,
    name: "India International EV Show 2027",
    description: "The 9th India International EV Show brings together electric vehicle manufacturers, suppliers, charging infrastructure providers, battery specialists and mobility professionals.",
    startDate: "2027-10-14",
    endDate: "2027-10-16",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Auto Cluster Exhibition Centre",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Pimpri-Chinchwad",
        addressRegion: "Maharashtra",
        addressCountry: "IN",
      },
    },
    organizer: { "@type": "Organization", name: "Futurex Group" },
    url: website,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export default function HomePage() {
  // (site)/layout.tsx continues to provide global header, main and footer.
  // Keep original branding, image assets and actual conversion destinations.
  return (
    <>
      <EventSchema />
      <HeroEntrance><CompactHero /></HeroEntrance>

      {/* 01 — Editorial intro and verified event information */}
      <section id="about-show" className="relative scroll-mt-28 overflow-hidden bg-white py-20 sm:py-28 lg:py-36">
        <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-3"><Eyebrow>About the show</Eyebrow></Reveal>
          <div className="lg:col-span-9">
            <LineHeading
              className="max-w-5xl text-[clamp(1.95rem,3.65vw,3.65rem)] font-light leading-[1.18] tracking-[-0.04em] text-ink"
              lines={[
                <>The India International EV Show connects manufacturers, suppliers, engineers and charging specialists</>,
                <><strong className="font-bold text-brand-dark">face to face in Pune.</strong></>,
              ]}
            />
            <Reveal delay={0.16} className="mt-8 max-w-2xl">
              <p className="text-base leading-8 text-copy">Across three days, explore electric mobility technologies, meet the people building them and identify new opportunities for your business.</p>
            </Reveal>
            <DividerReveal className="mt-14" />
            <dl className="mt-8 grid gap-x-8 gap-y-9 sm:grid-cols-2 xl:grid-cols-4">
              {facts.map((fact, index) => (
                <Reveal key={fact.label} delay={index * 0.07}>
                  <dt className="text-xs uppercase tracking-[0.12em] text-copy">{fact.label}</dt>
                  <dd className="mt-3 text-base font-bold leading-6 text-ink">{fact.value}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </section>

    {/* 02 — Premium animated exhibitor profiles */}
<ShowSectors sectors={sectors} />

   
{/* =========================================================
    WHY PUNE — REFINED PREMIUM EDITORIAL SECTION
    Main: Video | Secondary: Image
========================================================= */}

<section
  id="why-pune"
  aria-labelledby="why-pune-title"
  className="relative isolate overflow-hidden bg-brand-night py-20 text-white sm:py-28 lg:py-36"
>
  {/* Background architectural details */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
  >
    <div className="absolute inset-y-0 left-[8%] hidden w-px bg-white/[0.035] lg:block" />
    <div className="absolute inset-y-0 right-[8%] hidden w-px bg-white/[0.035] lg:block" />

    <span
      className="absolute -right-[2%] top-10 select-none whitespace-nowrap text-[clamp(8rem,24vw,25rem)] font-black leading-none tracking-[-0.11em] text-transparent opacity-[0.07]"
      style={{
        WebkitTextStroke: "1px #ffffff",
      }}
    >
      PUNE
    </span>
  </div>

  <div className="container-site relative z-10">

    {/* =====================================================
        01 — HEADING
    ===================================================== */}

    <div className="grid items-start gap-7 lg:grid-cols-12 lg:gap-8">

      <Reveal className="lg:col-span-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-[2px] w-8 shrink-0 bg-brand"
          />

          <Eyebrow light>
            Why Pune
          </Eyebrow>
        </div>

        <p className="mt-5 hidden max-w-[210px] text-xs leading-6 text-white/45 lg:block">
          A strategic meeting point for India's electric
          mobility industry.
        </p>
      </Reveal>

      <div className="min-w-0 lg:col-span-9">

        <div id="why-pune-title">
          <LineHeading
            className={`${headingStyle} max-w-5xl`}
            lines={[
              <>Built on engineering.</>,
              <>
                <strong className="font-bold text-brand">
                  Driven by innovation.
                </strong>
              </>,
            ]}
          />
        </div>

        <Reveal className="mt-6 max-w-2xl sm:mt-7">
          <p className="text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
            Pune brings automotive manufacturing,
            advanced engineering and emerging electric
            mobility technologies into one connected
            industrial ecosystem.
          </p>
        </Reveal>
      </div>
    </div>

    {/* =====================================================
        02 — VIDEO + IMAGE EDITORIAL COMPOSITION
    ===================================================== */}

    <div className="relative mt-12 sm:mt-16 lg:mt-20">

      {/* MAIN VIDEO */}
      <div className="relative lg:mr-[13%]">

        <ImageReveal
          parallax
          className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-[#142B25] sm:aspect-[16/9] lg:aspect-[1.85/1]"
        >
          {/* Static poster and video fallback */}
          <Image
            src="/images/DSC00889.JPG.webp"
            alt="Visitors exploring electric mobility technology at an earlier India International EV Show"
            fill
            sizes="(max-width: 1024px) 100vw, 1050px"
            className="object-cover"
          />

          {/* Exhibition footage */}
          <video
            className="absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.025] motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/DSC00889.JPG.webp"
            aria-hidden="true"
          >
            <source
              src="/video/iiev-hero.mp4"
              type="video/mp4"
            />
          </video>

          {/* Cinematic contrast */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-[#061914]/85 via-[#061914]/10 to-[#061914]/20"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-[#061914]/20 to-transparent"
          />

          {/* Top editorial label */}
          <div className="pointer-events-none absolute left-5 right-5 top-5 z-[3] flex items-center justify-between gap-3 sm:left-8 sm:right-8 sm:top-8">

            <div className="flex items-center gap-3">
              <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />

              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/90 sm:tracking-[0.2em]">
                The IIEV Experience
              </span>
            </div>

            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65 sm:block">
              Pune, India
            </span>
          </div>

          {/* Main video caption */}
          <div className="pointer-events-none absolute bottom-6 left-5 right-5 z-[3] sm:bottom-9 sm:left-9 sm:right-9 lg:bottom-12 lg:left-12">

            <span className="mb-4 block h-[2px] w-9 bg-brand" />

            <p className="max-w-xl text-[clamp(1.4rem,2.5vw,2.7rem)] font-semibold leading-[1.18] tracking-[-0.035em] text-white">
              Where industry connections
              <span className="block text-brand">
                become opportunities.
              </span>
            </p>
          </div>
        </ImageReveal>
      </div>

      {/* =================================================
          03 — OVERLAPPING SECONDARY IMAGE
      ================================================= */}

      <div className="relative z-10 -mt-8 ml-auto mr-3 w-[65%] sm:-mt-16 sm:mr-8 sm:w-[44%] lg:absolute lg:-bottom-24 lg:right-0 lg:ml-0 lg:mr-0 lg:mt-0 lg:w-[31%]">

        <ImageReveal
          className="group relative aspect-[4/5] overflow-hidden rounded-sm border-[5px] border-brand-night bg-[#17342A] shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:border-[7px]"
        >
          <Image
            src="/images/DSC01619_3x4.png"
            alt="Mobility industry professionals discussing products and technology at an earlier IIEV exhibition"
            fill
            sizes="(max-width: 640px) 65vw, (max-width: 1024px) 44vw, 400px"
            className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.045]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#061914]/70 via-transparent to-transparent"
          />

          <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7">

            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/85">
              Industry Networking
            </span>

            <span className="mt-3 block h-[2px] w-8 bg-brand transition-[width] duration-500 group-hover:w-14" />
          </div>
        </ImageReveal>

        {/* Editorial corner */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-3 -right-3 -z-10 h-16 w-16 border-b border-r border-brand/45 sm:-bottom-5 sm:-right-5 sm:h-20 sm:w-20"
        />
      </div>
    </div>

    {/* =====================================================
        04 — EDITORIAL STORY CONTENT
    ===================================================== */}

    <div className="mt-14 grid items-start gap-9 sm:mt-16 lg:mt-40 lg:grid-cols-12 lg:gap-8">

      {/* Section marker */}
      <Reveal className="lg:col-span-3">
        <div className="flex items-center gap-3">

          <span className="text-xs font-bold tracking-[0.18em] text-brand">
            LOCATION
          </span>

          <span className="h-px w-9 bg-brand/60" />
        </div>
      </Reveal>

      {/* Main story */}
      <Reveal className="min-w-0 lg:col-span-6">

        <h3 className="max-w-2xl text-[clamp(1.55rem,2.7vw,2.6rem)] font-light leading-[1.25] tracking-[-0.03em] text-white">
          A city that understands
          <span className="font-bold text-brand">
            {" "}how mobility is made.
          </span>
        </h3>

        <p className="mt-6 max-w-xl text-sm leading-8 text-white/65 sm:text-base">
          Pune and Pimpri-Chinchwad are home to an established
          automotive engineering and manufacturing ecosystem.
          IIEV brings component suppliers, technology
          providers, manufacturers and commercial buyers
          together here.
        </p>
      </Reveal>

      {/* Industry focus */}
      <Reveal className="lg:col-span-3">

        <div className="border-t border-white/20 pt-5">

          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
            Industry Focus
          </span>

          <p className="mt-3 text-sm leading-7 text-white/75">
            Automotive manufacturing, EV components,
            charging infrastructure and mobility technology.
          </p>
        </div>
      </Reveal>
    </div>
 
  </div>
</section>



     <IndustryAudience audiences={audiences} />

     <ShowExperience experience={experience} />
 

   {/* 06 — Event Essentials / SEO / AEO / GEO */}
{/* <EventEssentials /> */}

    {/* 07 — Animated final participation section */}
<ParticipateSection />
    </>
  );
}
