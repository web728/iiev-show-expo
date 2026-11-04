import { LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { ChevronStripes } from "@/components/ui/motifs";
import type { CurrentEdition } from "@/lib/data/edition";
import { heroVideo } from "@/content/media";
import { HeroVideo } from "./hero-video";
import { Countdown } from "./countdown";

export function HomeHero({ edition }: { edition: CurrentEdition }) {
  const v = edition.venue;
  return (
    <section className="relative isolate flex min-h-[min(calc(100svh-72px),52rem)] items-end overflow-hidden bg-brand-navy text-white lg:min-h-[min(calc(100svh-80px),56rem)]">
      <HeroVideo src={heroVideo.src} poster={heroVideo.poster} />
      {/* Brand-tinted overlays keep text legible on any frame */}
      <div className="absolute inset-0 -z-0 bg-gradient-to-t from-brand-navy via-brand-navy/70 to-brand-navy/30" aria-hidden="true" />
      <div className="absolute inset-0 -z-0 bg-gradient-to-r from-brand-navy/90 via-brand-navy/40 to-transparent" aria-hidden="true" />
      <ChevronStripes className="pointer-events-none absolute -bottom-2 right-0 z-10 hidden h-40 w-28 opacity-90 md:block" />

      <div className="container-site relative z-10 pb-12 pt-24 sm:pb-16 lg:pb-20">
        <div className="max-w-3xl animate-[hero-rise_.9s_var(--ease-brand)_both]">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-brand-yellow backdrop-blur-sm">
            <span className="inline-flex size-2 rounded-full bg-brand-yellow" aria-hidden="true" />
            {edition.editionLabel} · {edition.dateLabel}
          </p>
          <h1 className="mt-5 text-[2.6rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            India International <span className="text-brand-yellow">EV&nbsp;Show</span> {edition.year}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-xl">
            The business exhibition and conference for electric vehicles, batteries, charging and EV components — three days in Pune.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/75 sm:text-base">
            <Icon.MapPin className="size-4.5 text-brand-yellow" /> {v.name}, {v.locality}, {v.city}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/exhibit/book-a-stall/" variant="primary" size="lg" arrow>Book Your Stall</LinkButton>
            <LinkButton href="/visit/register/" variant="secondary" size="lg">Register as Visitor — get your badge</LinkButton>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <Countdown target={`${edition.startDate}T10:00:00+05:30`} />
          <a href="/api/calendar/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/85 underline-offset-4 hover:text-brand-yellow hover:underline">
            <Icon.Calendar className="size-4.5" /> Add to calendar
          </a>
        </div>
      </div>
    </section>
  );
}
