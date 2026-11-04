"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icons";

/**
 * Muted background loop of real 2026 footage. Respects reduced-motion and
 * data-saver (shows the poster instead) and pauses when off-screen.
 */
export function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    // Decide after mount so the server HTML always ships the lightweight poster.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllowed(!reduce && !saveData);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !allowed) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !paused) v.play().catch(() => undefined);
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [allowed, paused]);

  return (
    <>
      {allowed ? (
        <video ref={ref} className="absolute inset-0 h-full w-full object-cover" src={src} poster={poster} muted loop playsInline autoPlay preload="metadata" aria-hidden="true" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {allowed ? (
        <button
          type="button"
          onClick={() => {
            const v = ref.current;
            if (!v) return;
            if (v.paused) { v.play(); setPaused(false); } else { v.pause(); setPaused(true); }
          }}
          className="absolute bottom-5 right-5 z-20 inline-flex size-10 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur hover:bg-black/50"
          aria-label={paused ? "Play background video" : "Pause background video"}
        >
          {paused ? <Icon.Play className="size-5" /> : <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>}
        </button>
      ) : null}
    </>
  );
}
