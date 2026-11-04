
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CarFront,
  Coffee,
  ExternalLink,
  MapPin,
  Navigation,
  Warehouse,
  Clock3,
} from "lucide-react";

import { PageHero } from "@/components/ui/page-hero";
import { AboutReveal } from "@/components/about/about-motion";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCurrentEdition } from "@/lib/data/edition";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Auto Cluster Exhibition Centre | IIEV Show 2027 Venue",
  description:
    "Venue details for India International EV Show 2027 at Auto Cluster Exhibition Centre, H-Block, Plot C-181, Chinchwad East, Pimpri-Chinchwad, Pune 411019. Address, Google Maps and facilities.",
  path: "/visit/venue/",
});

const facilities = [
  {
    number: "01",
    title: "Exhibition Halls",
    description:
      "Indoor exhibition halls suitable for industrial and trade exhibition displays.",
    Icon: Warehouse,
  },
  {
    number: "02",
    title: "Outdoor Display Space",
    description:
      "Outdoor space within the exhibition complex for event-related displays and activities.",
    Icon: Building2,
  },
  {
    number: "03",
    title: "Parking Facilities",
    description:
      "Parking facilities are available at the complex. Event-specific access arrangements will be confirmed by the organiser.",
    Icon: CarFront,
  },
  {
    number: "04",
    title: "Cafeteria",
    description:
      "Cafeteria facilities are part of the exhibition centre's general amenities.",
    Icon: Coffee,
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
        className="h-[2px] w-7 bg-[#23A455]"
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

export default async function VenuePage() {
  const edition = await getCurrentEdition();
  const venue = edition.venue;

  const address = [
    "H-Block, Plot No. C-181",
    "Chinchwad East, Mumbai–Pune Road",
    "Pimpri-Chinchwad",
    "Pune – 411019",
    "Maharashtra, India",
  ];

  const mapQuery =
    "Auto Cluster Exhibition Centre, H Block, " +
    "Plot C-181, Chinchwad East, " +
    "Pimpri-Chinchwad, Pune, Maharashtra 411019";

  const mapUrl =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(mapQuery);

  const mapEmbedUrl =
    "https://www.google.com/maps?q=" +
    encodeURIComponent(mapQuery) +
    "&output=embed";

  return (
    <>
      {/* =====================================
          SHARED PAGE HERO
      ===================================== */}
      <PageHero
        eyebrow="Exhibition Venue"
        title="Auto Cluster"
        highlight="Exhibition Centre"
        description="The venue for India International EV Show 2027 in Pimpri-Chinchwad, Pune."
        image="/media/2026/arrival-welcome-gate.webp"
        imagePosition="center 48%"
        crumbs={[
          { label: "Visit", href: "/visit/" },
          { label: "Venue" },
        ]}
      />

      {/* =====================================
          ABOUT THE VENUE
      ===================================== */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[.95fr_1.05fr] lg:gap-16 lg:px-10">
          <AboutReveal>
            <Eyebrow>About the Venue</Eyebrow>

            <h2 className="mt-5 text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
              Located in Pune's
              <span className="text-[#23A455]">
                {" "}automotive region.
              </span>
            </h2>

            <p className="mt-6 text-[14px] leading-8 text-[#4A5750] sm:text-base">
              Auto Cluster Exhibition Centre is an
              exhibition and convention facility
              located in Chinchwad, Pimpri-Chinchwad,
              within the Pune metropolitan region.
            </p>

            <p className="mt-4 text-[14px] leading-8 text-[#4A5750] sm:text-base">
              The venue hosts industrial exhibitions
              and trade events. Its location places
              it close to the automotive manufacturing,
              component supply and engineering businesses
              operating in the Pimpri-Chinchwad region.
            </p>

            <div className="mt-8 flex items-start gap-4 border-t border-[#DFE8E1] pt-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF6EE] text-[#16893F]">
                <CalendarDays
                  size={23}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </span>

              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#16893F]">
                  India International EV Show {edition.year}
                </p>

                <p className="mt-2 text-lg font-extrabold text-[#102A1E]">
                  {edition.dateLabel}
                </p>

                <p className="mt-1 text-[12px] text-[#657568]">
                  {edition.editionLabel}
                </p>
              </div>
            </div>
          </AboutReveal>

          <AboutReveal delay={0.1}>
            <div className="group relative aspect-[5/4] overflow-hidden rounded-[24px] bg-[#102A1E]">
              <Image
                src="/media/2026/arrival-welcome-gate.webp"
                alt="IIEV Show 2026 entrance at Auto Cluster Exhibition Centre, Pimpri-Chinchwad"
                fill
                sizes="(max-width:1024px) 100vw, 55vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#091B13]/80 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8BE3A8]">
                  Exhibition Venue
                </p>

                <p className="mt-2 text-lg font-extrabold text-white">
                  Auto Cluster Exhibition Centre
                </p>

                <p className="mt-1 text-[11px] text-white/70">
                  Pimpri-Chinchwad, Pune
                </p>
              </div>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* =====================================
          GOOGLE MAP + OFFICIAL ADDRESS
      ===================================== */}
      <section
        id="venue-location"
        className="scroll-mt-28 bg-[#F5F9F5] py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <Eyebrow>Venue Location</Eyebrow>
            </div>

            <h2 className="mt-5 text-[clamp(2rem,4.3vw,3.7rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
              Find the
              <span className="text-[#23A455]">
                {" "}exhibition centre.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-[#4A5750]">
              View the venue location on Google Maps.
              Zoom in, explore the surrounding roads
              or open the location directly for directions.
            </p>
          </AboutReveal>

          <AboutReveal
            delay={0.1}
            className="mt-11 overflow-hidden rounded-[24px] border border-[#DDE8DF] bg-white shadow-[0_20px_55px_-40px_rgba(9,27,19,0.25)]"
          >
            {/* REAL GOOGLE MAP EMBED */}
            <div className="relative h-[320px] w-full bg-[#E9F0E9] sm:h-[430px] lg:h-[510px]">
              <iframe
                title="Google Maps — Auto Cluster Exhibition Centre, Pimpri-Chinchwad, Pune"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>

            {/* ADDRESS + MAP BUTTON */}
            <div className="flex flex-col gap-7 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF6EE] text-[#16893F]">
                  <MapPin
                    size={24}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#16893F]">
                    Full Venue Address
                  </p>

                  <h3 className="mt-2 text-lg font-extrabold text-[#102A1E]">
                    {venue.name}
                  </h3>

                  <address className="mt-3 text-[13px] not-italic leading-7 text-[#526357]">
                    {address.map((line, index) => (
                      <span key={line}>
                        {line}
                        {index !== address.length - 1 && (
                          <span className="block" />
                        )}
                      </span>
                    ))}
                  </address>
                </div>
              </div>

              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-full bg-[#23A455] px-6 text-[13px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#16893F] hover:shadow-[0_12px_28px_-14px_rgba(35,164,85,0.55)]"
              >
                <Navigation
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

                Open in Google Maps

                <ArrowUpRight
                  size={17}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />

                <span className="sr-only">
                  Opens in a new tab
                </span>
              </a>
            </div>
          </AboutReveal>
        </div>
      </section>

      {/* =====================================
          VENUE FACILITIES
      ===================================== */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="max-w-3xl">
            <Eyebrow>Venue Facilities</Eyebrow>

            <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.6rem)] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#102A1E]">
              Facilities for
              <span className="text-[#23A455]">
                {" "}trade exhibitions.
              </span>
            </h2>

            <p className="mt-5 text-sm leading-8 text-[#4A5750]">
              Auto Cluster Exhibition Centre provides
              indoor and outdoor exhibition areas,
              along with amenities supporting trade
              events and their visitors.
            </p>
          </AboutReveal>

          <div className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {facilities.map(({ number, title, description, Icon }, index) => (
              <AboutReveal
                key={number}
                delay={index * 0.06}
                className="h-full"
              >
                <article className="group flex h-full min-h-[230px] flex-col rounded-[22px] border border-[#DFE8E1] bg-[#FAFCFA] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#23A455]/50 hover:shadow-[0_18px_42px_-35px_rgba(9,27,19,0.3)]">
                  <div className="flex items-start justify-between">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-[#EAF6EE] text-[#16893F] transition-colors duration-300 group-hover:bg-[#23A455] group-hover:text-white">
                      <Icon
                        size={24}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </span>

                    
                  </div>

                  <h3 className="mt-8 text-lg font-extrabold text-[#102A1E]">
                    {title}
                  </h3>

                  <p className="mt-3 text-[13px] leading-7 text-[#4A5750]">
                    {description}
                  </p>
                </article>
              </AboutReveal>
            ))}
          </div>

         
        </div>
      </section>

      {/* =====================================
          EVENT-SPECIFIC ACCESS INFORMATION
      ===================================== */}
      <section className="bg-[#091B13] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <AboutReveal className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <Eyebrow light>IIEV {edition.year} Venue Access</Eyebrow>
            </div>

            <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.6rem)] font-extrabold leading-[1.12] tracking-[-0.05em]">
              Plan your arrival at
              <span className="text-[#23A455]">
                {" "}Auto Cluster.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-white/70">
              Event-specific entry gates, hall allocations
              and parking instructions for IIEV 2027
              will be shared through official event
              information.
            </p>
          </AboutReveal>

          <AboutReveal
            delay={0.1}
            className="mx-auto mt-9 max-w-3xl"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-6">
                <div className="flex items-center gap-2 text-[#72DA98]">
                  <CalendarDays
                    size={19}
                    aria-hidden="true"
                  />
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em]">
                    Event Dates
                  </span>
                </div>

                <p className="mt-4 text-base font-extrabold">
                  {edition.dateLabel}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-6">
                <div className="flex items-center gap-2 text-[#72DA98]">
                  <Clock3
                    size={19}
                    aria-hidden="true"
                  />
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em]">
                    Visitor Timings
                  </span>
                </div>

                <p className="mt-4 text-[14px] font-bold leading-6">
                  {edition.openingHours ??
                    "To be announced"}
                </p>
              </div>
            </div>
          </AboutReveal>

          <AboutReveal className="mt-9 flex justify-center">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#23A455] px-7 text-[13px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#16893F]"
            >
              <Navigation
                size={18}
                aria-hidden="true"
              />

              Open in Google Maps

              <ArrowUpRight
                size={17}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </AboutReveal>
        </div>
      </section>
    </>
  );
}
