import { describe, expect, it } from "vitest";
import { sanitizeCell } from "@/lib/sheets";
import { redact } from "@/lib/log";
import { can, ROLES, ROLE_PERMISSIONS } from "@/lib/auth/rbac";
import { totpCode, verifyTotp, base32Decode, base32Encode, generateTotpSecret } from "@/lib/security/totp";
import { encrypt, decrypt, humanRef, safeEqual } from "@/lib/security/crypto";
import { parseQrPayload, qrPayload, issueBadgeToken } from "@/lib/badge/token";
import { stallEnquirySchema, visitorRegistrationSchema, phoneField } from "@/lib/validation/forms";
import { istLocalToDate, dateToIstLocal } from "@/lib/admin/form-parse";
import { slugify } from "@/lib/format";
import { sniffType } from "@/lib/storage";
import { legacyRedirects } from "@/config/redirects";

describe("spreadsheet formula-injection protection", () => {
  it.each(["=HYPERLINK(\"http://x\")", "+cmd", "-2+3", "@SUM(A1)", "\t=1"])("neutralises %s", (v) => {
    expect(sanitizeCell(v).startsWith("'")).toBe(true);
  });
  it("leaves normal values and flattens arrays/newlines", () => {
    expect(sanitizeCell("Pune")).toBe("Pune");
    expect(sanitizeCell(["a", "b"])).toBe("a, b");
    expect(sanitizeCell("line1\nline2")).toBe("line1 line2");
  });
});

describe("log redaction", () => {
  it("removes emails, phones and sensitive keys", () => {
    const out = JSON.stringify(redact({ msg: "contact a.b@example.com or +91 98765 43210", email: "x@y.z", token: "abc", nested: { phone: "9" } }));
    expect(out).not.toContain("a.b@example.com");
    expect(out).not.toContain("98765");
    expect(out).toContain("[redacted]");
  });
});

describe("RBAC", () => {
  it("super admin has every permission; analyst cannot see personal data", () => {
    expect(can("super_admin", "users.manage")).toBe(true);
    expect(can("analyst", "leads.view")).toBe(false);
    expect(can("analyst", "visitors.view")).toBe(false);
    expect(can("analyst", "reports.view")).toBe(true);
  });
  it("registration staff can scan but not manage users or content", () => {
    expect(can("registration", "checkin.scan")).toBe(true);
    expect(can("registration", "users.manage")).toBe(false);
    expect(can("registration", "content.publish")).toBe(false);
  });
  it("sales cannot touch visitor records", () => {
    expect(can("sales", "visitors.view")).toBe(false);
    expect(can("sales", "leads.export")).toBe(true);
  });
  it("only super admin manages users", () => {
    for (const r of ROLES) expect(ROLE_PERMISSIONS[r].includes("users.manage")).toBe(r === "super_admin");
  });
  it("unauthenticated has nothing", () => expect(can(undefined, "dashboard.view")).toBe(false));
});

describe("TOTP (RFC 6238)", () => {
  it("matches the RFC test vector (SHA-1, T=59s)", () => {
    const secret = base32Encode(Buffer.from("12345678901234567890"));
    expect(totpCode(secret, 59_000)).toBe("287082");
  });
  it("verifies within ±1 step and rejects others", () => {
    const s = generateTotpSecret();
    const now = Date.now();
    expect(verifyTotp(s, totpCode(s, now), now)).toBe(true);
    expect(verifyTotp(s, totpCode(s, now - 30_000), now)).toBe(true);
    expect(verifyTotp(s, totpCode(s, now - 120_000), now)).toBe(false);
    expect(verifyTotp(s, "abc", now)).toBe(false);
  });
  it("base32 round-trips", () => {
    const b = Buffer.from("hello world");
    expect(base32Decode(base32Encode(b)).equals(b)).toBe(true);
  });
});

