
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  updated: string;
  sections: LegalSection[];
  children?: ReactNode;
};

const contactEmail = "namit@futurextrade.com";

export function LegalDocument({
  eyebrow,
  title,
  highlight,
  description,
  updated,
  sections,
  children,
}: LegalDocumentProps) {
  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        highlight={highlight}
        description={description}
        image="/media/2026/inauguration-ribbon.webp"
        imagePosition="center 42%"
        crumbs={[{ label: `${title} ${highlight}`.trim() }]}
      />

      <main className="bg-white">
        {/* Introduction */}
        <section className="relative overflow-hidden border-b border-[#E1E9E2] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <AboutReveal className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 bg-[#23A455]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#16893F]">
                  Website information
                </span>
              </div>

              <h2 className="mt-6 text-[clamp(2rem,4vw,3.6rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
                Clear information.
                <span className="block text-[#23A455]">
                  Transparent practices.
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-sm leading-8 text-[#4A5750] sm:text-base">
                {description} This document explains the
                relevant practices and considerations for
                visitors using the India International EV
                Show website.
              </p>

              <p className="mt-6 text-xs font-semibold text-[#627267]">
                Last updated: {updated}
              </p>
            </AboutReveal>
          </div>
        </section>

        {/* Legal document */}
        <section className="relative overflow-hidden bg-[#F8FAF7] py-16 sm:py-24">
          <svg
            aria-hidden="true"
            viewBox="0 0 500 500"
            fill="none"
            className="pointer-events-none absolute -right-44 -top-48 h-[500px] w-[500px] text-[#23A455] opacity-[0.065]"
          >
            <circle cx="250" cy="250" r="220" stroke="currentColor" />
            <circle cx="250" cy="250" r="165" stroke="currentColor" />
            <circle
              cx="250"
              cy="250"
              r="110"
              stroke="currentColor"
              strokeDasharray="3 12"
            />
            <path
              d="M250 30 A220 220 0 0 1 470 250"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>

          <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-10">
            {/* Section navigation */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <AboutReveal>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
                    On this page
                  </p>

                  <nav
                    aria-label="Document sections"
                    className="mt-6 border-t border-[#DCE7DE]"
                  >
                    {sections.map((section, index) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="group flex items-start gap-4 border-b border-[#DCE7DE] py-4 text-sm transition-colors hover:text-[#16893F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16893F]"
                      >
                        <span className="shrink-0 text-xs font-bold tabular-nums text-[#16893F]">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="font-semibold leading-6 text-[#425448] transition-colors group-hover:text-[#16893F]">
                          {section.title}
                        </span>
                      </a>
                    ))}
                  </nav>
                </AboutReveal>
              </div>
            </aside>

            {/* Full content */}
            <div className="min-w-0 lg:col-span-8">
              {sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-heading`}
                  className="scroll-mt-28 border-b border-[#DCE7DE] py-9 first:pt-0 sm:py-11"
                >
                  <AboutReveal delay={Math.min(index, 3) * 0.04}>
                    <div className="flex items-start gap-4 sm:gap-6">
                      <span className="pt-1 text-xs font-bold tabular-nums text-[#16893F]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="min-w-0 flex-1">
                        <h2
                          id={`${section.id}-heading`}
                          className="text-[clamp(1.35rem,2.3vw,1.9rem)] font-extrabold leading-[1.25] tracking-[-0.035em] text-[#102A1E]"
                        >
                          {section.title}
                        </h2>

                        <div className="mt-5 space-y-4 break-words text-sm leading-8 text-[#4A5750] sm:text-base">
                          {section.content}
                        </div>
                      </div>
                    </div>
                  </AboutReveal>
                </section>
              ))}

              {children}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="relative isolate overflow-hidden bg-[#102A1E] py-16 text-white sm:py-20">
          <svg
            aria-hidden="true"
            viewBox="0 0 500 500"
            fill="none"
            className="pointer-events-none absolute -right-40 -top-44 h-[480px] w-[480px] opacity-20"
          >
            <circle cx="250" cy="250" r="210" stroke="#79D398" />
            <circle
              cx="250"
              cy="250"
              r="150"
              stroke="#79D398"
              strokeDasharray="4 12"
            />
            <path
              d="M250 40 A210 210 0 0 1 460 250"
              stroke="#A5E7BA"
              strokeWidth="2"
            />
          </svg>

          <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <AboutReveal className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#91DDA9]">
                Questions or concerns?
              </p>

              <h2 className="mt-4 text-[clamp(1.9rem,3.8vw,3.2rem)] font-extrabold leading-[1.13] tracking-[-0.045em]">
                Contact the
                <span className="text-[#82D79C]"> IIEV Show team.</span>
              </h2>

              <p className="mt-5 text-sm leading-8 text-white/70">
                For questions about this document or
                requests relating to your information,
                contact the exhibition team.
              </p>
            </AboutReveal>

            <AboutReveal delay={0.1}>
              <a
                href={`mailto:${contactEmail}?subject=IIEV%20Show%20Website%20Enquiry`}
                className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-[#23A455] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#16893F] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <Mail size={17} aria-hidden="true" />
                Contact the team
                <ArrowUpRight
                  size={17}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>

              <p className="mt-3 text-xs text-white/60">
                {contactEmail}
              </p>
            </AboutReveal>
          </div>
        </section>

        {/* Footer navigation */}
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-7 gap-y-3 px-5 py-7 text-xs font-semibold text-[#526658] sm:px-8 lg:px-10">
          <Link href="/privacy-policy/" className="hover:text-[#16893F]">
            Privacy Policy
          </Link>
          <Link href="/cookie-policy/" className="hover:text-[#16893F]">
            Cookie Policy
          </Link>
          <Link href="/terms/" className="hover:text-[#16893F]">
            Terms of Use
          </Link>
          <Link href="/accessibility/" className="hover:text-[#16893F]">
            Accessibility
          </Link>
        </div>
      </main>
    </>
  );
}
