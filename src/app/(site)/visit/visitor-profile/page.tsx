
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CarFront,
  Factory,
  GraduationCap,
  Handshake,
  Leaf,
  MapPin,
  PlugZap,
  Truck,
  UsersRound,
} from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { pageMetadata } from "@/lib/seo/metadata";
import { VISITOR_INDUSTRY_OPTIONS } from "@/config/options";

export const metadata: Metadata = pageMetadata({
  title: "Visitor Profile | India International EV Show 2027",
  description:
    "Explore the visitor profile of India International EV Show, including manufacturers, dealers, EV buyers, fleet operators, students, government organisations and sustainability professionals.",
  path: "/visit/visitor-profile/",
});

type VisitorGroup = {
  number: string;
  title: string;
  description: string;
  visitors: string[];
  Icon: LucideIcon;
};

const visitorGroups: VisitorGroup[] = [
  {
    number: "01",
    title: "Automotive & Manufacturing",
    description:
      "Professionals involved in vehicle manufacturing, engineering, component development and technology evaluation.",
    Icon: Factory,
    visitors: [
      "Manufacturers",
      "Component Suppliers",
      "Automotive Engineers",
      "Consultants & Research Analysts",
      "Industry Analysts",
    ],
  },
  {
    number: "02",
    title: "Dealers & EV Buyers",
    description:
      "Businesses and individuals exploring electric vehicles, distribution opportunities and new mobility products.",
    Icon: Handshake,
    visitors: [
      "Dealers & Importers",
      "Potential EV Buyers",
      "Luxury Car Buyers",
      "Tech Enthusiasts & Early Adopters",
    ],
  },
  {
    number: "03",
    title: "Fleet & Transportation",
    description:
      "Professionals responsible for commercial fleets, mobility services, logistics and public transport.",
    Icon: Truck,
    visitors: [
      "Fleet Operators & Logistics Companies",
      "Fleet Managers",
      "Logistics Managers",
      "Public Transport Operators",
      "Ride-sharing & Car-sharing Companies",
    ],
  },
  {
    number: "04",
    title: "Charging & Infrastructure",
    description:
      "Organisations working on EV charging, electricity supply, infrastructure planning and transport development.",
    Icon: PlugZap,
    visitors: [
      "EV Charging Infrastructure Developers",
      "Electric Utility Professionals",
      "Real Estate Developers & Construction Companies",
      "Urban Planners",
      "Transportation Planners",
    ],
  },
  {
    number: "05",
    title: "Government & Institutions",
    description:
      "Public authorities and institutions involved in mobility policy, urban development and transport systems.",
    Icon: Building2,
    visitors: [
      "Government Agencies & Policymakers",
      "Public Transportation Authorities",
      "Municipal Authorities",
      "Road Transport Authorities",
      "Urban Planning & Development Professionals",
    ],
  },
  {
    number: "06",
    title: "Education & Sustainability",
    description:
      "Students, researchers, environmental organisations and individuals interested in the development of cleaner mobility.",
    Icon: GraduationCap,
    visitors: [
      "Engineering & Technology Students",
      "Business Students",
      "Sustainability Advocates",
      "Sustainable Energy Advocates",
      "Environmental NGOs & Sustainability Organizations",
      "Environmental & Sustainability Professionals",
      "General Public",
    ],
  },
];

