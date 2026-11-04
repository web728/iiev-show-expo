import type { Metadata } from "next";
import { PageHero, Section, CtaBand } from "@/components/ui/layout-blocks";
import { YouTubeFacade } from "@/components/sections/youtube-facade";
import { TestimonialWall } from "@/components/sections/testimonial-wall";
import { pageMetadata, absoluteUrl } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { getVideos } from "@/lib/data/public";
import { heroVideo, testimonials } from "@/content/media";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Videos — Show Floor & Exhibitor Testimonials",
  description: "Watch footage from the India International EV Show 2026 in Pune and hear exhibitors talk about their experience on the show floor.",
  path: "/videos/",
});

export default async function VideosPage() {
  const videos = await getVideos();
  const videoLd = [
    { name: "India International EV Show 2026 — show floor", description: "Footage from the 8th India International EV Show, Auto Cluster Exhibition Centre, Pune, 2–4 October 2026.", thumbnailUrl: absoluteUrl(heroVideo.poster), contentUrl: absoluteUrl(heroVideo.src), duration: "PT24S" },
    ...testimonials.map((t) => ({ name: `Exhibitor testimonial — ${t.stand} stand`, description: `Exhibitor testimonial recorded at the ${t.stand} stand, India International EV Show 2026, Pune.`, thumbnailUrl: absoluteUrl(t.poster), contentUrl: absoluteUrl(t.src) })),
  ].map((v) => ({ "@context": "https://schema.org", "@type": "VideoObject", uploadDate: "2026-10-04", ...v }));
  return (
    <>
      {videoLd.map((v) => <JsonLd key={v.contentUrl} data={v} />)}
      <PageHero image={{ src: "/media/2026/expo-scooter-stage.webp" }} eyebrow="Media" title="Videos" intro={<p>Footage from the 2026 show floor and exhibitor testimonials, recorded in Pune.</p>} crumbs={[{ label: "Media", href: "/media/" }, { label: "Videos", href: "/videos/" }]} />
      <Section eyebrow="Show floor" title="IIEV Show 2026 in 25 seconds">
        <video src={heroVideo.src} poster={heroVideo.poster} controls muted playsInline preload="none" className="aspect-video w-full rounded-3xl bg-brand-navy" />
      </Section>
      <Section tone="navy" eyebrow="Exhibitor voices" title="Testimonials from the 2026 exhibitors">
        <TestimonialWall items={testimonials} />
      </Section>
      {videos.length ? (
        <Section eyebrow="More" title="Films & highlights">
          <ul className="grid gap-8 md:grid-cols-2">
            {videos.map((v) => (
              <li key={v._id}>
                <YouTubeFacade id={v.youtubeId} title={v.title} />
                <h2 className="mt-3 font-bold text-ink">{v.title}</h2>
                {v.edition ? <p className="text-sm text-ink-muted">{v.edition}</p> : null}
                {v.description ? <p className="mt-1 text-[15px] text-ink-soft">{v.description}</p> : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
      <CtaBand title="Be on the floor in 2027" primary={{ label: "Book Your Stall", href: "/exhibit/book-a-stall/" }} secondary={{ label: "Register as Visitor", href: "/visit/register/" }} />
    </>
  );
}
