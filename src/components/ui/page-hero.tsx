
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Home } from "lucide-react";

type Crumb = {
  label: string;
  href?: string;
};

type PageHeroProps = {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  image: string;
  imagePosition?: string;
  crumbs?: Crumb[];
};

const ease = [0.22, 1, 0.36, 1] as const;

export function PageHero({
  eyebrow,
  title,
  highlight,
  description,
  image,
  imagePosition = "center",
  crumbs = [],
}: PageHeroProps) {
  const reduceMotion = useReducedMotion();

  const reveal = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduceMotion ? 0 : 0.65,
      delay: reduceMotion ? 0 : delay,
      ease,
    },
  });

  return (
    <section
      className="
        relative isolate flex min-h-[350px]
        items-center overflow-hidden
        bg-[#091B13] text-white
        sm:min-h-[390px]
        lg:min-h-[430px]
      "
      aria-labelledby="page-heading"
    >
      {/* Background photograph */}
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        style={{ objectPosition: imagePosition }}
        className="pointer-events-none -z-30 object-cover"
      />

      {/* Strong dark overlay */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-20
          bg-[linear-gradient(90deg,rgba(9,27,19,.94)_0%,rgba(9,27,19,.84)_52%,rgba(9,27,19,.65)_100%)]
        "
      />

      {/* Animated geometric SVG */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <motion.svg
          viewBox="0 0 650 650"
          fill="none"
          className="
            absolute -right-44 top-1/2
            h-[530px] w-[530px]
            -translate-y-1/2 opacity-70
            lg:-right-20 lg:h-[650px] lg:w-[650px]
          "
          animate={
            reduceMotion ? undefined : { rotate: 360 }
          }
          transition={{
            duration: 110,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <circle
            cx="325"
            cy="325"
            r="285"
            stroke="#23A455"
            strokeOpacity=".28"
          />
          <circle
            cx="325"
            cy="325"
            r="225"
            stroke="white"
            strokeOpacity=".13"
          />
          <circle
            cx="325"
            cy="325"
            r="165"
            stroke="#23A455"
            strokeOpacity=".25"
            strokeDasharray="5 13"
          />
          <path
            d="M325 40V100M325 550V610M40 325H100M550 325H610"
            stroke="#23A455"
            strokeOpacity=".45"
            strokeWidth="2"
          />
          <circle cx="325" cy="40" r="5" fill="#23A455" />
          <circle cx="610" cy="325" r="4" fill="#23A455" />
        </motion.svg>

        {/* Minimal horizontal details */}
        <svg
          viewBox="0 0 440 90"
          fill="none"
          className="absolute bottom-0 left-0 w-[360px] opacity-30 sm:w-[440px]"
        >
          <path
            d="M0 89H200L245 44H390"
            stroke="#23A455"
            strokeWidth="1.5"
          />
          <circle cx="390" cy="44" r="4" fill="#23A455" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Breadcrumb */}
          <motion.nav
            {...reveal(0)}
            aria-label="Breadcrumb"
            className="mb-7 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-white/60 sm:text-xs"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Home size={13} aria-hidden="true" />
              Home
            </Link>

            {crumbs.map((crumb, index) => (
              <span
                key={`${crumb.label}-${index}`}
                className="inline-flex items-center gap-2"
              >
                <span aria-hidden="true" className="text-[#23A455]">
                  /
                </span>
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-white"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    aria-current="page"
                    className="text-white/90"
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </motion.nav>

          {/* Eyebrow */}
          <motion.div
            {...reveal(0.06)}
            className="mb-5 flex items-center justify-center gap-3"
          >
            <span className="h-px w-8 bg-[#23A455]" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/80 sm:text-[11px]">
              {eyebrow}
            </span>
            <span className="h-px w-8 bg-[#23A455]" />
          </motion.div>

          {/* Page heading */}
          <motion.h1
            {...reveal(0.12)}
            id="page-heading"
            className="
              mx-auto max-w-4xl
              text-[clamp(2.3rem,5vw,4.6rem)]
              font-extrabold leading-[1.1]
              tracking-[-0.055em]
              text-balance
            "
          >
            {title}
            {highlight && (
              <>
                {" "}
                <span className="text-[#23A455]">
                  {highlight}
                </span>
              </>
            )}
          </motion.h1>

          {description && (
            <motion.p
              {...reveal(0.2)}
              className="
                mx-auto mt-5 max-w-[680px]
                text-[13px] leading-7
                text-white/75
                sm:text-[15px] sm:leading-8
              "
            >
              {description}
            </motion.p>
          )}

          {/* Small bottom indicator */}
          <motion.div
            {...reveal(0.28)}
            className="mt-7 flex justify-center"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-[#23A455]">
              <ArrowRight
                size={16}
                strokeWidth={1.8}
                className="rotate-90"
                aria-hidden="true"
              />
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
