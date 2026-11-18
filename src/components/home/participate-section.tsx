
"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Download,
  CalendarDays,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

/* =========================================================
   ANIMATED BRAND ORBIT
   SVG is purely decorative and never blocks content.
========================================================= */

function BrandOrbit({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      className="
        pointer-events-none absolute
        -right-[190px] -top-[150px] z-0
        h-[410px] w-[410px]
        opacity-55

        sm:-right-[210px] sm:-top-[230px]
        sm:h-[650px] sm:w-[650px]

        lg:-right-[180px] lg:-top-[310px]
        lg:h-[850px] lg:w-[850px]
        lg:opacity-70
      "
      initial={
        reduced
          ? false
          : {
              opacity: 0,
              scale: 0.88,
              rotate: -8,
            }
      }
      whileInView={{
        opacity: 1,
        scale: 1,
        rotate: 0,
      }}
      viewport={{
        once: true,
        amount: 0.1,
      }}
      transition={{
        duration: reduced ? 0 : 1.4,
        ease,
      }}
    >
      <svg
        viewBox="0 0 800 800"
        fill="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient
            id="participate-orbit-gradient"
            x1="0"
            y1="0"
            x2="800"
            y2="800"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#69CB8B" stopOpacity="0.05" />
            <stop
              offset="0.5"
              stopColor="#82DDA1"
              stopOpacity="0.7"
            />
            <stop
              offset="1"
              stopColor="#FFFFFF"
              stopOpacity="0.07"
            />
          </linearGradient>
        </defs>

        {/* Fine structural rings */}

        <circle
          cx="400"
          cy="400"
          r="345"
          stroke="white"
          strokeOpacity="0.12"
          strokeWidth="1"
        />

        <circle
          cx="400"
          cy="400"
          r="290"
          stroke="white"
          strokeOpacity="0.08"
          strokeWidth="1"
        />

        <circle
          cx="400"
          cy="400"
          r="230"
          stroke="white"
          strokeOpacity="0.07"
          strokeWidth="1"
        />

        {/* Main stroke drawing */}

        <motion.circle
          cx="400"
          cy="400"
          r="345"
          stroke="url(#participate-orbit-gradient)"
          strokeWidth="2"
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
          viewport={{ once: true }}
          transition={{
            duration: reduced ? 0 : 2,
            ease,
          }}
        />

        {/* Slow animated engineering dial */}

        <motion.g
          style={{
            transformOrigin: "400px 400px",
          }}
          animate={
            reduced
              ? undefined
              : {
                  rotate: 360,
                }
          }
          transition={{
            duration: 95,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <circle
            cx="400"
            cy="400"
            r="315"
            stroke="#95E1AD"
            strokeOpacity="0.4"
            strokeWidth="1"
            strokeDasharray="2 18"
          />

          <path
            d="M400 85 A315 315 0 0 1 715 400"
            stroke="#A7E9BC"
            strokeOpacity="0.65"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <circle
            cx="400"
            cy="85"
            r="5"
            fill="#A7E9BC"
          />
        </motion.g>

        {/* Counter-rotating technical detail */}

        <motion.g
          style={{
            transformOrigin: "400px 400px",
          }}
          animate={
            reduced
              ? undefined
              : {
                  rotate: -360,
                }
          }
          transition={{
            duration: 120,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <circle
            cx="400"
            cy="400"
            r="253"
            stroke="white"
            strokeOpacity="0.22"
            strokeWidth="1"
            strokeDasharray="1 24"
          />

          <path
            d="M400 147 A253 253 0 0 0 147 400"
            stroke="#8EDAA7"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
        </motion.g>
      </svg>
    </motion.div>
  );
}

/* =========================================================
   PARTICIPATION CTA
========================================================= */

export function ParticipateSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = Boolean(useReducedMotion());

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 75,
    damping: 27,
    mass: 0.5,
  });

  const orbitY = useTransform(
    smooth,
    [0, 1],
    ["-5%", "6%"]
  );

  const enter = (delay = 0, distance = 28) => ({
    initial: reduced
      ? false
      : {
          opacity: 0,
          y: distance,
        },

    whileInView: {
      opacity: 1,
      y: 0,
    },

    viewport: {
      once: true,
      amount: 0.12,
    },

    transition: {
      duration: reduced ? 0 : 0.85,
      delay: reduced ? 0 : delay,
      ease,
    },
  });

  return (
    <section
      ref={sectionRef}
      id="participate"
      aria-labelledby="participate-title"
      className="relative isolate scroll-mt-28 overflow-hidden bg-brand-night py-24 text-white sm:py-32 lg:py-40"
    >
      {/* ==========================================
          ANIMATED SVG BACKGROUND
      ========================================== */}

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={
          reduced
            ? undefined
            : {
                y: orbitY,
              }
        }
      >
        <BrandOrbit reduced={reduced} />
      </motion.div>

      {/* Subtle background depth */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-brand-night/35 via-transparent to-transparent"
      />

      {/* ==========================================
          SECTION CONTENT
      ========================================== */}

      <div className="container-site relative z-10">

        {/* Eyebrow */}

        <motion.div
          {...enter(0)}
          className="flex items-center gap-3"
        >
          <motion.span
            aria-hidden="true"
            className="h-[2px] bg-brand"
            initial={
              reduced
                ? false
                : {
                    width: 0,
                  }
            }
            whileInView={{
              width: 32,
            }}
            viewport={{ once: true }}
            transition={{
              duration: reduced ? 0 : 0.75,
              ease,
            }}
          />

          <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
            Get involved
          </span>
        </motion.div>

        {/* ==========================================
            HEADING — MASKED LINE REVEAL
        ========================================== */}

        <h2
          id="participate-title"
          className="mt-8 max-w-5xl text-[clamp(2.4rem,6vw,6.2rem)] font-light leading-[1.03] tracking-[-0.055em]"
        >
          <span className="block overflow-hidden pb-[0.1em]">

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
              Take your place
            </motion.span>
          </span>

          <span className="block overflow-hidden pb-[0.1em]">

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
                duration: reduced ? 0 : 1.05,
                delay: reduced ? 0 : 0.16,
                ease,
              }}
            >
              in the EV conversation.
            </motion.span>
          </span>
        </h2>

        {/* Description */}

        <motion.p
          {...enter(0.22)}
          className="mt-8 max-w-xl text-base leading-8 text-white/75"
        >
          Exhibit, visit, sponsor or partner.
          Connect with the India International EV Show
          team about participating in the 2027 edition.
        </motion.p>

        {/* ==========================================
            CTA BUTTONS
        ========================================== */}

        <motion.div
          {...enter(0.32)}
          className="mt-10 flex flex-wrap items-center gap-6 sm:gap-9"
        >
          {/* Primary CTA */}

          <motion.div
            whileHover={
              reduced
                ? undefined
                : {
                    y: -3,
                  }
            }
            whileTap={
              reduced
                ? undefined
                : {
                    scale: 0.985,
                  }
            }
            transition={{
              duration: 0.25,
              ease,
            }}
          >
            <Link
              href="mailto:namit@futurextrade.com?subject=IIEV%202027%20Participation%20Enquiry"
              className="group inline-flex min-h-12 items-center gap-5 rounded-full bg-brand py-2 pl-6 pr-2 text-sm font-bold text-white transition-colors duration-300 hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Contact the team

              <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-brand-dark">
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="-rotate-45 transition-transform duration-300 group-hover:rotate-0"
                />
              </span>
            </Link>
          </motion.div>

          {/* Brochure */}

          <Link
            href="/downloads"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-11 items-center gap-3 text-sm font-bold text-white underline decoration-white/40 underline-offset-[7px] transition-colors duration-300 hover:decoration-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <Download
              size={17}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-y-1"
            />

            View brochure
          </Link>
        </motion.div>

       
 
      </div>
    </section>
  );
}
