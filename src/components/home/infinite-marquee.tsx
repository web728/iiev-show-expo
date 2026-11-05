"use client";

import { motion, useReducedMotion } from "framer-motion";

const words = ["EXHIBIT", "NETWORK", "EXPLORE", "VISIT", "CONNECT"];

function Line({ reverse = false }: { reverse?: boolean }) {
  const reduceMotion = useReducedMotion();
  const group = (
    <div className="flex shrink-0 items-center">
      {words.map((word) => (
        <span key={word} className="inline-flex items-center gap-7 px-7 sm:gap-11 sm:px-11">
          <span className="whitespace-nowrap text-[clamp(2.2rem,5.6vw,5.4rem)] font-black uppercase leading-[1.3] tracking-[-0.06em]">{word}</span>
          <span aria-hidden="true" className="inline-block size-3 shrink-0 rotate-45 border-2 border-[#52D381] sm:size-4" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden" aria-label="Exhibit, Network, Explore, Visit and Connect">
      <motion.div
        className="flex w-max"
        aria-hidden="true"
        initial={false}
        animate={reduceMotion ? undefined : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={reduceMotion ? undefined : { x: { ease: "linear", duration: 32, repeat: Infinity } }}
      >
        {group}
        {group}
      </motion.div>
    </div>
  );
}

export function InfiniteMarquee() {
  return (
    <section aria-label="IIEV show experiences" className="overflow-hidden border-y border-[#143D28] bg-[#102A1E] py-7 text-white/95 sm:py-9">
      <Line />
    </section>
  );
}
