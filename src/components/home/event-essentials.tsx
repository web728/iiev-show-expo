
"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  ArrowUpRight,
  MapPin,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const essentials = [
  {
    number: "01",
    category: "Event dates",
    question: "When is India International EV Show 2027?",
    answer:
      "India International EV Show (IIEV Show) 2027 takes place from 14 to 16 October 2027.",
  },
  {
    number: "02",
    category: "Exhibition venue",
    question: "Where is IIEV Show 2027 being held?",
    answer:
      "The event will be held at Auto Cluster Exhibition Centre in Pimpri-Chinchwad, Pune, Maharashtra, India.",
  },
  {
    number: "03",
    category: "Who should attend",
    question: "Who should attend IIEV Show 2027?",
    answer:
      "EV manufacturers, component suppliers, charging infrastructure companies, fleet operators, dealers, distributors, technology providers and mobility professionals.",
  },
];

const reveal: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
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

export function EventEssentials() {
  const reduced = Boolean(useReducedMotion());

  const enter = (
    delay = 0,
    distance = 24
  ) => ({
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
      amount: 0.15,
    },
    transition: {
      duration: reduced ? 0 : 0.85,
      delay: reduced ? 0 : delay,
      ease,
    },
  });

  return (
    <section
      id="event-essentials"
      aria-labelledby="essentials-heading"
      className="relative isolate overflow-hidden bg-white py-20 sm:py-28 lg:py-36"
    >
      {/* Subtle editorial section marker */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#102A1E]/10"
      />

      <div className="container-site">
        {/* ==========================================
            SECTION INTRO
        ========================================== */}

        <div className="mb-12 flex flex-wrap items-center justify-between gap-4 sm:mb-16">
          <motion.div
            {...enter()}
            className="flex items-center gap-3"
          >
            <span className="h-[2px] w-9 bg-brand-dark" />

            <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-dark">
              Event essentials
            </span>
          </motion.div>

          <motion.span
            {...enter(0.1)}
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-copy/70"
          >
            IIEV / Visitor Information
          </motion.span>
        </div>

        {/* ==========================================
            EDITORIAL SPLIT LAYOUT
        ========================================== */}

        <div className="grid min-w-0 gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-20">

          {/* ======================================
              LEFT — EVENT IDENTITY PANEL
          ====================================== */}

          <div className="min-w-0 lg:col-span-5">
            <div className="lg:sticky lg:top-28">

              <motion.div
                initial={
                  reduced
                    ? false
                    : {
                        opacity: 0,
                        clipPath: "inset(0 0 12% 0)",
                      }
                }
                whileInView={{
                  opacity: 1,
                  clipPath: "inset(0 0 0% 0)",
                }}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  duration: reduced ? 0 : 1.05,
                  ease,
                }}
                className="relative isolate overflow-hidden bg-[#102A1E] p-6 text-white sm:p-9 lg:p-10 xl:p-12"
              >
                {/* Fine architectural line */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute right-[17%] top-0 h-full w-px bg-white/[0.07]"
                />

                {/* Technical corner artwork */}
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10"
                  animate={
                    reduced
                      ? undefined
                      : {
                          rotate: [0, 12, 0],
                          scale: [1, 1.035, 1],
                        }
                  }
                  transition={{
                    duration: 24,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10"
                />

                {/* Panel header */}
                <motion.div
                  {...enter(0.1)}
                  className="relative flex items-center justify-between gap-3"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1DDAF]">
                    India International EV Show
                  </span>

                  <ArrowUpRight
                    size={19}
                    strokeWidth={1.5}
                    className="shrink-0 text-[#A1DDAF]"
                    aria-hidden="true"
                  />
                </motion.div>

                {/* Edition label */}
                <motion.div
                  {...enter(0.18)}
                  className="relative mt-12 sm:mt-16"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.19em] text-white/55">
                    9th Edition
                  </span>
                </motion.div>

                {/* Oversized date */}
                <div className="relative mt-4 overflow-hidden pb-2">
                  <motion.div
                    initial={
                      reduced
                        ? false
                        : {
                            y: "105%",
                            opacity: 0,
                          }
                    }
                    whileInView={{
                      y: "0%",
                      opacity: 1,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: reduced ? 0 : 1.1,
                      delay: reduced ? 0 : 0.2,
                      ease,
                    }}
                    className="whitespace-nowrap text-[clamp(4.1rem,10vw,7.8rem)] font-bold leading-[0.95] tracking-[-0.09em] text-white lg:text-[clamp(3.5rem,6.3vw,7rem)]"
                  >
                    14<span className="text-[#80D49A]">—</span>16
                  </motion.div>
                </div>

                {/* Month and year */}
                <motion.div
                  {...enter(0.35)}
                  className="relative mt-4 flex items-center gap-3"
                >
                  <span className="h-[2px] w-8 bg-[#80D49A]" />

                  <span className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                    October 2027
                  </span>
                </motion.div>

                {/* Event facts */}
                <motion.div
                  {...enter(0.45)}
                  className="relative mt-12 border-t border-white/20 pt-7"
                >
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      strokeWidth={1.6}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-[#91DCAB]"
                    />

                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
                        Event location
                      </span>

                      <p className="mt-2 text-sm font-semibold leading-7 text-white">
                        Auto Cluster Exhibition Centre
                      </p>

                      <p className="text-xs leading-6 text-white/65">
                        Pimpri-Chinchwad, Pune, India
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Bottom signature */}
                <div className="relative mt-10 flex items-center justify-between border-t border-white/15 pt-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                    IIEV 2027
                  </span>

                  <CalendarDays
                    size={17}
                    strokeWidth={1.5}
                    className="text-[#91DCAB]"
                    aria-hidden="true"
                  />
                </div>
              </motion.div>

              {/* Small strip below */}
              <motion.div
                {...enter(0.35)}
                className="flex items-center justify-between border-b border-[#102A1E]/15 py-5"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-brand-dark">
                  03 essential answers
                </span>

                <span className="text-xs font-semibold text-copy">
                  Visitor guide / 2027
                </span>
              </motion.div>
            </div>
          </div>

          {/* ======================================
              RIGHT — QUESTIONS & ANSWERS
          ====================================== */}

          <div className="min-w-0 lg:col-span-7">
            {/* Main section heading */}
            <motion.div
              variants={reveal}
              initial={reduced ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2
                id="essentials-heading"
                className="text-[clamp(2.4rem,4.5vw,4.8rem)] font-light leading-[1.07] tracking-[-0.05em] text-ink"
              >
                Everything you
                <span className="block font-bold text-brand-dark">
                  need to know.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-8 text-copy sm:text-base">
                Planning to attend India International EV
                Show 2027? Here are the essential event
                details to help you prepare your visit.
              </p>
            </motion.div>

            {/* ==================================
                QUESTIONS
            ================================== */}

            <div className="mt-12 sm:mt-16">
              {essentials.map((item, index) => (
                <motion.article
                  key={item.number}
                  initial={
                    reduced
                      ? false
                      : {
                          opacity: 0,
                          y: 25,
                        }
                  }
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: reduced ? 0 : 0.75,
                    delay: reduced ? 0 : index * 0.09,
                    ease,
                  }}
                  className="group relative"
                >
                  {/* Animated divider */}
                  <motion.div
                    aria-hidden="true"
                    className="h-px w-full origin-left bg-brand-dark/20"
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
                      duration: reduced ? 0 : 0.9,
                      delay: reduced
                        ? 0
                        : index * 0.1,
                      ease,
                    }}
                  />

                  <div className="grid gap-4 py-8 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-6 sm:py-10">

                    {/* Number */}
                    <span className="text-xs font-bold tabular-nums tracking-[0.12em] text-brand-dark">
                      {item.number}
                    </span>

                    {/* Answer content */}
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-dark/65">
                        {item.category}
                      </p>

                      <h3 className="mt-4 max-w-xl text-[clamp(1.3rem,2.1vw,1.8rem)] font-semibold leading-[1.3] tracking-[-0.03em] text-ink transition-colors duration-300 group-hover:text-brand-dark">
                        {item.question}
                      </h3>

                      <p className="mt-4 max-w-lg text-sm leading-8 text-copy sm:text-base">
                        {item.answer}
                      </p>

                      {/* Restrained detail accent */}
                      <span
                        aria-hidden="true"
                        className="mt-6 block h-[2px] w-7 bg-brand-dark/30 transition-[width,background-color] duration-500 group-hover:w-14 group-hover:bg-brand-dark"
                      />
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* ==================================
                VISITOR ACTION
            ================================== */}

            <motion.div
              {...enter(0.15)}
              className="mt-7 border-t border-brand-dark/20 pt-8"
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-lg font-semibold tracking-tight text-ink">
                    Ready to experience IIEV?
                  </p>

                  <p className="mt-2 text-sm leading-7 text-copy">
                    Plan your visit to Pune for
                    14–16 October 2027.
                  </p>
                </div>

                <Link
                  href="/visit/register/"
                  className="group inline-flex min-h-12 w-fit shrink-0 items-center gap-4 bg-brand-dark px-6 py-3 text-sm font-bold text-white transition-colors duration-300 hover:bg-brand-night focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-dark"
                >
                  Register to Visit

                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
