
import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

/* =========================================================
   IIEV SHOW 2027 — GLOBAL CONFIGURATION
========================================================= */

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  preload: true,
});

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://iievshow.com"
).replace(/\/+$/, "");

const siteName = "India International EV Show";

const siteTitle =
  "India International EV Show 2027 | EV Expo in Pune";

const siteDescription =
  "Discover India International EV Show (IIEV Show) 2027, " +
  "14–16 October at Auto Cluster Exhibition Centre, Pune. " +
  "Explore electric vehicles, EV charging infrastructure, " +
  "battery technology, components and future mobility solutions.";

/* =========================================================
   ADVANCED GLOBAL METADATA
========================================================= */

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: siteTitle,
    template: "%s | IIEV Show",
  },

  description: siteDescription,

  applicationName: siteName,

  category: "Electric Vehicle Exhibition",

  keywords: [
    "India International EV Show",
    "IIEV Show",
    "IIEV Show 2027",
    "India International EV Show 2027",
    "EV Expo India 2027",
    "EV Exhibition Pune",
    "Electric Vehicle Expo Pune",
    "Electric Vehicle Exhibition India",
    "EV Trade Show India",
    "EV Charging Infrastructure Expo",
    "Battery Technology Exhibition",
    "Electric Mobility Expo",
    "E-Mobility Exhibition India",
    "EV Components Exhibition",
    "Auto Cluster Exhibition Centre Pune",
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName,
    title: siteTitle,
    description: siteDescription,
  },

  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },

  /* =====================================================
     GOOGLE SEARCH CONSOLE VERIFICATION

     Next.js automatically generates:
     <meta name="google-site-verification" content="..." />
  ===================================================== */

  verification: {
    google:
      "8Y98e3o4_ONy9fCiJ9glbq2brZJa2i_sIrM04mfPOH4",
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  referrer: "strict-origin-when-cross-origin",
};

/* =========================================================
   VIEWPORT — ORIGINAL BRAND COLOR PRESERVED
========================================================= */

export const viewport: Viewport = {
  themeColor: "#102a1e",
  width: "device-width",
  initialScale: 1,
};

/* =========================================================
   GLOBAL STRUCTURED DATA — SEO / AEO / GEO
========================================================= */

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: siteName,
  alternateName: ["IIEV Show", "IIEV"],
  url: siteUrl,
  description:
    "India International EV Show is an exhibition focused " +
    "on electric vehicles, EV charging infrastructure, " +
    "battery technology, automotive components and " +
    "electric mobility solutions.",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: siteName,
  alternateName: "IIEV Show",
  url: siteUrl,
  inLanguage: "en-IN",
  description: siteDescription,
  publisher: {
    "@id": `${siteUrl}/#organization`,
  },
};

/* =========================================================
   JSON-LD SERIALIZATION
========================================================= */

function serializeJsonLd(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/* =========================================================
   ROOT LAYOUT
========================================================= */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={montserrat.variable}>
      <body className="min-h-dvh antialiased">
        {children}

        {/* Global organization identity */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(organizationSchema),
          }}
        />

        {/* Global website identity */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(websiteSchema),
          }}
        />
      </body>
    </html>
  );
}
