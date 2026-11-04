import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const isIndexable = () =>
  process.env.SITE_ENV === "production" && process.env.ALLOW_INDEXING === "true";

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Per-page metadata: unique title/description, canonical, OG/Twitter.
 * Staging and any non-approved environment are always noindex.
 */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(opts.path);
  const index = isIndexable() && !opts.noindex;
  const image = opts.image ? absoluteUrl(opts.image) : absoluteUrl("/opengraph-image");
  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    alternates: { canonical: url },
    robots: index ? { index: true, follow: true } : { index: false, follow: false, nocache: true },
    openGraph: {
      type: opts.type ?? "website",
      url,
      siteName: `${siteConfig.name} (${siteConfig.shortName})`,
      title: opts.title,
      description: opts.description,
      locale: siteConfig.locale,
      images: [{ url: image, width: 1200, height: 630, alt: siteConfig.name }],
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
      ...(opts.modifiedTime ? { modifiedTime: opts.modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description, images: [image] },
  };
}
