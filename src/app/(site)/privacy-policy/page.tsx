import type { Metadata } from "next";
import { LegalPage, legalMeta } from "@/components/sections/legal-page";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

const m = legalMeta("privacy-policy");
export const metadata: Metadata = pageMetadata({ title: m.title, description: m.description, path: "/privacy-policy/" });

export default function Page() {
  return <LegalPage slug="privacy-policy" />;
}
