"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";

const nav = [
  { href: "#about", label: "About" },
  { href: "#ecosystem", label: "Exhibitor Profiles" },
  { href: "#why-exhibit", label: "Why Exhibit" },
  { href: "#audience", label: "Visitors" },
  { href: "#experience", label: "Experience" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  return (
    <header className="sticky top-0 z-50 border-b border-stroke bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-19 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 lg:h-22 lg:px-10">
        <Link
          href="#top"
          aria-label="IIEV Show, homepage"
          className="flex shrink-0 items-center gap-2.5"
        >
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-brand text-white shadow-[0_8px_20px_-12px_#23a455]">
            <svg
              viewBox="0 0 40 40"
              fill="none"
              className="h-8 w-8"
              aria-hidden="true"
            >
              <path
                d="M9 27.5 18 9l3 12 10-9-8 19-4-10-10 6.5Z"
                fill="currentColor"
              />
              <path
                d="M9 30h22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-[20px] leading-[.95] font-black tracking-[-.065em] text-ink">
            INDIA<span className="text-brand">EV</span>
            <span className="mt-1 block text-[9px] font-extrabold tracking-[.18em] text-copy">
              INTERNATIONAL SHOW
            </span>
          </span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-6 xl:flex"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[12px] font-bold text-copy transition-colors hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-3 sm:flex xl:ml-0">
          <Link
            href="/downloads/9th_India_International_EV_Show_2027_Brochure"
            target="_blank"
            className="hidden text-[12px] font-bold text-ink hover:text-brand lg:block"
          >
            Brochure
          </Link>
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3.5 text-[12px] font-extrabold text-white transition-colors hover:bg-brand-dark"
          >
            Enquire to Exhibit <ArrowUpRight size={15} />
          </Link>
        </div>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stroke text-ink xl:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="overflow-hidden border-t border-stroke bg-white xl:hidden"
          >
            <div className="flex flex-col px-5 py-4 sm:px-8">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-stroke py-3.5 text-sm font-bold text-ink"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/downloads/9th_India_International_EV_Show_2027_Brochure"
                target="_blank"
                onClick={() => setOpen(false)}
                className="py-3.5 text-sm font-bold text-ink"
              >
                Download Brochure
              </Link>
              <Link
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-brand px-5 py-3 text-center text-sm font-bold text-white"
              >
                Enquire to Exhibit
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
