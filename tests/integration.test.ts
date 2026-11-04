import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { startDb, stopDb, clearDb } from "./helpers/db";

// Integration tests against a real MongoDB (mongodb-memory-server).

let svc: {
  createLead: typeof import("@/lib/services/leads").createLead;
  registerVisitor: typeof import("@/lib/services/visitors").registerVisitor;
  approveVisitor: typeof import("@/lib/services/visitors").approveVisitor;
  reissueBadge: typeof import("@/lib/services/visitors").reissueBadge;
  cancelVisitor: typeof import("@/lib/services/visitors").cancelVisitor;
  checkIn: typeof import("@/lib/services/checkin").checkIn;
  processDueJobs: typeof import("@/lib/jobs").processDueJobs;
};
let M: typeof import("@/models/leads") & typeof import("@/models/content");
const actor = { id: "000000000000000000000001", email: "staff@test" };

beforeAll(async () => {
  await startDb();
  const [leads, visitors, checkin, jobs, mLeads, mContent] = await Promise.all([
    import("@/lib/services/leads"), import("@/lib/services/visitors"), import("@/lib/services/checkin"), import("@/lib/jobs"),
    import("@/models/leads"), import("@/models/content"),
  ]);
  svc = { ...leads, ...visitors, ...checkin, ...jobs } as typeof svc;
  M = { ...mLeads, ...mContent };
});
afterAll(stopDb);
beforeEach(async () => {
  await clearDb();
  delete process.env.SMTP_HOST;
});

const visitor = (o: Record<string, unknown> = {}) => ({
  fullName: "Test Visitor", email: `v${Math.random().toString(36).slice(2)}@example.com`, phone: "9876543210", company: "Fleet Co", designation: "Manager",
  industry: "Fleet operator / logistics", city: "Pune", state: "Maharashtra", country: "India", reasonForVisit: "Other", sectorInterests: ["electric-vehicles"],
  privacyAccepted: true as const, marketingOptIn: false, idempotencyKey: randomUUID(), ...o,
});

async function setApproval(mode: "auto" | "review") {
  await M.Edition.updateOne({ slug: "2027" }, { $set: { slug: "2027", editionNumber: 9, editionLabel: "9th Edition", year: 2027, isCurrent: true, startDate: "2027-11-11", endDate: "2027-11-13", dateLabel: "11–13 November 2027", registration: { visitorOpen: true, approvalMode: mode } } }, { upsert: true });
}

async function tokenFor(ref: string) {
  const { decrypt } = await import("@/lib/security/crypto");
  const v = await M.Visitor.findOne({ ref }).select("+badgeTokenEnc").lean<{ badgeTokenEnc: string }>();
  return `IIEV1.${decrypt(v!.badgeTokenEnc)}`;
}

