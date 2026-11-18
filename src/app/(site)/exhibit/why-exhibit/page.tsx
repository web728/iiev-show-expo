import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Factory,
  Handshake,
  LayoutGrid,
  MapPin,
  PackageSearch,
  Presentation,
  ShieldCheck,
  UsersRound,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCurrentEdition } from "@/lib/data/edition";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Why Exhibit at IIEV Show 2027 | Exhibitor Guide",
  description:
    "Discover why to exhibit at India International EV Show 2027 in Pune. Explore business opportunities, participation steps, stall options, exhibitor manual information and preparation guidance.",
  path: "/exhibit/why-exhibit/",
});

const BOOK_STALL_HREF = "/exhibit/book-a-stall/";

const benefits: {
  title: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Showcase your products",
    description:
      "Present electric vehicles, components, charging solutions, battery technologies and manufacturing equipment to an industry-focused audience.",
    Icon: Presentation,
  },
  {
    title: "Meet potential buyers",
    description:
      "Engage with dealers, distributors, fleet operators, engineering teams and other professionals evaluating EV solutions.",
    Icon: UsersRound,
  },
  {
    title: "Explore partnerships",
    description:
      "Connect with manufacturers, technology providers, system integrators and prospective business partners.",
    Icon: Handshake,
  },
  {
    title: "Discuss technical needs",
    description:
      "Demonstrate capabilities, answer product questions and understand the requirements of different applications.",
    Icon: Factory,
  },
  {
    title: "Understand the market",
    description:
      "Observe technology developments, compare available solutions and gather direct feedback from industry professionals.",
    Icon: PackageSearch,
  },
];

const process = [
  {
    title: "Send an enquiry",
    description:
      "Share your products, industry segment and approximate exhibition space requirement.",
  },
  {
    title: "Review available options",
    description:
      "The exhibitor sales team shares available locations and applicable participation terms.",
  },
  {
    title: "Confirm your booking",
    description:
      "Complete the participation contract and follow the payment schedule stated in the agreement.",
  },
  {
    title: "Prepare your stand",
    description:
      "Receive the exhibitor manual, portal access and directory-listing invitation.",
  },
];

const manualTopics: {
  title: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Event Schedule",
    description: "Build-up, show and dismantling timings.",
    Icon: CalendarDays,
  },
  {
    title: "Stand Construction",
    description: "Stand design approvals and contractor rules.",
    Icon: LayoutGrid,
  },
  {
    title: "Utilities & Services",
    description: "Electrical load, furniture and additional services.",
    Icon: Zap,
  },
  {
    title: "Exhibit Movement",
    description: "Movement of vehicles and heavy exhibits into the halls.",
    Icon: Factory,
  },
  {
    title: "Access & Badges",
    description: "Exhibitor badges, vehicle passes and entry arrangements.",
    Icon: BadgeCheck,
  },
  {
    title: "Health & Safety",
    description: "Safety requirements and fire regulations.",
    Icon: ShieldCheck,
  },
];

const preparation = [
  {
    phase: "Before",
    title: "Plan your participation",
    description:
      "Define your objectives, prepare product specifications and invite relevant customers or prospects.",
  },
  {
    phase: "During",
    title: "Engage and demonstrate",
    description:
      "Have technical and commercial representatives available, demonstrate products and record enquiries.",
  },
  {
    phase: "After",
    title: "Follow up",
    description:
      "Contact relevant prospects, share requested information and evaluate the outcomes of participation.",
  },
];

/* ---------- Shared pieces ---------- */

function MotionStyles() {
  return (
    <style>{`
      @keyframes iiev-spin { to { transform: rotate(360deg); } }
      @keyframes iiev-spin-rev { to { transform: rotate(-360deg); } }
      @keyframes iiev-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      @keyframes iiev-shimmer {
        0% { transform: translateX(-130%) skewX(-20deg); }
        100% { transform: translateX(260%) skewX(-20deg); }
      }
      @keyframes iiev-ring {
        0% { box-shadow: 0 0 0 0 rgba(35,164,85,.45); }
        70% { box-shadow: 0 0 0 16px rgba(35,164,85,0); }
        100% { box-shadow: 0 0 0 0 rgba(35,164,85,0); }
      }
      @keyframes iiev-dot {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.5); opacity: .55; }
      }
      @keyframes iiev-glow {
        0%, 100% { opacity: .35; transform: scale(1); }
        50% { opacity: .65; transform: scale(1.08); }
      }
      .iiev-spin { animation: iiev-spin 70s linear infinite; }
      .iiev-spin-rev { animation: iiev-spin-rev 90s linear infinite; }
      .iiev-float { animation: iiev-float 6s ease-in-out infinite; }
      .iiev-shimmer { animation: iiev-shimmer 3.4s ease-in-out infinite; }
      .iiev-ring { animation: iiev-ring 2.4s ease-out infinite; }
      .iiev-dot { animation: iiev-dot 2.2s ease-in-out infinite; }
      .iiev-glow { animation: iiev-glow 7s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) {
        .iiev-spin, .iiev-spin-rev, .iiev-float, .iiev-shimmer,
        .iiev-ring, .iiev-dot, .iiev-glow { animation: none !important; }
      }
    `}</style>
  );
}

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

