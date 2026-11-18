
"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";

/* =========================================================
   IIEV SHOW 2027 — PREMIUM EXHIBITOR SECTORS
   Original editorial layout preserved
========================================================= */

type Sector = {
  number: string;
  name: string;
  desc: string;
};

type ShowSectorsProps = {
  sectors: Sector[];
};

const ease = [0.22, 1, 0.36, 1] as const;

const headingVariant: Variants = {
  hidden: {
    y: "105%",
    opacity: 0,
  },
  visible: {
    y: "0%",
    opacity: 1,
    transition: {
      duration: 0.95,
      ease,
    },
  },
};

/* =========================================================
   INDIVIDUAL EDITORIAL ROW
========================================================= */

function SectorRow({
  sector,
  index,
  reduced,
}: {
  sector: Sector;
  index: number;
  reduced: boolean;
}) {
  return (
    <motion.li
      initial={
        reduced
          ? false
          : {
              opacity: 0,
              y: 24,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: reduced ? 0 : 0.72,
        delay: reduced ? 0 : Math.min(index, 3) * 0.055,
        ease,
      }}
      className="group relative list-none"
    >
      {/* Background hover wash */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-brand-dark/[0.035]
          opacity-0 transition-opacity
          duration-500 ease-out
          group-hover:opacity-100
        "
      />

      {/* Animated left rail */}
      <span
        aria-hidden="true"
        className="
          absolute bottom-[12%] left-0 top-[12%]
          w-[2px] origin-center
          scale-y-0 bg-brand-dark
          transition-transform duration-500 ease-out
          group-hover:scale-y-100
        "
      />

      {/* Main row */}
      <div
        className="
          relative grid min-w-0
          grid-cols-[2.25rem_minmax(0,1fr)_1.5rem]
          gap-x-3 gap-y-3
          py-7 transition-[padding]
          duration-500 ease-out
          group-hover:pl-3
          sm:grid-cols-[3rem_minmax(0,1.2fr)_minmax(0,1fr)_1.5rem]
          sm:items-start sm:gap-x-5 sm:py-9
          lg:group-hover:pl-5
        "
      >
        {/* Sector number */}
        <span
          className="
            pt-1 text-xs font-bold
            tabular-nums tracking-[0.08em]
            text-brand-dark/65
            transition-colors duration-300
            group-hover:text-brand-dark
          "
        >
          {sector.number}
        </span>

        {/* Title */}
        <h3
          className="
            min-w-0 text-[clamp(1.2rem,2vw,1.65rem)]
            font-bold leading-[1.25]
            tracking-[-0.035em] text-ink
            transition-colors duration-500
            group-hover:text-brand-dark
          "
        >
          {sector.name}
        </h3>

        {/* Description */}
        <p
          className="
            col-start-2 min-w-0
            text-sm leading-7 text-copy
            sm:col-start-3
          "
        >
          {sector.desc}
        </p>

        {/* Arrow indicator */}
        <ArrowUpRight
          size={21}
          strokeWidth={1.6}
          aria-hidden="true"
          className="
            col-start-3 row-start-1
            mt-1 text-brand-dark/45
            transition-[transform,color]
            duration-500 ease-out
            group-hover:translate-x-1
            group-hover:-translate-y-1
            group-hover:text-brand-dark
            sm:col-start-4
          "
        />
      </div>

      {/* Base separator */}
      <div className="relative h-px overflow-hidden bg-ink/15">
        {/* Animated reveal */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 origin-left bg-brand-dark/35"
          initial={reduced ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: reduced ? 0 : 0.85,
            delay: reduced ? 0 : 0.08,
            ease,
          }}
        />

        {/* Strong hover line */}
        <span
          aria-hidden="true"
          className="
            absolute inset-0 origin-left
            scale-x-0 bg-brand-dark
            transition-transform duration-700
            ease-out group-hover:scale-x-100
          "
        />
      </div>
    </motion.li>
  );
}

/* =========================================================
   MAIN SECTION
========================================================= */

export function ShowSectors({
  sectors,
}: ShowSectorsProps) {
  const reduced = Boolean(useReducedMotion());

  const fadeUp = (delay = 0) => ({
    initial: reduced
      ? false
      : {
          opacity: 0,
          y: 24,
        },

    whileInView: {
      opacity: 1,
      y: 0,
    },

    viewport: {
      once: true,
      amount: 0.2,
    },

    transition: {
      duration: reduced ? 0 : 0.8,
      delay: reduced ? 0 : delay,
      ease,
    },
  });

  const headingLine = (delay: number) => ({
    variants: headingVariant,
    initial: reduced ? false : "hidden",
    whileInView: "visible",
    viewport: {
      once: true,
      amount: 0.25,
    },
    transition: {
      delay,
    },
  });

  return (
    <section
      id="show-sectors"
      aria-labelledby="show-sectors-heading"
      className="
        relative isolate scroll-mt-28
        overflow-visible bg-soft
        py-20 sm:py-28 lg:py-36
      "
    >
      <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-12">

        {/* ==========================================
            LEFT — STICKY EDITORIAL CONTENT
        ========================================== */}

        <div className="min-w-0 lg:col-span-4">

          <div className="lg:sticky lg:top-32">

            {/* Eyebrow */}
            <motion.div
              {...fadeUp()}
              className="flex items-center gap-3"
            >
              <motion.span
                aria-hidden="true"
                className="h-[2px] bg-brand-dark"
                initial={reduced ? false : { width: 0 }}
                whileInView={{ width: 30 }}
                viewport={{ once: true }}
                transition={{
                  duration: reduced ? 0 : 0.7,
                  ease,
                }}
              />

              <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-dark">
                Exhibitor profiles
              </span>
            </motion.div>

            {/* ======================================
                HEADING
            ====================================== */}

            <h2
              id="show-sectors-heading"
              className="
                mt-6 text-[clamp(2.25rem,4.4vw,4.2rem)]
                font-light leading-[1.08]
                tracking-[-0.045em] text-ink
              "
            >
              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block"
                  initial={
                    reduced
                      ? false
                      : { opacity: 0, y: "105%" }
                  }
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: reduced ? 0 : 0.95,
                    delay: reduced ? 0 : 0.08,
                    ease,
                  }}
                >
                  One show.
                </motion.span>
              </span>

              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block font-bold text-brand-dark"
                  initial={
                    reduced
                      ? false
                      : { opacity: 0, y: "105%" }
                  }
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: reduced ? 0 : 0.95,
                    delay: reduced ? 0 : 0.2,
                    ease,
                  }}
                >
                  The full EV
                </motion.span>
              </span>

              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block"
                  initial={
                    reduced
                      ? false
                      : { opacity: 0, y: "105%" }
                  }
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: reduced ? 0 : 0.95,
                    delay: reduced ? 0 : 0.32,
                    ease,
                  }}
                >
                  ecosystem.
                </motion.span>
              </span>
            </h2>

            {/* Description */}
            <motion.p
              {...fadeUp(0.28)}
              className="mt-7 max-w-sm text-sm leading-8 text-copy"
            >
              Explore the technologies and companies
              shaping electric transportation,
              infrastructure and manufacturing.
            </motion.p>

            {/* CTA */}
            <motion.div
              {...fadeUp(0.36)}
              className="mt-8"
            >
              <Link
                href="#participate"
                className="
                  group inline-flex min-h-11
                  items-center gap-3
                  text-sm font-bold
                  text-brand-dark underline
                  decoration-brand/40
                  underline-offset-[7px]
                  transition-colors duration-300
                  hover:text-ink
                  focus-visible:outline
                  focus-visible:outline-2
                  focus-visible:outline-offset-4
                  focus-visible:outline-brand-dark
                "
              >
                Explore participation

                <ArrowUpRight
                  size={17}
                  aria-hidden="true"
                  className="
                    transition-transform duration-300
                    group-hover:translate-x-1
                    group-hover:-translate-y-1
                  "
                />
              </Link>
            </motion.div>
 
          </div>
        </div>

        {/* ==========================================
            RIGHT — PREMIUM SECTOR DIRECTORY
        ========================================== */}

        <div className="min-w-0 lg:col-span-8">

          {/* Directory top label */}
          <motion.div
            {...fadeUp(0.1)}
            className="mb-5 flex items-center justify-between gap-4"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-dark">
              Explore sectors
            </span>

         
          </motion.div>

          {/* Animated top divider */}
          <motion.div
            aria-hidden="true"
            className="h-[2px] w-full origin-left bg-ink"
            initial={reduced ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: reduced ? 0 : 1,
              ease,
            }}
          />

          {/* Sector rows */}
          <ol className="list-none">
            {sectors.map((sector, index) => (
              <SectorRow
                key={sector.number}
                sector={sector}
                index={index}
                reduced={reduced}
              />
            ))}
          </ol>

          
        </div>
      </div>
    </section>
  );
}
