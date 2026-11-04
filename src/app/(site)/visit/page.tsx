
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  QrCode,
  Search,
  TicketCheck,
  UsersRound,
} from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCurrentEdition } from "@/lib/data/edition";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Visit IIEV Show 2027 | Visitor Information & Registration",
  description:
    "Plan your visit to India International EV Show 2027, 14–16 October at Auto Cluster Exhibition Centre, Pimpri-Chinchwad, Pune. Explore visitor information, registration and travel guidance.",
  path: "/visit/",
});

const explore = [
  {
    number: "01",
    title: "Why Visit",
    text: "Explore products, suppliers and professional opportunities across electric mobility.",
    href: "/visit/why-visit/",
    Icon: Search,
  },
  {
    number: "02",
    title: "Visitor Profile",
    text: "See the industry groups and professional roles relevant to the exhibition.",
    href: "/visit/visitor-profile/",
    Icon: UsersRound,
  },
  {
    number: "03",
    title: "Register as Visitor",
    text: "Complete your personal registration for the upcoming edition.",
    href: "/visit/register/",
    Icon: TicketCheck,
  },
  {
    number: "04",
    title: "Travel & Stay",
    text: "Find practical information about reaching the exhibition venue in Pune.",
    href: "/visit/why-visit/#travel-stay",
    Icon: MapPin,
  },
  {
    number: "05",
    title: "Visitor FAQs",
    text: "Find answers about admission, badges, timings and venue access.",
    href: "/visit/why-visit/#visitor-faqs",
    Icon: ClipboardCheck,
  },
  {
    number: "06",
    title: "Retrieve Your Badge",
    text: "Already registered? Access the existing badge retrieval process.",
    href: "/visit/badge/",
    Icon: QrCode,
  },
];

