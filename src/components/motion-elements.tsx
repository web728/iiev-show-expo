"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >{children}</motion.div>
  );
}

export function HoverLift({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} whileHover={reduced ? undefined : { y: -6 }} transition={{ duration: 0.25 }}>{children}</motion.div>;
}

export function HeroReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.85, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}
