import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://iievshow.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "India International EV Show 2027 | Pune", template: "%s | IIEV Show" },
  description: "India International EV Show 2027, 14–16 October at Auto Cluster Exhibition Centre, Pimpri-Chinchwad, Pune. Explore EVs, charging infrastructure, components and mobility technologies.",
  applicationName: "India International EV Show",
  openGraph: {
    type: "website",
    siteName: "India International EV Show",
    locale: "en_IN",
    url: siteUrl,
    title: "India International EV Show 2027 | Pune",
    description: "9th edition · 14–16 October 2027 · Auto Cluster Exhibition Centre, Pune",
  },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#102a1e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={montserrat.variable}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
