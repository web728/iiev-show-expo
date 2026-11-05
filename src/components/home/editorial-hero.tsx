"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, CalendarDays, MapPin } from "lucide-react";

type Props = {
  editionLabel: string;
  year: number;
  dateLabel: string;
  venue: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function EditorialHero({ editionLabel, year, dateLabel, venue }: Props) {
  const reducedMotion = useReducedMotion();

  const enter = (delay: number) => ({
    initial: reducedMotion ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: reducedMotion ? 0 : delay, duration: reducedMotion ? 0 : 0.65, ease },
  });

  return (
    <section aria-labelledby="home-hero-title" className="relative isolate overflow-hidden bg-[#F6F8F3]">
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[52%_48%]">
        {/* Calm editorial typography: no oversized display copy. */}
        <div className="relative flex min-w-0 flex-col justify-center px-5 pb-9 pt-12 sm:px-9 sm:pb-12 sm:pt-16 lg:min-h-[552px] lg:pb-12 lg:pl-[max(40px,calc((100vw-1250px)/2))] lg:pr-12 lg:pt-12">
          <motion.div {...enter(0)} className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#BFD8C5] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#176F38]">
              <span className="size-1.5 rounded-full bg-[#23A455]" />
              {editionLabel} · {year}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#677769]">Pune · India</span>
          </motion.div>

          <motion.p {...enter(0.07)} className="mt-7 text-[11px] font-bold uppercase tracking-[0.22em] text-[#387C4C]">
            India International EV Show
          </motion.p>

          <motion.h1 {...enter(0.13)} id="home-hero-title" className="mt-3 max-w-[690px] text-[clamp(2.5rem,4.05vw,4rem)] font-extrabold leading-[1.085] tracking-[-0.048em] text-[#102A1E]">
            Where the EV industry <span className="text-[#20964B]">comes together.</span>
          </motion.h1>

          <motion.p {...enter(0.2)} className="mt-5 max-w-[455px] text-[14px] leading-[1.75] text-[#5D6D61] sm:text-[15px]">
            Vehicles, components, charging, energy storage and the people moving electric mobility forward — on one exhibition floor.
          </motion.p>

          <motion.div {...enter(0.27)} className="mt-7 flex flex-wrap gap-2.5">
            <Link href="/exhibit/book-a-stall/" className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#102A1E] px-5 py-3 text-[12px] font-bold text-white transition-colors hover:bg-[#20964B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20964B]">
              Book a Stall <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </Link>
            <Link href="/visit/register/" className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#C8D9CB] bg-white px-5 py-3 text-[12px] font-bold text-[#102A1E] transition-colors hover:border-[#20964B] hover:text-[#168740] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20964B]">
              Register to Visit <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </motion.div>

          <motion.div {...enter(0.34)} className="mt-9 grid max-w-[510px] gap-4 border-t border-[#D7E1D8] pt-5 sm:grid-cols-[0.9fr_1.1fr]">
            <div className="flex items-start gap-2.5">
              <CalendarDays size={17} className="mt-0.5 shrink-0 text-[#168740]" aria-hidden="true" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#869386]">Show dates</p>
                <p className="mt-1 text-[12px] font-semibold leading-5 text-[#244530]">{dateLabel}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin size={17} className="mt-0.5 shrink-0 text-[#168740]" aria-hidden="true" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#869386]">Venue</p>
                <p className="mt-1 text-[12px] font-semibold leading-5 text-[#244530]">{venue}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Genuine event photography, minimal overlay; fixed aspect ratio on mobile. */}
        <motion.div {...enter(0.1)} className="relative min-h-[305px] bg-[#153021] sm:min-h-[430px] lg:min-h-[552px]">
          <Image
            src="/images/hero-exhibition.webp"
            alt="Electric cars displayed on the India International EV Show exhibition floor"
            fill priority sizes="(min-width:1024px) 48vw, 100vw"
            className="object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#091B13]/65 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 text-white sm:bottom-7 sm:left-8 sm:right-8">
            <span className="max-w-[260px] text-[11px] font-bold uppercase leading-5 tracking-[0.16em] text-white/90">
              From the exhibition floor
            </span>
            <Link href="#about-show" aria-label="Explore the show" className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/55 bg-black/20 backdrop-blur-sm transition-colors hover:bg-[#23A455]">
              <ArrowDownRight size={19} aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