export default async function VisitPage() {
  const edition = await getCurrentEdition();

  const venue = [
    edition.venue.name,
    edition.venue.locality,
    edition.venue.city,
    edition.venue.region,
  ]
    .filter(Boolean)
    .join(", ");

  const automatic =
    edition.registration.approvalMode === "auto";

  return (
    <>
      <PageHero
        eyebrow="Visitor Information"
        title="Visit"
        highlight="IIEV Show 2027"
        description="Explore electric vehicles, charging solutions, components and mobility technologies while connecting with industry professionals."
        image="/media/2026/expo-aisle-visitors.webp"
        imagePosition="center 48%"
        crumbs={[{ label: "Visit" }]}
      />

      {/* INTRODUCTION */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-4xl text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
              Plan Your Visit
            </p>

            <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.9rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
              Discover the people and products behind{" "}
              <span className="text-[#23A455]">
                electric mobility.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-sm leading-8 text-[#526357] sm:text-base">
              India International EV Show offers a
              business-focused setting to explore
              vehicle technologies, evaluate solutions
              and meet manufacturers, suppliers and
              service providers from across the EV industry.
            </p>
          </AboutReveal>

          <AboutReveal
            delay={0.1}
            className="mt-11 grid gap-px overflow-hidden rounded-2xl border border-[#DFE8E1] bg-[#DFE8E1] md:grid-cols-3"
          >
            <div className="bg-[#F6FAF7] p-6 sm:p-8">
              <CalendarDays
                size={22}
                className="text-[#16893F]"
                aria-hidden="true"
              />
              <p className="mt-5 text-lg font-extrabold text-[#102A1E]">
                {edition.dateLabel}
              </p>
              <p className="mt-2 text-xs text-[#627568]">
                Event Dates
              </p>
            </div>

            <div className="bg-[#F6FAF7] p-6 sm:p-8">
              <MapPin
                size={22}
                className="text-[#16893F]"
                aria-hidden="true"
              />
              <p className="mt-5 text-base font-extrabold leading-6 text-[#102A1E]">
                {edition.venue.name}
              </p>
              <p className="mt-2 text-xs leading-6 text-[#627568]">
                {edition.venue.locality},{" "}
                {edition.venue.city}
              </p>
            </div>

            <div className="bg-[#102A1E] p-6 text-white sm:p-8">
              <UsersRound
                size={22}
                className="text-[#23A455]"
                aria-hidden="true"
              />
              <p className="mt-5 text-lg font-extrabold">
                {edition.editionLabel}
              </p>
              <p className="mt-2 text-xs text-white/60">
                India International EV Show
              </p>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* VISITOR RESOURCES */}
      <section className="bg-[#F5F9F5] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
              Visitor Resources
            </p>

            <h2 className="mt-4 max-w-3xl text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
              Everything you need{" "}
              <span className="text-[#23A455]">
                before you arrive.
              </span>
            </h2>
          </AboutReveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {explore.map((item, index) => {
              const Icon = item.Icon;

              return (
                <AboutReveal
                  key={item.href}
                  delay={(index % 3) * 0.06}
                  className="h-full"
                >
                  <Link
                    href={item.href}
                    className="group flex h-full min-h-[220px] flex-col rounded-[22px] border border-[#DFE8E1] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#23A455]/50 hover:shadow-[0_22px_46px_-34px_rgba(9,27,19,0.35)]"
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex size-12 items-center justify-center rounded-xl bg-[#E8F5EC] text-[#16893F] transition-colors group-hover:bg-[#23A455] group-hover:text-white">
                        <Icon
                          size={23}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </span>

                      <ArrowUpRight
                        size={18}
                        className="text-[#16893F] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="mt-8 text-lg font-extrabold text-[#102A1E]">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-[13px] leading-7 text-[#526357]">
                      {item.text}
                    </p>
                  </Link>
                </AboutReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* REGISTRATION PROCESS */}
      <section className="relative isolate overflow-hidden bg-[#102A1E] py-16 text-white sm:py-24">
        <svg
          viewBox="0 0 520 520"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute -right-44 -top-40 size-[520px] opacity-25"
        >
          <circle cx="260" cy="260" r="212" stroke="#23A455" />
          <circle cx="260" cy="260" r="146" stroke="#23A455" />
          <circle
            cx="260"
            cy="260"
            r="80"
            stroke="#23A455"
            strokeDasharray="5 12"
          />
        </svg>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#23A455]">
              Visitor Registration
            </p>

            <h2 className="mt-5 text-[clamp(2rem,4.4vw,3.8rem)] font-extrabold leading-[1.12] tracking-[-0.05em]">
              A straightforward{" "}
              <span className="text-[#23A455]">
                registration process.
              </span>
            </h2>

            <p className="mt-5 text-sm leading-8 text-white/65">
              Complete your registration, follow the
              confirmation instructions and present
              your badge when you arrive.
            </p>
          </AboutReveal>

          <div className="mt-11 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Register online",
                text: "Enter your personal and professional details.",
              },
              {
                n: "02",
                title: automatic
                  ? "Receive your badge"
                  : "Wait for approval",
                text: automatic
                  ? "Your badge is generated through the registration process and sent to your email."
                  : "Your registration is reviewed. Approved visitors receive their badge by email.",
              },
              {
                n: "03",
                title: "Present your badge",
                text: "Show the badge on your phone or bring a printed copy for entry scanning.",
              },
            ].map((step, index) => (
              <AboutReveal
                key={step.n}
                delay={index * 0.07}
                className="h-full"
              >
                <div className="h-full rounded-2xl border border-white/15 bg-white/[0.04] p-7 transition-colors duration-300 hover:bg-white/[0.08]">
                  <span className="text-xs font-extrabold text-[#23A455]">
                    STEP {step.n}
                  </span>

                  <h3 className="mt-8 text-lg font-extrabold">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-[13px] leading-7 text-white/65">
                    {step.text}
                  </p>
                </div>
              </AboutReveal>
            ))}
          </div>

          <AboutReveal className="mt-8">
            <div className="flex flex-col gap-5 rounded-2xl border border-white/15 bg-[#091B13] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-extrabold text-white">
                  Admission Information
                </p>
                <p className="mt-2 max-w-2xl text-[13px] leading-7 text-white/65">
                  {edition.registration.admissionNote ??
                    "The admission policy will be communicated through official visitor information and registration confirmation."}
                </p>
              </div>

              <Link
                href="/visit/why-visit/#visitor-faqs"
                className="inline-flex shrink-0 items-center gap-2 text-xs font-bold text-[#6CD895] hover:text-white"
              >
                Visitor FAQs
                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* EXHIBITION PHOTOGRAPH */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-16 lg:px-10">
          <AboutReveal>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
              At the Exhibition
            </p>

            <h2 className="mt-5 text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
              Explore technologies.{" "}
              <span className="text-[#23A455]">
                Meet the industry.
              </span>
            </h2>

            <p className="mt-6 text-sm leading-8 text-[#526357]">
              Whether you are sourcing components,
              evaluating mobility solutions or exploring
              distribution opportunities, IIEV creates
              a setting for direct product discussions
              and professional connections.
            </p>

            <Link
              href="/visit/why-visit/"
              className="group mt-7 inline-flex items-center gap-2 border-b-2 border-[#23A455] pb-2 text-[13px] font-bold text-[#16893F] hover:text-[#102A1E]"
            >
              Explore Why Visit
              <ArrowUpRight
                size={17}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          </AboutReveal>

          <AboutReveal delay={0.1}>
            <div className="relative aspect-[5/4] overflow-hidden rounded-[24px] bg-[#102A1E]">
              <Image
                src="/media/2026/expo-car-interest.webp"
                alt="Visitors examining vehicle technology at an IIEV exhibition"
                fill
                sizes="(max-width:1024px) 100vw, 55vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.04]"
              />
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

          <h2 className="mt-5 text-[clamp(2rem,4.4vw,3.8rem)] font-extrabold leading-[1.12] tracking-[-0.05em]">
            Plan your visit{" "}
            <span className="text-[#23A455]">
              to Pune.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-white/70">
            {edition.dateLabel} · {venue}
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
              href="/visit/why-visit/#travel-stay"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 px-7 text-[13px] font-bold text-white transition-colors hover:bg-white/10"
            >
              Travel & Stay
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </AboutReveal>
      </section>
    </>
  );
}
