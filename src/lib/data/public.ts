import "server-only";
import { cache } from "react";
import { readOrFallback } from "@/lib/db/connect";
import { sectors as sectorSeed, type SectorContent } from "@/content/sectors";
import { faqs as faqSeed, type FaqSeed } from "@/content/faqs";
import { pastEditions as historySeed, type PastEditionSeed } from "@/content/history";
import {
  Sector, Faq, PastEdition, Post, Speaker, Session, ExhibitorListing, GalleryAlbum, Video, Download, Partner, Page,
} from "@/models/content";
import { getCurrentEdition } from "./edition";
import { photos2026 } from "@/content/media";

const published = () => ({ status: "published", $or: [{ publishedAt: { $exists: false } }, { publishedAt: null }, { publishedAt: { $lte: new Date() } }] });

function plain<T>(docs: unknown): T {
  return JSON.parse(JSON.stringify(docs)) as T;
}

// ---- Sectors --------------------------------------------------------------

export type PublicSector = SectorContent & { metaTitle?: string; metaDescription?: string };

export const getSectors = cache(async (): Promise<PublicSector[]> => {
  return readOrFallback(async () => {
    const rows = await Sector.find(published()).sort({ order: 1 }).lean();
    if (!rows.length) return sectorSeed;
    const iconBySlug = new Map(sectorSeed.map((s) => [s.slug, s.icon]));
    return plain<PublicSector[]>(rows).map((r) => ({ ...r, icon: iconBySlug.get(r.slug) ?? "Bolt" }));
  }, sectorSeed);
});

export async function getSector(slug: string) {
  return (await getSectors()).find((s) => s.slug === slug) ?? null;
}

// ---- FAQs -----------------------------------------------------------------

export const getFaqs = cache(async (audience?: FaqSeed["audience"]): Promise<FaqSeed[]> => {
  const fallback = faqSeed.filter((f) => !audience || f.audience === audience).sort((a, b) => a.order - b.order);
  return readOrFallback(async () => {
    const rows = await Faq.find({ ...published(), ...(audience ? { audience } : {}) }).sort({ order: 1 }).lean();
    return rows.length ? plain<FaqSeed[]>(rows) : fallback;
  }, fallback);
});

// ---- History --------------------------------------------------------------

export type PublicPastEdition = PastEditionSeed & { body?: string; reportUrl?: string; verifiedStats?: { value: string; label: string; source: string }[] };

export const getPastEditions = cache(async (): Promise<PublicPastEdition[]> => {
  const fallback = [...historySeed].sort((a, b) => b.year - a.year || b.slug.localeCompare(a.slug));
  return readOrFallback(async () => {
    const rows = await PastEdition.find(published()).sort({ year: -1, slug: -1 }).lean();
    return rows.length ? plain<PublicPastEdition[]>(rows) : fallback;
  }, fallback);
});

export async function getPastEdition(slug: string) {
  return (await getPastEditions()).find((e) => e.slug === slug) ?? null;
}

// ---- Editorial ------------------------------------------------------------

export type PublicPost = {
  _id: string;
  kind: "news" | "insight";
  slug: string;
  title: string;
  excerpt?: string;
  body: string;
  category?: string;
  author?: string;
  sourceName?: string;
  sourceUrl?: string;
  coverImage?: string;
  coverAlt?: string;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: string;
  updatedAt?: string;
};

export async function getPosts(kind: "news" | "insight", opts: { page?: number; perPage?: number; category?: string } = {}) {
  const perPage = opts.perPage ?? 12;
  const page = Math.max(1, opts.page ?? 1);
  return readOrFallback(async () => {
    const q = { kind, ...published(), ...(opts.category ? { category: opts.category } : {}) };
    const [rows, total] = await Promise.all([
      Post.find(q).sort({ publishedAt: -1 }).skip((page - 1) * perPage).limit(perPage).lean(),
      Post.countDocuments(q),
    ]);
    return { items: plain<PublicPost[]>(rows), total, page, pages: Math.max(1, Math.ceil(total / perPage)) };
  }, { items: [] as PublicPost[], total: 0, page: 1, pages: 1 });
}

export async function getPost(kind: "news" | "insight", slug: string) {
  return readOrFallback(async () => plain<PublicPost | null>(await Post.findOne({ kind, slug, ...published() }).lean()), null);
}

// ---- Conference -----------------------------------------------------------

export type PublicSpeaker = { _id: string; slug: string; name: string; designation?: string; organisation?: string; image?: string; bio?: string; linkedin?: string; edition: string };
export type PublicSession = { _id: string; title: string; description?: string; startsAt: string; endsAt: string; room?: string; track?: string; format?: string; speakerSlugs: string[]; sessionStatus: string; edition: string };

export async function getSpeakers(editionSlug?: string) {
  const edition = editionSlug ?? (await getCurrentEdition()).slug;
  return readOrFallback(async () => plain<PublicSpeaker[]>(await Speaker.find({ edition, consentToPublish: true, ...published() }).sort({ name: 1 }).lean()), [] as PublicSpeaker[]);
}

export async function getSpeaker(slug: string, editionSlug?: string) {
  const edition = editionSlug ?? (await getCurrentEdition()).slug;
  return readOrFallback(async () => plain<PublicSpeaker | null>(await Speaker.findOne({ edition, slug, consentToPublish: true, ...published() }).lean()), null);
}

