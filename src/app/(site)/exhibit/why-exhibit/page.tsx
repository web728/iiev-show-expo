
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  ClipboardList,
  Factory,
  FileText,
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

const benefits: {
  number: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    number: "01",
    title: "Showcase your products",
    description:
      "Present electric vehicles, components, charging solutions, battery technologies and manufacturing equipment to an industry-focused audience.",
    Icon: Presentation,
  },
  {
    number: "02",
    title: "Meet potential buyers",
    description:
      "Engage with dealers, distributors, fleet operators, engineering teams and other professionals evaluating EV solutions.",
    Icon: UsersRound,
  },
  {
    number: "03",
    title: "Explore partnerships",
    description:
      "Connect with manufacturers, technology providers, system integrators and prospective business partners.",
    Icon: Handshake,
  },
  {
    number: "04",
    title: "Discuss technical needs",
    description:
      "Demonstrate capabilities, answer product questions and understand the requirements of different applications.",
    Icon: Factory,
  },
  {
    number: "05",
    title: "Understand the market",
    description:
      "Observe technology developments, compare available solutions and gather direct feedback from industry professionals.",
    Icon: PackageSearch,
  },
];

const process = [
  {
    number: "01",
    title: "Send an enquiry",
    description:
      "Share your products, industry segment and approximate exhibition space requirement.",
  },
  {
    number: "02",
    title: "Review available options",
    description:
      "The exhibitor sales team shares available locations and applicable participation terms.",
  },
  {
    number: "03",
    title: "Confirm your booking",
    description:
      "Complete the participation contract and follow the payment schedule stated in the agreement.",
  },
  {
    number: "04",
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
    number: "01",
    phase: "Before",
    title: "Plan your participation",
    description:
      "Define your objectives, prepare product specifications and invite relevant customers or prospects.",
  },
  {
    number: "02",
    phase: "During",
    title: "Engage and demonstrate",
    description:
      "Have technical and commercial representatives available, demonstrate products and record enquiries.",
  },
  {
    number: "03",
    phase: "After",
    title: "Follow up",
    description:
      "Contact relevant prospects, share requested information and evaluate the outcomes of participation.",
  },
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
        center
          ? "mx-auto max-w-3xl text-center"
          : "max-w-3xl"
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
        <p className="mt-5 text-[13px] leading-7 text-[#4A5750] sm:text-[15px] sm:leading-8">
          {description}
        </p>
      )}
    </AboutReveal>
  );
}

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

      {/* INTRODUCTION */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            center
            eyebrow="Business Opportunities"
            title="Take your products"
            highlight="to the industry."
            description="India International EV Show brings vehicle manufacturers, component suppliers, technology developers and other electric mobility businesses into a focused exhibition environment. Exhibiting provides opportunities for product discovery, technical discussions and professional networking."
          />
        </div>
      </section>

      {/* EXHIBITION BENEFITS */}
      <section className="bg-[#F5F9F5] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Why Participate"
            title="Business conversations"
            highlight="that matter."
            description="An opportunity to meet relevant industry participants and discuss products directly with potential customers and partners."
          />

          <div className="mt-11 grid gap-4 md:grid-cols-6">
            {benefits.map((item, index) => {
              const Icon = item.Icon;

              return (
                <AboutReveal
                  key={item.number}
                  delay={(index % 3) * 0.06}
                  className={`h-full ${
                    index < 2
                      ? "md:col-span-3"
                      : "md:col-span-2"
                  }`}
                >
                  <article className="group relative flex h-full min-h-[245px] flex-col justify-between overflow-hidden rounded-[22px] border border-[#DDE8DF] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#23A455]/50 hover:shadow-[0_20px_48px_-34px_rgba(9,27,19,0.35)] sm:p-8">
                    <svg
                      viewBox="0 0 160 160"
                      fill="none"
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-8 -top-8 size-40 text-[#23A455] opacity-[0.07]"
                    >
                      <circle cx="80" cy="80" r="66" stroke="currentColor" />
                      <circle cx="80" cy="80" r="40" stroke="currentColor" />
                      <path d="M80 14V40M120 80H146" stroke="currentColor" />
                    </svg>

                    <div className="relative flex items-start justify-between">
                      <span className="flex size-12 items-center justify-center rounded-xl bg-[#E9F6ED] text-[#16893F] transition-colors duration-300 group-hover:bg-[#23A455] group-hover:text-white">
                        <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
                      </span>

                    
                    </div>

                    <div className="relative mt-9">
                      <h3 className="text-xl font-extrabold tracking-tight text-[#102A1E]">
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

      {/* WHY PUNE */}
      <section className="relative isolate overflow-hidden bg-[#102A1E] py-16 text-white sm:py-24">
        <svg
          aria-hidden="true"
          viewBox="0 0 520 520"
          fill="none"
          className="pointer-events-none absolute -right-40 -top-44 size-[520px] opacity-20"
        >
          <circle cx="260" cy="260" r="215" stroke="#23A455" />
          <circle cx="260" cy="260" r="150" stroke="#23A455" />
          <circle
            cx="260"
            cy="260"
            r="90"
            stroke="#23A455"
            strokeDasharray="5 12"
          />
        </svg>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10">
          <AboutReveal>
            <Eyebrow light>Why Pune</Eyebrow>

            <h2 className="mt-5 text-[clamp(2rem,4.1vw,3.5rem)] font-extrabold leading-[1.12] tracking-[-0.05em]">
              Close to an established
              <span className="block text-[#23A455]">
                automotive ecosystem.
              </span>
            </h2>

            <p className="mt-6 text-sm leading-8 text-white/75 sm:text-base">
              Pune and Pimpri-Chinchwad are recognised
              centres for automotive manufacturing,
              engineering and component supply.
              The region offers a practical meeting
              point for companies working across
              the electric mobility value chain.
            </p>

            <div className="mt-8 space-y-4 border-t border-white/15 pt-6">
              <div className="flex items-start gap-3">
                <CalendarDays
                  size={19}
                  className="mt-0.5 shrink-0 text-[#23A455]"
                  aria-hidden="true"
                />

                <span className="text-sm font-semibold">
                  {edition.dateLabel}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  size={19}
                  className="mt-0.5 shrink-0 text-[#23A455]"
                  aria-hidden="true"
                />

                <span className="text-sm leading-7 text-white/85">
                  {venue}
                </span>
              </div>
            </div>
          </AboutReveal>

          <AboutReveal delay={0.1}>
            <div className="relative aspect-[5/4] overflow-hidden rounded-[24px] bg-[#091B13]">
              <Image
                src="/media/2026/expo-river-stall.webp"
                alt="Exhibition stand at IIEV Show 2026"
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.035]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#091B13]/65 via-transparent to-transparent" />

              <p className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-[#091B13]/70 px-4 py-2 text-xs font-semibold backdrop-blur-sm">
                IIEV Show 2026
              </p>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* PARTICIPATION PROCESS */}
      <section
        id="participation-process"
        className="scroll-mt-28 bg-white py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Participation Process"
            title="From enquiry"
            highlight="to exhibition."
            description="The steps below explain how exhibitors move from their initial enquiry to preparing for the event."
          />

          <div className="mt-11 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {process.map((step, index) => (
              <AboutReveal
                key={step.number}
                delay={index * 0.06}
                className="h-full"
              >
                <article className="group flex h-full min-h-[235px] flex-col rounded-[20px] border border-[#DFE8E1] bg-[#F8FBF8] p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#23A455]/45">
                 

                  <h3 className="mt-9 text-lg font-extrabold text-[#102A1E]">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-[13px] leading-7 text-[#4A5750]">
                    {step.description}
                  </p>
                </article>
              </AboutReveal>
            ))}
          </div>
        </div>
      </section>

     

      {/* EXHIBITOR MANUAL */}
      <section
        id="exhibitor-manual"
        className="scroll-mt-28 bg-white py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            center
            eyebrow="Exhibitor Manual"
            title="Everything needed"
            highlight="for show preparation."
            description="The exhibitor manual provides operational information, technical requirements and venue procedures for participating companies."
          />

          <div className="mt-11 grid gap-px overflow-hidden rounded-[22px] border border-[#DFE8E1] bg-[#DFE8E1] sm:grid-cols-2 lg:grid-cols-3">
            {manualTopics.map(({ title, description, Icon }, index) => (
              <AboutReveal
                key={title}
                delay={(index % 3) * 0.05}
                className="h-full"
              >
                <article className="group h-full min-h-[185px] bg-white p-7 transition-colors duration-300 hover:bg-[#F0F8F2]">
                  <Icon
                    size={24}
                    strokeWidth={1.8}
                    className="text-[#16893F]"
                    aria-hidden="true"
                  />

                  <h3 className="mt-7 text-[15px] font-extrabold text-[#102A1E]">
                    {title}
                  </h3>

                  <p className="mt-3 text-[13px] leading-7 text-[#4A5750]">
                    {description}
                  </p>
                </article>
              </AboutReveal>
            ))}
          </div>

          <AboutReveal className="mt-7">
            <div className="flex items-start gap-4 rounded-2xl border border-[#DDE8DF] bg-[#F5F9F5] p-6">
              <FileText
                size={22}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0 text-[#16893F]"
                aria-hidden="true"
              />

              <div>
                <h3 className="text-sm font-extrabold text-[#102A1E]">
                  2027 Exhibitor Manual
                </h3>

                <p className="mt-2 text-[13px] leading-7 text-[#4A5750]">
                  The manual will be shared with confirmed
                  exhibitors and published in the Downloads
                  section when available. Detailed deadlines,
                  technical specifications and rules should
                  be checked against that document.
                </p>
              </div>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* DIRECTORY AND BADGES */}
      <section className="bg-[#F5F9F5] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="After Confirmation"
            title="Prepare your"
            highlight="company presence."
            description="Once participation is confirmed, exhibitors receive further instructions for their company listing and event access."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <AboutReveal className="h-full">
              <article className="h-full rounded-[22px] border border-[#DFE8E1] bg-white p-7 sm:p-9">
                <BookOpen
                  size={26}
                  strokeWidth={1.8}
                  className="text-[#16893F]"
                  aria-hidden="true"
                />

                <h3 className="mt-7 text-xl font-extrabold text-[#102A1E]">
                  Exhibitor Directory
                </h3>

                <p className="mt-4 text-[13px] leading-7 text-[#4A5750]">
                  Confirmed exhibitors are invited to submit
                  a company description, product categories,
                  logo and website for the online exhibitor
                  directory. Listings are checked before
                  publication, and stall numbers are added
                  once allocated.
                </p>
              </article>
            </AboutReveal>

            <AboutReveal delay={0.08} className="h-full">
              <article className="h-full rounded-[22px] border border-[#DFE8E1] bg-white p-7 sm:p-9">
                <BadgeCheck
                  size={26}
                  strokeWidth={1.8}
                  className="text-[#16893F]"
                  aria-hidden="true"
                />

                <h3 className="mt-7 text-xl font-extrabold text-[#102A1E]">
                  Exhibitor Badges
                </h3>

                <p className="mt-4 text-[13px] leading-7 text-[#4A5750]">
                  Exhibitor badges are issued per stall.
                  The allocation applicable to different
                  stall sizes, together with the collection
                  and access instructions, will be provided
                  in the exhibitor manual.
                </p>
              </article>
            </AboutReveal>
          </div>
        </div>
      </section>

      {/* EXHIBITOR PREPARATION */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            center
            eyebrow="Practical Preparation"
            title="Make the most"
            highlight="of your participation."
            description="Simple preparation and consistent follow-up can help exhibitors manage their time and enquiries more effectively."
          />

          <div className="mt-11 grid gap-5 md:grid-cols-3">
            {preparation.map((step, index) => (
              <AboutReveal
                key={step.number}
                delay={index * 0.07}
                className="h-full"
              >
                <article className="flex h-full flex-col rounded-[22px] border border-[#DFE8E1] bg-[#F7FAF7] p-7 sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#16893F]">
                      {step.phase} the Show
                    </span>

                  
                  </div>

                  <h3 className="mt-9 text-xl font-extrabold text-[#102A1E]">
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
      </section>

     

      {/* FINAL CTA */}
      <section className="relative isolate overflow-hidden bg-[#091B13] py-16 text-white sm:py-22">
        <svg
          viewBox="0 0 500 500"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute -right-36 -top-48 size-[500px] opacity-20"
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
        </svg>

        <AboutReveal className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="flex justify-center">
            <Eyebrow light>Exhibit at IIEV 2027</Eyebrow>
          </div>

          <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.9rem)] font-extrabold leading-[1.12] tracking-[-0.05em]">
            Ready to discuss
            <span className="text-[#23A455]">
              {" "}exhibition space?
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-white/70">
            Tell the team what you would like to exhibit
            and your approximate space requirement.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/exhibit/book-a-stall/"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#23A455] px-7 text-[13px] font-extrabold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#16893F]"
            >
              Book Your Stall
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>

            <Link
              href="/exhibit/exhibitor-profile/"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-7 text-[13px] font-bold text-white transition-colors duration-300 hover:bg-white/10"
            >
              View Exhibitor Profile
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </AboutReveal>
      </section>
    </>
  );
}
