import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/sections/post-views";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPost } from "@/lib/data/public";

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPost("news", slug);
  if (!p) return {};
  return pageMetadata({ title: p.metaTitle || p.title, description: p.metaDescription || p.excerpt || p.title, path: `/news/${p.slug}/`, type: "article", image: p.coverImage, publishedTime: p.publishedAt, modifiedTime: p.updatedAt });
}

export default async function NewsArticlePage({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const p = await getPost("news", slug);
  if (!p) notFound();
  return <PostArticle post={p} />;
}
