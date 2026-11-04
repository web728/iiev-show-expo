import "server-only";
import mongoose from "mongoose";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = globalThis as unknown as { __iievMongo?: Cache };
const cache: Cache = g.__iievMongo ?? (g.__iievMongo = { conn: null, promise: null });

export class DatabaseUnavailableError extends Error {
  code = "DB_UNAVAILABLE";
  constructor(message = "Database is not configured or unreachable") {
    super(message);
  }
}

export function isDbConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

/** Connects once per server instance and reuses the pooled connection. */
export async function connectDb(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new DatabaseUnavailableError("MONGODB_URI is not set");
  if (cache.conn && cache.conn.connection.readyState === 1) return cache.conn;
  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB || undefined,
        maxPoolSize: Number(process.env.MONGODB_POOL_SIZE || 10),
        serverSelectionTimeoutMS: 8000,
        autoIndex: process.env.NODE_ENV !== "production" || process.env.MONGODB_AUTO_INDEX === "true",
      })
      .catch((err) => {
        cache.promise = null;
        throw new DatabaseUnavailableError(err instanceof Error ? err.message : String(err));
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

/**
 * For public read paths: returns fallback when the DB is unavailable so pages
 * still render (e.g. during build or a brief outage). Never use for writes.
 */
export async function readOrFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDbConfigured()) return fallback;
  try {
    await connectDb();
    return await fn();
  } catch (err) {
    console.error("[db] read fallback:", err instanceof Error ? err.message : err);
    return fallback;
  }
}
