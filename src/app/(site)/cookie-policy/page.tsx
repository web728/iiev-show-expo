import type { Metadata } from "next";
import { LegalPage, legalMeta } from "@/components/sections/legal-page";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

const m = legalMeta("cookie-policy");
export const metadata: Metadata = pageMetadata({ title: m.title, description: m.description, path: "/cookie-policy/" });

export default function Page() {
  return <LegalPage slug="cookie-policy" />;
}
