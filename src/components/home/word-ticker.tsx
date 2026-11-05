"use client";

import { motion, useReducedMotion } from "framer-motion";

const words = ["Exhibit", "Network", "Explore", "Visit", "Connect"];

export function WordTicker() {
  const reducedMotion = useReducedMotion();
  const content = (
    <div className="flex shrink-0 items-center">
      {words.map((word) => (
        <span key={word} className="inline-flex shrink-0 items-center gap-5 px-5 sm:gap-7 sm:px-7">
          <span className="whitespace-nowrap text-[13px] font-extrabold uppercase tracking-[0.18em] sm:text-[14px]">{word}</span>
          <span aria-hidden="true" className="size-1.5 rotate-45 bg-[#52CC7B]" />
        </span>
      ))}
    </div>
  );

  return (
    <div aria-label="Exhibit, Network, Explore, Visit, Connect" className="overflow-hidden border-y border-[#1D422B] bg-[#102A1E] py-[15px] text-[#F4FFF6]">
      <motion.div aria-hidden="true" className="flex w-max" initial={false}
        animate={reducedMotion ? undefined : { x: ["0%", "-50%"] }}
        transition={reducedMotion ? undefined : { x: { ease: "linear", duration: 34, repeat: Infinity } }}>
        {content}{content}
      </motion.div>
    </div>
  );
}