function SectionTag({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-[2px] w-7 bg-[#23A455]" />
      <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#16893F] sm:text-[11px]">
        {children}
      </span>
    </div>
  );
}

export default function VisitorProfilePage() {
  const industries = VISITOR_INDUSTRY_OPTIONS.filter(
    (item) => item !== "Other"
  );

  return (
    <>
      <PageHero
        eyebrow="Visit IIEV Show"
        title="Visitor"
        highlight="Profile"
        description="From automotive professionals and EV buyers to students and sustainability advocates, explore the communities relevant to IIEV Show."
        image="/media/2026/expo-students.webp"
        imagePosition="center 45%"
        crumbs={[
          { label: "Visit", href: "/visit/" },
          { label: "Visitor Profile" },
        ]}
      />

      {/* INTRODUCTION */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center">
              <SectionTag>Who Can Visit</SectionTag>
            </div>

            <h2 className="mt-6 text-[clamp(2rem,4.5vw,3.9rem)] font-extrabold leading-[1.12] tracking-[-0.055em] text-[#102A1E]">
              An exhibition for the
              <span className="text-[#23A455]">
                {" "}wider EV ecosystem.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-[14px] leading-8 text-[#526357] sm:text-base">
              India International EV Show welcomes
              interest from vehicle manufacturers,
              suppliers, dealers, fleet operators,
              infrastructure developers, public bodies,
              students and people exploring electric mobility.
            </p>

            <p className="mx-auto mt-4 max-w-3xl text-[14px] leading-8 text-[#526357] sm:text-base">
              The exhibition offers opportunities to
              discover products, learn about emerging
              technologies and engage with companies
              involved in electric vehicles and
              supporting industries.
            </p>
          </AboutReveal>

          {/* Official exhibition imagery */}
          <AboutReveal
            delay={0.1}
            className="mt-12 grid gap-3 md:grid-cols-[1.35fr_1fr]"
          >
            <div className="relative h-[250px] overflow-hidden rounded-[22px] bg-[#102A1E] sm:h-[350px]">
              <Image
                src="/media/2026/expo-aisle-visitors.webp"
                alt="Visitors exploring an India International EV Show exhibition"
                fill
                sizes="(max-width:768px) 100vw, 58vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.035]"
              />
            </div>

            <div className="relative h-[220px] overflow-hidden rounded-[22px] bg-[#102A1E] sm:h-[350px]">
              <Image
                src="/media/2026/expo-car-interest.webp"
                alt="Visitors examining electric vehicle exhibits"
                fill
                sizes="(max-width:768px) 100vw, 42vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.035]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#091B13]/65 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/65">
                  India International EV Show
                </p>
                <p className="mt-1 text-sm font-extrabold text-white">
                  Explore electric mobility
                </p>
              </div>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* VISITOR GROUPS */}
      <section className="bg-[#F5F9F5] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mb-11 max-w-3xl">
            <SectionTag>Visitor Categories</SectionTag>

            <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.6rem)] font-extrabold leading-[1.12] tracking-[-0.055em] text-[#102A1E]">
              Discover who the
              <span className="text-[#23A455]">
                {" "}show is for.
              </span>
            </h2>

            <p className="mt-5 text-sm leading-8 text-[#526357]">
              The following categories reflect the
              range of professional, institutional
              and individual audiences associated
              with the exhibition.
            </p>
          </AboutReveal>

          <div className="grid gap-5 lg:grid-cols-2">
            {visitorGroups.map((group, index) => {
              const Icon = group.Icon;

              return (
                <AboutReveal
                  key={group.number}
                  delay={(index % 2) * 0.07}
                  className="h-full"
                >
                  <article className="group flex h-full flex-col rounded-[24px] border border-[#DDE8DF] bg-white p-7 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#23A455]/50 hover:shadow-[0_22px_45px_-35px_rgba(9,27,19,0.35)] sm:p-9">
                    <div className="flex items-start justify-between">
                      <div className="flex size-13 items-center justify-center rounded-2xl bg-[#E9F6ED] text-[#16893F] transition-colors duration-300 group-hover:bg-[#23A455] group-hover:text-white">
                        <Icon
                          size={26}
                          strokeWidth={1.7}
                          aria-hidden="true"
                        />
                      </div>

                      <span className="text-xs font-extrabold text-[#93A598]">
                        {group.number} / 06
                      </span>
                    </div>

                    <h3 className="mt-7 text-xl font-extrabold tracking-tight text-[#102A1E]">
                      {group.title}
                    </h3>

                    <p className="mt-3 text-[13px] leading-7 text-[#526357]">
                      {group.description}
                    </p>

                    <div className="mt-7 border-t border-[#E6EEE8] pt-6">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#16893F]">
                        Relevant Visitor Profiles
                      </p>

                      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                        {group.visitors.map((visitor) => (
                          <li
                            key={visitor}
                            className="flex items-start gap-2.5 text-[12px] leading-6 text-[#405648]"
                          >
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#23A455]" />
                            {visitor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </AboutReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* INDUSTRY REGISTRATION OPTIONS */}
      <section className="bg-white py-16 sm:py-22">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <SectionTag>Registration Categories</SectionTag>
            </div>

            <h2 className="mt-5 text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
              Industry backgrounds
              <span className="text-[#23A455]">
                {" "}represented.
              </span>
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#526357]">
              These classifications help visitors
              describe their industry when registering.
            </p>
          </AboutReveal>

          <AboutReveal className="mx-auto mt-10 max-w-5xl">
            <div className="flex flex-wrap justify-center gap-2.5">
              {industries.map((industry) => (
                <span
                  key={industry}
                  className="rounded-full border border-[#DDE8DF] bg-[#F6FAF7] px-4 py-2.5 text-[12px] font-semibold text-[#365241] transition-colors hover:border-[#23A455]/50 hover:bg-[#EAF6EE]"
                >
                  {industry}
                </span>
              ))}
            </div>
          </AboutReveal>

          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-6 text-[#718074]">
            Visitor profiles are intended audience
            categories, not confirmed attendance figures
            or a list of registered visitors for 2027.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden bg-[#091B13] py-16 text-white sm:py-20">
        <svg
          viewBox="0 0 500 500"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute -right-36 -top-40 size-[500px] opacity-25"
        >
          <circle cx="250" cy="250" r="210" stroke="#23A455" />
          <circle cx="250" cy="250" r="145" stroke="#23A455" />
          <circle
            cx="250"
            cy="250"
            r="80"
            stroke="#23A455"
            strokeDasharray="5 13"
          />
        </svg>

        <AboutReveal className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#23A455]">
            IIEV Show 2027
          </p>

          <h2 className="mt-5 text-[clamp(2rem,4.4vw,3.8rem)] font-extrabold leading-[1.12] tracking-[-0.05em]">
            Explore the future of
            <span className="text-[#23A455]">
              {" "}electric mobility.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-white/70">
            Discover products, emerging technologies
            and companies working across the EV industry.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/visit/register/"
              className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-[#23A455] px-7 text-[13px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#16893F]"
            >
              Register as Visitor
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>

            <Link
              href="/visit/why-visit/"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 px-7 text-[13px] font-bold text-white transition-colors hover:bg-white/10"
            >
              Why Visit
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </AboutReveal>
      </section>
    </>
  );
}
