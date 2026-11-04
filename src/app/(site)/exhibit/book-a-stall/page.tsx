
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  MapPin,
  MessageSquareText,
} from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { SmartForm } from "@/components/forms/smart-form";
import { stallFields } from "@/components/forms/configs";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCurrentEdition } from "@/lib/data/edition";

// Use the exact API endpoint from your existing
// working exhibitor registration page.
const STALL_FORM_ENDPOINT = "/api/forms/stall/";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Exhibitor Enquiry | Book a Stall at IIEV Show 2027",
  description:
    "Submit your exhibitor enquiry for India International EV Show 2027. Share your company information, products or services and preferred booth size.",
  path: "/exhibit/book-a-stall/",
});

export default async function BookAStallPage() {
  const edition = await getCurrentEdition();

  return (
    <>
      <PageHero
        eyebrow="Exhibit at IIEV 2027"
        title="Exhibitor"
        highlight="Enquiry"
        description="Interested in exhibiting? Share your company information, products and preferred booth size with the IIEV Show team."
        image="/media/2026/expo-stall-visitors.webp"
        imagePosition="center 47%"
        crumbs={[
          {
            label: "Exhibit",
            href: "/exhibit/",
          },
          {
            label: "Exhibitor Enquiry",
          },
        ]}
      />

      <section className="bg-[#F5F8F5] py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mb-9 max-w-3xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
              Exhibition Participation
            </p>

            <h2 className="mt-3 text-[clamp(2rem,3.8vw,3rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
              Enquire about{" "}
              <span className="text-[#23A455]">
                exhibition space.
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#617166]">
              Complete the form below to share your
              company details, products or services,
              and preferred booth size.
            </p>
          </AboutReveal>

          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_315px] lg:gap-9">
            {/* EXHIBITOR FORM */}
            <div className="min-w-0 overflow-hidden rounded-[24px] border border-[#DAE5DC] bg-white shadow-[0_25px_70px_-48px_rgba(9,27,19,0.35)]">
              <div className="border-b border-[#E7EEE8] bg-[#FAFCFA] px-6 py-6 sm:px-9 sm:py-7">
                <div className="flex items-center gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-[#E9F7ED] text-[#16893F]">
                    <Building2
                      size={23}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <h3 className="text-lg font-extrabold tracking-[-0.025em] text-[#102A1E]">
                      Exhibitor Enquiry Form
                    </h3>

                    <p className="mt-1 text-xs text-[#718175]">
                      Provide your company and exhibition requirements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-9">
                <SmartForm
                  endpoint={STALL_FORM_ENDPOINT}
                  formName="stall_enquiry"
                  fields={stallFields}
                  submitLabel="Submit Exhibitor Enquiry"
                  consentPurpose="respond to my exhibition enquiry"
                  minimal
                />
              </div>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-4 lg:sticky lg:top-28">
              <AboutReveal delay={0.08}>
                <div className="rounded-[22px] bg-[#102A1E] p-7 text-white">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#70DA98]">
                    IIEV 2027
                  </p>

                  <h3 className="mt-3 text-xl font-extrabold tracking-tight">
                    Exhibition Details
                  </h3>

                  <div className="mt-7 flex gap-3">
                    <CalendarDays
                      size={19}
                      className="mt-1 shrink-0 text-[#70DA98]"
                      aria-hidden="true"
                    />

                    <div>
                      <p className="text-xs text-white/55">
                        Dates
                      </p>

                      <p className="mt-1 text-sm font-bold leading-6">
                        {edition.dateLabel}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <MapPin
                      size={19}
                      className="mt-1 shrink-0 text-[#70DA98]"
                      aria-hidden="true"
                    />

                    <div>
                      <p className="text-xs text-white/55">
                        Venue
                      </p>

                      <p className="mt-1 text-sm font-bold leading-6">
                        {edition.venue.name}
                      </p>

                      <p className="mt-1 text-xs leading-6 text-white/60">
                        {edition.venue.locality},{" "}
                        {edition.venue.city}
                      </p>
                    </div>
                  </div>
                </div>
              </AboutReveal>

              <AboutReveal delay={0.12}>
                <div className="rounded-[22px] border border-[#DDE8DF] bg-white p-7">
                  <MessageSquareText
                    size={24}
                    className="text-[#16893F]"
                    aria-hidden="true"
                  />

                  <h3 className="mt-5 text-base font-extrabold text-[#102A1E]">
                    About Your Enquiry
                  </h3>

                  <p className="mt-3 text-[13px] leading-7 text-[#5B6B60]">
                    Share your products or services
                    and select a booth-size preference
                    if you have one.
                  </p>

                  <p className="mt-3 text-[12px] leading-6 text-[#718175]">
                    A preferred size is an enquiry
                    preference, not a confirmed allocation.
                  </p>

                  <div className="mt-5 border-t border-[#E6EEE8] pt-5">
                    <Link
                      href="/exhibit/why-exhibit/#participation-process"
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#16893F] hover:text-[#102A1E]"
                    >
                      Exhibition Participation Information
                      <ArrowUpRight
                        size={16}
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              </AboutReveal>

              <AboutReveal delay={0.16}>
                <div className="flex items-start gap-3 rounded-xl border border-[#DDE8DF] bg-white px-5 py-4">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-[#16893F]"
                    aria-hidden="true"
                  />

                  <p className="text-[12px] leading-6 text-[#607165]">
                    Booth sizes and final participation
                    arrangements are subject to
                    confirmation by the organiser.
                  </p>
                </div>
              </AboutReveal>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
