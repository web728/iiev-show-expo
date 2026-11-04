
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  QrCode,
  ShieldCheck,
} from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { VisitorRegistrationForm } from "@/components/forms/visitor-registration";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCurrentEdition } from "@/lib/data/edition";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Visitor Registration | IIEV Show 2027",
  description:
    "Register as a visitor for India International EV Show 2027 at Auto Cluster Exhibition Centre, Pimpri-Chinchwad, Pune.",
  path: "/visit/register/",
});

export default async function RegisterPage() {
  const edition = await getCurrentEdition();

  const automatic =
    edition.registration.approvalMode === "auto";

  return (
    <>
      <PageHero
        eyebrow="IIEV Show 2027"
        title="Visitor"
        highlight="Registration"
        description="Register to visit India International EV Show 2027 and receive your personal entry badge through the official registration process."
        image="/media/2026/expo-stall-visitors.webp"
        imagePosition="center 48%"
        crumbs={[
          {
            label: "Visit",
            href: "/visit/",
          },
          {
            label: "Visitor Registration",
          },
        ]}
      />

      <section className="relative overflow-hidden bg-[#F5F8F5] py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          {/* COMPACT SECTION HEADING */}
          <AboutReveal className="mb-9 max-w-3xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#16893F]">
              Official Visitor Registration
            </p>

            <h2 className="mt-3 text-[clamp(2rem,3.8vw,3rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
              Register for{" "}
              <span className="text-[#23A455]">
                IIEV 2027.
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#617166]">
              Complete the form below using your
              personal contact details.
              Each visitor should register individually.
            </p>
          </AboutReveal>

          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_315px] lg:gap-9">
            {/* FORM */}
            <div className="min-w-0 overflow-hidden rounded-[24px] border border-[#DAE5DC] bg-white shadow-[0_25px_70px_-48px_rgba(9,27,19,0.35)]">
              <div className="border-b border-[#E7EEE8] bg-[#FAFCFA] px-6 py-6 sm:px-9 sm:py-7">
                <div className="flex items-center gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-[#E9F7ED] text-[#16893F]">
                    <QrCode
                      size={23}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <h3 className="text-lg font-extrabold tracking-[-0.025em] text-[#102A1E]">
                      Your Registration Details
                    </h3>

                    <p className="mt-1 text-xs text-[#718175]">
                      Complete all required information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-9">
                {edition.registration.visitorOpen ? (
                  <VisitorRegistrationForm />
                ) : (
                  <div
                    role="status"
                    className="rounded-2xl border border-[#DDE8DF] bg-[#F6FAF7] p-7"
                  >
                    <Clock3
                      size={26}
                      className="text-[#16893F]"
                      aria-hidden="true"
                    />

                    <h3 className="mt-5 text-xl font-extrabold text-[#102A1E]">
                      Registration Currently Closed
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-[#526357]">
                      Visitor registration for{" "}
                      {edition.year} is not open
                      at the moment.
                    </p>

                    <Link
                      href="/contact/"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#16893F]"
                    >
                      Contact the Organiser
                      <ArrowUpRight
                        size={16}
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* MINIMAL SIDEBAR */}
            <aside className="space-y-4 lg:sticky lg:top-28">
              <AboutReveal delay={0.08}>
                <div className="overflow-hidden rounded-[22px] bg-[#102A1E] p-7 text-white">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#70DA98]">
                    Exhibition Details
                  </p>

                  <div className="mt-6 flex items-start gap-3">
                    <CalendarDays
                      size={19}
                      className="mt-1 shrink-0 text-[#70DA98]"
                      aria-hidden="true"
                    />

                    <div>
                      <p className="text-xs text-white/55">
                        Event Dates
                      </p>
                      <p className="mt-1 text-sm font-bold leading-6">
                        {edition.dateLabel}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-start gap-3">
                    <MapPin
                      size={19}
                      className="mt-1 shrink-0 text-[#70DA98]"
                      aria-hidden="true"
                    />

                    <div>
                      <p className="text-xs text-white/55">
                        Exhibition Venue
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
                  <ShieldCheck
                    size={24}
                    className="text-[#16893F]"
                    aria-hidden="true"
                  />

                  <h3 className="mt-5 text-base font-extrabold text-[#102A1E]">
                    After Registration
                  </h3>

                  <p className="mt-3 text-[13px] leading-7 text-[#5B6B60]">
                    {automatic
                      ? "After successful registration, your badge is issued through the registration system."
                      : "Registration details are reviewed before an approved badge is issued."}
                  </p>

                  <div className="mt-5 border-t border-[#E6EEE8] pt-5">
                    <Link
                      href="/visit/badge/"
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#16893F] hover:text-[#102A1E]"
                    >
                      Retrieve an Existing Badge
                      <ArrowUpRight
                        size={16}
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              </AboutReveal>

              {edition.registration.admissionNote && (
                <div className="flex items-start gap-3 rounded-xl border border-[#DDE8DF] bg-white px-5 py-4">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-[#16893F]"
                    aria-hidden="true"
                  />

                  <p className="text-[12px] leading-6 text-[#607165]">
                    {edition.registration.admissionNote}
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
