
"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  MoveDown,
} from "lucide-react";

/* =========================================================
   IIEV SHOW 2027
   THE EXHIBITION, UNFILTERED

   Design:
   - Automotive editorial
   - Cinematic photography
   - Large typographic chapters
   - No generic cards or tabs
========================================================= */

type ExperienceItem = {
  number: string;
  title: string;
  body: string;
};

type ShowExperienceProps = {
  experience: ExperienceItem[];
};

const ease = [0.22, 1, 0.36, 1] as const;

/* =========================================================
   ANIMATED EDITORIAL CHAPTER
========================================================= */

function ExperienceChapter({
  item,
  index,
  reduced,
}: {
  item: ExperienceItem;
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
              y: 40,
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
        duration: reduced ? 0 : 0.85,
        delay: reduced ? 0 : 0.05,
        ease,
      }}
      className="group relative list-none"
    >
      {/* Animated horizontal rule */}

      <motion.div
        aria-hidden="true"
        className="h-px w-full origin-left bg-[#102A1E]/20"
        initial={
          reduced
            ? false
            : { scaleX: 0 }
        }
        whileInView={{
          scaleX: 1,
        }}
        viewport={{ once: true }}
        transition={{
          duration: reduced ? 0 : 1.1,
          ease,
        }}
      />

      {/* Row hover background */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          inset-x-0 bottom-0 top-px
          bg-[#E6EEE7]
          opacity-0 transition-opacity
          duration-500 ease-out
          group-hover:opacity-100
        "
      />

      {/* Editorial row */}

      <div
        className="
          relative grid min-w-0 gap-5
          py-9 transition-[padding]
          duration-500 ease-out
          group-hover:px-3
          sm:py-12
          lg:grid-cols-12
          lg:items-center lg:gap-8
          lg:py-14
          lg:group-hover:px-6
        "
      >
        {/* Number */}

        <div className="lg:col-span-2">
          <motion.span
            initial={
              reduced
                ? false
                : {
                    opacity: 0,
                    x: -18,
                  }
            }
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: reduced ? 0 : 0.75,
              delay: reduced ? 0 : 0.1,
              ease,
            }}
            className="
              block w-fit
              text-[clamp(3rem,6vw,6.5rem)]
              font-light leading-none
              tracking-[-0.09em]
              text-[#102A1E]/20
              transition-[color,transform]
              duration-500
              group-hover:-translate-y-1
              group-hover:text-brand-dark
            "
          >
            {item.number}
          </motion.span>
        </div>

        {/* Title */}

        <div className="min-w-0 lg:col-span-5">
          <h3
            className="
              text-[clamp(2.1rem,4.2vw,4.5rem)]
              font-semibold leading-[1.06]
              tracking-[-0.055em] text-ink
              transition-colors duration-500
              group-hover:text-brand-dark
            "
          >
            {item.title}
            <span className="text-brand-dark">.</span>
          </h3>

          <span
            className="
              mt-5 block h-[2px] w-8
              bg-brand-dark/40
              transition-[width,background-color]
              duration-500
              group-hover:w-20
              group-hover:bg-brand-dark
              lg:hidden
            "
          />
        </div>

        {/* Description */}

        <div className="min-w-0 lg:col-span-4">
          <p
            className="
              max-w-sm text-sm leading-8
              text-copy
              sm:text-base
            "
          >
            {item.body}
          </p>
        </div>

        {/* Direction symbol */}

        <div className="hidden lg:col-span-1 lg:flex lg:justify-end">
          <motion.div
            initial={
              reduced
                ? false
                : {
                    opacity: 0,
                    x: -12,
                  }
            }
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: reduced ? 0 : 0.6,
              delay: reduced ? 0 : 0.2,
            }}
          >
            <ArrowUpRight
              size={28}
              strokeWidth={1.3}
              aria-hidden="true"
              className="
                text-brand-dark/35
                transition-[transform,color]
                duration-500
                group-hover:translate-x-1
                group-hover:-translate-y-1
                group-hover:text-brand-dark
              "
            />
          </motion.div>
        </div>
      </div>

      {/* Small chapter identifier */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute
          bottom-3 right-0
          hidden text-[10px]
          font-semibold uppercase
          tracking-[0.18em] text-brand-dark/30
          lg:block
        "
      >
        Chapter {String(index + 1).padStart(2, "0")}
      </span>
    </motion.li>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export function ShowExperience({
  experience,
}: ShowExperienceProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const reduced = Boolean(useReducedMotion());

  const items = experience.slice(0, 4);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 28,
    mass: 0.5,
  });

  const photoY = useTransform(
    smooth,
    [0, 1],
    ["-5%", "5%"]
  );

  const photoScale = useTransform(
    smooth,
    [0, 1],
    [1.08, 1.02]
  );

  const fadeUp = (delay = 0) => ({
    initial: reduced
      ? false
      : {
          opacity: 0,
          y: 30,
        },

    whileInView: {
      opacity: 1,
      y: 0,
    },

    viewport: {
      once: true,
      amount: 0.15,
    },

    transition: {
      duration: reduced ? 0 : 0.85,
      delay: reduced ? 0 : delay,
      ease,
    },
  });

  if (!items.length) return null;

  return (
    <section
      ref={sectionRef}
      id="experience"
      aria-labelledby="experience-heading"
      className="relative isolate overflow-hidden bg-[#F6F8F5]"
    >
      {/* =================================================
          01 — SECTION INTRODUCTION
      ================================================= */}

      <div className="container-site py-20 sm:py-28 lg:pt-36 lg:pb-20">

        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">

          {/* Heading */}

          <div className="min-w-0 lg:col-span-9">

            <motion.div
              {...fadeUp()}
              className="flex items-center gap-3"
            >
              <span
                aria-hidden="true"
                className="h-[2px] w-9 bg-brand-dark"
              />

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-dark">
                The show experience
              </span>
            </motion.div>

            <h2
              id="experience-heading"
              className="
                mt-7 max-w-6xl
                text-[clamp(2.6rem,6vw,6.5rem)]
                font-light leading-[1.04]
                tracking-[-0.055em] text-ink
              "
            >
              <span className="block overflow-hidden pb-[0.08em]">

                <motion.span
                  className="block"
                  initial={
                    reduced
                      ? false
                      : {
                          opacity: 0,
                          y: "110%",
                        }
                  }
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: reduced ? 0 : 1.05,
                    ease,
                  }}
                >
                  Not just an exhibition.
                </motion.span>

              </span>

              <span className="block overflow-hidden pb-[0.09em]">

                <motion.span
                  className="block font-bold text-brand-dark"
                  initial={
                    reduced
                      ? false
                      : {
                          opacity: 0,
                          y: "110%",
                        }
                  }
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: reduced ? 0 : 1.05,
                    delay: reduced ? 0 : 0.16,
                    ease,
                  }}
                >
                  An industry in motion.
                </motion.span>

              </span>
            </h2>
          </div>

          {/* Right intro detail */}

          <motion.div
            {...fadeUp(0.2)}
            className="lg:col-span-3"
          >
            <div className="max-w-sm border-l-2 border-brand-dark/35 pl-5 lg:ml-auto">

              <p className="text-sm leading-8 text-copy">
                Experience real products, practical
                technologies and conversations across
                the electric mobility value chain.
              </p>

              <span className="mt-5 block text-[10px] font-bold uppercase tracking-[0.18em] text-brand-dark">
                IIEV Show 2027
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* =================================================
          02 — CINEMATIC FULL-WIDTH IMAGE
      ================================================= */}

      <div className="relative">

        <motion.div
          initial={
            reduced
              ? false
              : {
                  opacity: 0,
                  clipPath: "inset(7% 0% 7% 0%)",
                }
          }
          whileInView={{
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0%)",
          }}
          viewport={{
            once: true,
            amount: 0.1,
          }}
          transition={{
            duration: reduced ? 0 : 1.2,
            ease,
          }}
          className="
            relative h-[520px]
            overflow-hidden bg-brand-night
            sm:h-[650px]
            lg:h-[min(80svh,850px)]
          "
        >
          {/* Image parallax */}

          <motion.div
            className="absolute -inset-[6%]"
            style={
              reduced
                ? undefined
                : {
                    y: photoY,
                    scale: photoScale,
                  }
            }
          >
            <Image
              src="/images/DSC00730.JPG.webp"
              alt="Electric vehicles and mobility technologies on display at India International EV Show"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>

          {/* Image gradient layers */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-0
              bg-gradient-to-t
              from-brand-night/95
              via-brand-night/20
              to-brand-night/25
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-0
              bg-gradient-to-r
              from-brand-night/35
              via-transparent
              to-transparent
            "
          />

          {/* Main overlay content */}

          <div className="absolute inset-0 flex flex-col justify-between text-white">

            {/* Top metadata */}

            <div className="container-site flex flex-wrap items-start justify-between gap-4 pt-8 sm:pt-12">

              <motion.div
                {...fadeUp(0.15)}
                className="flex items-center gap-3"
              >
                <span className="h-2 w-2 rounded-full bg-brand" />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  Inside the exhibition
                </span>
              </motion.div>

              <motion.span
                {...fadeUp(0.2)}
                className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75"
              >
                Pune, India
              </motion.span>
            </div>

            {/* Cinematic headline */}

            <div className="container-site pb-9 sm:pb-14 lg:pb-20">

              <motion.div
                {...fadeUp(0.1)}
                className="mb-6 flex items-center gap-4"
              >
                <span className="h-[2px] w-12 bg-brand" />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                  The IIEV Experience
                </span>
              </motion.div>

              <h3
                className="
                  max-w-5xl
                  text-[clamp(2.7rem,6.4vw,7rem)]
                  font-light leading-[1.02]
                  tracking-[-0.055em]
                "
              >
                <span className="block overflow-hidden pb-[0.09em]">

                  <motion.span
                    className="block"
                    initial={
                      reduced
                        ? false
                        : {
                            opacity: 0,
                            y: "110%",
                          }
                    }
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: reduced ? 0 : 1,
                      ease,
                    }}
                  >
                    See what's next.
                  </motion.span>

                </span>

                <span className="block overflow-hidden pb-[0.09em]">

                  <motion.span
                    className="block font-bold text-brand"
                    initial={
                      reduced
                        ? false
                        : {
                            opacity: 0,
                            y: "110%",
                          }
                    }
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: reduced ? 0 : 1,
                      delay: reduced ? 0 : 0.15,
                      ease,
                    }}
                  >
                    Meet who builds it.
                  </motion.span>

                </span>
              </h3>

              {/* Image bottom footer */}

              <motion.div
                {...fadeUp(0.25)}
                className="
                  mt-9 flex flex-wrap
                  items-center justify-between
                  gap-5 border-t border-white/30
                  pt-5
                "
              >
                <p className="max-w-lg text-xs leading-6 text-white/75 sm:text-sm">
                  Explore products, technology and
                  opportunities on the exhibition floor.
                </p>

                <span className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.17em] text-white/90">
                  Explore the journey

                  <MoveDown
                    size={17}
                    aria-hidden="true"
                    className="text-brand"
                  />
                </span>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </div>

      {/* =================================================
          03 — EDITORIAL EXPERIENCE CHAPTERS
      ================================================= */}

      <div className="container-site py-20 sm:py-28 lg:py-36">

        {/* Chapter introduction */}

        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">

          <motion.div
            {...fadeUp()}
            className="lg:col-span-7"
          >
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-dark">
              01 — 04 / The experience
            </span>

            <h3
              className="
                mt-5 max-w-xl
                text-[clamp(2rem,3.8vw,3.8rem)]
                font-light leading-[1.13]
                tracking-[-0.04em] text-ink
              "
            >
              Four ways to experience
              <span className="font-bold text-brand-dark">
                {" "}the industry.
              </span>
            </h3>
          </motion.div>

          <motion.div
            {...fadeUp(0.15)}
            className="lg:col-span-5"
          >
            <p className="max-w-sm text-sm leading-8 text-copy lg:ml-auto">
              From discovering new solutions to
              meeting potential business partners,
              every conversation has a purpose.
            </p>
          </motion.div>
        </div>

        {/* Editorial chapters */}

        <ol className="mt-14 sm:mt-20">
          {items.map((item, index) => (
            <ExperienceChapter
              key={`${item.number}-${item.title}`}
              item={item}
              index={index}
              reduced={reduced}
            />
          ))}
        </ol>

       
      </div>
    </section>
  );
}
