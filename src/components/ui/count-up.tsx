"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/** Counts up once when scrolled into view. Server HTML contains the final value. */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!inView || reduce || !ref.current) return;
    const el = ref.current;
    const c = animate(0, value, { duration: 1.4, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => { el.textContent = `${Math.round(v).toLocaleString("en-IN")}${suffix}`; } });
    return () => c.stop();
  }, [inView, reduce, value, suffix]);
  return <span ref={ref} className="tabular-nums">{value.toLocaleString("en-IN")}{suffix}</span>;
}
