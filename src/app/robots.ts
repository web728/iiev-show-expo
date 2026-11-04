import type { MetadataRoute } from "next";
import { isIndexable, absoluteUrl } from "@/lib/seo/metadata";

// Production (with explicit ALLOW_INDEXING=true launch gate) allows crawling of
// public pages; every other environment disallows everything.
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/visit/badge/", "/search/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
