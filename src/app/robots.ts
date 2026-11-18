
import type { MetadataRoute } from "next";

import {
  absoluteUrl,
  isIndexable,
} from "@/lib/seo/metadata";

/* =========================================================
   IIEV SHOW — ADVANCED ROBOTS.TXT

   Production:
   - Crawl public pages
   - Restrict internal application routes
   - Declare canonical sitemap

   Development / blocked environments:
   - Disallow crawling
========================================================= */

export default function robots(): MetadataRoute.Robots {
  /* ===============================================
     NON-PRODUCTION / INDEXING DISABLED
  =============================================== */

  if (!isIndexable()) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

  /* ===============================================
     PUBLIC PRODUCTION WEBSITE
  =============================================== */

  return {
    rules: [
      {
        userAgent: "*",

        allow: "/",

        disallow: [
          "/admin/",
          "/api/",
          "/search/",
          "/visit/badge/",
        ],
      },
    ],

    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
