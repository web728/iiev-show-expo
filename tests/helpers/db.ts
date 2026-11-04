import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let server: MongoMemoryServer | null = null;

/** Real MongoDB (in-memory) per test file. */
export async function startDb() {
  server = await MongoMemoryServer.create();
  process.env.MONGODB_URI = server.getUri("iiev_test");
  const { connectDb } = await import("@/lib/db/connect");
  await connectDb();
  const models = await Promise.all([import("@/models/leads"), import("@/models/content"), import("@/models/admin")]);
  for (const mod of models) for (const v of Object.values(mod)) if (v && typeof v === "function" && "syncIndexes" in v && "modelName" in v) await (v as unknown as mongoose.Model<unknown>).syncIndexes();
}

export async function stopDb() {
  await mongoose.disconnect();
  await server?.stop();
}

export async function clearDb() {
  const db = mongoose.connection.db;
  if (!db) return;
  for (const c of await db.collections()) await c.deleteMany({});
}
