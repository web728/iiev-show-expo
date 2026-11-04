
"use client";

import type { ReactNode } from "react";
import {
  motion,
  useReducedMotion,
} from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function AboutReveal({
  children,
  className = "",
  delay = 0,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : { opacity: 0, y: 28 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        amount: 0.12,
        margin: "0px 0px -35px 0px",
      }}
      transition={{
        duration: reduceMotion ? 0 : 0.7,
        delay: reduceMotion ? 0 : delay,
        ease,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AboutMotif() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 sm:h-[900px] sm:w-[900px]"
        animate={
          reduceMotion ? undefined : { rotate: 360 }
        }
        transition={{
          duration: 100,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <svg
          viewBox="0 0 900 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <circle
            cx="450"
            cy="450"
            r="340"
            stroke="#23A455"
            strokeOpacity=".16"
          />

          <circle
            cx="450"
            cy="450"
            r="275"
            stroke="white"
            strokeOpacity=".08"
          />

          <circle
            cx="450"
            cy="450"
            r="205"
            stroke="#23A455"
            strokeOpacity=".12"
            strokeDasharray="5 12"
          />

          <path
            d="M450 40V110M450 790V860M40 450H110M790 450H860"
            stroke="#23A455"
            strokeOpacity=".35"
            strokeWidth="2"
          />

          <path
            d="M210 210L255 255M645 645L690 690M690 210L645 255M255 645L210 690"
            stroke="#23A455"
            strokeOpacity=".2"
          />

          <circle cx="450" cy="110" r="5" fill="#23A455" />
          <circle cx="790" cy="450" r="4" fill="#23A455" />
          <circle cx="210" cy="690" r="4" fill="#23A455" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07] sm:h-[500px] sm:w-[500px]"
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.035, 1] }
        }
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
