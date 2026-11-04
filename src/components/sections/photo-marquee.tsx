import Image from "next/image";
import type { Photo } from "@/content/media";

/** Infinite, pause-on-hover strip of real event photos (CSS only; stops for reduced motion). */
export function PhotoMarquee({ photos, reverse = false }: { photos: Photo[]; reverse?: boolean }) {
  const row = [...photos, ...photos];
  return (
    <div className="group relative overflow-hidden" aria-label="Photos from IIEV Show 2026" role="region">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--fade,#fff)] to-transparent sm:w-32" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--fade,#fff)] to-transparent sm:w-32" aria-hidden="true" />
      <ul className={`flex w-max gap-4 group-hover:[animation-play-state:paused] ${reverse ? "animate-[marquee-rev_70s_linear_infinite]" : "animate-[marquee_70s_linear_infinite]"} motion-reduce:animate-none`}>
        {row.map((p, i) => (
          <li key={`${p.slug}-${i}`} className="relative h-44 w-64 shrink-0 overflow-hidden rounded-2xl sm:h-56 sm:w-80" aria-hidden={i >= photos.length ? true : undefined}>
            <Image src={p.src} alt={i >= photos.length ? "" : p.alt} fill sizes="320px" className="object-cover transition-transform duration-700 hover:scale-105" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8 text-xs font-semibold text-white">{p.caption}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
