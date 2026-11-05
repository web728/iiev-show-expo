"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Arc, Chars, Lines } from "@/components/home/motion-kit";

const ease = [0.22, 1, 0.36, 1] as const;

const facts = [
  { label: "Venue", value: "Auto Cluster Exhibition Centre, Pune" },
  { label: "Organised by", value: "Futurex Group" },
];

export function CompactHero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  // The footage moves a little slower than the page; the copy fades as you leave.
  // Both ride a spring so scrolling feels smooth, not steppy.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.35 });
  const mediaY = useTransform(smooth, [0, 1], ["0%", "14%"]);
  const copyOpacity = useTransform(smooth, [0, 0.7], [1, 0]);

  const fade = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: reduced ? 0 : delay, ease },
  });

  return (
    <section ref={ref} aria-labelledby="home-hero-title" className="relative isolate flex min-h-[86svh] flex-col justify-end overflow-hidden bg-brand-night text-white">
      {/* Footage. The still photo is the poster and the reduced-motion fallback. */}
      <motion.div aria-hidden="true" className="absolute inset-0 -z-20 scale-110" style={reduced ? undefined : { y: mediaY }}>
        {reduced ? (
          <Image src="/images/industry-floor.webp" alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <video
            className={`h-full w-full object-cover transition-opacity duration-1000 ${videoReady ? "opacity-100" : "opacity-0"}`}
            autoPlay muted loop playsInline preload="auto"
            poster="/images/industry-floor.webp"
            onCanPlay={() => setVideoReady(true)}
          >
            <source src="/videos/hero-bg.webm" type="video/webm" />
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
          </video>
        )}
      </motion.div>
      {/* A touch of brand green over the footage so the whole frame leans green, not blue */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-brand-deep/30 mix-blend-multiply" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-night/90 via-brand-night/55 to-brand-night/20" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-night via-transparent to-brand-night/40" />

      <Arc delay={0.2} opacity={0.95} className="absolute -right-[16%] -top-[34%] -z-10 aspect-square w-[min(66vw,780px)]" />

      <motion.div style={reduced ? undefined : { opacity: copyOpacity }} className="relative mx-auto w-full max-w-7xl px-5 pb-8 pt-36 sm:px-8 lg:px-10">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <motion.p {...fade(0.05)} className="inline-flex items-center gap-2 text-sm font-semibold text-white/90">
              {/* The only yellow on the page, one small bolt. Swap text-[#F9C900] for text-brand to remove it. */}
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-[#F9C900]" fill="currentColor"><path d="M14.2 1.5 4.5 14.1h6.1L8.9 22.5l10.6-13.2h-6.3z" /></svg>
              9th India International EV Show
            </motion.p>
            <Lines
              as="h1"
              id="home-hero-title"
              delay={0.1}
              className="mt-5 max-w-3xl text-[clamp(2.6rem,6.2vw,5.4rem)] font-light leading-[1.03] tracking-[-0.035em] [text-shadow:0_2px_30px_rgba(0,20,51,0.35)]"
              lines={["Where electric mobility", <span key="b" className="font-bold text-brand">meets business.</span>]}
            />
            <motion.p {...fade(0.55)} className="mt-6 max-w-md text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
              Vehicles, components, charging and technology, with the people who build them.
            </motion.p>
       <motion.div {...fade(0.7)} className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
  <Link
    href="/exhibit/book-a-stall/"
    className="group inline-flex min-h-12 items-center gap-4 rounded-full bg-brand py-2 pl-6 pr-2 text-sm font-bold text-white transition duration-300 hover:bg-brand-dark active:scale-[0.98] focus-visible:outline-offset-4"
  >
    Book Your Exhibition Space
    <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-brand-dark transition-transform duration-300 group-hover:scale-105">
      <ArrowRight
        size={16}
        aria-hidden="true"
        className="-rotate-45 transition-transform duration-300 group-hover:rotate-0"
      />
    </span>
  </Link>

  <Link
    href="/visit/register/"
    className="text-sm font-bold text-white underline decoration-white/40 underline-offset-[6px] transition-colors duration-300 hover:decoration-brand focus-visible:outline-offset-4"
  >
    Register as a Visitor
  </Link>
</motion.div>
          </div>

          {/* The date, set as type */}
          <div className="lg:col-span-4 lg:text-right">
            <Chars text="14–16" delay={0.35} className="text-[clamp(4.5rem,11vw,9rem)] font-bold leading-[0.9] tracking-[-0.06em]" />
            <motion.p {...fade(0.85)} className="mt-3 text-lg font-semibold sm:text-xl">October 2027</motion.p>
          </div>
        </div>

        <motion.dl {...fade(1)} className="mt-10 grid border-t border-white/25 sm:grid-cols-2 lg:max-w-xl">
          {facts.map((f) => (
            <div key={f.label} className="py-4 sm:pr-6">
              <dt className="text-xs text-white/60">{f.label}</dt>
              <dd className="mt-1 text-sm font-semibold">{f.value}</dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>
    </section>
  );
}