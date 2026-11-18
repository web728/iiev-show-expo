
import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowUpRight,
  Mail,
  Monitor,
  Keyboard,
  Eye,
  MessageSquareText,
} from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { pageMetadata } from "@/lib/seo/metadata";

/* =========================================================
   IIEV SHOW — ACCESSIBILITY STATEMENT
========================================================= */

export const metadata: Metadata = pageMetadata({
  title: "Accessibility Statement",
  description:
    "Read theIndia International EV Show website accessibility statement, including our accessibility approach, known limitations, and how to report an accessibility issue.",
  path: "/accessibility/",
});

/* =========================================================
   ACCESSIBILITY PRIORITIES
========================================================= */

const priorities = [
  {
    title: "Clear content",
    description:
      "We aim to use readable text, meaningful headings and straightforward navigation.",
    Icon: Eye,
  },
  {
    title: "Keyboard access",
    description:
      "We aim to make navigation, links, forms and other interactive features usable with a keyboard.",
    Icon: Keyboard,
  },
  {
    title: "Responsive experience",
    description:
      "We aim to keep website content accessible across different devices, screen sizes and zoom levels.",
    Icon: Monitor,
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function AccessibilityPage() {
  return (
    <>
      {/* ================================================
          SHARED PAGE HERO
      ================================================ */}

      <PageHero
        eyebrow="Website Information"
        title="Our"
        highlight="Accessibility"
        description="Our approach to making the India International EV Show website easier to access and use."
        image="/media/2026/inauguration-ribbon.webp"
        imagePosition="center 42%"
        crumbs={[{ label: "Accessibility" }]}
      />

      <main id="accessibility-content">

        {/* ================================================
            01 — INTRODUCTION
        ================================================ */}

        <section
          aria-labelledby="accessibility-intro"
          className="bg-white py-18 sm:py-24 lg:py-28"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-10">

            {/* Section label */}
            <AboutReveal className="lg:col-span-4">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-[2px] w-8 bg-[#23A455]"
                />

                <span className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-[#16893F]">
                  Our approach
                </span>
              </div>

              <h2
                id="accessibility-intro"
                className="mt-6 text-[clamp(2rem,3.7vw,3.5rem)] font-extrabold leading-[1.13] tracking-[-0.05em] text-[#102A1E]"
              >
                Accessibility
                <span className="block text-[#23A455]">
                  matters.
                </span>
              </h2>
            </AboutReveal>

            {/* Main statement */}
            <AboutReveal
              delay={0.1}
              className="lg:col-span-8"
            >
              <div className="max-w-3xl space-y-5 text-[14px] leading-8 text-[#4A5750] sm:text-base">
                <p>
                  India International EV Show (IIEV Show)
                  aims to make its website usable by as many
                  people as possible, including visitors
                  who use assistive technologies or have
                  accessibility requirements.
                </p>

                <p>
                  We recognise that people access websites
                  in different ways. Our approach is to
                  provide clear information, straightforward
                  navigation and accessible ways to learn
                  about the exhibition.
                </p>

                <p>
                  Accessibility is an ongoing consideration.
                  We welcome feedback about barriers that
                  visitors may encounter while using
                  this website.
                </p>
              </div>
            </AboutReveal>
          </div>
        </section>

        {/* ================================================
            02 — ACCESSIBILITY PRIORITIES
        ================================================ */}

        <section
          aria-labelledby="accessibility-priorities"
          className="relative overflow-hidden bg-[#F5F9F5] py-18 sm:py-24"
        >
          {/* Decorative SVG background */}
          <svg
            viewBox="0 0 480 480"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-36 h-[480px] w-[480px] text-[#23A455] opacity-[0.07]"
          >
            <circle
              cx="240"
              cy="240"
              r="205"
              stroke="currentColor"
            />

            <circle
              cx="240"
              cy="240"
              r="150"
              stroke="currentColor"
            />

            <circle
              cx="240"
              cy="240"
              r="95"
              stroke="currentColor"
              strokeDasharray="4 12"
            />

            <path
              d="M95 95 L385 385"
              stroke="currentColor"
            />
          </svg>

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

            <AboutReveal className="max-w-3xl">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-[#16893F]">
                Website usability
              </p>

              <h2
                id="accessibility-priorities"
                className="mt-5 text-[clamp(2rem,4.2vw,3.7rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]"
              >
                Making information
                <span className="text-[#23A455]">
                  {" "}easier to access.
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-8 text-[#4A5750] sm:text-base">
                These are the key accessibility
                considerations that guide our website
                experience.
              </p>
            </AboutReveal>

            <div className="mt-12 grid gap-0 border-y border-[#DCE7DE] md:grid-cols-3">
              {priorities.map((item, index) => (
                <AboutReveal
                  key={item.title}
                  delay={index * 0.08}
                  className={`h-full ${
                    index > 0
                      ? "border-t border-[#DCE7DE] md:border-l md:border-t-0"
                      : ""
                  }`}
                >
                  <div className="h-full py-8 md:px-7 md:py-10 lg:px-9">
                    <item.Icon
                      size={26}
                      strokeWidth={1.5}
                      className="text-[#16893F]"
                      aria-hidden="true"
                    />

                    <h3 className="mt-6 text-lg font-extrabold tracking-[-0.025em] text-[#102A1E]">
                      {item.title}
                    </h3>

                    <p className="mt-3 max-w-sm text-sm leading-7 text-[#58685D]">
                      {item.description}
                    </p>
                  </div>
                </AboutReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================
            03 — STANDARDS AND LIMITATIONS
        ================================================ */}

        <section
          aria-labelledby="accessibility-standards"
          className="bg-white py-18 sm:py-24 lg:py-28"
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-20 lg:px-10">

            {/* Left */}
            <AboutReveal className="lg:col-span-5">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-[2px] w-8 bg-[#23A455]"
                />

                <span className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-[#16893F]">
                  Accessibility standards
                </span>
              </div>

              <h2
                id="accessibility-standards"
                className="mt-6 text-[clamp(2rem,3.9vw,3.5rem)] font-extrabold leading-[1.13] tracking-[-0.05em] text-[#102A1E]"
              >
                An ongoing
                <span className="block text-[#23A455]">
                  responsibility.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-8 text-[#4A5750] sm:text-base">
                The Web Content Accessibility Guidelines
                (WCAG) provide an internationally recognised
                framework for accessible web content.
              </p>

              <a
                href="https://www.w3.org/TR/WCAG22/"
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#16893F] underline decoration-[#16893F]/30 underline-offset-[6px] transition-colors hover:text-[#102A1E]"
              >
                Learn about WCAG 2.2

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

            {/* Right */}
            <div className="min-w-0 lg:col-span-7">

              <AboutReveal>
                <div className="border-t border-[#DCE7DE] py-7">
                  <h3 className="text-lg font-extrabold text-[#102A1E]">
                    Our accessibility approach
                  </h3>

                  <p className="mt-3 text-sm leading-8 text-[#4A5750] sm:text-base">
                    We use WCAG principles as a reference
                    for improving the website. This
                    statement does not represent a formal
                    certification or a claim that every
                    page currently meets a particular
                    WCAG conformance level.
                  </p>
                </div>
              </AboutReveal>

              <AboutReveal delay={0.08}>
                <div className="border-t border-[#DCE7DE] py-7">
                  <h3 className="text-lg font-extrabold text-[#102A1E]">
                    Known limitations
                  </h3>

                  <p className="mt-3 text-sm leading-8 text-[#4A5750] sm:text-base">
                    Some areas of the website may present
                    accessibility challenges, particularly
                    embedded media, third-party content,
                    downloadable documents or interactive
                    features. We encourage visitors to
                    report any difficulties they encounter.
                  </p>
                </div>
              </AboutReveal>

              <AboutReveal delay={0.16}>
                <div className="border-y border-[#DCE7DE] py-7">
                  <h3 className="text-lg font-extrabold text-[#102A1E]">
                    Alternative access to information
                  </h3>

                  <p className="mt-3 text-sm leading-8 text-[#4A5750] sm:text-base">
                    If you cannot access important event
                    information or complete a website
                    form, please contact the IIEV Show
                    team. We will review your request
                    and try to provide the information
                    through a suitable alternative.
                  </p>
                </div>
              </AboutReveal>
            </div>
          </div>
        </section>

        {/* ================================================
            04 — FEEDBACK & CONTACT
        ================================================ */}

        <section
          aria-labelledby="accessibility-feedback"
          className="relative isolate overflow-hidden bg-[#102A1E] py-18 text-white sm:py-24"
        >
          {/* Background architectural SVG */}
          <svg
            viewBox="0 0 600 600"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] opacity-25"
          >
            <circle
              cx="300"
              cy="300"
              r="250"
              stroke="#69C98B"
            />

            <circle
              cx="300"
              cy="300"
              r="195"
              stroke="#69C98B"
              strokeDasharray="3 12"
            />

            <path
              d="M300 50 A250 250 0 0 1 550 300"
              stroke="#88DFA5"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <circle
              cx="300"
              cy="50"
              r="5"
              fill="#88DFA5"
            />
          </svg>

          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-16 lg:px-10">

            {/* Content */}
            <AboutReveal className="lg:col-span-7">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 bg-[#23A455]" />

                <span className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-[#8FD6A3]">
                  Accessibility feedback
                </span>
              </div>

              <h2
                id="accessibility-feedback"
                className="mt-6 text-[clamp(2.1rem,4.3vw,3.8rem)] font-extrabold leading-[1.13] tracking-[-0.055em]"
              >
                Having difficulty
                <span className="block text-[#83D49A]">
                  using our website?
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-8 text-white/75 sm:text-base">
                Please tell us which page or feature
                caused a problem and describe what
                happened. If you use a particular browser
                or assistive technology, sharing those
                details can help us investigate.
              </p>

              <p className="mt-4 max-w-xl text-sm leading-8 text-white/65">
                You can also contact us if you need
                event information in another accessible
                format.
              </p>
            </AboutReveal>

            {/* Contact action */}
            <AboutReveal
              delay={0.12}
              className="lg:col-span-5"
            >
              <div className="border-t border-white/25 pt-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">

                <MessageSquareText
                  size={29}
                  strokeWidth={1.5}
                  className="text-[#83D49A]"
                  aria-hidden="true"
                />

                <h3 className="mt-5 text-xl font-bold text-white">
                  Contact the IIEV Show team
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/65">
                  For website accessibility questions,
                  feedback or assistance with information.
                </p>

                <a
                  href="mailto:namit@futurextrade.com?subject=IIEV%20Show%20Website%20Accessibility%20Feedback"
                  className="group mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#23A455] px-6 py-3 text-sm font-bold text-white transition-colors duration-300 hover:bg-[#16893F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <Mail
                    size={17}
                    aria-hidden="true"
                  />

                  Email accessibility feedback

                  <ArrowUpRight
                    size={17}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>

                <p className="mt-4 break-all text-xs text-white/65">
                  namit@futurextrade.com
                </p>
              </div>
            </AboutReveal>
          </div>
        </section>

        {/* ================================================
            05 — CLOSING NOTE
        ================================================ */}

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <AboutReveal>
              <div className="flex flex-col gap-5 border-t border-[#DFE8E1] pt-7 sm:flex-row sm:items-center sm:justify-between">

                <p className="max-w-2xl text-sm leading-7 text-[#58685D]">
                  This statement applies to the India
                  International EV Show website at
                  {" "}
                  <a
                    href="https://iievshow.com/"
                    className="font-semibold text-[#16893F] underline underline-offset-4"
                  >
                    iievshow.com
                  </a>
                  . It may be updated as the website
                  and its accessibility practices evolve.
                </p>

                <Link
                  href="/"
                  className="group inline-flex min-h-11 w-fit shrink-0 items-center gap-2 text-sm font-bold text-[#16893F] transition-colors hover:text-[#102A1E]"
                >
                  Back to homepage

                  <ArrowUpRight
                    size={17}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>
            </AboutReveal>
          </div>
        </section>

      </main>
    </>
  );
}
