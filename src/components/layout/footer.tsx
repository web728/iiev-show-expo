
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Mail,
} from "lucide-react";

import {
  footerNav,
  legalNav,
  organiser,
  siteConfig,
} from "@/config/site";

import type {
  CurrentEdition,
  PublicSettings,
} from "@/lib/data/edition";

import { Icon } from "@/components/ui/icons";
import { CookieSettingsButton } from "./consent";

export function SiteFooter({
  edition,
  settings,
}: {
  edition: CurrentEdition;
  settings: PublicSettings;
}) {
  const venue = edition.venue;

  const venueLabel = [
    venue.name,
    venue.locality,
    venue.city,
  ]
    .filter(Boolean)
    .join(", ");

  const socials = [
    {
      href: siteConfig.social.linkedin,
      label: "LinkedIn",
      Icon: Icon.Linkedin,
    },
    {
      href: siteConfig.social.instagram,
      label: "Instagram",
      Icon: Icon.Instagram,
    },
    {
      href: siteConfig.social.facebook,
      label: "Facebook",
      Icon: Icon.Facebook,
    },
    {
      href: siteConfig.social.x,
      label: "X",
      Icon: Icon.X,
    },
  ].filter((social) => Boolean(social.href));

  return (
    <footer
      aria-label="Website footer"
      className="relative isolate overflow-hidden bg-[#091B13] text-white"
    >
      {/* TOP BRAND LINE */}
      <div
        aria-hidden="true"
        className="h-[3px] w-full bg-[#23A455]"
      />

      {/* BACKGROUND ACCENT */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-36 -top-40 size-[440px] rounded-full border border-[#23A455]/10" />
        <div className="absolute -right-20 -top-20 size-[300px] rounded-full border border-[#23A455]/10" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">

        {/* =====================================
            MAIN FOOTER
        ===================================== */}
        <div className="grid gap-11 border-b border-white/10 pb-12 pt-13 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-12 lg:pb-14 lg:pt-16 xl:grid-cols-[350px_minmax(0,1fr)] xl:gap-16">

          {/* BRAND COLUMN */}
          <div className="min-w-0">
            <Link
              href="/"
              aria-label="India International EV Show homepage"
              className="inline-flex rounded-xl bg-white px-3 py-2.5 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <Image
                src="/brand/iiev-9th-edition-logo-trimmed.png"
                alt="India International EV Show, 9th Edition"
                width={1538}
                height={734}
                sizes="175px"
                className="h-[64px] w-auto object-contain"
              />
            </Link>

            <p className="mt-5 max-w-[330px] text-[13px] leading-[25px] text-white/65">
              A platform for electric vehicles,
              automotive technologies, components
              and the wider e-mobility industry.
            </p>

            {/* EVENT DETAILS */}
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <CalendarDays
                  size={18}
                  strokeWidth={1.8}
                  className="mt-0.5 shrink-0 text-[#55CB7E]"
                  aria-hidden="true"
                />

                <span className="text-[13px] font-semibold leading-6 text-white/90">
                  {edition.dateLabel}
                </span>
              </div>

              <Link
                href="/visit/venue/"
                className="group flex items-start gap-3"
              >
                <MapPin
                  size={18}
                  strokeWidth={1.8}
                  className="mt-0.5 shrink-0 text-[#55CB7E]"
                  aria-hidden="true"
                />

                <span className="text-[12px] leading-6 text-white/70 transition-colors group-hover:text-white">
                  {venueLabel}
                </span>
              </Link>
            </div>

            {/* SOCIAL ICONS */}
            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {socials.map(
                  ({
                    href,
                    label,
                    Icon: SocialIcon,
                  }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${label} — opens in a new tab`}
                      className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#23A455] hover:bg-[#23A455] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23A455]"
                    >
                      <SocialIcon className="size-[17px]" />
                    </a>
                  )
                )}
              </div>
            )}
          </div>

          {/* FOUR NAVIGATION COLUMNS */}
          <div className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4 sm:gap-x-5 lg:gap-x-7">
            {footerNav.map((column) => (
              <nav
                key={column.title}
                aria-label={`${column.title} links`}
                className="min-w-0"
              >
                <h2 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-white">
                  {column.title}
                </h2>

                <div
                  aria-hidden="true"
                  className="mt-3 h-[2px] w-7 bg-[#23A455]"
                />

                <ul className="mt-5 space-y-3.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-start gap-1 text-[12px] leading-[22px] text-white/60 transition-colors duration-200 hover:text-white"
                      >
                        <span>{link.label}</span>

                        <ArrowUpRight
                          size={12}
                          strokeWidth={1.8}
                          aria-hidden="true"
                          className="mt-1 shrink-0 text-[#55CB7E] opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* =====================================
            ORGANISER + CONTACT
        ===================================== */}
        <div className="flex flex-col gap-6 border-b border-white/10 py-7 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-5 sm:gap-6">
            <div>
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/45">
                Organised by
              </p>

              <a
                href={organiser.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${organiser.legalName} website`}
                className="inline-flex rounded-lg bg-white px-3.5 py-2.5 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Image
                  src={organiser.logo}
                  alt={organiser.legalName}
                  width={1000}
                  height={209}
                  sizes="145px"
                  className="h-[26px] w-auto object-contain"
                />
              </a>
            </div>

            <div className="hidden h-10 w-px bg-white/15 sm:block" />

            <div className="max-w-[350px]">
              <p className="text-[12px] font-bold text-white/90">
                {organiser.legalName}
              </p>

              {settings.address && (
                <p className="mt-1 text-[11px] leading-5 text-white/55">
                  {settings.address}
                </p>
              )}
            </div>
          </div>

          <Link
            href="/contact/"
            className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full border border-[#23A455]/45 bg-[#23A455]/10 px-5 text-[12px] font-bold text-[#74E19A] transition-all duration-200 hover:border-[#23A455] hover:bg-[#23A455] hover:text-white md:self-auto"
          >
            <Mail
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            Contact the Organiser
            <ArrowUpRight
              size={15}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        {/* =====================================
            COPYRIGHT + LEGAL
        ===================================== */}
        <div className="flex flex-col gap-4 py-6 text-[11px] leading-5 text-white/45 lg:flex-row lg:items-center lg:justify-between">
          <p className="shrink-0">
            © {new Date().getFullYear()}{" "}
            {organiser.legalName}.
            {" "}All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 lg:justify-end">
            {legalNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors duration-200 hover:text-white"
              >
                {link.label}
              </Link>
            ))}

            <CookieSettingsButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
