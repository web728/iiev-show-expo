
import type { MetadataRoute } from "next";

import {
  STATIC_ROUTES,
  dynamicRoutes,
} from "@/lib/seo/routes";

import {
  absoluteUrl,
  isIndexable,
} from "@/lib/seo/metadata";

import {
  photos2026,
  heroVideo,
  testimonials,
} from "@/content/media";

import { sectorVisual } from "@/content/sectors";

/* =========================================================
   IIEV SHOW — ADVANCED XML SITEMAP

   Features:
   - Canonical public URLs only
   - Production indexing gate
   - Image sitemap metadata
   - Video sitemap metadata
   - Duplicate URL prevention
   - Removed detail-page filtering
   - Valid dynamic lastModified values
========================================================= */

export const revalidate = 3600;

type SitemapEntry = MetadataRoute.Sitemap[number];

type VideoEntry = NonNullable<SitemapEntry["videos"]>[number];

/* =========================================================
   URL NORMALIZATION
========================================================= */

function normalizePath(path: string): string {
  if (!path || path === "/") return "/";

  const pathname = path
    .split("?")[0]
    .split("#")[0];

  return `/${pathname.replace(/^\/+|\/+$/g, "")}/`;
}

/* =========================================================
   INDEXABILITY FILTER

   Explicitly excludes:
   - Application/private routes
   - Internal search
   - Removed past-edition detail pages
========================================================= */

function isPublicRoute(path: string): boolean {
  const normalized = normalizePath(path);

  const blockedPrefixes = [
    "/admin/",
    "/api/",
    "/search/",
    "/visit/badge/",
    "/_next/",
  ];

  if (
    blockedPrefixes.some((prefix) =>
      normalized.startsWith(prefix)
    )
  ) {
    return false;
  }

  // Archive overview stays indexable.
  // Individual historical detail pages were removed.
  if (
    normalized.startsWith("/past-editions/") &&
    normalized !== "/past-editions/"
  ) {
    return false;
  }

  return true;
}

/* =========================================================
   MEDIA HELPERS
========================================================= */

function imageUrls(
  paths: string[]
): string[] {
  return [
    ...new Set(
      paths
        .filter(Boolean)
        .map((src) => absoluteUrl(src))
    ),
  ];
}

function validDate(
  value: string | Date | undefined | null
): Date | undefined {
  if (!value) return undefined;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? undefined
    : date;
}

/* =========================================================
   IMAGE COLLECTIONS

   Attach images only to pages where they
   actually appear in the rendered content.
========================================================= */

const imageMap: Record<string, string[]> = {
  "/": imageUrls(
    photos2026
      .slice(0, 12)
      .map((photo) => photo.src)
  ),

  "/gallery/": imageUrls(
    photos2026
      .slice(0, 6)
      .map((photo) => photo.src)
  ),

  "/gallery/iiev-2026-pune/": imageUrls(
    photos2026.map((photo) => photo.src)
  ),

  "/videos/": imageUrls([
    heroVideo.poster,
    ...testimonials.map((item) => item.poster),
  ]),
};

/* =========================================================
   VIDEO SITEMAP

   Google-required fields:
   - title
   - description
   - thumbnail_loc

   content_loc points to the playable video file.
========================================================= */

const videoEntries: VideoEntry[] = [
  {
    title: "India International EV Show 2026 — Show Floor",

    description:
      "Footage from the 8th India International EV Show " +
      "held in Pune, India, from 2 to 4 October 2026.",

    thumbnail_loc: absoluteUrl(heroVideo.poster),

    content_loc: absoluteUrl(heroVideo.src),
  },

  ...testimonials.map(
    (testimonial): VideoEntry => ({
      title:
        `IIEV Show 2026 Exhibitor Testimonial — ` +
        `${testimonial.stand} Stand`,

      description:
        `Exhibitor testimonial recorded at the ` +
        `${testimonial.stand} stand during ` +
        `India International EV Show 2026 in Pune.`,

      thumbnail_loc: absoluteUrl(
        testimonial.poster
      ),

      content_loc: absoluteUrl(
        testimonial.src
      ),
    })
  ),
];

/* =========================================================
   PAGE MEDIA LOOKUP
========================================================= */

function getImages(path: string): string[] {
  const normalized = normalizePath(path);

  if (imageMap[normalized]) {
    return imageMap[normalized];
  }

  if (normalized.startsWith("/sectors/")) {
    const slug = normalized
      .split("/")
      .filter(Boolean)[1];

    if (slug) {
      const visual = sectorVisual(slug);

      if (visual?.src) {
        return imageUrls([visual.src]);
      }
    }
  }

  return [];
}

function getVideos(path: string): VideoEntry[] {
  const normalized = normalizePath(path);

  // Attach these entries only if the videos
  // are embedded on this public page.
  if (normalized === "/videos/") {
    return videoEntries;
  }

  return [];
}

/* =========================================================
   SITEMAP GENERATION
========================================================= */

export default async function sitemap():
  Promise<MetadataRoute.Sitemap> {

  // Respect the existing production indexing gate.
  if (!isIndexable()) {
    return [];
  }

  const dynamic = await dynamicRoutes();

  const sitemapEntries = new Map<
    string,
    SitemapEntry
  >();

  /* ===============================================
     STATIC ROUTES
  =============================================== */

  for (const route of STATIC_ROUTES) {
    const path = normalizePath(route.path);

    if (!isPublicRoute(path)) {
      continue;
    }

    const images = getImages(path);
    const videos = getVideos(path);

    const entry: SitemapEntry = {
      url: absoluteUrl(path),

      changeFrequency: "weekly",

      priority: route.priority ?? 0.6,

      ...(images.length
        ? { images }
        : {}),

      ...(videos.length
        ? { videos }
        : {}),
    };

    sitemapEntries.set(path, entry);
  }

  /* ===============================================
     DYNAMIC ROUTES
  =============================================== */

  for (const route of dynamic) {
    const path = normalizePath(route.path);

    if (!isPublicRoute(path)) {
      continue;
    }

    // Static canonical entries take precedence.
    if (sitemapEntries.has(path)) {
      continue;
    }

    const images = getImages(path);
    const videos = getVideos(path);
    const lastModified = validDate(
      route.lastModified
    );

    const entry: SitemapEntry = {
      url: absoluteUrl(path),

      changeFrequency: "monthly",

      priority: 0.5,

      ...(lastModified
        ? { lastModified }
        : {}),

      ...(images.length
        ? { images }
        : {}),

      ...(videos.length
        ? { videos }
        : {}),
    };

    sitemapEntries.set(path, entry);
  }

  return Array.from(
    sitemapEntries.values()
  );
}
