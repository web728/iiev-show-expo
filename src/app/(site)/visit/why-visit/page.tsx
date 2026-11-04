
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  BatteryCharging,
  CarFront,
  Check,
  ChevronDown,
  Cpu,
  Factory,
  Gauge,
  Hotel,
  MapPin,
  Plane,
  PlugZap,
  TrainFront,
  Truck,
  UsersRound,
  Car,
} from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCurrentEdition } from "@/lib/data/edition";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Why Visit IIEV Show 2027 | Visitor Guide",
  description:
    "Discover electric vehicles, automotive components, manufacturing technologies and energy management solutions at IIEV Show 2027. Find travel information and visitor FAQs.",
  path: "/visit/why-visit/",
});

const focusAreas: {
  title: string;
  text: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Electric Vehicles",
    text: "Explore electric two-wheelers, three-wheelers, passenger vehicles and commercial mobility solutions.",
    Icon: CarFront,
  },
  {
    title: "Manufacturing Systems",
    text: "Discover equipment, automation and engineering technologies used in vehicle and component manufacturing.",
    Icon: Factory,
  },
  {
    title: "Components & Parts",
    text: "Examine powertrains, motors, controllers, electrical systems and other EV components.",
    Icon: Cpu,
  },
  {
    title: "Energy Management",
    text: "Explore battery integration, charging systems and technologies supporting vehicle energy use.",
    Icon: BatteryCharging,
  },
  {
    title: "Charging Infrastructure",
    text: "Learn about charging hardware, connectors, charging services and related infrastructure.",
    Icon: PlugZap,
  },
  {
    title: "Mobility & Safety Technology",
    text: "Discover vehicle systems, digital mobility solutions, testing and safety-related technologies.",
    Icon: Gauge,
  },
];

const travel = [
  {
    title: "By Air",
    Icon: Plane,
    text: "Pune International Airport serves domestic and selected international routes. Visitors arriving through Mumbai may continue to Pune by road. Allow additional travel time during busy periods.",
  },
  {
    title: "By Rail & Metro",
    Icon: TrainFront,
    text: "Pune Junction is a major railway station. The Pune–Lonavala suburban line serves Pimpri, Chinchwad and Akurdi. Check the current Pune Metro network and plan local transport for the final journey.",
  },
  {
    title: "By Road",
    Icon: Car,
    text: "Pimpri-Chinchwad is accessible through the Mumbai–Pune road network. App-based cabs, taxis and auto-rickshaws are available for travel within Pune and surrounding areas.",
  },
  {
    title: "Where to Stay",
    Icon: Hotel,
    text: "Consider hotels in Pimpri-Chinchwad, Wakad, Hinjewadi, Baner or central Pune. Choose accommodation based on the venue commute and your wider travel plans.",
  },
];

