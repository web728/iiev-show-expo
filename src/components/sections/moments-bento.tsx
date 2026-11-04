import Image from "next/image";
import type { Photo } from "@/content/media";
import { Reveal } from "@/components/ui/reveal";

/** Editorial bento grid of real moments; first tile is large. */
export function MomentsBento({ photos }: { photos: Photo[] }) {
  const spans = ["md:col-span-2 md:row-span-2", "", "", "md:row-span-2", "", "md:col-span-2", ""];
  return (
    <ul className="grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] md:grid-cols-4 md:gap-4">
      {photos.slice(0, 7).map((p, i) => (
        <li key={p.slug} className={`${spans[i] ?? ""} ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
          <Reveal delay={i * 0.04} className="h-full">
            <figure className="group relative h-full overflow-hidden rounded-2xl bg-brand-navy">
              <Image src={p.src} alt={p.alt} fill sizes={i === 0 ? "(min-width:768px) 50vw, 100vw" : "(min-width:768px) 25vw, 50vw"} className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-brand)] group-hover:scale-[1.06]" />
              <figcaption className="absolute inset-x-0 bottom-0 translate-y-1 bg-gradient-to-t from-brand-navy/85 via-brand-navy/30 to-transparent px-4 pb-3 pt-10 text-sm font-semibold text-white opacity-95 transition-transform duration-500 group-hover:translate-y-0">
                {p.caption}
              </figcaption>
            </figure>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
