
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Arc } from "@/components/home/motion-kit";

/* ==========================================
   ANIMATION CONFIG
========================================== */

const ease = [0.22, 1, 0.36, 1] as const;

const facts = [
  {
    label: "Venue",
    value: "Auto Cluster Exhibition Centre, Pune",
  },
  {
    label: "Organised by",
    value: "Futurex Group",
  },
];

const textReveal: Variants = {
  hidden: {
    y: "105%",
    opacity: 0,
  },
  visible: {
    y: "0%",
    opacity: 1,
    transition: {
      duration: 1.05,
      ease,
    },
  },
};

const characterReveal: Variants = {
  hidden: {
    y: "110%",
    opacity: 0,
  },
  visible: {
    y: "0%",
    opacity: 1,
    transition: {
      duration: 0.85,
      ease,
    },
  },
};

/* ==========================================
   COMPONENT
========================================== */

export function CompactHero() {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const reduced = Boolean(reducedMotion);

  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  /* ==========================================
     SCROLL PARALLAX
  ========================================== */

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.35,
  });

  const mediaY = useTransform(
    smooth,
    [0, 1],
    ["0%", "10%"]
  );

  const mediaScale = useTransform(
    smooth,
    [0, 1],
    [1, 1.045]
  );

  const copyOpacity = useTransform(
    smooth,
    [0, 0.7],
    [1, 0]
  );

  const copyY = useTransform(
    smooth,
    [0, 1],
    [0, -35]
  );

  /* ==========================================
     ANIMATION HELPERS
  ========================================== */

  const fade = (delay: number) => ({
    initial: reduced
      ? false
      : {
          opacity: 0,
          y: 22,
        },

    animate: {
      opacity: 1,
      y: 0,
    },

    transition: {
      duration: 0.85,
      delay: reduced ? 0 : delay,
      ease,
    },
  });

  return (
    <section
      ref={ref}
      id="home-hero"
      aria-labelledby="home-hero-title"
      className="relative isolate flex min-h-[86svh] flex-col justify-end overflow-hidden bg-brand-night text-white"
    >
      {/* ==========================================
          BACKGROUND VIDEO + IMAGE
      ========================================== */}

      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-20 scale-110 overflow-hidden"
        style={
          reduced
            ? undefined
            : {
                y: mediaY,
                scale: mediaScale,
              }
        }
      >
        {/* Image remains visible while video loads */}

        <motion.div
          className="absolute inset-0"
          initial={
            reduced
              ? false
              : {
                  opacity: 0.55,
                  scale: 1.065,
                }
          }
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: reduced ? 0 : 1.8,
            ease,
          }}
        >
          <Image
            src="/images/DSC00730.JPG.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>

        {/* Actual IIEV footage */}

        {!reduced && !videoFailed && (
          <video
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-out ${
              videoReady
                ? "opacity-100"
                : "opacity-0"
            }`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/DSC00730.JPG.webp"
            onPlaying={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
          >
            <source
              src="/video/iiev-hero.mp4"
              type="video/mp4"
            />

            <source
              src="/video/hero-bg.webm"
              type="video/webm"
            />
          </video>
        )}
      </motion.div>

      {/* ==========================================
          ORIGINAL GRADIENTS — PRESERVED
      ========================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-brand-deep/30 mix-blend-multiply"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-brand-night/90 via-brand-night/55 to-brand-night/20"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-brand-night via-transparent to-brand-night/40"
      />

      {/* ==========================================
          ORIGINAL ARC SVG — ANIMATED
      ========================================== */}

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[16%] -top-[34%] -z-10 aspect-square w-[min(66vw,780px)]"
        initial={
          reduced
            ? false
            : {
                opacity: 0,
                scale: 0.94,
                rotate: -7,
              }
        }
        animate={{
          opacity: 1,
          scale: 1,
          rotate: 0,
        }}
        transition={{
          duration: reduced ? 0 : 1.8,
          delay: reduced ? 0 : 0.2,
          ease,
        }}
      >
        <motion.div
          className="h-full w-full"
          animate={
            reduced
              ? undefined
              : {
                  y: [0, -12, 0],
                  rotate: [0, 1.5, 0],
                }
          }
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Arc
            opacity={0.95}
            className="h-full w-full"
          />
        </motion.div>
      </motion.div>

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <motion.div
        className="relative mx-auto w-full max-w-7xl px-5 pb-8 pt-36 sm:px-8 lg:px-10"
        style={
          reduced
            ? undefined
            : {
                opacity: copyOpacity,
                y: copyY,
              }
        }
      >
        <div className="grid items-end gap-10 lg:grid-cols-12">

          {/* ======================================
              LEFT CONTENT
          ====================================== */}

          <div className="lg:col-span-8">

            {/* EVENT LABEL */}

            <motion.p
              {...fade(0.12)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/90"
            >
              <motion.svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 text-[#F9C900]"
                fill="currentColor"
                initial={
                  reduced
                    ? false
                    : {
                        opacity: 0,
                        scale: 0.65,
                      }
                }
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.6,
                  delay: reduced ? 0 : 0.35,
                  ease,
                }}
              >
                <path d="M14.2 1.5 4.5 14.1h6.1L8.9 22.5l10.6-13.2h-6.3z" />
              </motion.svg>

              9th India International EV Show
            </motion.p>

            {/* ======================================
                ORIGINAL HEADING
                LINE-BY-LINE REVEAL
            ====================================== */}

            <h1
              id="home-hero-title"
              className="mt-5 max-w-3xl text-[clamp(2.6rem,6.2vw,5.4rem)] font-light leading-[1.03] tracking-[-0.035em] [text-shadow:0_2px_30px_rgba(0,20,51,0.35)]"
            >
              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block"
                  variants={textReveal}
                  initial={reduced ? false : "hidden"}
                  animate="visible"
                  transition={{
                    delay: 0.2,
                  }}
                >
                  Where electric mobility
                </motion.span>
              </span>

              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block font-bold text-brand"
                  initial={
                    reduced
                      ? false
                      : {
                          y: "105%",
                          opacity: 0,
                        }
                  }
                  animate={{
                    y: "0%",
                    opacity: 1,
                  }}
                  transition={{
                    duration: 1.05,
                    delay: reduced ? 0 : 0.38,
                    ease,
                  }}
                >
                  meets business.
                </motion.span>
              </span>
            </h1>

            {/* DESCRIPTION */}

            <motion.p
              {...fade(0.75)}
              className="mt-6 max-w-md text-sm leading-7 text-white/80 sm:text-base sm:leading-8"
            >
              Vehicles, components, charging and
              technology, with the people who build them.
            </motion.p>

            {/* ======================================
                BUTTONS
            ====================================== */}

            <motion.div
              {...fade(0.92)}
              className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4"
            >
              {/* PRIMARY CTA */}

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
                  href="/exhibit/book-a-stall/"
                  className="group inline-flex min-h-12 items-center gap-4 rounded-full bg-brand py-2 pl-6 pr-2 text-sm font-bold text-white transition duration-300 hover:bg-brand-dark active:scale-[0.98] focus-visible:outline-offset-4"
                >
                  Book Your Exhibition Space

                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-brand-dark transition-transform duration-300 group-hover:scale-105">
                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                      className="-rotate-45 transition-transform duration-300 group-hover:rotate-0"
                    />
                  </span>
                </Link>
              </motion.div>

              {/* SECONDARY CTA */}

              <Link
                href="/visit/register/"
                className="group inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white underline decoration-white/40 underline-offset-[6px] transition-colors duration-300 hover:decoration-brand focus-visible:outline-offset-4"
              >
                Register as a Visitor

                <ArrowRight
                  size={15}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
          </div>

          {/* ======================================
              RIGHT DATE
          ====================================== */}

          <div className="lg:col-span-4 lg:text-right">

            {/* Character stagger container */}

            <div className="overflow-hidden pb-3">
              <motion.div
                className="flex whitespace-nowrap text-[clamp(4.5rem,11vw,9rem)] font-bold leading-[0.9] tracking-[-0.06em] lg:justify-end"
                initial={
                  reduced ? false : "hidden"
                }
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      delayChildren: 0.45,
                      staggerChildren: 0.075,
                    },
                  },
                }}
                aria-label="14 to 16"
              >
                {Array.from("14–16").map(
                  (char, index) => (
                    <span
                      key={`${char}-${index}`}
                      className="inline-block overflow-hidden"
                      aria-hidden="true"
                    >
                      <motion.span
                        className="inline-block"
                        variants={characterReveal}
                      >
                        {char}
                      </motion.span>
                    </span>
                  )
                )}
              </motion.div>
            </div>

            <motion.p
              {...fade(0.95)}
              className="mt-3 text-lg font-semibold sm:text-xl"
            >
              October 2027
            </motion.p>
          </div>
        </div>

        {/* ======================================
            EVENT FACTS
        ====================================== */}

        <motion.dl
          initial={
            reduced
              ? false
              : {
                  opacity: 0,
                  y: 22,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.9,
            delay: reduced ? 0 : 1.1,
            ease,
          }}
          className="mt-10 grid border-t border-white/25 sm:grid-cols-2 lg:max-w-xl"
        >
          {facts.map((fact, index) => (
            <motion.div
              key={fact.label}
              initial={
                reduced
                  ? false
                  : {
                      opacity: 0,
                      y: 12,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: reduced
                  ? 0
                  : 1.2 + index * 0.12,
                ease,
              }}
              className="py-4 sm:pr-6"
            >
              <dt className="text-xs text-white/60">
                {fact.label}
              </dt>

              <dd className="mt-1 text-sm font-semibold">
                {fact.value}
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </motion.div>
    </section>
  );
}
