"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icons";
import type { Testimonial } from "@/content/media";

/** Real exhibitor video testimonials from 2026. Video loads only on click. */
export function TestimonialWall({ items }: { items: Testimonial[] }) {
  const [open, setOpen] = useState<Testimonial | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "Tab") {
        // Keep focus inside the dialog (close button ↔ video controls).
        const nodes = [...document.querySelectorAll<HTMLElement>("[data-testimonial-dialog] button, [data-testimonial-dialog] video")];
        if (!nodes.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      lastTrigger.current?.focus();
    };
  }, [open]);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {items.map((t) => (
          <li key={t.code}>
            <button
              type="button"
              onClick={(e) => { lastTrigger.current = e.currentTarget; setOpen(t); }}
              className="group relative block aspect-[4/5] w-full overflow-hidden rounded-xl bg-brand-navy text-left focus-visible:outline-offset-4 sm:aspect-video"
            >
              <Image src={t.poster} alt="" fill sizes="(min-width:1024px) 33vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              <span className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 to-transparent" />
              <span className="absolute left-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-brand-yellow text-brand-navy shadow-md sm:left-4 sm:top-4 sm:size-11" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="ml-0.5 size-5" fill="currentColor"><path d="M7 4.5v15l12-7.5z" /></svg>
              </span>
              <span className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-brand-yellow">Play · Exhibitor, 2026</span>
                <span className="mt-0.5 block text-sm font-bold leading-snug text-white sm:text-base">At the {t.stand} stand</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {open ? (
        <div data-testimonial-dialog role="dialog" aria-modal="true" aria-label={`Testimonial at the ${open.stand} stand`} className="fixed inset-0 z-[90] flex items-center justify-center bg-brand-navy/90 p-4 backdrop-blur" onClick={() => setOpen(null)}>
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button ref={closeRef} type="button" onClick={() => setOpen(null)} className="absolute -top-12 right-0 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Close video">
              <Icon.Close className="size-6" />
            </button>
            <video src={open.src} poster={open.poster} controls autoPlay playsInline className="aspect-video w-full rounded-2xl bg-black" />
            <p className="mt-3 text-sm text-white/80">Exhibitor testimonial recorded at the {open.stand} stand, India International EV Show 2026, Pune.</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
