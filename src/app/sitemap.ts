import type { MetadataRoute } from "next";
import { STATIC_ROUTES, dynamicRoutes } from "@/lib/seo/routes";
import { absoluteUrl } from "@/lib/seo/metadata";
import { photos2026, heroVideo, testimonials } from "@/content/media";
import { sectorVisual } from "@/content/sectors";

export const revalidate = 3600;

// Only canonical, indexable public routes, with image & video extensions so
// real event photography and footage can surface in Google Images / Videos.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dyn = await dynamicRoutes();
  const imagesFor: Record<string, string[]> = {
    "/": photos2026.slice(0, 12).map((p) => absoluteUrl(p.src)),
    "/gallery/": photos2026.slice(0, 6).map((p) => absoluteUrl(p.src)),
    "/gallery/iiev-2026-pune/": photos2026.map((p) => absoluteUrl(p.src)),
    "/past-editions/2026-pune/": photos2026.slice(0, 9).map((p) => absoluteUrl(p.src)),
  };
  const videos: MetadataRoute.Sitemap[number]["videos"] = [
    { title: "India International EV Show 2026 — show floor", description: "Footage from the 8th India International EV Show, Pune, 2–4 October 2026.", thumbnail_loc: absoluteUrl(heroVideo.poster), content_loc: absoluteUrl(heroVideo.src) },
    ...testimonials.map((t) => ({ title: `Exhibitor testimonial — ${t.stand} stand, IIEV Show 2026`, description: `Exhibitor testimonial recorded at the ${t.stand} stand, India International EV Show 2026, Pune.`, thumbnail_loc: absoluteUrl(t.poster), content_loc: absoluteUrl(t.src) })),
  ];
  return [
    ...STATIC_ROUTES.map((r) => ({
      url: absoluteUrl(r.path),
      changeFrequency: "weekly" as const,
      priority: r.priority ?? 0.6,
      ...(imagesFor[r.path] ? { images: imagesFor[r.path] } : {}),
      ...(r.path === "/videos/" ? { videos } : {}),
    })),
    ...dyn.map((r) => ({
      url: absoluteUrl(r.path),
      lastModified: r.lastModified ? new Date(r.lastModified) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      ...(imagesFor[r.path] ? { images: imagesFor[r.path] } : r.path.startsWith("/sectors/") ? { images: [absoluteUrl(sectorVisual(r.path.split("/")[2]).src)] } : {}),
    })),
  ];
}
