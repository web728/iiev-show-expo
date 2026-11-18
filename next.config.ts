
import type { NextConfig } from "next";
import { legacyRedirects } from "./src/config/redirects";

/* =========================================================
   IIEV SHOW — NEXT.JS CONFIGURATION
========================================================= */

const isProd = process.env.NODE_ENV === "production";

/* =========================================================
   CONTENT SECURITY POLICY
========================================================= */

const csp = [
  "default-src 'self'",

  [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    ...(isProd ? [] : ["'unsafe-eval'"]),
    "https://www.googletagmanager.com",
    "https://www.google.com/recaptcha/",
    "https://www.gstatic.com/recaptcha/",
    "https://www.recaptcha.net/recaptcha/",
  ].join(" "),

  "style-src 'self' 'unsafe-inline'",

  "img-src 'self' data: blob: https:",

  "font-src 'self' data:",

  [
    "connect-src",
    "'self'",
    "https://www.google-analytics.com",
    "https://*.google-analytics.com",
    "https://www.googletagmanager.com",
    "https://www.google.com",
    "https://www.gstatic.com",
    "https://www.recaptcha.net",
  ].join(" "),

  [
    "frame-src",
    "https://www.google.com",
    "https://recaptcha.google.com",
    "https://www.recaptcha.net",
    "https://www.youtube-nocookie.com",
  ].join(" "),

  "media-src 'self' blob:",

  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/* =========================================================
   SECURITY HEADERS
========================================================= */

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: csp,
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(self), microphone=(), geolocation=()",
  },

  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value:
            "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

/* =========================================================
   NEXT.JS CONFIGURATION
========================================================= */

const nextConfig: NextConfig = {
  trailingSlash: true,

  poweredByHeader: false,

  reactStrictMode: true,

  /* =====================================================
     DEVELOPMENT LOGGING
  ===================================================== */

  logging: {
    browserToTerminal: false,
  },

  /* =====================================================
     IMAGE HANDLING

     FIX FOR:
     /_next/image → 402 Payment Required

     Original public images are delivered directly.
     No code changes required in next/image components.
  ===================================================== */

  images: {
    unoptimized: true,

    formats: [
      "image/avif",
      "image/webp",
    ],

    qualities: [60, 75, 90],

    remotePatterns: process.env.MEDIA_CDN_HOST
      ? [
          {
            protocol: "https",
            hostname: process.env.MEDIA_CDN_HOST,
          },
        ]
      : [],
  },

  /* =====================================================
     SERVERLESS FILE TRACING
  ===================================================== */

  outputFileTracingIncludes: {
    "/**": [
      "./public/brand/**",
      "./node_modules/@fontsource/montserrat/files/montserrat-latin-{400,600,800}-normal.woff",
    ],
  },

  /* =====================================================
     SERVER PACKAGES
  ===================================================== */

  serverExternalPackages: [
    "mongoose",
    "pdf-lib",
    "nodemailer",
    "google-auth-library",
    "bcryptjs",
  ],

  /* =====================================================
     TURBOPACK
  ===================================================== */

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  /* =====================================================
     HTTP HEADERS
  ===================================================== */

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },

      {
        source: "/admin/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },

      {
        source: "/api/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },

  /* =====================================================
     LEGACY REDIRECTS
  ===================================================== */

  async redirects() {
    return legacyRedirects.map((route) => ({
      source: route.from,
      destination: route.to,
      statusCode: 301 as const,
    }));
  },
};

export default nextConfig;
