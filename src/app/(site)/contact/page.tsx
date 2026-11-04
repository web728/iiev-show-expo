
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  BadgeHelp,
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { SmartForm } from "@/components/forms/smart-form";
import { contactFields } from "@/components/forms/configs";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicSettings } from "@/lib/data/edition";
import { organiser } from "@/config/site";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Contact Us | India International EV Show 2027",
  description:
    "Contact the India International EV Show team for exhibition space, visitor registration, sponsorship, media enquiries and general information about IIEV Show 2027 in Pune.",
  path: "/contact/",
});

function SectionLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="h-[2px] w-7 bg-[#23A455]"
      />

      <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#16893F] sm:text-[11px]">
        {children}
      </span>
    </div>
  );
}

export default async function ContactPage() {
  const settings = await getPublicSettings();

  const contacts = settings.contacts ?? [];

  return (
    <>
      {/* =========================================
          REUSABLE INNER PAGE HERO
      ========================================= */}
      <PageHero
        eyebrow="Get in Touch"
        title="Contact"
        highlight="Our Team"
        description="Get in touch with the India International EV Show team for exhibition, visitor and event-related enquiries."
        image="/media/2026/b2b-meeting-room.webp"
        imagePosition="center 48%"
        crumbs={[{ label: "Contact Us" }]}
      />

      {/* =========================================
          INTRODUCTION
      ========================================= */}
      <section className="bg-white pb-10 pt-16 sm:pb-12 sm:pt-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <SectionLabel>Contact IIEV Show</SectionLabel>
            </div>

            <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.8rem)] font-extrabold leading-[1.12] tracking-[-0.055em] text-[#102A1E]">
              We&apos;re here to{" "}
              <span className="text-[#23A455]">
                help you connect.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-[14px] leading-8 text-[#526357] sm:text-base">
              Have a question about participating in
              India International EV Show? Send your
              enquiry through the form below or contact
              the relevant team member using the
              published contact details.
            </p>
          </AboutReveal>
        </div>
      </section>

      {/* =========================================
          CONTACT FORM + CONTACT INFORMATION
      ========================================= */}
      <section className="bg-[#F5F9F5] py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-start gap-7 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-9 lg:px-10">
          {/* LEFT: FORM */}
          <AboutReveal className="min-w-0">
            <div className="overflow-hidden rounded-[24px] border border-[#DCE7DE] bg-white shadow-[0_22px_65px_-48px_rgba(9,27,19,0.32)]">
              {/* FORM HEADER */}
              <div className="border-b border-[#E6EEE8] bg-[#FAFCFA] px-6 py-7 sm:px-9 sm:py-9">
                <div className="flex items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#E5F4EA] text-[#16893F]">
                    <MessageSquareText
                      size={23}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#16893F]">
                      Enquiry Form
                    </p>

                    <h2 className="mt-2 text-[clamp(1.4rem,2.7vw,2rem)] font-extrabold leading-tight tracking-[-0.04em] text-[#102A1E]">
                      Send us a message
                    </h2>

                    <p className="mt-3 max-w-xl text-[13px] leading-7 text-[#526357]">
                      Share your enquiry and relevant
                      details so the event team can
                      respond appropriately.
                    </p>
                  </div>
                </div>
              </div>

              {/* EXISTING WORKING FORM */}
              <div className="p-6 sm:p-9">
            
<SmartForm
  endpoint="/api/forms/contact/"
  formName="contact"
  fields={contactFields}
  submitLabel="Send Message"
  consentPurpose="respond to my message"
  submitEvent="contact_submitted"
/>

              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 px-1">
              <ShieldCheck
                size={18}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0 text-[#16893F]"
                aria-hidden="true"
              />

              <p className="text-[12px] leading-6 text-[#6B7C70]">
                Please share only information relevant
                to your enquiry. Your message will be
                handled according to the applicable
                website privacy policy.
              </p>
            </div>
          </AboutReveal>

          {/* RIGHT: CONTACT DETAILS */}
          <div className="space-y-5 lg:sticky lg:top-28">
            {/* ORGANISER DETAILS */}
            <AboutReveal delay={0.08}>
              <div className="overflow-hidden rounded-[22px] border border-[#DCE7DE] bg-white">
                <div className="relative overflow-hidden bg-[#102A1E] px-6 py-7 text-white sm:px-7">
                  {/* Decorative brand SVG */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 180 180"
                    fill="none"
                    className="pointer-events-none absolute -right-9 -top-12 size-44 text-[#23A455] opacity-25"
                  >
                    <circle
                      cx="90"
                      cy="90"
                      r="73"
                      stroke="currentColor"
                    />
                    <circle
                      cx="90"
                      cy="90"
                      r="49"
                      stroke="currentColor"
                    />
                    <circle
                      cx="90"
                      cy="90"
                      r="25"
                      stroke="currentColor"
                      strokeDasharray="4 7"
                    />
                  </svg>

                  <div className="relative">
                    <span className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-[#70DA98]">
                      <Building2
                        size={22}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </span>

                    <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#70DA98]">
                      Event Organiser
                    </p>

                    <h2 className="mt-2 text-lg font-extrabold leading-snug tracking-[-0.025em]">
                      {organiser.legalName}
                    </h2>
                  </div>
                </div>

                <div className="space-y-6 p-6 sm:p-7">
                  {/* OFFICE ADDRESS */}
                  {settings.address && (
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF6EE] text-[#16893F]">
                        <MapPin
                          size={18}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </span>

                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#16893F]">
                          Office Address
                        </p>

                        <address className="mt-2 whitespace-pre-line text-[13px] not-italic leading-7 text-[#405548]">
                          {settings.address}
                        </address>
                      </div>
                    </div>
                  )}

                  {/* PUBLISHED CONTACTS */}
                  {contacts.length > 0 ? (
                    <div
                      className={
                        settings.address
                          ? "border-t border-[#E6EEE8] pt-6"
                          : ""
                      }
                    >
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#16893F]">
                        Contact Details
                      </p>

                      <ul className="mt-5 space-y-6">
                        {contacts.map((contact, index) => (
                          <li
                            key={`${contact.name}-${index}`}
                            className={
                              index > 0
                                ? "border-t border-[#EAEFEA] pt-5"
                                : ""
                            }
                          >
                            <p className="text-[13px] font-extrabold text-[#102A1E]">
                              {contact.name}
                            </p>

                            {contact.role && (
                              <p className="mt-1 text-[11px] font-medium text-[#748377]">
                                {contact.role}
                              </p>
                            )}

                            <div className="mt-3 space-y-2.5">
                              {contact.phone && (
                                <a
                                  href={`tel:${contact.phone.replace(
                                    /[^\d+]/g,
                                    ""
                                  )}`}
                                  className="group flex items-center gap-3 break-all text-[12px] font-semibold text-[#365241] transition-colors hover:text-[#16893F]"
                                >
                                  <Phone
                                    size={16}
                                    strokeWidth={1.8}
                                    className="shrink-0 text-[#16893F]"
                                    aria-hidden="true"
                                  />

                                  <span>
                                    {contact.phone}
                                  </span>
                                </a>
                              )}

                              {contact.email && (
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="group flex items-start gap-3 break-all text-[12px] font-semibold leading-6 text-[#365241] transition-colors hover:text-[#16893F]"
                                >
                                  <Mail
                                    size={16}
                                    strokeWidth={1.8}
                                    className="mt-1 shrink-0 text-[#16893F]"
                                    aria-hidden="true"
                                  />

                                  <span>
                                    {contact.email}
                                  </span>
                                </a>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[#F5F9F5] p-4">
                      <p className="text-[12px] leading-6 text-[#526357]">
                        For event enquiries, please use
                        the contact form. Additional
                        contact details will be shown
                        when published.
                      </p>
                    </div>
                  )}

                  <Link
                    href="/organiser/"
                    className="group flex items-center justify-between gap-3 border-t border-[#E6EEE8] pt-5 text-[12px] font-extrabold text-[#16893F] transition-colors hover:text-[#102A1E]"
                  >
                    <span>About the Organiser</span>

                    <ArrowUpRight
                      size={17}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </div>
              </div>
            </AboutReveal>

            {/* REGISTRATION & BADGE SUPPORT */}
            <AboutReveal delay={0.12}>
              <div className="rounded-[22px] border border-[#DCE7DE] bg-white p-6 sm:p-7">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#EAF6EE] text-[#16893F]">
                  <BadgeHelp
                    size={22}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>

                <h2 className="mt-5 text-base font-extrabold text-[#102A1E]">
                  Registration & Badge Support
                </h2>

                <p className="mt-3 text-[12px] leading-7 text-[#526357]">
                  Need assistance with visitor
                  registration or accessing your
                  badge? Include your registration
                  reference when contacting the team.
                </p>

                <p className="mt-3 text-[12px] leading-6 text-[#526357]">
                  Already registered but unable to find
                  your badge email? Use the secure
                  retrieval page.
                </p>

                <Link
                  href="/visit/badge/"
                  className="group mt-5 inline-flex items-center gap-2 text-[12px] font-extrabold text-[#16893F] transition-colors hover:text-[#102A1E]"
                >
                  Retrieve My Badge

                  <ArrowUpRight
                    size={17}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>
            </AboutReveal>

            {/* INFORMATION LINKS */}
            <AboutReveal delay={0.16}>
              <div className="rounded-[22px] border border-[#DCE7DE] bg-[#FAFCFA] p-6 sm:p-7">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#16893F]">
                  Helpful Information
                </p>

                <div className="mt-4 divide-y divide-[#E4ECE5]">
                  {[
                    {
                      label: "Exhibiting at IIEV",
                      href: "/exhibit/why-exhibit/",
                    },
                    {
                      label: "Visitor Information",
                      href: "/visit/",
                    },
                    {
                      label: "Venue & Location",
                      href: "/visit/venue/",
                    },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center justify-between gap-3 py-3.5 text-[12px] font-bold text-[#405548] transition-colors hover:text-[#16893F]"
                    >
                      {item.label}

                      <ArrowRight
                        size={16}
                        strokeWidth={1.8}
                        aria-hidden="true"
                        className="shrink-0 text-[#16893F] transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </AboutReveal>
          </div>
        </div>
      </section>

      {/* =========================================
          BOTTOM SIMPLE SUPPORT NOTE
      ========================================= */}
      <section className="border-t border-[#E0E9E1] bg-white py-12 sm:py-16">
        <AboutReveal className="mx-auto flex max-w-7xl flex-col gap-5 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="max-w-2xl">
            <SectionLabel>India International EV Show</SectionLabel>

            <h2 className="mt-4 text-xl font-extrabold tracking-[-0.03em] text-[#102A1E] sm:text-2xl">
              Looking for exhibition participation details?
            </h2>

            <p className="mt-3 text-[13px] leading-7 text-[#526357]">
              If your enquiry is about exhibition
              space, stall options or participation
              terms, you can also use the dedicated
              exhibitor enquiry form.
            </p>
          </div>

          <Link
            href="/exhibit/book-a-stall/"
            className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[#23A455] px-6 text-[13px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#16893F] lg:self-auto"
          >
            Book Your Stall

            <ArrowUpRight
              size={17}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </AboutReveal>
      </section>
    </>
  );
}
