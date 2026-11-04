import type { NextConfig } from "next";
import { legacyRedirects } from "./src/config/redirects";

const isProd = process.env.NODE_ENV === "production";

// Content-Security-Policy kept compatible with Next.js inline bootstrapping.
// Tighten with nonces once analytics/tag choices are final (see docs/DEPLOYMENT_GUIDE.md).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
  "frame-src https://www.google.com https://www.youtube-nocookie.com",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  // camera=(self) is required by the authorised check-in scanner
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), interest-cohort=()" },
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

const nextConfig: NextConfig = {
  trailingSlash: true,
  // Browser→terminal log forwarding writes into .next/dev/logs on every page
  // load, which re-triggered dev compiles and reload loops in the preview pane.
  logging: { browserToTerminal: false },
  poweredByHeader: false,
  reactStrictMode: true,
  // Badge PDFs, emails and OG images read these from disk at runtime (serverless tracing).
  outputFileTracingIncludes: {
    "/**": ["./public/brand/**", "./node_modules/@fontsource/montserrat/files/montserrat-latin-{400,600,800}-normal.woff"],
  },
  serverExternalPackages: ["mongoose", "pdf-lib", "nodemailer", "google-auth-library", "bcryptjs"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 90],
    remotePatterns: process.env.MEDIA_CDN_HOST
      ? [{ protocol: "https", hostname: process.env.MEDIA_CDN_HOST }]
      : [],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
    ];
  },
  async redirects() {
    return legacyRedirects.map((r) => ({ source: r.from, destination: r.to, statusCode: 301 as const }));
  },
};

export default nextConfig;
