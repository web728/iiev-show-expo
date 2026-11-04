import type { Metadata } from "next";
import { LegalPage, legalMeta } from "@/components/sections/legal-page";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

const m = legalMeta("accessibility");
export const metadata: Metadata = pageMetadata({ title: m.title, description: m.description, path: "/accessibility/" });

export default function Page() {
  return <LegalPage slug="accessibility" />;
}
