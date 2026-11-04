/**
 * Seed / migrate the database. Idempotent — safe to re-run.
 *
 *   npx tsx scripts/seed.ts                      # content + indexes
 *   ADMIN_EMAIL=you@org.com ADMIN_NAME="Your Name" npx tsx scripts/seed.ts
 *        → also creates a Super Admin and prints a one-time invite link
 *
 * Requires MONGODB_URI (loaded from .env.local / .env if present).
 * Never creates default passwords.
 */
import { readFileSync, existsSync } from "node:fs";
import { createHash, randomBytes } from "node:crypto";
import mongoose from "mongoose";

for (const f of [".env.local", ".env"]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf8").replace(/^﻿/, "").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });

  const { Edition, SiteSettings, Sector, Faq, PastEdition } = await import("../src/models/content");
  const models = await Promise.all([import("../src/models/content"), import("../src/models/leads"), import("../src/models/admin")]);
  const { AdminUser } = models[2];
  const { defaultEdition, organiser } = await import("../src/config/site");
  const { sectors } = await import("../src/content/sectors");
  const { faqs } = await import("../src/content/faqs");
  const { pastEditions } = await import("../src/content/history");

  // Indexes (migrations): build every declared index.
  for (const mod of models) {
    for (const v of Object.values(mod)) {
      if (v && typeof v === "function" && "syncIndexes" in v && "modelName" in v) {
        await (v as unknown as mongoose.Model<unknown>).syncIndexes();
        console.log(`  indexes ✓ ${(v as unknown as mongoose.Model<unknown>).modelName}`);
      }
    }
  }

  // Edition — only create if missing (never overwrite admin edits).
  if (!(await Edition.exists({ slug: defaultEdition.slug }))) {
    await Edition.updateMany({}, { $set: { isCurrent: false } });
    await Edition.create({ ...defaultEdition, isCurrent: true, updatedBy: "seed" });
    console.log("Edition 2027 created");
  }
  if (!(await SiteSettings.exists({ key: "global" }))) {
    await SiteSettings.create({
      key: "global",
      notifyRecipients: (process.env.NOTIFY_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 2),
      contacts: organiser.contacts,
      address: organiser.address,
      organiserContactsVerified: false,
      updatedBy: "seed",
    });
    console.log("Site settings created");
  }

  let n = 0;
  for (const s of sectors) {
    const { icon, ...rest } = s;
    void icon;
    const r = await Sector.updateOne({ slug: s.slug }, { $setOnInsert: { ...rest, status: "published", publishedAt: new Date(), updatedBy: "seed" } }, { upsert: true });
    n += r.upsertedCount;
  }
  console.log(`Sectors: ${n} inserted`);

  n = 0;
  for (const f of faqs) {
    const r = await Faq.updateOne({ audience: f.audience, question: f.question }, { $setOnInsert: { ...f, status: "published", publishedAt: new Date() } }, { upsert: true });
    n += r.upsertedCount;
  }
  console.log(`FAQs: ${n} inserted`);

  n = 0;
  for (const p of pastEditions) {
    const r = await PastEdition.updateOne(
      { slug: p.slug },
      { $setOnInsert: { ...p, dates: p.dates ?? undefined, venue: p.venue ?? undefined, status: "published", publishedAt: new Date(), locked: p.confidence === "high", updatedBy: "seed" } },
      { upsert: true },
    );
    n += r.upsertedCount;
  }
  console.log(`Past editions: ${n} inserted`);

  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  if (email) {
    const existing = await AdminUser.findOne({ email });
    if (existing) {
      console.log(`Admin ${email} already exists (role ${existing.role}).`);
    } else {
      const token = randomBytes(32).toString("base64url");
      await AdminUser.create({
        email,
        name: process.env.ADMIN_NAME || "Super Admin",
        role: "super_admin",
        inviteTokenHash: createHash("sha256").update(token).digest("hex"),
        inviteExpires: new Date(Date.now() + 72 * 3600_000),
        invitedBy: "seed",
      });
      const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
      console.log("\nSuper Admin created. Set the password within 72 hours using this ONE-TIME link:\n");
      console.log(`  ${base}/admin/set-password/?kind=invite&token=${token}\n`);
    }
  }
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
