import type { Metadata } from "next";
import { LegalPage, legalMeta } from "@/components/sections/legal-page";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

const m = legalMeta("terms");
export const metadata: Metadata = pageMetadata({ title: m.title, description: m.description, path: "/terms/" });

export default function Page() {
  return <LegalPage slug="terms" />;
}