describe("crypto helpers", () => {
  it("AES-GCM round-trips and detects tampering", () => {
    const enc = encrypt("secret-value");
    expect(decrypt(enc)).toBe("secret-value");
    const [iv, tag, body] = enc.split(".");
    expect(() => decrypt([iv, tag, body.slice(0, -2) + "AA"].join("."))).toThrow();
  });
  it("human refs use the unambiguous alphabet", () => {
    for (let i = 0; i < 200; i++) expect(humanRef("VS", "2027")).toMatch(/^VS-27-[2-9A-HJKMNP-Z]{6}$/);
  });
  it("safeEqual", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});

describe("badge QR payload", () => {
  it("contains only an opaque token — no personal data", () => {
    const { token } = issueBadgeToken();
    const p = qrPayload(token);
    expect(p).toMatch(/^IIEV1\.[A-Za-z0-9_-]{43}$/);
    expect(parseQrPayload(p)).toBe(token);
  });
  it("rejects foreign or malformed codes", () => {
    expect(parseQrPayload("https://example.com")).toBeNull();
    expect(parseQrPayload("IIEV1.short")).toBeNull();
    expect(parseQrPayload("IIEV1.<script>alert(1)</script>xxxxxxxxxxxxxxxxxxxxxxxxx")).toBeNull();
  });
});

describe("form validation", () => {
  const base = {
    fullName: "Asha Rao", designation: "Head of Sales", company: "VoltParts", email: "ASHA@Example.com ", phone: "098765 43210", city: "Pune", state: "Maharashtra", country: "India",
    segments: ["ev-components"], productDescription: "Hub motors and controllers", areaPreference: "Not sure yet", privacyAccepted: true, idempotencyKey: "3b241101-e2bb-4255-8caf-4136c566a962",
  };
  it("accepts a valid stall enquiry and normalises values", () => {
    const r = stallEnquirySchema.parse({ ...base, website: "voltparts.in" });
    expect(r.email).toBe("asha@example.com");
    expect(r.phone).toBe("09876543210");
    expect(r.website).toBe("https://voltparts.in");
    expect(r.marketingOptIn).toBe(false);
  });
  it("requires privacy consent and at least one segment", () => {
    const r = stallEnquirySchema.safeParse({ ...base, privacyAccepted: false, segments: [] });
    expect(r.success).toBe(false);
    const paths = r.success ? [] : r.error.issues.map((i) => i.path[0]);
    expect(paths).toContain("privacyAccepted");
    expect(paths).toContain("segments");
  });
  it("rejects unknown sector values (no injection of arbitrary tags)", () => {
    expect(stallEnquirySchema.safeParse({ ...base, segments: ["$where"] }).success).toBe(false);
  });
  it.each([["9876543210", true], ["+91 98765 43210", true], ["+44 20 7946 0958", true], ["12345", false], ["5876543210", false], ["+0123", false]])("phone %s → %s", (p, ok) => {
    expect(phoneField.safeParse(p).success).toBe(ok);
  });
  it("visitor registration requires interests", () => {
    const r = visitorRegistrationSchema.safeParse({ ...base, industry: "Fleet operator / logistics", reasonForVisit: "Other", sectorInterests: [] });
    expect(r.success).toBe(false);
  });
});

describe("Asia/Kolkata date handling", () => {
  it("interprets admin datetime input as IST and round-trips", () => {
    const d = istLocalToDate("2027-11-11T10:00")!;
    expect(d.toISOString()).toBe("2027-11-11T04:30:00.000Z");
    expect(dateToIstLocal(d)).toBe("2027-11-11T10:00");
  });
});

describe("misc", () => {
  it("slugify", () => expect(slugify("Batteries, Cells & BMS")).toBe("batteries-cells-and-bms"));
  it("sniffs real file signatures", () => {
    expect(sniffType(Buffer.from("%PDF-1.7 xxxxxxxx"))).toBe("application/pdf");
    expect(sniffType(Buffer.from("MZ\x90\x00 executable....."))).toBeNull();
  });
  it("legacy redirects map every old iievshow.com menu URL", () => {
    const froms = legacyRedirects.map((r) => r.from);
    for (const old of ["/about-us/", "/why-exhibit/", "/exhibitor-registration/", "/why-visit/", "/visitor-registration/", "/contact-us/", "/brochure/"]) expect(froms).toContain(old);
    for (const r of legacyRedirects) expect(r.to.startsWith("/")).toBe(true);
  });
});