function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  center = false,
}: {
  eyebrow: string;
  title: string;
  highlight: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <AboutReveal
      className={
        center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"
      }
    >
      <div className={center ? "flex justify-center" : ""}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>

      <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.6rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
        {title}
        <span className="text-[#23A455]"> {highlight}</span>
      </h2>

      {description && (
        <p
          className={`mt-5 text-[13px] leading-7 text-[#4A5750] sm:text-[15px] sm:leading-8 ${
            center ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      )}
    </AboutReveal>
  );
}

/** Primary CTA with shimmer sweep + pulsing ring */
function BookStallButton({ large = false }: { large?: boolean }) {
  return (
    <Link
      href={BOOK_STALL_HREF}
      className={`
        iiev-ring group relative inline-flex items-center justify-center
        gap-2 overflow-hidden rounded-full bg-[#23A455]
        font-extrabold text-white
        transition-all duration-300
        hover:-translate-y-0.5 hover:bg-[#16893F]
        hover:shadow-[0_18px_40px_-16px_rgba(35,164,85,.7)]
        focus-visible:outline-2 focus-visible:outline-offset-4
        focus-visible:outline-[#23A455]
        ${
          large
            ? "min-h-14 px-9 text-[14px]"
            : "min-h-12 px-8 text-[13px]"
        }
      `}
    >
      <span
        aria-hidden="true"
        className="iiev-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
      <span className="relative">Book Your Stall</span>
      <ArrowUpRight
        size={18}
        strokeWidth={2}
        aria-hidden="true"
        className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </Link>
  );
}

/* ---------- Page ---------- */

export default async function WhyExhibitPage() {
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
      <MotionStyles />

      {/* SHARED PAGE HERO */}
      <PageHero
        eyebrow="Exhibit at IIEV 2027"
        title="Why Exhibit"
        highlight="at IIEV Show?"
        description="Present your solutions, meet industry professionals and explore business opportunities across the electric mobility value chain."
        image="/media/2026/expo-two-wheeler-crowd.webp"
        imagePosition="center 48%"
        crumbs={[
          { label: "Exhibit", href: "/exhibit/" },
          { label: "Why Exhibit" },
        ]}
      />

      {/* =====================================
          INTRODUCTION + BOOK BUTTON
      ===================================== */}
      <section className="relative isolate overflow-hidden bg-white py-18 sm:py-24 lg:py-28">
        {/* soft glow */}
        <div
          aria-hidden="true"
          className="iiev-glow pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(35,164,85,.14),transparent)]"
        />

        {/* rotating rings */}
        <svg
          viewBox="0 0 400 400"
          fill="none"
          aria-hidden="true"
          className="iiev-spin pointer-events-none absolute -left-32 top-10 -z-10 size-[400px] text-[#23A455] opacity-[0.08]"
        >
          <circle cx="200" cy="200" r="175" stroke="currentColor" />
          <circle
            cx="200"
            cy="200"
            r="120"
            stroke="currentColor"
            strokeDasharray="5 11"
          />
          <circle cx="200" cy="25" r="5" fill="currentColor" />
        </svg>

        <svg
          viewBox="0 0 400 400"
          fill="none"
          aria-hidden="true"
          className="iiev-spin-rev pointer-events-none absolute -right-32 bottom-0 -z-10 size-[400px] text-[#23A455] opacity-[0.08]"
        >
          <circle cx="200" cy="200" r="175" stroke="currentColor" />
          <circle
            cx="200"
            cy="200"
            r="115"
            stroke="currentColor"
            strokeDasharray="5 11"
          />
          <circle cx="375" cy="200" r="5" fill="currentColor" />
        </svg>

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            center
            eyebrow="Business Opportunities"
            title="Take your products"
            highlight="to the industry."
            description="9th India International EV Show brings vehicle manufacturers, component suppliers, technology developers and other electric mobility businesses into a focused exhibition environment. Exhibiting provides opportunities for product discovery, technical discussions and professional networking."
          />

          {/* Centered CTA */}
          <AboutReveal
            delay={0.12}
            className="mt-10 flex flex-col items-center gap-6"
          >
            <BookStallButton large />
 
          </AboutReveal>
        </div>
      </section>

      {/* =====================================
          EXHIBITION BENEFITS (BENTO)
      ===================================== */}
      <section className="relative overflow-hidden bg-[#F5F9F5] py-18 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Why Participate"
            title="Business conversations"
            highlight="that matter."
            description="An opportunity to meet relevant industry participants and discuss products directly with potential customers and partners."
          />

          <div className="mt-12 grid gap-4 md:grid-cols-6">
            {benefits.map((item, index) => {
              const Icon = item.Icon;

              return (
                <AboutReveal
                  key={item.title}
                  delay={(index % 3) * 0.07}
                  className={`h-full ${
                    index < 2 ? "md:col-span-3" : "md:col-span-2"
                  }`}
                >
                  <article
                    className="
                      group relative flex h-full min-h-[260px] flex-col
                      justify-between overflow-hidden rounded-[24px]
                      border border-[#DDE8DF] bg-white p-7
                      transition-all duration-500
                      hover:-translate-y-1.5
                      hover:border-[#23A455]/50
                      hover:shadow-[0_30px_60px_-38px_rgba(9,27,19,.45)]
                      sm:p-8
                    "
                  >
                    {/* top accent bar */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[#23A455] to-[#7BD69A] transition-transform duration-500 group-hover:scale-x-100"
                    />

                    {/* hover glow */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-24 -right-24 size-64 rounded-full bg-[radial-gradient(closest-side,rgba(35,164,85,.16),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />

                    <svg
                      viewBox="0 0 160 160"
                      fill="none"
                      aria-hidden="true"
                      className="iiev-spin pointer-events-none absolute -right-8 -top-8 size-40 text-[#23A455] opacity-[0.08]"
                    >
                      <circle cx="80" cy="80" r="66" stroke="currentColor" />
                      <circle
                        cx="80"
                        cy="80"
                        r="40"
                        stroke="currentColor"
                        strokeDasharray="4 8"
                      />
                      <circle cx="80" cy="14" r="3.5" fill="currentColor" />
                    </svg>

                    <div className="relative">
                      <span className="flex size-14 items-center justify-center rounded-2xl bg-[#E9F6ED] text-[#16893F] transition-all duration-500 group-hover:rotate-[-6deg] group-hover:scale-105 group-hover:bg-[#23A455] group-hover:text-white">
                        <Icon
                          size={26}
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      </span>
                    </div>

                    <div className="relative mt-10">
                      <h3 className="text-xl font-extrabold tracking-[-0.03em] text-[#102A1E] sm:text-[22px]">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-[13px] leading-7 text-[#4A5750]">
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
          PARTICIPATION PROCESS
      ===================================== */}
      <section
        id="participation-process"
        className="relative scroll-mt-28 overflow-hidden bg-white py-18 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Participation Process"
            title="From enquiry"
            highlight="to exhibition."
            description="The steps below explain how exhibitors move from their initial enquiry to preparing for the event."
          />

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {process.map((step, index) => (
              <AboutReveal
                key={step.title}
                delay={index * 0.08}
                className="h-full"
              >
                <article
                  className="
                    group relative flex h-full min-h-[240px] flex-col
                    overflow-hidden rounded-[22px]
                    border border-[#DFE8E1] bg-[#F8FBF8] p-7
                    transition-all duration-500
                    hover:-translate-y-1
                    hover:border-[#23A455]/50
                    hover:bg-white
                    hover:shadow-[0_26px_55px_-38px_rgba(9,27,19,.45)]
                  "
                >
                  {/* connector row */}
                  <div className="flex items-center gap-3">
                    <span className="relative flex size-4 items-center justify-center">
                      <span
                        aria-hidden="true"
                        className="iiev-dot absolute size-4 rounded-full bg-[#23A455]/30"
                      />
                      <span className="relative size-2.5 rounded-full bg-[#23A455]" />
                    </span>

                    <span
                      aria-hidden="true"
                      className={`h-px flex-1 bg-gradient-to-r from-[#23A455]/60 to-transparent ${
                        index === process.length - 1
                          ? "opacity-0"
                          : ""
                      }`}
                    />
                  </div>

                  <h3 className="mt-10 text-lg font-extrabold tracking-[-0.02em] text-[#102A1E]">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-[13px] leading-7 text-[#4A5750]">
                    {step.description}
                  </p>

                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                    className="mt-auto pt-0 text-[#23A455] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </article>
              </AboutReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================
          EXHIBITOR MANUAL (DARK)
      ===================================== */}
      <section
        id="exhibitor-manual"
        className="relative isolate scroll-mt-28 overflow-hidden bg-[#091B13] py-18 text-white sm:py-24"
      >
        <svg
          viewBox="0 0 600 600"
          fill="none"
          aria-hidden="true"
          className="iiev-spin pointer-events-none absolute -right-48 -top-48 -z-10 size-[600px] opacity-30"
        >
          <circle cx="300" cy="300" r="250" stroke="#23A455" />
          <circle cx="300" cy="300" r="185" stroke="#23A455" />
          <circle
            cx="300"
            cy="300"
            r="120"
            stroke="#23A455"
            strokeDasharray="5 12"
          />
          <circle cx="300" cy="50" r="5" fill="#23A455" />
        </svg>

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <Eyebrow light>Exhibitor Manual</Eyebrow>
            </div>

            <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.6rem)] font-extrabold leading-[1.12] tracking-[-0.05em]">
              Everything needed
              <span className="text-[#23A455]">
                {" "}for show preparation.
              </span>
            </h2>

            <p className="mx-auto mt-5 text-[13px] leading-7 text-white/65 sm:text-[15px] sm:leading-8">
              The exhibitor manual provides operational
              information, technical requirements and venue
              procedures for participating companies.
            </p>
          </AboutReveal>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {manualTopics.map(({ title, description, Icon }, index) => (
              <AboutReveal
                key={title}
                delay={(index % 3) * 0.06}
                className="h-full"
              >
                <article
                  className="
                    group relative h-full min-h-[190px] overflow-hidden
                    rounded-[20px] border border-white/12
                    bg-white/[0.04] p-7 backdrop-blur-sm
                    transition-all duration-500
                    hover:-translate-y-1
                    hover:border-[#23A455]/60
                    hover:bg-white/[0.08]
                  "
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-[radial-gradient(closest-side,rgba(35,164,85,.25),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  <span className="relative flex size-12 items-center justify-center rounded-xl bg-[#23A455]/15 text-[#23A455] transition-all duration-500 group-hover:scale-105 group-hover:bg-[#23A455] group-hover:text-white">
                    <Icon
                      size={23}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </span>

                  <h3 className="relative mt-7 text-[15px] font-extrabold">
                    {title}
                  </h3>

                  <p className="relative mt-3 text-[13px] leading-7 text-white/65">
                    {description}
                  </p>
                </article>
              </AboutReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================
          DIRECTORY AND BADGES
      ===================================== */}
      <section className="bg-[#F5F9F5] py-18 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="After Confirmation"
            title="Prepare your"
            highlight="company presence."
            description="Once participation is confirmed, exhibitors receive further instructions for their company listing and event access."
          />

          <div className="mt-11 grid gap-5 md:grid-cols-2">
            {[
              {
                Icon: BookOpen,
                title: "Exhibitor Directory",
                text: "Confirmed exhibitors are invited to submit a company description, product categories, logo and website for the online exhibitor directory. Listings are checked before publication, and stall numbers are added once allocated.",
              },
              {
                Icon: BadgeCheck,
                title: "Exhibitor Badges",
                text: "Exhibitor badges are issued per stall. The allocation applicable to different stall sizes, together with the collection and access instructions, will be provided in the exhibitor manual.",
              },
            ].map(({ Icon, title, text }, index) => (
              <AboutReveal
                key={title}
                delay={index * 0.08}
                className="h-full"
              >
                <article
                  className="
                    group relative h-full overflow-hidden rounded-[24px]
                    border border-[#DFE8E1] bg-white p-7
                    transition-all duration-500
                    hover:-translate-y-1
                    hover:border-[#23A455]/50
                    hover:shadow-[0_28px_58px_-40px_rgba(9,27,19,.45)]
                    sm:p-9
                  "
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-gradient-to-b from-[#23A455] to-[#7BD69A] transition-transform duration-500 group-hover:scale-y-100"
                  />

                  <span className="flex size-14 items-center justify-center rounded-2xl bg-[#E9F6ED] text-[#16893F] transition-all duration-500 group-hover:bg-[#23A455] group-hover:text-white">
                    <Icon
                      size={27}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </span>

                  <h3 className="mt-8 text-xl font-extrabold tracking-[-0.03em] text-[#102A1E]">
                    {title}
                  </h3>

                  <p className="mt-4 text-[13px] leading-7 text-[#4A5750]">
                    {text}
                  </p>
                </article>
              </AboutReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================
          EXHIBITOR PREPARATION
      ===================================== */}
      <section className="bg-white py-18 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            center
            eyebrow="Practical Preparation"
            title="Make the most"
            highlight="of your participation."
            description="Simple preparation and consistent follow-up can help exhibitors manage their time and enquiries more effectively."
          />

          <div className="relative mt-12">
            {/* connecting line (desktop) */}
            <div
              aria-hidden="true"
              className="absolute left-[16%] right-[16%] top-[34px] hidden h-px bg-gradient-to-r from-transparent via-[#23A455]/40 to-transparent md:block"
            />

            <div className="grid gap-5 md:grid-cols-3">
              {preparation.map((step, index) => (
                <AboutReveal
                  key={step.title}
                  delay={index * 0.09}
                  className="h-full"
                >
                  <article
                    className="
                      group relative flex h-full flex-col overflow-hidden
                      rounded-[24px] border border-[#DFE8E1]
                      bg-[#F7FAF7] p-7
                      transition-all duration-500
                      hover:-translate-y-1.5
                      hover:border-[#23A455]/50
                      hover:bg-white
                      hover:shadow-[0_30px_60px_-40px_rgba(9,27,19,.45)]
                      sm:p-8
                    "
                  >
                    <div className="flex items-center gap-3">
                      <span className="relative flex size-4 items-center justify-center">
                        <span
                          aria-hidden="true"
                          className="iiev-dot absolute size-4 rounded-full bg-[#23A455]/30"
                        />
                        <span className="relative size-2.5 rounded-full bg-[#23A455]" />
                      </span>

                      <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#16893F]">
                        {step.phase} the Show
                      </span>
                    </div>

                    <h3 className="mt-10 text-xl font-extrabold tracking-[-0.03em] text-[#102A1E]">
                      {step.title}
                    </h3>

                    <p className="mt-4 text-[13px] leading-7 text-[#4A5750]">
                      {step.description}
                    </p>
                  </article>
                </AboutReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          FINAL CTA
      ===================================== */}
      <section className="relative isolate overflow-hidden bg-[#091B13] py-20 text-white sm:py-28">
        {/* background image */}
        <Image
          src="/media/2026/expo-two-wheeler-crowd.webp"
          alt=""
          fill
          sizes="100vw"
          aria-hidden="true"
          className="-z-20 object-cover opacity-[0.14]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-[#091B13] via-[#091B13]/80 to-[#091B13]"
        />

        {/* glow */}
        <div
          aria-hidden="true"
          className="iiev-glow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(35,164,85,.3),transparent)]"
        />

        {/* rotating rings */}
        <svg
          viewBox="0 0 500 500"
          fill="none"
          aria-hidden="true"
          className="iiev-spin pointer-events-none absolute -right-36 -top-48 -z-10 size-[500px] opacity-30"
        >
          <circle cx="250" cy="250" r="210" stroke="#23A455" />
          <circle cx="250" cy="250" r="145" stroke="#23A455" />
          <circle
            cx="250"
            cy="250"
            r="80"
            stroke="#23A455"
            strokeDasharray="6 12"
          />
          <circle cx="250" cy="40" r="5" fill="#23A455" />
        </svg>

        <svg
          viewBox="0 0 500 500"
          fill="none"
          aria-hidden="true"
          className="iiev-spin-rev pointer-events-none absolute -bottom-52 -left-40 -z-10 size-[500px] opacity-20"
        >
          <circle cx="250" cy="250" r="210" stroke="#23A455" />
          <circle
            cx="250"
            cy="250"
            r="145"
            stroke="#23A455"
            strokeDasharray="6 12"
          />
        </svg>

        <AboutReveal className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="flex justify-center">
            <Eyebrow light>Exhibit at IIEV 2027</Eyebrow>
          </div>

          <h2 className="mt-6 text-[clamp(2.1rem,4.7vw,4.2rem)] font-extrabold leading-[1.12] tracking-[-0.055em]">
            Ready to discuss
            <span className="text-[#23A455]">
              {" "}exhibition space?
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-8 text-white/70 sm:text-base">
            Tell the team what you would like to exhibit
            and your approximate space requirement.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <BookStallButton large />

            <Link
              href="/exhibit/exhibitor-profile/"
              className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/30 px-8 text-[14px] font-bold text-white transition-all duration-300 hover:border-[#23A455] hover:bg-white/10"
            >
              View Exhibitor Profile
              <ArrowRight
                size={17}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </AboutReveal>
      </section>
    </>
  );
}