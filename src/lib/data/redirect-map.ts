import "server-only";
import { connectDb, isDbConfigured } from "@/lib/db/connect";
import { Redirect } from "@/models/content";

// CMS-managed redirects for src/proxy.ts. Read straight from MongoDB (the proxy runs on the
// Node.js runtime) — never via an HTTP self-call built from the request Host header, which
// would let a forged Host poison the shared cache. Cached per server instance for 60 s;
// a slow or unavailable database never blocks page requests for more than LOOKUP_TIMEOUT_MS.

export type RedirectRow = { from: string; to: string; statusCode: number };
const TTL_MS = 60_000;
const LOOKUP_TIMEOUT_MS = 1500;
let cache: { at: number; map: Map<string, RedirectRow> } | null = null;
let inflight: Promise<Map<string, RedirectRow>> | null = null;

export function normalisePath(p: string) {
  const lower = p.toLowerCase();
  return lower.endsWith("/") ? lower : `${lower}/`;
}

async function load(): Promise<Map<string, RedirectRow>> {
  await connectDb();
  const rows = await Redirect.find({ active: true }).select("from to statusCode -_id").lean<RedirectRow[]>();
  return new Map(rows.map((r) => [normalisePath(r.from), r]));
}

export async function getRedirectMap(): Promise<Map<string, RedirectRow>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.map;
  if (!isDbConfigured()) return new Map();
  inflight ??= Promise.race([
    load(),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("redirect lookup timeout")), LOOKUP_TIMEOUT_MS)),
  ])
    .catch(() => cache?.map ?? new Map<string, RedirectRow>())
    .then((map) => {
      cache = { at: Date.now(), map };
      inflight = null;
      return map;
    });
  return inflight;
}
