// Starts a real, persistent local MongoDB for development (no Atlas needed).
// Usage: npm run db:local  → prints a MONGODB_URI to put in .env.local
import { MongoMemoryServer } from "mongodb-memory-server";
import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// Stored OUTSIDE the project so database file writes don't trigger the
// Next.js file watcher (which would cause endless dev reloads).
const dbPath = process.env.LOCAL_MONGO_DIR || path.join(os.homedir(), ".iiev-local-mongo");
mkdirSync(dbPath, { recursive: true });

const port = Number(process.env.LOCAL_MONGO_PORT || 27027);
const server = await MongoMemoryServer.create({
  instance: { port, dbPath, storageEngine: "wiredTiger" },
});

console.log(`Local MongoDB running: ${server.getUri()}iiev`);
console.log(`Press Ctrl+C to stop. Data persists in ${dbPath}`);

const stop = async () => {
  await server.stop({ doCleanup: false });
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