export async function getSessions(editionSlug?: string) {
  const edition = editionSlug ?? (await getCurrentEdition()).slug;
  return readOrFallback(async () => plain<PublicSession[]>(await Session.find({ edition, ...published() }).sort({ startsAt: 1 }).lean()), [] as PublicSession[]);
}

// ---- Directory ------------------------------------------------------------

export type PublicListing = { _id: string; slug: string; company: string; country?: string; city?: string; categories: string[]; logo?: string; profile?: string; website?: string; booth?: string; edition: string };

export async function getExhibitors(opts: { edition?: string; q?: string; category?: string; country?: string; page?: number; perPage?: number } = {}) {
  const edition = opts.edition ?? (await getCurrentEdition()).slug;
  const perPage = opts.perPage ?? 24;
  const page = Math.max(1, opts.page ?? 1);
  return readOrFallback(async () => {
    const q: Record<string, unknown> = { edition, status: "published" };
    if (opts.category) q.categories = opts.category;
    if (opts.country) q.country = opts.country;
    if (opts.q) q.company = { $regex: opts.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 60), $options: "i" };
    const [rows, total] = await Promise.all([
      ExhibitorListing.find(q).sort({ company: 1 }).skip((page - 1) * perPage).limit(perPage).lean(),
      ExhibitorListing.countDocuments(q),
    ]);
    return { items: plain<PublicListing[]>(rows), total, page, pages: Math.max(1, Math.ceil(total / perPage)) };
  }, { items: [] as PublicListing[], total: 0, page: 1, pages: 1 });
}

export async function getExhibitor(slug: string, edition?: string) {
  const ed = edition ?? (await getCurrentEdition()).slug;
  return readOrFallback(async () => plain<PublicListing | null>(await ExhibitorListing.findOne({ edition: ed, slug, status: "published" }).lean()), null);
}

export async function getExhibitorEditions() {
  return readOrFallback(async () => (await ExhibitorListing.distinct("edition", { status: { $in: ["published", "archived"] } })) as string[], [] as string[]);
}

// ---- Media ----------------------------------------------------------------

export type PublicAlbum = { _id: string; slug: string; title: string; edition?: string; description?: string; images: { src: string; width?: number; height?: number; alt: string; caption?: string; credit?: string; focalX?: number; focalY?: number }[] };
export type PublicVideo = { _id: string; title: string; youtubeId: string; edition?: string; description?: string };
export type PublicDownload = { _id: string; title: string; description?: string; fileUrl: string; fileType?: string; fileSizeLabel?: string; edition?: string; category?: string };
export type PublicPartner = { _id: string; name: string; kind: string; tier?: string; logo?: string; url?: string; edition?: string };

// Built-in album of organiser-supplied 2026 photography (always available).
const builtInAlbum: PublicAlbum = {
  _id: "builtin-2026",
  slug: "iiev-2026-pune",
  title: "IIEV Show 2026 — Pune",
  edition: "2026",
  description: "The 8th edition at the Auto Cluster Exhibition Centre, Pimpri-Chinchwad, 2–4 October 2026: inauguration, exhibition floor, round-table meetings and the leadership conference.",
  images: photos2026.map((p) => ({ src: p.src, width: p.width, height: p.height, alt: p.alt, caption: p.caption, credit: "IIEV Show / Futurex" })),
};

export async function getAlbums() {
  const db = await readOrFallback(async () => plain<PublicAlbum[]>(await GalleryAlbum.find({ ...published(), rightsConfirmed: true }).sort({ edition: -1, createdAt: -1 }).lean()), [] as PublicAlbum[]);
  return db.some((a) => a.slug === builtInAlbum.slug) ? db : [builtInAlbum, ...db];
}
export async function getAlbum(slug: string) {
  if (slug === builtInAlbum.slug) {
    const db = await readOrFallback(async () => plain<PublicAlbum | null>(await GalleryAlbum.findOne({ slug, ...published(), rightsConfirmed: true }).lean()), null);
    return db ?? builtInAlbum;
  }
  return readOrFallback(async () => plain<PublicAlbum | null>(await GalleryAlbum.findOne({ slug, ...published(), rightsConfirmed: true }).lean()), null);
}
export async function getVideos() {
  return readOrFallback(async () => plain<PublicVideo[]>(await Video.find(published()).sort({ createdAt: -1 }).lean()), [] as PublicVideo[]);
}
export async function getDownloads() {
  return readOrFallback(async () => plain<PublicDownload[]>(await Download.find(published()).sort({ createdAt: -1 }).lean()), [] as PublicDownload[]);
}
export async function getPartners(editionSlug?: string) {
  const edition = editionSlug ?? (await getCurrentEdition()).slug;
  return readOrFallback(async () => plain<PublicPartner[]>(await Partner.find({ edition, ...published() }).sort({ order: 1, name: 1 }).lean()), [] as PublicPartner[]);
}

// ---- CMS pages (legal etc.) ----------------------------------------------

export type PublicPage = { slug: string; title: string; intro?: string; body: string; metaTitle?: string; metaDescription?: string; updatedAt?: string; lastReviewedAt?: string; noindex?: boolean };

export async function getCmsPage(slug: string) {
  return readOrFallback(async () => plain<PublicPage | null>(await Page.findOne({ slug, ...published() }).lean()), null);
}
