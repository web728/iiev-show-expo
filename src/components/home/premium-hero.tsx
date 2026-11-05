"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  MapPin,
} from "lucide-react";

type Props = {
  editionLabel: string;
  year: number;
  dateLabel: string;
  venue: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function PremiumHero({ editionLabel, year, dateLabel, venue }: Props) {
  const reduced = useReducedMotion();
  const enter = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : 0.8, delay: reduced ? 0 : delay, ease },
  });

  return (
    <section
      aria-labelledby="iiev-home-title"
      className="relative isolate overflow-hidden bg-[#091B13] text-white"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:80px_80px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-52 top-8 size-[520px] rounded-full bg-[#23A455]/10 blur-[110px]" />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-5 pb-15 pt-14 sm:px-8 sm:pb-20 sm:pt-18 lg:min-h-[690px] lg:grid-cols-[0.96fr_1.04fr] lg:gap-12 lg:px-12 lg:py-23 xl:min-h-[740px]">
        {/* Main message: clean type, not a poster full of labels */}
        <div className="relative z-10 max-w-[680px]">
          <motion.div {...enter(0)} className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.19em] text-[#78DEA0]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#78DEA0]/35">
              <span className="h-1.5 w-1.5 rounded-full bg-[#78DEA0]" />
            </span>
            {editionLabel} · {year}
          </motion.div>

          <motion.p {...enter(0.09)} className="mt-7 max-w-lg text-[12px] font-bold uppercase tracking-[0.22em] text-white/65 sm:text-[13px]">
            India International EV Show
          </motion.p>

          <motion.h1
            {...enter(0.15)}
            id="iiev-home-title"
            className="mt-4 text-[clamp(3.1rem,6.1vw,6.6rem)] font-extrabold leading-[0.99] tracking-[-0.065em]"
          >
            Where the
            <span className="block text-[#52D381]">electric future</span>
            takes shape.
          </motion.h1>

          <motion.p {...enter(0.24)} className="mt-7 max-w-[530px] text-[14px] leading-8 text-white/72 sm:text-[16px]">
            Discover electric vehicles, charging technologies, components and the people driving the next chapter of mobility.
          </motion.p>

          <motion.div {...enter(0.32)} className="mt-8 flex flex-wrap gap-3">
            <Link href="/exhibit/book-a-stall/" className="group inline-flex min-h-[54px] items-center justify-center gap-3 rounded-full bg-[#23A455] px-7 text-[13px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#31B966] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Book a Stall
              <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </Link>
            <Link href="/visit/register/" className="group inline-flex min-h-[54px] items-center justify-center gap-3 rounded-full border border-white/28 bg-white/5 px-7 text-[13px] font-bold text-white transition-colors hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Register as Visitor
              <ArrowUpRight size={17} className="text-[#72D895]" aria-hidden="true" />
            </Link>
          </motion.div>

          <motion.div {...enter(0.4)} className="mt-10 grid gap-5 border-t border-white/15 pt-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <CalendarDays size={18} className="mt-0.5 shrink-0 text-[#75E09B]" aria-hidden="true" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-white/42">Event dates</p>
                <p className="mt-1.5 text-[13px] font-semibold leading-6 text-white/90">{dateLabel}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-[#75E09B]" aria-hidden="true" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-white/42">Venue · Pune</p>
                <p className="mt-1.5 text-[13px] font-semibold leading-6 text-white/90">{venue}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Real exhibition photography — purposeful cinematic crop */}
        <motion.div {...enter(0.17)} className="relative min-w-0">
          <div className="relative h-[370px] overflow-hidden rounded-[26px] border border-white/15 bg-[#15291E] shadow-[0_42px_100px_-40px_rgba(0,0,0,0.65)] sm:h-[490px] lg:h-[590px] lg:rounded-[32px]">
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={reduced ? undefined : { scale: [1, 1.045, 1] }}
              transition={reduced ? undefined : { duration: 23, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/images/hero-exhibition.webp"
                alt="Electric vehicles on display at a previous India International EV Show exhibition"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover object-center"
              />
            </motion.div>
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#091B13]/85 via-[#091B13]/10 to-transparent" />
            <div aria-hidden="true" className="absolute inset-0 ring-1 ring-inset ring-white/10" />

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-3 sm:bottom-8 sm:left-8 sm:right-8">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#95E6B0]">From the exhibition floor</p>
                <p className="mt-2 max-w-[270px] text-xl font-extrabold leading-tight tracking-[-0.03em] text-white sm:text-2xl">Real products. Real industry conversations.</p>
              </div>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/12 text-white backdrop-blur-sm">
                <ArrowDownRight size={22} aria-hidden="true" />
              </span>
            </div>
          </div>

          <motion.div {...enter(0.5)} className="absolute -bottom-5 -left-5 hidden w-[195px] overflow-hidden rounded-[19px] border-[5px] border-[#091B13] bg-[#15291E] shadow-xl xl:block">
            <div className="relative h-[135px]">
              <Image src="/images/networking.webp" alt="Industry visitors discussing EV technologies at the exhibition" fill sizes="195px" className="object-cover" />
            </div>
            <p className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8BE5AA]">Connect · Collaborate</p>
          </motion.div>
        </motion.div>
      </div>

      <div className="relative border-t border-white/10 bg-[#0E2419]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.13em] text-white/48 sm:px-8 lg:px-12">
          <span>Electric Vehicles</span><span className="text-[#4BBE76]">/</span><span>Energy Storage</span><span className="text-[#4BBE76]">/</span><span>Charging & Components</span><span className="hidden text-[#4BBE76] sm:inline">/</span><span className="hidden sm:inline">Industry Networking</span>
        </div>
      </div>
    </section>
  );
}
