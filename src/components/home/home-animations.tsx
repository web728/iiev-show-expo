"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  className = "",
  delay = 0,
  amount = 0.16,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: reduced ? 0 : 0.78, delay: reduced ? 0 : delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function LineHeading({
  lines,
  className = "",
}: {
  lines: ReactNode[];
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <h2 className={className}>
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className="block"
            initial={reduced ? false : { y: "112%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: reduced ? 0 : 0.85, delay: reduced ? 0 : index * 0.12, ease }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h2>
  );
}

export function ImageReveal({
  children,
  className = "",
  parallax = false,
}: {
  children: ReactNode;
  className?: string;
  parallax?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const visible = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div
      ref={ref}
      className={`relative isolate overflow-hidden ${className}`}
      initial={reduced ? false : { clipPath: "inset(12% 0 12% 0)", opacity: 0.6 }}
      animate={visible ? { clipPath: "inset(0% 0 0% 0)", opacity: 1 } : undefined}
      transition={{ duration: reduced ? 0 : 1, ease }}
    >
      <motion.div
        className="absolute inset-[-6%]"
        style={parallax && !reduced ? { y: imageY } : undefined}
        initial={reduced ? false : { scale: 1.08 }}
        animate={visible ? { scale: 1 } : undefined}
        transition={{ duration: reduced ? 0 : 1.4, ease }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function EditorialRow({
  children,
  index,
  className = "",
}: {
  children: ReactNode;
  index: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`group relative ${className}`}
      initial={reduced ? false : { opacity: 0.45, x: 18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.55 }}
      transition={{ duration: reduced ? 0 : 0.56, delay: reduced ? 0 : Math.min(index, 3) * 0.055, ease }}
    >
      <motion.span
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-[3px] origin-top bg-brand"
        initial={{ scaleY: 0 }}
        whileHover={{ scaleY: 1 }}
        transition={{ duration: 0.35, ease }}
      />
      {children}
    </motion.div>
  );
}

export function HeroEntrance({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.75, ease }}
    >
      {children}
    </motion.div>
  );
}

export function DividerReveal({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className={`h-px origin-left bg-stroke ${className}`}
      initial={reduced ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: reduced ? 0 : 0.8, ease }}
    />
  );
}

export function HoverLift({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      whileHover={reduced ? undefined : { y: -5 }}
      transition={{ duration: 0.3, ease }}
    >
      {children}
    </motion.div>
  );
}