describe("lead submission (MongoDB is the system of record)", () => {
  it("persists, is idempotent on retry, and queues integration jobs", async () => {
    const key = randomUUID();
    const input = { idempotencyKey: key, fullName: "A", email: "a@example.com", company: "X", privacyAccepted: true as const, marketingOptIn: false, segments: ["ev-components"] };
    const r1 = await svc.createLead("stall", input, "1.2.3.4");
    const r2 = await svc.createLead("stall", input, "1.2.3.4");
    expect(r2.ref).toBe(r1.ref);
    expect(r2.duplicate).toBe(true);
    expect(await M.Lead.countDocuments()).toBe(1);
    const jobs = await M.IntegrationJob.find({ entityId: r1.id }).lean();
    expect(jobs.map((j) => j.kind).sort()).toEqual(["email_ack", "email_organiser", "sheets_append"]);
    const lead = await M.Lead.findById(r1.id).lean<{ details: Record<string, unknown>; ipHash: string }>();
    expect(lead!.details.segments).toEqual(["ev-components"]);
    expect(lead!.ipHash).not.toContain("1.2.3.4");
    expect(await M.ConsentRecord.countDocuments({ entityId: r1.id })).toBe(2);
  });

  it("concurrent duplicate submissions create exactly one record", async () => {
    const key = randomUUID();
    const input = { idempotencyKey: key, fullName: "A", email: "a@example.com", privacyAccepted: true as const, marketingOptIn: false };
    const results = await Promise.all(Array.from({ length: 8 }, () => svc.createLead("contact", input, "1.1.1.1")));
    expect(new Set(results.map((r) => r.ref)).size).toBe(1);
    expect(await M.Lead.countDocuments()).toBe(1);
  });

  it("unconfigured Sheets/email are recorded as skipped — never as success", async () => {
    const r = await svc.createLead("stall", { idempotencyKey: randomUUID(), fullName: "A", email: "a@example.com", privacyAccepted: true, marketingOptIn: false }, "1.1.1.1");
    await svc.processDueJobs(10, r.id);
    const lead = await M.Lead.findById(r.id).lean<{ integrations: Record<string, string> }>();
    expect(lead!.integrations).toMatchObject({ sheets: "skipped", organiserEmail: "skipped", ackEmail: "skipped" });
  });

  it("email failure keeps the lead and schedules a retry with backoff", async () => {
    process.env.SMTP_HOST = "127.0.0.1";
    process.env.SMTP_PORT = "1"; // connection refused
    process.env.SMTP_USER = "u";
    process.env.SMTP_PASS = "p";
    process.env.EMAIL_FROM = "IIEV <noreply@example.com>";
    // Fresh adapter instance so the env is picked up
    const { getEmailAdapter } = await import("@/lib/email");
    (getEmailAdapter as unknown as { _reset?: () => void })._reset?.();
    const r = await svc.createLead("contact", { idempotencyKey: randomUUID(), fullName: "A", email: "a@example.com", privacyAccepted: true, marketingOptIn: false }, "1.1.1.1");
    await svc.processDueJobs(10, r.id);
    expect(await M.Lead.countDocuments({ _id: r.id })).toBe(1);
    const ack = await M.IntegrationJob.findOne({ entityId: r.id, kind: "email_ack" }).lean<{ status: string; attempts: number; nextRunAt: Date; lastError: string }>();
    expect(ack!.status).toBe("failed");
    expect(ack!.attempts).toBe(1);
    expect(ack!.nextRunAt.getTime()).toBeGreaterThan(Date.now());
    expect(ack!.lastError).toBeTruthy();
    for (const k of ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"]) delete process.env[k];
  });
});

describe("visitor registration, badges and check-in", () => {
  it("auto-approval issues an opaque badge; same key is idempotent; same email is deduped", async () => {
    await setApproval("auto");
    const input = visitor();
    const r1 = await svc.registerVisitor(input, "1.1.1.1");
    expect(r1.kind).toBe("created");
    const r2 = await svc.registerVisitor(input, "1.1.1.1");
    expect(r2.kind).toBe("duplicate_submission");
    const r3 = await svc.registerVisitor({ ...input, idempotencyKey: randomUUID() }, "1.1.1.1");
    expect(r3.kind).toBe("already_registered");
    const v = await M.Visitor.findOne({ email: input.email }).select("+badgeTokenHash +badgeTokenEnc").lean<Record<string, unknown>>();
    expect(v!.status).toBe("approved");
    expect(String(v!.badgeTokenHash)).toMatch(/^[a-f0-9]{64}$/);
    const qr = await tokenFor(String(v!.ref));
    expect(qr).not.toContain(input.email);
    expect(qr).not.toContain("Visitor");
  });

  it("reviewed mode holds the badge until approval", async () => {
    await setApproval("review");
    const r = await svc.registerVisitor(visitor(), "1.1.1.1");
    expect(r.kind === "created" && r.status).toBe("pending_review");
    const v = await M.Visitor.findOne({ ref: (r as { ref: string }).ref }).select("+badgeTokenEnc").lean<{ _id: string; badgeTokenEnc?: string }>();
    expect(v!.badgeTokenEnc).toBeUndefined();
    const denied = await svc.checkIn({ visitorId: String(v!._id), actor });
    expect(denied.result).toBe("not_approved");
    await svc.approveVisitor(String(v!._id), actor);
    const ok = await svc.checkIn({ qrText: await tokenFor((r as { ref: string }).ref), actor });
    expect(ok.result).toBe("ok");
  });

  it("first scan ok, repeat scans flagged duplicate, concurrency-safe count", async () => {
    await setApproval("auto");
    const r = await svc.registerVisitor(visitor(), "1.1.1.1");
    const qr = await tokenFor((r as { ref: string }).ref);
    const results = await Promise.all(Array.from({ length: 5 }, () => svc.checkIn({ qrText: qr, station: "A", actor })));
    expect(results.filter((x) => x.result === "ok").length).toBe(1);
    expect(results.filter((x) => x.result === "duplicate").length).toBe(4);
    const v = await M.Visitor.findOne({ ref: (r as { ref: string }).ref }).lean<{ checkInCount: number; status: string; checkedInAt: Date }>();
    expect(v!.checkInCount).toBe(5);
    expect(v!.status).toBe("checked_in");
    expect(await M.CheckIn.countDocuments()).toBe(5);
  });

  it("reissue revokes the old QR; cancellation blocks entry", async () => {
    await setApproval("auto");
    const r = await svc.registerVisitor(visitor(), "1.1.1.1");
    const ref = (r as { ref: string }).ref;
    const oldQr = await tokenFor(ref);
    const v = await M.Visitor.findOne({ ref }).lean<{ _id: string }>();
    const ver = await svc.reissueBadge(String(v!._id), actor, false);
    expect(ver).toBe(2);
    expect((await svc.checkIn({ qrText: oldQr, actor })).result).toBe("not_found");
    const newQr = await tokenFor(ref);
    expect((await svc.checkIn({ qrText: newQr, actor })).result).toBe("ok");
    await svc.cancelVisitor(String(v!._id), actor, "test");
    expect((await svc.checkIn({ qrText: newQr, actor })).result).toBe("revoked");
  });

  it("foreign QR codes are rejected without a lookup", async () => {
    expect((await svc.checkIn({ qrText: "https://example.com", actor })).result).toBe("not_found");
  });

  it("badge access links are invalidated by reissue", async () => {
    await setApproval("auto");
    const { verifyBadgeAccessToken } = await import("@/lib/badge/access");
    const r = await svc.registerVisitor(visitor(), "1.1.1.1");
    const access = await verifyBadgeAccessToken((r as { badgeAccess: string }).badgeAccess);
    expect(access?.version).toBe(1);
    const v = await M.Visitor.findOne({ ref: (r as { ref: string }).ref }).lean<{ _id: string; badgeVersion: number }>();
    await svc.reissueBadge(String(v!._id), actor, false);
    const after = await M.Visitor.findById(v!._id).lean<{ badgeVersion: number }>();
    expect(after!.badgeVersion).not.toBe(access?.version);
    expect(await verifyBadgeAccessToken("garbage")).toBeNull();
  });

  it("renders a badge PDF with the official logo and no crash on long names", async () => {
    const { renderBadgePdf } = await import("@/lib/badge/pdf");
    const { defaultEdition } = await import("@/config/site");
    const pdf = await renderBadgePdf({
      visitor: { ref: "VS-27-ABCDEF", fullName: "Venkatanarasimharajuvaripeta Subramanian Lakshminarayanan", company: "A Very Long Company Name Private Limited International", designation: "Chief" },
      token: "x".repeat(43),
      edition: defaultEdition,
    });
    expect(Buffer.from(pdf).subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(20_000);
  });
});

describe("rate limiting", () => {
  it("blocks after the limit within a window", async () => {
    const { rateLimit } = await import("@/lib/security/rate-limit");
    const results = [];
    for (let i = 0; i < 5; i++) results.push((await rateLimit("t:key", 3, 600)).ok);
    expect(results).toEqual([true, true, true, false, false]);
  });
});
