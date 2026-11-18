
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type Audience = {
  title: string;
  description: string;
};

type IndustryAudienceProps = {
  audiences: Audience[];
};

const ease = [0.22, 1, 0.36, 1] as const;

/* =========================================================
   NETWORK GEOMETRY

   Stage and SVG share 1000 x 620 coordinates.

   Important:
   - Left text ends around x = 300
   - Right text begins around x = 700
   - Curves terminate at x = 335 / 665

   Therefore SVG connections never cross text.
========================================================= */

const networkNodes = [
  {
    x: 335,
    y: 112,
    path: "M500 310 C420 290 435 125 335 112",
  },
  {
    x: 665,
    y: 112,
    path: "M500 310 C580 290 565 125 665 112",
  },
  {
    x: 335,
    y: 310,
    path: "M500 310 C440 270 400 350 335 310",
  },
  {
    x: 665,
    y: 310,
    path: "M500 310 C560 350 600 270 665 310",
  },
  {
    x: 335,
    y: 508,
    path: "M500 310 C420 330 435 495 335 508",
  },
  {
    x: 665,
    y: 508,
    path: "M500 310 C580 330 565 495 665 508",
  },
];

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 26,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease,
    },
  },
};

/* =========================================================
   SVG CONNECTIONS
========================================================= */