const visitTips = [
  "Register in advance and keep your confirmation accessible.",
  "Explore exhibitor and sector information before arriving.",
  "Identify the products and technologies most relevant to you.",
  "Prepare questions about specifications, applications and availability.",
  "Allow time for demonstrations and direct discussions.",
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
      <span className="h-[2px] w-7 bg-[#23A455]" />
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

export default async function WhyVisitPage() {
  const edition = await getCurrentEdition();

  const venue = [
    edition.venue.name,
    edition.venue.locality,
    edition.venue.city,
    edition.venue.region,
  ]
    .filter(Boolean)
    .join(", ");

  const faqs = [
    {
      question: "How do I register as a visitor?",
      answer: (
        <>
          Complete the{" "}
          <Link href="/visit/register/" className="font-bold text-[#16893F] underline underline-offset-4">
            visitor registration form
          </Link>
          . Follow the instructions provided after submission.
        </>
      ),
    },
    {
      question: "Is there an entry fee?",
      answer:
        edition.registration.admissionNote ??
        "Admission details will be communicated through official event information and registration confirmation.",
    },
    {
      question: "I lost my badge email. How can I get it again?",
      answer: (
        <>
          Use the{" "}
          <Link href="/visit/badge/" className="font-bold text-[#16893F] underline underline-offset-4">
            badge retrieval page
          </Link>{" "}
          with the email address used during registration.
        </>
      ),
    },
    {
      question: "Can someone else use my badge?",
      answer:
        "No. Visitor badges are personal. Each attendee should register using their own information.",
    },
    {
      question: "How do I reach the venue?",
      answer:
        `The exhibition venue is ${venue}. Air, rail, road and accommodation guidance is provided in the Travel & Stay section below.`,
    },
    {
      question: "What are the opening hours?",
      answer:
        "Daily visitor opening hours will be communicated through the official event schedule or visitor confirmation. Contact the organiser if you need clarification before travelling.",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Visit IIEV Show"
        title="Why Visit"
        highlight="IIEV Show?"
        description="Discover electric mobility technologies, explore new products and connect with manufacturers, suppliers and other industry participants."
        image="/media/2026/expo-car-interest.webp"
        imagePosition="center 48%"
        crumbs={[
          { label: "Visit", href: "/visit/" },
          { label: "Why Visit" },
        ]}
      />

      {/* CORE EXHIBITION POSITIONING */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center">
              <Eyebrow>Why Visit</Eyebrow>
            </div>

            <h2 className="mt-6 text-[clamp(2rem,4.6vw,4rem)] font-extrabold leading-[1.12] tracking-[-0.055em] text-[#102A1E]">
              Explore the latest in
              <span className="text-[#23A455]">
                {" "}electric mobility.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-3xl text-[14px] leading-8 text-[#526357] sm:text-base">
              India International EV Show brings together
              technologies and solutions relevant to
              automotive manufacturing and electric mobility.
              The exhibition covers emerging manufacturing
              systems, components, energy management,
              e-mobility, vehicle safety and electric
              vehicle models.
            </p>

            <p className="mx-auto mt-4 max-w-3xl text-[14px] leading-8 text-[#526357] sm:text-base">
              Visitors can explore products, learn about
              technological developments and interact
              with manufacturers, suppliers and
              professionals working across the industry.
              It is an opportunity to exchange ideas,
              assess solutions and explore potential
              business relationships.
            </p>
          </AboutReveal>
        </div>
      </section>

      {/* TECHNOLOGY FOCUS */}
      <section className="bg-[#F5F9F5] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mb-11 max-w-3xl">
            <Eyebrow>At the Exhibition</Eyebrow>

            <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.6rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
              What you can
              <span className="text-[#23A455]">
                {" "}explore.
              </span>
            </h2>

            <p className="mt-5 text-sm leading-8 text-[#526357]">
              The exhibition covers products and technologies
              used across the electric vehicle ecosystem.
            </p>
          </AboutReveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {focusAreas.map(({ title, text, Icon }, index) => (
              <AboutReveal
                key={title}
                delay={(index % 3) * 0.06}
                className="h-full"
              >
                <article className="group relative flex h-full min-h-[235px] flex-col overflow-hidden rounded-[22px] border border-[#DFE8E1] bg-white p-7 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#23A455]/50 hover:shadow-[0_20px_42px_-32px_rgba(9,27,19,0.32)]">
                  <svg
                    viewBox="0 0 150 150"
                    fill="none"
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-8 -top-10 size-36 text-[#23A455] opacity-[0.07]"
                  >
                    <circle cx="75" cy="75" r="61" stroke="currentColor" />
                    <circle cx="75" cy="75" r="39" stroke="currentColor" />
                    <circle cx="75" cy="75" r="17" stroke="currentColor" />
                  </svg>

                  <span className="relative flex size-12 items-center justify-center rounded-xl bg-[#E8F5EC] text-[#16893F] transition-colors group-hover:bg-[#23A455] group-hover:text-white">
                    <Icon
                      size={24}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>

                  <h3 className="relative mt-8 text-lg font-extrabold text-[#102A1E]">
                    {title}
                  </h3>

                  <p className="relative mt-3 text-[13px] leading-7 text-[#526357]">
                    {text}
                  </p>
                </article>
              </AboutReveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHY ATTEND */}
      <section className="relative isolate overflow-hidden bg-[#102A1E] py-16 text-white sm:py-24">
        <svg
          viewBox="0 0 520 520"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 size-[520px] opacity-25"
        >
          <circle cx="260" cy="260" r="215" stroke="#23A455" />
          <circle cx="260" cy="260" r="150" stroke="#23A455" />
          <circle
            cx="260"
            cy="260"
            r="90"
            stroke="#23A455"
            strokeDasharray="6 13"
          />
        </svg>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:px-10">
          <AboutReveal>
            <Eyebrow light>Industry Connections</Eyebrow>

            <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.12] tracking-[-0.05em]">
              Meet, learn
              <span className="block text-[#23A455]">
                and connect.
              </span>
            </h2>

            <p className="mt-6 text-sm leading-8 text-white/70 sm:text-base">
              Meet companies presenting products
              and technologies across electric mobility.
              Discuss industry requirements, exchange
              knowledge and explore commercial
              or professional opportunities.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                "Manufacturers",
                "Dealers & Buyers",
                "Fleet Operators",
                "Engineering Professionals",
                "Students & Researchers",
                "Industry Institutions",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-2 text-[11px] font-semibold text-white/75"
                >
                  {item}
                </span>
              ))}
            </div>

            <Link
              href="/visit/visitor-profile/"
              className="group mt-8 inline-flex items-center gap-2 border-b-2 border-[#23A455] pb-2 text-[13px] font-bold text-white transition-colors hover:text-[#6CD895]"
            >
              Explore Visitor Profile
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
                src="/media/2026/expo-aisle-visitors.webp"
                alt="Visitors exploring exhibits at the India International EV Show"
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.04]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#091B13]/50 via-transparent to-transparent" />

              <span className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-[#091B13]/70 px-4 py-2 text-[11px] font-semibold backdrop-blur-sm">
                Previous exhibition
              </span>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* VISIT PLANNING TIPS */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="grid items-start gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
            <div>
              <Eyebrow>Plan Your Visit</Eyebrow>

              <h2 className="mt-5 text-[clamp(2rem,4vw,3.3rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
                Come prepared to
                <span className="text-[#23A455]">
                  {" "}explore.
                </span>
              </h2>

              <p className="mt-5 text-sm leading-8 text-[#526357]">
                A little planning helps you identify
                relevant products, exhibitors and
                discussions during your visit.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#DFE8E1] bg-[#F7FAF7] p-6 sm:p-8">
              <ul className="space-y-5">
                {visitTips.map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-3 text-[13px] leading-7 text-[#405548]"
                  >
                    <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#E2F2E7] text-[#16893F]">
                      <Check
                        size={14}
                        strokeWidth={2.2}
                        aria-hidden="true"
                      />
                    </span>

                    {tip}
                  </li>
                ))}
              </ul>

              <Link
                href="/exhibitors/"
                className="group mt-8 inline-flex items-center gap-2 text-[13px] font-bold text-[#16893F] hover:text-[#102A1E]"
              >
                View Exhibitor Directory
                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* TRAVEL & STAY */}
      <section
        id="travel-stay"
        className="scroll-mt-28 bg-[#F5F9F5] py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="max-w-3xl">
            <Eyebrow>Travel & Stay</Eyebrow>

            <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
              Plan your journey
              <span className="text-[#23A455]">
                {" "}to Pune.
              </span>
            </h2>

            <p className="mt-5 text-sm leading-8 text-[#526357]">
              Practical travel information for
              reaching Auto Cluster Exhibition Centre,
              Pimpri-Chinchwad. Check schedules and
              travel arrangements before departure.
            </p>
          </AboutReveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {travel.map(({ title, text, Icon }, index) => (
              <AboutReveal
                key={title}
                delay={(index % 2) * 0.07}
                className="h-full"
              >
                <article className="group h-full rounded-[22px] border border-[#DFE8E1] bg-white p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#23A455]/45 sm:p-8">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-[#E8F5EC] text-[#16893F]">
                    <Icon
                      size={24}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </span>

                  <h3 className="mt-7 text-xl font-extrabold text-[#102A1E]">
                    {title}
                  </h3>

                  <p className="mt-4 text-[13px] leading-7 text-[#526357]">
                    {text}
                  </p>
                </article>
              </AboutReveal>
            ))}
          </div>

          <AboutReveal className="mt-7">
            <div className="rounded-2xl border border-[#DFE8E1] bg-white p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <MapPin
                  size={22}
                  className="mt-0.5 shrink-0 text-[#16893F]"
                  aria-hidden="true"
                />

                <div>
                  <h3 className="text-sm font-extrabold text-[#102A1E]">
                    Exhibition Venue
                  </h3>

                  <p className="mt-2 text-[13px] leading-7 text-[#526357]">
                    {venue}
                  </p>

                  <Link
                    href="/visit/venue/"
                    className="group mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#16893F] hover:text-[#102A1E]"
                  >
                    Venue Details
                    <ArrowUpRight
                      size={16}
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>

              <p className="mt-5 border-t border-[#E8EEE9] pt-5 text-[12px] leading-6 text-[#718074]">
                Official hotel partners or shuttle services
                for 2027 have not been announced. Any
                confirmed arrangements will be shared
                through official event information.
              </p>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* VISITOR FAQS */}
      <section
        id="visitor-faqs"
        className="scroll-mt-28 bg-white py-16 sm:py-24"
      >
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <AboutReveal className="text-center">
            <div className="flex justify-center">
              <Eyebrow>Visitor FAQs</Eyebrow>
            </div>

            <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
              Before you
              <span className="text-[#23A455]">
                {" "}arrive.
              </span>
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#526357]">
              Essential answers about registration,
              badges, admission and visiting the exhibition.
            </p>
          </AboutReveal>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => (
              <AboutReveal
                key={faq.question}
                delay={(index % 3) * 0.04}
              >
                <details className="group overflow-hidden rounded-2xl border border-[#DFE8E1] bg-[#FAFCFA] open:border-[#23A455]/40">
                  <summary className="flex min-h-17 cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left [&::-webkit-details-marker]:hidden sm:px-7">
                    <span className="text-[13px] font-extrabold leading-6 text-[#102A1E] sm:text-[15px]">
                      {faq.question}
                    </span>

                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E5F4E9] text-[#16893F]">
                      <ChevronDown
                        size={17}
                        aria-hidden="true"
                        className="transition-transform duration-300 group-open:rotate-180"
                      />
                    </span>
                  </summary>

                  <div className="border-t border-[#E8EEE9] px-5 pb-6 pt-4 text-[13px] leading-7 text-[#526357] sm:px-7">
                    {faq.answer}
                  </div>
                </details>
              </AboutReveal>
            ))}
          </div>

          <AboutReveal className="mt-8">
            <div className="flex flex-col gap-5 rounded-2xl bg-[#102A1E] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <h3 className="text-base font-extrabold">
                  Still have a question?
                </h3>
                <p className="mt-2 text-xs leading-6 text-white/65">
                  Contact the organiser for additional
                  visiting information.
                </p>
              </div>

              <Link
                href="/contact/"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-white/25 px-5 text-xs font-bold text-white transition-colors hover:border-[#23A455] hover:bg-[#23A455]"
              >
                Contact Us
                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#091B13] py-16 text-white sm:py-20">
        <AboutReveal className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#23A455]">
            IIEV 2027
          </p>

          <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.8rem)] font-extrabold leading-[1.12] tracking-[-0.05em]">
            Explore electric mobility
            <span className="text-[#23A455]">
              {" "}in Pune.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-white/70">
            {edition.dateLabel} · {edition.venue.city}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/visit/register/"
              className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-[#23A455] px-7 text-[13px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#16893F]"
            >
              Register as Visitor
              <ArrowUpRight
                size={17}
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/visit/visitor-profile/"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 px-7 text-[13px] font-bold text-white transition-colors hover:bg-white/10"
            >
              Visitor Profile
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
