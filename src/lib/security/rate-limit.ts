import "server-only";
import { connectDb } from "@/lib/db/connect";
import { RateLimit } from "@/models/admin";

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSec: number };

/**
 * Fixed-window rate limiter backed by MongoDB (works across serverless
 * instances; documents expire via TTL index).
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
  await connectDb();
  const now = Date.now();
  const windowStart = Math.floor(now / (windowSec * 1000));
  const docKey = `${key}:${windowStart}`;
  const expiresAt = new Date((windowStart + 1) * windowSec * 1000 + 60_000);
  const doc = await RateLimit.findOneAndUpdate(
    { key: docKey },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { upsert: true, returnDocument: "after" },
  ).lean<{ count: number }>();
  const count = doc?.count ?? 1;
  const retryAfterSec = Math.ceil(((windowStart + 1) * windowSec * 1000 - now) / 1000);
  return { ok: count <= limit, remaining: Math.max(0, limit - count), retryAfterSec };
}