function NetworkConnections({
  activeIndex,
  count,
  reduced,
}: {
  activeIndex: number;
  count: number;
  reduced: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1000 620"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    >
      {/* Engineering rings */}

      <circle
        cx="500"
        cy="310"
        r="161"
        fill="none"
        stroke="#B8CDBD"
        strokeWidth="1"
        strokeDasharray="3 10"
        opacity="0.6"
      />

      <circle
        cx="500"
        cy="310"
        r="130"
        fill="none"
        stroke="#B8CDBD"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* Individually animated curves */}

      {networkNodes.slice(0, count).map((node, index) => {
        const selected = activeIndex === index;

        return (
          <g key={index}>
            {/* Base curve */}

            <path
              d={node.path}
              fill="none"
              stroke="#C5D5C8"
              strokeWidth="1.3"
              strokeLinecap="round"
            />

            {/* Animated connection draw */}

            <motion.path
              d={node.path}
              fill="none"
              stroke={
                selected
                  ? "#257D47"
                  : "#98BAA2"
              }
              strokeWidth={selected ? 2.5 : 1.3}
              strokeLinecap="round"
              initial={
                reduced
                  ? false
                  : {
                      pathLength: 0,
                      opacity: 0,
                    }
              }
              whileInView={{
                pathLength: 1,
                opacity: 1,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                pathLength: {
                  duration: reduced ? 0 : 1.3,
                  delay: reduced
                    ? 0
                    : 0.2 + index * 0.11,
                  ease,
                },
                opacity: {
                  duration: reduced ? 0 : 0.5,
                },
              }}
            />

            {/* Smooth active highlight */}

            <motion.path
              d={node.path}
              fill="none"
              stroke="#288A50"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={false}
              animate={{
                opacity: selected ? 1 : 0,
              }}
              transition={{
                duration: reduced ? 0 : 0.35,
              }}
            />

            {/* Flowing signal on active curve */}

            {selected && !reduced && (
              <motion.path
                key={`flow-${index}`}
                d={node.path}
                fill="none"
                stroke="#83D5A0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="8 24"
                initial={{
                  opacity: 0,
                  strokeDashoffset: 0,
                }}
                animate={{
                  opacity: 0.95,
                  strokeDashoffset: -128,
                }}
                transition={{
                  opacity: {
                    duration: 0.35,
                  },
                  strokeDashoffset: {
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "linear",
                  },
                }}
              />
            )}

            {/* Endpoint */}

            <motion.circle
              cx={node.x}
              cy={node.y}
              initial={false}
              animate={{
                r: selected ? 6 : 4,
                fill: selected
                  ? "#257D47"
                  : "#A6C0AB",
              }}
              transition={{
                duration: reduced ? 0 : 0.3,
              }}
            />

            {/* Active endpoint pulse */}

            {selected && !reduced && (
              <motion.circle
                cx={node.x}
                cy={node.y}
                fill="none"
                stroke="#318E56"
                strokeWidth="1.3"
                initial={{
                  r: 6,
                  opacity: 0.6,
                }}
                animate={{
                  r: 15,
                  opacity: 0,
                }}
                transition={{
                  duration: 2.1,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export function IndustryAudience({
  audiences,
}: IndustryAudienceProps) {
  const reduced = Boolean(useReducedMotion());
  const [activeIndex, setActiveIndex] = useState(0);

  const items = audiences.slice(0, 6);

  if (items.length === 0) return null;

  return (
    <section
      id="industry-audience"
      aria-labelledby="industry-audience-title"
      className="relative isolate overflow-hidden bg-[#F7F9F6] py-20 sm:py-28 lg:py-36"
    >
      {/* Background grid */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(to right, #DDE6DD 1px, transparent 1px), linear-gradient(to bottom, #DDE6DD 1px, transparent 1px)",
          backgroundSize: "110px 110px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
        }}
      />

      <div className="container-site relative z-10">

        {/* =================================================
            HEADING
        ================================================= */}

        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">

          <div className="lg:col-span-8">

            <motion.div
              variants={fadeUp}
              initial={reduced ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <span className="h-[2px] w-8 bg-brand-dark" />

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-dark">
                Who you'll meet
              </span>
            </motion.div>

            <h2
              id="industry-audience-title"
              className="mt-6 max-w-5xl text-[clamp(2.4rem,5.4vw,5.3rem)] font-light leading-[1.06] tracking-[-0.05em] text-ink"
            >
              <span className="block overflow-hidden pb-[0.09em]">
                <motion.span
                  className="block"
                  initial={
                    reduced
                      ? false
                      : { y: "110%", opacity: 0 }
                  }
                  whileInView={{
                    y: 0,
                    opacity: 1,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: reduced ? 0 : 0.95,
                    ease,
                  }}
                >
                  An entire industry.
                </motion.span>
              </span>

              <span className="block overflow-hidden pb-[0.09em]">
                <motion.span
                  className="block font-bold text-brand-dark"
                  initial={
                    reduced
                      ? false
                      : { y: "110%", opacity: 0 }
                  }
                  whileInView={{
                    y: 0,
                    opacity: 1,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: reduced ? 0 : 0.95,
                    delay: reduced ? 0 : 0.13,
                    ease,
                  }}
                >
                  One connected platform.
                </motion.span>
              </span>
            </h2>
          </div>

          <motion.div
            variants={fadeUp}
            initial={reduced ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-4"
          >
            <p className="max-w-sm text-sm leading-8 text-copy lg:ml-auto">
              From manufacturers and technology developers
              to buyers, institutions and investors.
              Explore the professional network at IIEV.
            </p>
          </motion.div>
        </div>

        {/* =================================================
            DESKTOP NETWORK
        ================================================= */}

        <div className="relative mt-16 hidden aspect-[1000/620] w-full xl:block">

          {/* SVG always behind content */}

          <NetworkConnections
            activeIndex={activeIndex}
            count={items.length}
            reduced={reduced}
          />

          {/* ===============================================
              CENTER HUB
          =============================================== */}

          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">

            <motion.div
              initial={
                reduced
                  ? false
                  : {
                      opacity: 0,
                      scale: 0.86,
                    }
              }
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{ once: true }}
              transition={{
                duration: reduced ? 0 : 1.05,
                delay: reduced ? 0 : 0.3,
                ease,
              }}
              className="relative flex h-[clamp(180px,18vw,230px)] w-[clamp(180px,18vw,230px)] flex-col items-center justify-center rounded-full bg-[#102A1E] text-center text-white shadow-[0_25px_75px_rgba(16,42,30,0.13)]"
            >
              {/* Slow rotating ring */}

              <motion.div
                aria-hidden="true"
                className="absolute -inset-[10px] rounded-full border border-dashed border-brand-dark/30"
                animate={
                  reduced
                    ? undefined
                    : { rotate: 360 }
                }
                transition={{
                  duration: 90,
                  ease: "linear",
                  repeat: Infinity,
                }}
              />

              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#99DDAE]">
                Connecting
              </span>

              <span className="mt-3 text-[3.5rem] font-bold leading-none tracking-[-0.08em]">
                IIEV
              </span>

              <span className="mt-2 text-sm font-semibold tracking-[0.12em] text-white/85">
                NETWORK
              </span>

              <motion.span
                aria-hidden="true"
                className="mt-5 h-[2px] w-10 bg-[#82D59D]"
                animate={
                  reduced
                    ? undefined
                    : {
                        scaleX: [1, 1.4, 1],
                      }
                }
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </div>

          {/* ===============================================
              TEXT NODES

              Left text: x 4% to 30%
              Right text: x 70% to 96%

              Curves end at x 33.5% and 66.5%.

              There is a visible gap between
              text and connection endpoints.
          =============================================== */}

          {items.map((audience, index) => {
            const selected = activeIndex === index;
            const leftSide = index % 2 === 0;

            const row = Math.floor(index / 2);

            const topPositions = [
              "18.06%",
              "50%",
              "81.94%",
            ];

            return (
              <motion.button
                key={audience.title}
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                initial={
                  reduced
                    ? false
                    : {
                        opacity: 0,
                        y: 18,
                      }
                }
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: reduced ? 0 : 0.7,
                  delay: reduced
                    ? 0
                    : 0.2 + index * 0.09,
                  ease,
                }}
                className={`group absolute z-30 w-[26%] -translate-y-1/2 rounded-sm bg-[#F7F9F6]/95 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-dark ${
                  leftSide
                    ? "left-[4%] text-right"
                    : "right-[4%] text-left"
                }`}
                style={{
                  top: topPositions[row],
                }}
              >
                {/* Number and small indicator */}

                <span
                  className={`mb-3 flex items-center gap-3 ${
                    leftSide
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <span
                    className={`text-xs font-bold tabular-nums transition-colors duration-300 ${
                      selected
                        ? "text-brand-dark"
                        : "text-brand-dark/50"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <motion.span
                    className="h-[2px] bg-brand-dark"
                    animate={{
                      width: selected ? 38 : 18,
                      opacity: selected ? 1 : 0.35,
                    }}
                    transition={{
                      duration: reduced ? 0 : 0.35,
                      ease,
                    }}
                  />
                </span>

                {/* Heading */}

                <span
                  className={`block text-[clamp(1rem,1.4vw,1.32rem)] font-bold leading-[1.25] tracking-[-0.035em] transition-colors duration-300 ${
                    selected
                      ? "text-brand-dark"
                      : "text-ink"
                  }`}
                >
                  {audience.title}
                </span>

                {/* Description */}

                <span className="mt-2 block text-xs leading-[1.6] text-copy">
                  {audience.description}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* =================================================
            MOBILE / TABLET
        ================================================= */}

        <div className="mt-14 xl:hidden">

          {/* Mobile center hub */}

          <motion.div
            initial={
              reduced
                ? false
                : {
                    opacity: 0,
                    scale: 0.9,
                  }
            }
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{ once: true }}
            transition={{
              duration: reduced ? 0 : 0.8,
              ease,
            }}
            className="relative mx-auto flex h-44 w-44 flex-col items-center justify-center rounded-full bg-[#102A1E] text-center text-white sm:h-52 sm:w-52"
          >
            <motion.div
              aria-hidden="true"
              className="absolute -inset-3 rounded-full border border-dashed border-brand-dark/35"
              animate={
                reduced
                  ? undefined
                  : { rotate: 360 }
              }
              transition={{
                duration: 90,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            <span className="text-[10px] uppercase tracking-[0.2em] text-[#A0DFB1]">
              The IIEV
            </span>

            <span className="mt-1 text-4xl font-bold tracking-[-0.07em] sm:text-5xl">
              Network
            </span>

            <span className="mt-3 h-[2px] w-9 bg-[#82D59D]" />
          </motion.div>

          {/* Mobile connector */}

          <motion.div
            aria-hidden="true"
            className="mx-auto mt-3 h-12 w-px origin-top bg-brand-dark/40"
            initial={
              reduced
                ? false
                : { scaleY: 0 }
            }
            whileInView={{
              scaleY: 1,
            }}
            viewport={{ once: true }}
            transition={{
              duration: reduced ? 0 : 0.6,
              ease,
            }}
          />

          {/* Mobile audience directory */}

          <div className="grid gap-x-8 sm:grid-cols-2">
            {items.map((audience, index) => (
              <motion.article
                key={audience.title}
                initial={
                  reduced
                    ? false
                    : {
                        opacity: 0,
                        y: 22,
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
                  duration: reduced ? 0 : 0.7,
                  delay: reduced
                    ? 0
                    : (index % 2) * 0.08,
                  ease,
                }}
                className="border-t border-brand-dark/20 py-7 sm:py-9"
              >
                <span className="mb-4 flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-brand-dark" />

                  <span className="text-xs font-bold text-brand-dark">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </span>

                <h3 className="text-xl font-bold leading-snug tracking-[-0.035em] text-ink">
                  {audience.title}
                </h3>

                <p className="mt-3 max-w-md text-sm leading-7 text-copy">
                  {audience.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>

        {/* =================================================
            BOTTOM CTA
        ================================================= */}

        <motion.div
          variants={fadeUp}
          initial={reduced ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 flex flex-col gap-6 border-t border-brand-dark/20 pt-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark">
              14–16 October 2027 · Pune
            </p>

            <p className="mt-3 max-w-xl text-lg font-semibold leading-7 tracking-tight text-ink sm:text-xl">
              Different industries.
              <span className="text-brand-dark">
                {" "}One connected EV ecosystem.
              </span>
            </p>
          </div>

          <Link
            href="/visit/register/"
            className="group inline-flex min-h-12 w-fit items-center gap-5 bg-brand-dark px-6 py-3 text-sm font-bold text-white transition-colors duration-300 hover:bg-brand-night focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-dark"
          >
            Meet the Industry

            <ArrowUpRight
              size={18}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
