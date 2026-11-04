"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/icons";
import { buttonClass } from "@/components/ui/button";

export type Journey = {
  key: string;
  label: string;
  short: string;
  icon: IconName;
  headline: string;
  text: string;
  steps: string[];
  cta: { label: string; href: string };
  secondary: { label: string; href: string };
  image: { src: string; alt: string };
};

/** "Who are you?" — routes each audience to its own path with a tailored next step. */
export function JourneyPicker({ journeys }: { journeys: Journey[] }) {
  const [active, setActive] = useState(journeys[0].key);
  const reduce = useReducedMotion();
  const j = journeys.find((x) => x.key === active)!;
  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
      <div role="tablist" aria-label="Choose your path" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
        {journeys.map((x) => {
          const I = Icon[x.icon];
          const on = x.key === active;
          return (
            <button
              key={x.key}
              role="tab"
              id={`tab-${x.key}`}
              aria-selected={on}
              aria-controls={`panel-${x.key}`}
              onClick={() => setActive(x.key)}
              className={`group flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3.5 text-left font-semibold transition-all ${on ? "border-brand-green bg-brand-green text-white shadow-[0_10px_30px_-12px_rgb(29_128_67/0.6)]" : "border-line bg-white text-ink hover:border-brand-green hover:text-brand-green"}`}
            >
              <span className={`inline-flex size-9 items-center justify-center rounded-full ${on ? "bg-white/15" : "bg-mist group-hover:bg-brand-green/10"}`}><I className="size-5" /></span>
              <span className="whitespace-nowrap lg:hidden">{x.short}</span>
              <span className="hidden whitespace-nowrap lg:inline">{x.label}</span>
              <Icon.Arrow className={`ml-auto hidden size-4 transition-transform lg:block ${on ? "translate-x-0" : "-translate-x-1 opacity-0"}`} />
            </button>
          );
        })}
      </div>
      <div className="relative min-h-[26rem] overflow-hidden rounded-3xl bg-brand-navy text-white">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={j.key}
            id={`panel-${j.key}`}
            role="tabpanel"
            aria-labelledby={`tab-${j.key}`}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid h-full md:grid-cols-[1.1fr_1fr]"
          >
            <div className="relative order-2 p-7 sm:p-9 md:order-1">
              <h3 className="text-2xl font-extrabold leading-tight sm:text-3xl">{j.headline}</h3>
              <p className="mt-3 text-white/75">{j.text}</p>
              <ol className="mt-6 grid gap-3">
                {j.steps.map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-extrabold text-brand-navy">{i + 1}</span>
                    <span className="pt-0.5 text-white/90">{s}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={j.cta.href} className={buttonClass("secondary", "lg")}>{j.cta.label} <Icon.Arrow className="size-4.5" /></Link>
                <Link href={j.secondary.href} className={buttonClass("outline-light", "lg")}>{j.secondary.label}</Link>
              </div>
            </div>
            <div className="relative order-1 min-h-56 md:order-2">
              <Image src={j.image.src} alt={j.image.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent md:bg-gradient-to-r md:from-brand-navy md:via-brand-navy/20" aria-hidden="true" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
