import type { Metadata } from "next";
import { PostIndex } from "@/components/sections/post-views";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPosts } from "@/lib/data/public";

export const revalidate = 300;

export async function generateMetadata({ searchParams }: PageProps<"/insights">): Promise<Metadata> {
  const sp = await searchParams;
  return pageMetadata({ title: "Insights — Electric Mobility Industry Articles", description: "Editorially reviewed articles on India's electric-mobility industry: technology, charging, batteries, fleets and business models.", path: "/insights/", noindex: Boolean(sp.page && sp.page !== "1") });
}

export default async function InsightsPage({ searchParams }: PageProps<"/insights">) {
  const sp = await searchParams;
  const r = await getPosts("insight", { page: Number(sp.page || 1) });
  return <PostIndex kind="insight" items={r.items} page={r.page} pages={r.pages} intro="Practical, editorially reviewed articles for people building and buying electric mobility." />;
}
