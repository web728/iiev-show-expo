"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * One motion language for the whole page: things rise a short distance, once,
 * with the same easing. The only things that loop are the brand arcs, very slowly.
 * Scroll-linked movement is spring-smoothed so it never feels jittery.
 */
const ease = [0.22, 1, 0.36, 1] as const;
const view = { once: true, margin: "-12% 0px" } as const;
const smoothSpring = { stiffness: 90, damping: 26, mass: 0.35 } as const;

export function FadeUp({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={view}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/** A headline you break into lines yourself; each line slides up out of its own mask. */
export function Lines({
  lines, as = "h2", className = "", id, delay = 0,
}: {
  lines: ReactNode[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  id?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      id={id}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={view}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: delay } } }}
    >
      {lines.map((line, i) => (
        <span key={i} className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
          <motion.span
            className="block"
            variants={reduced ? { hidden: { y: 0 }, show: { y: 0 } } : { hidden: { y: "105%" }, show: { y: 0, transition: { duration: 0.95, ease } } }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Big numerals that rise one character at a time. */
export function Chars({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.p
      aria-label={text}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={view}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: delay } } }}
    >
      {Array.from(text).map((c, i) => (
        <span key={i} aria-hidden="true" className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-top">
          <motion.span
            className="inline-block"
            variants={reduced ? { hidden: { y: 0 }, show: { y: 0 } } : { hidden: { y: "105%" }, show: { y: 0, transition: { duration: 0.9, ease } } }}
          >
            {c}
          </motion.span>
        </span>
      ))}
    </motion.p>
  );
}

/** Photo that wipes open once, then drifts very slightly as you scroll. Put <Image fill /> inside. */
export function Photo({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, smoothSpring);
  const y = useTransform(smooth, [0, 1], ["-6%", "6%"]);
  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      initial={reduced ? false : { clipPath: "inset(0 0 100% 0)" }}
      whileInView={{ clipPath: "inset(0 0 0% 0)" }}
      viewport={view}
      transition={{ duration: 1.1, ease }}
    >
      <motion.div className="absolute inset-0" style={reduced ? undefined : { y, scale: 1.14 }}>{children}</motion.div>
    </motion.div>
  );
}

/** Hairline that draws itself left to right. */
export function Rule({ className = "", tone = "bg-stroke" }: { className?: string; tone?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className={`block h-px w-full origin-left ${tone} ${className}`}
      initial={reduced ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={view}
      transition={{ duration: 1.1, ease }}
    />
  );
}

/** Short all-green tab that draws itself on top of a hairline. */
export function Tab({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className={`block h-[3px] w-12 origin-left bg-gradient-to-r from-[#1D8043] to-[#3BB36B] ${className}`}
      initial={reduced ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={view}
      transition={{ duration: 0.8, ease }}
    />
  );
}

/** Brand chevron stripes from the guidelines, as quiet texture. Colour with text-*. */
export function Chevrons({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 160" className={className} fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="square">
      {[0, 28, 56, 84].map((y) => (
        <path key={y} d={`M10 ${y + 52} L60 ${y + 2} L110 ${y + 52}`} />
      ))}
    </svg>
  );
}

/**
 * The big arc from the brand guidelines: a ring in brand greens only, with a fine dashed
 * orbit just outside it turning the other way. It eases in, then drifts very slowly.
 * The caller positions it (needs an absolute/relative className).
 */
export function Arc({
  className = "", opacity = 1, delay = 0, thickness = "clamp(28px, 4.6vw, 64px)",
}: {
  className?: string;
  opacity?: number;
  delay?: number;
  thickness?: string;
}) {
  const reduced = useReducedMotion();
  const mask = `radial-gradient(farthest-side, transparent calc(100% - ${thickness}), #000 calc(100% - ${thickness} + 1px))`;
  return (
    <motion.div
      aria-hidden="true"
      className={className}
      initial={reduced ? false : { opacity: 0, scale: 0.92 }}
      whileInView={{ opacity, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.6, delay, ease }}
    >
      <motion.div
        className="h-full w-full rounded-full"
        style={{
          background: "conic-gradient(from 200deg, #1D8043, #3BB36B 32%, #16893F 58%, #2A9A55 80%, #1D8043)",
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
        animate={reduced ? {} : { rotate: 360 }}
        transition={{ duration: 140, ease: "linear", repeat: Infinity }}
      />
      <motion.svg
        viewBox="0 0 100 100"
        fill="none"
        className="absolute left-1/2 top-1/2 h-[114%] w-[114%] -translate-x-1/2 -translate-y-1/2 text-[#3BB36B]/45"
        animate={reduced ? {} : { rotate: -360 }}
        transition={{ duration: 220, ease: "linear", repeat: Infinity }}
      >
        <circle cx="50" cy="50" r="49.5" stroke="currentColor" strokeWidth="1" strokeDasharray="4 9" vectorEffect="non-scaling-stroke" />
      </motion.svg>
    </motion.div>
  );
}

/** List row that switches on (green title, small indent, bar, arrow) when it passes through the middle of the screen. */
export function FocusRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const active = useInView(ref, { margin: "-42% 0px -42% 0px" });
  return (
    <div ref={ref} data-active={!reduced && active} className={className}>
      {children}
    </div>
  );
}