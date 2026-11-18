"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Wrapper: draws the centre line (desktop) / left line (mobile).
 * A green line fills downward as the user scrolls.
 */
export function TimelineLine({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const trigger = window.innerHeight * 0.6;
      const p = (trigger - rect.top) / rect.height;
      setProgress(Math.min(1, Math.max(0, p)));
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* base line */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 top-0 left-[15px] w-px bg-[#CADBCD] md:left-1/2 md:-translate-x-1/2"
      />
      {/* progress line */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-[14.5px] w-[2px] bg-[#23A455] md:left-1/2 md:-translate-x-1/2"
        style={{ height: `${progress * 100}%` }}
      />
      {children}
    </div>
  );
}

/**
 * One timeline row. Slides in from the left or right on scroll.
 * Desktop: left items sit left of the line, right items sit right of it.
 * Mobile: everything sits to the right of the left-hand line.
 */
export function TimelineItem({
  side,
  children,
}: {
  side: "left" | "right";
  children: ReactNode;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isLeft = side === "left";

  const hidden = isLeft
    ? "opacity-0 -translate-x-12"
    : "opacity-0 translate-x-12";

  return (
    <li
      ref={ref}
      className={`relative pl-10 md:w-1/2 md:pl-0 ${
        isLeft ? "md:pr-12" : "md:ml-auto md:pl-12"
      }`}
    >
      {/* marker on the line */}
      <span
        aria-hidden="true"
        className={`
          absolute top-10 z-10 flex size-[15px] rounded-full
          border-[3px] border-[#F5F9F5] bg-[#23A455] ring-1 ring-[#23A455]/40
          transition-[transform,opacity] duration-500
          left-[8px]
          ${
            isLeft
              ? "md:left-auto md:-right-[7.5px]"
              : "md:left-[-7.5px]"
          }
          ${visible ? "scale-100 opacity-100" : "scale-0 opacity-0"}
          motion-reduce:scale-100 motion-reduce:opacity-100
        `}
      />

      <div
        className={`
          transition-[opacity,transform] duration-700 ease-out
          will-change-transform
          ${visible ? "opacity-100 translate-x-0" : hidden}
          motion-reduce:translate-x-0 motion-reduce:opacity-100
          motion-reduce:transition-none
        `}
      >
        {children}
      </div>
    </li>
  );
}