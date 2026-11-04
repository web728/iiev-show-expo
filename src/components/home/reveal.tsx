"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string; delay?: number };

export function Reveal({ children, className = "", delay = 0 }: Props) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.13 }}
      transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function HeroReveal({ children, className = "", delay = 0 }: Props) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.85, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function ImageLift({ children, className = "" }: Props) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      whileHover={reduced ? undefined : { y: -5 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >{children}</motion.div>
  );
}
