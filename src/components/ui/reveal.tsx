"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Subtle entrance motion; disabled when the user prefers reduced motion. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      // Slide only — content is never hidden (works without JS, in print and for crawlers)
      initial={{ y: 16 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
