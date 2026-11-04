"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

/** The decorative circuit motif is intentionally an inline SVG: no external SVG or font dependency. */
function MobilityMotif() {
  const reduced = useReducedMotion();
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 1200 580" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full opacity-70">
      <defs>
        <linearGradient id="iiev-motif" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#23A455" stopOpacity="0.30" />
          <stop offset="1" stopColor="#23A455" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <motion.g fill="none" stroke="url(#iiev-motif)" strokeWidth="1.2" initial={false} animate={reduced ? {} : { x: [0, 12, 0], y: [0, -8, 0] }} transition={{ duration: 22, ease: "easeInOut", repeat: Infinity }}>
        <circle cx="600" cy="245" r="220" />
        <circle cx="600" cy="245" r="295" />
        <circle cx="600" cy="245" r="370" />
        <path d="M-80 370 H240 l64 -64 h94 M1200 150 H990 l-70 70 H780" />
        <path d="M0 525 H270 l82 -82 h92 M1200 485 H970 l-60 -60 H810" />
      </motion.g>
      <g fill="#23A455" opacity=".52"><circle cx="398" cy="306" r="3.5"/><circle cx="920" cy="220" r="3.5"/><circle cx="444" cy="443" r="3.5"/></g>
    </svg>
  );
}

export function CompactHero() {
  const reduced = useReducedMotion();
  const enter = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : 0.65, delay: reduced ? 0 : delay, ease },
  });

  return (
    <section aria-labelledby="home-hero-title" className="relative isolate overflow-hidden bg-brand-night text-white">
      <MobilityMotif />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(35,164,85,0.16),transparent_62%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-7 pt-12 text-center sm:px-8 sm:pb-9 sm:pt-14 lg:px-10 lg:pt-16">
        <motion.p {...enter(0)} className="mx-auto inline-flex items-center gap-2 rounded-full border border-brand/45 bg-brand/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/90 sm:text-[11px]">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" /> 9th India International EV Show
        </motion.p>
        <motion.h1 {...enter(0.08)} id="home-hero-title" className="mx-auto mt-5 max-w-4xl text-[clamp(2.25rem,5.2vw,4.5rem)] font-extrabold leading-[1.07] tracking-[-0.055em]">
          Where electric mobility <span className="text-brand">meets business.</span>
        </motion.h1>
        <motion.p {...enter(0.16)} className="mx-auto mt-4 max-w-2xl text-[13px] leading-6 text-white/75 sm:text-[15px] sm:leading-7">
          Explore electric vehicles, components, charging infrastructure and technology. Connect with manufacturers, suppliers and industry professionals in Pune.
        </motion.p>
        <motion.div {...enter(0.21)} className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold text-white/90 sm:text-[13px]">
          <span className="inline-flex items-center gap-2"><CalendarDays size={16} className="text-brand" aria-hidden="true"/>14–16 October 2027</span>
          <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-brand" aria-hidden="true"/>Auto Cluster Exhibition Centre, Pune</span>
        </motion.div>
        <motion.div {...enter(0.27)} className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="#participate" className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-offset-4">Exhibition enquiries <ArrowUpRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
          <Link href="#show-sectors" className="inline-flex min-h-11 items-center rounded-full border border-white/30 bg-white/5 px-6 py-3 text-xs font-bold text-white transition-colors hover:bg-white/15">Explore the show</Link>
        </motion.div>
        <motion.div {...enter(0.32)} className="relative mx-auto mt-8 max-w-5xl overflow-hidden rounded-[18px] border border-white/20 shadow-[0_15px_40px_-25px_rgba(0,0,0,.65)] sm:mt-9">
          <div className="relative h-[145px] w-full sm:h-[190px] lg:h-[205px]">
            <Image src="/images/industry-floor.webp" alt="Visitors and exhibitors meeting on the IIEV exhibition floor in 2026" fill priority sizes="(max-width:1024px) 100vw, 1024px" className="object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-night/60 via-transparent to-brand-night/10" />
            <div className="absolute bottom-3 left-4 rounded-md bg-brand-night/80 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm sm:bottom-4 sm:left-5">From the 2026 exhibition</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
