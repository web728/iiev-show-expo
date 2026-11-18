"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { CalendarDays, MapPin, CheckCircle2, FileSearch, Clock3 } from "lucide-react";
import type { getPastEditions } from "@/lib/data/public";

type Edition = Awaited<ReturnType<typeof getPastEditions>>[number];

const confidenceDetails = {
  high: {
    label: "Verified",
    Icon: CheckCircle2,
    className: "border-[#23A455]/25 bg-[#23A455]/10 text-[#16893F]",
  },
  medium: {
    label: "Reported",
    Icon: FileSearch,
    className: "border-[#D7E3D9] bg-[#F1F5F1] text-[#425B48]",
  },
  low: {
    label: "Being verified",
    Icon: Clock3,
    className: "border-[#E4E8E3] bg-[#F5F6F4] text-[#59665C]",
  },
} as const;

const ease = [0.22, 1, 0.36, 1] as const;

function ArchiveEntry({ edition, index }: { edition: Edition; index: number }) {
  const onLeft = index % 2 === 0;
  const confidence =
    edition.confidence === "high" ||
    edition.confidence === "medium" ||
    edition.confidence === "low"
      ? edition.confidence
      : "low";
  const { label, Icon, className } = confidenceDetails[confidence];

  return (
    <li className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-4 pb-9 last:pb-0 sm:grid-cols-[40px_minmax(0,1fr)] sm:gap-x-5 lg:grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] lg:gap-x-5 lg:pb-14">
      {/* Center node — aligned with the continuous line */}
      <motion.span
        aria-hidden="true"
        initial={{ scale: 0.6, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.5, ease }}
        className="relative z-10 col-start-1 row-start-1 mt-9 flex h-[14px] w-[14px] items-center justify-center rounded-full border-[3px] border-[#F5F9F5] bg-[#23A455] ring-1 ring-[#23A455]/40 sm:ml-[6px] lg:col-start-2 lg:mx-auto lg:mt-12"
      />

      {/* Decorative branch from center to each alternating entry */}
      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.65, ease, delay: 0.1 }}
        style={{ transformOrigin: onLeft ? "right center" : "left center" }}
        className={`absolute top-[55px] hidden h-px w-[44px] bg-[#8EC7A0] lg:block ${onLeft ? "left-[calc(50%-44px)]" : "left-1/2"}`}
      />

      {/* Read-only archive record, never a Link/button */}
      <motion.article
        initial={{ opacity: 0, x: onLeft ? -64 : 64, y: 12 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, amount: 0.22 }}
        transition={{ duration: 0.9, ease, delay: 0.08 }}
        className={`relative col-start-2 row-start-1 min-w-0 overflow-hidden rounded-[22px] border border-[#DFE8E1] bg-white p-6 shadow-[0_15px_38px_-35px_rgba(9,27,19,0.22)] sm:p-8 lg:col-span-1 lg:w-full ${
          onLeft ? "lg:col-start-1" : "lg:col-start-3"
        }`}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 text-[#23A455] opacity-[0.07]"
        >
          <circle cx="100" cy="100" r="83" stroke="currentColor" />
          <circle cx="100" cy="100" r="58" stroke="currentColor" />
          <circle cx="100" cy="100" r="30" stroke="currentColor" />
        </svg>

        <div className="relative flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#16893F]">
            {edition.editionLabel}
          </span>
          <span className="h-1 w-1 rounded-full bg-[#A9B9AD]" aria-hidden="true" />
          <span className="text-[12px] font-semibold text-[#647368]">{edition.year}</span>
        </div>

        <h3 className="relative mt-4 text-[clamp(1.5rem,2.7vw,2.3rem)] font-extrabold leading-tight tracking-[-0.045em] text-[#102A1E]">
          {edition.city}
        </h3>

        <div className="relative mt-4 flex flex-col gap-2 text-[12px] leading-6 text-[#566A5D] sm:text-[13px]">
          <span className="flex items-start gap-2">
            <CalendarDays size={16} aria-hidden="true" className="mt-1 shrink-0 text-[#16893F]" />
            {edition.dates ?? "Dates being verified"}
          </span>
          {edition.venue && (
            <span className="flex items-start gap-2">
              <MapPin size={16} aria-hidden="true" className="mt-1 shrink-0 text-[#16893F]" />
              {edition.venue}
            </span>
          )}
        </div>

        <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E9EFEA] pt-4">
          <span className="text-[11px] font-bold text-[#657469]">Historical event record</span>
          <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold ${className}`}>
            <Icon size={13} strokeWidth={2} aria-hidden="true" />
            {label}
          </span>
        </div>
      </motion.article>
    </li>
  );
}

export function ArchiveTimeline({ editions }: { editions: Edition[] }) {
  const timelineRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 72%", "end 35%"],
  });
  const lineProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <div className="relative">
      {/* A single continuous track. Mobile left, desktop center. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-7 left-[6px] top-10 w-[2px] bg-[#D0DED2] sm:left-[12px] lg:left-1/2 lg:-translate-x-1/2"
      >
        <motion.div
          className="h-full w-full origin-top bg-[#23A455]"
          style={{ scaleY: lineProgress }}
        />
      </div>

      <ol ref={timelineRef} className="relative list-none">
        {editions.map((edition, index) => (
          <ArchiveEntry key={edition.slug} edition={edition} index={index} />
        ))}
      </ol>
    </div>
  );
}
