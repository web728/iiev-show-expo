import "server-only";
import mongoose from "mongoose";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalCache = globalThis as typeof globalThis & { __iievMongo?: Cache };
const cache = globalCache.__iievMongo ?? (globalCache.__iievMongo = { conn: null, promise: null });

export class DatabaseUnavailableError extends Error {
  code = "DB_UNAVAILABLE";
  constructor(message = "Database is not configured or unreachable") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}
export function isDbConfigured() {
  return Boolean(process.env.MONGODB_URI);
}
export async function connectDb(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new DatabaseUnavailableError("MONGODB_URI is not set");
  if (cache.conn && cache.conn.connection.readyState === 1) return cache.conn;
  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || undefined,
      maxPoolSize: Number(process.env.MONGODB_POOL_SIZE || 10),
      serverSelectionTimeoutMS: 8000,
      autoIndex: process.env.NODE_ENV !== "production" || process.env.MONGODB_AUTO_INDEX === "true",
    }).catch((error: unknown) => {
      cache.promise = null;
      throw new DatabaseUnavailableError(error instanceof Error ? error.message : String(error));
    });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
export async function readOrFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDbConfigured()) return fallback;
  try { await connectDb(); return await fn(); }
  catch (error) { console.error("[db] read fallback:", error instanceof Error ? error.message : error); return fallback; }
}
