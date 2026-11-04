import type { Metadata } from "next";
import { PostIndex } from "@/components/sections/post-views";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPosts } from "@/lib/data/public";

export const revalidate = 300;

export async function generateMetadata({ searchParams }: PageProps<"/news">): Promise<Metadata> {
  const sp = await searchParams;
  return pageMetadata({ title: "News", description: "Announcements and updates from the India International EV Show.", path: "/news/", noindex: Boolean(sp.page && sp.page !== "1") });
}

export default async function NewsPage({ searchParams }: PageProps<"/news">) {
  const sp = await searchParams;
  const r = await getPosts("news", { page: Number(sp.page || 1) });
  return <PostIndex kind="news" items={r.items} page={r.page} pages={r.pages} intro="Show announcements, programme updates and press releases." />;
}
