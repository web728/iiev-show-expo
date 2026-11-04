// End-to-end HTTP smoke test against a running server.
//   BASE_URL=http://localhost:3000 node scripts/smoke-test.mjs
// Exercises real routes, redirects, headers, protections and form APIs.
// Writes qa-report.json with every result. Exits non-zero on any failure.

import { writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const results = [];
let failed = 0;
const ok = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  if (!pass) failed++;
  console.log(`${pass ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const PUBLIC = [
  "/", "/about/", "/why-iiev/", "/past-editions/", "/past-editions/2024-pune/", "/concurrent-events/",
  "/exhibit/", "/exhibit/why-exhibit/", "/exhibit/exhibitor-profile/", "/exhibit/book-a-stall/", "/exhibit/floor-plan/", "/exhibit/information/", "/exhibit/faqs/",
  "/visit/", "/visit/why-visit/", "/visit/visitor-profile/", "/visit/register/", "/visit/venue/", "/visit/travel/", "/visit/faqs/", "/visit/badge/",
  "/sectors/", "/sectors/electric-vehicles/", "/sectors/batteries-cells/", "/sectors/charging-infrastructure/",
  "/exhibitors/", "/conference/", "/conference/agenda/", "/conference/speakers/", "/conference/register/", "/conference/apply-to-speak/",
  "/sponsorship/", "/sponsorship/enquire/", "/partners/", "/become-a-partner/",
  "/media/", "/news/", "/insights/", "/gallery/", "/videos/", "/downloads/",
  "/faq/", "/contact/", "/search/?q=battery", "/site-map/",
  "/privacy-policy/", "/terms/", "/cookie-policy/", "/accessibility/",
];

const text = (html, re) => (re.exec(html)?.[1] ?? "").replace(/\s+/g, " ").trim();

async function main() {
  const titles = new Map();
  for (const p of PUBLIC) {
    const r = await fetch(BASE + p, { redirect: "manual" });
    const html = await r.text();
    const title = text(html, /<title>([^<]*)<\/title>/i);
    const h1s = (html.match(/<h1[\s>]/gi) || []).length;
    const canonical = /<link rel="canonical" href="([^"]+)"/i.exec(html)?.[1];
    const desc = /<meta name="description" content="([^"]*)"/i.exec(html)?.[1];
    const issues = [];
    if (r.status !== 200) issues.push(`status ${r.status}`);
    if (!title) issues.push("no title");
    if (h1s !== 1) issues.push(`${h1s} h1`);
    if (!p.startsWith("/search") && !canonical) issues.push("no canonical");
    if (!p.startsWith("/search") && !desc) issues.push("no description");
    if (/lorem ipsum/i.test(html)) issues.push("lorem ipsum");
    if (titles.has(title) && !p.startsWith("/search")) issues.push(`duplicate title with ${titles.get(title)}`);
    titles.set(title, p);
    ok(`GET ${p}`, issues.length === 0, issues.join(", ") || title);
  }

  // Non-production must be noindex
  const home = await fetch(BASE + "/");
  const homeHtml = await home.text();
  ok("Non-production pages are noindex", /<meta name="robots" content="noindex/i.test(homeHtml));
  ok("Homepage has ExhibitionEvent JSON-LD", /"@type":"ExhibitionEvent"/.test(homeHtml) && /"startDate":"2027-11-11"/.test(homeHtml));
  ok("Homepage shows dates & venue", homeHtml.includes("11–13 November 2027") && homeHtml.includes("Auto Cluster Exhibition Centre"));
  ok("Unapproved forecast figures are NOT shown", !homeHtml.includes("15,000+"));

  // Security headers
  const h = home.headers;
  for (const k of ["content-security-policy", "x-content-type-options", "referrer-policy", "x-frame-options", "permissions-policy"]) ok(`Header ${k}`, Boolean(h.get(k)));
  ok("No x-powered-by", !h.get("x-powered-by"));

  // Legacy redirects (SEO migration)
  for (const [from, to] of [["/about-us/", "/about/"], ["/exhibitor-registration/", "/exhibit/book-a-stall/"], ["/visitor-registration/", "/visit/register/"], ["/contact-us/", "/contact/"], ["/why-exhibit/", "/exhibit/why-exhibit/"]]) {
    const r = await fetch(BASE + from, { redirect: "manual" });
    ok(`301 ${from} → ${to}`, r.status === 301 && (r.headers.get("location") || "").endsWith(to), `${r.status} ${r.headers.get("location")}`);
  }

  // 404
  const nf = await fetch(BASE + "/this-page-does-not-exist/");
  ok("Unknown URL returns 404", nf.status === 404);

  // Sitemap / robots
  const sm = await (await fetch(BASE + "/sitemap.xml")).text();
  ok("sitemap.xml lists canonical pages", sm.includes("/exhibit/book-a-stall/") && sm.includes("/sectors/electric-vehicles/"));
  ok("sitemap.xml excludes private routes", !sm.includes("/admin") && !sm.includes("/api/") && !sm.includes("/visit/badge"));
  const robots = await (await fetch(BASE + "/robots.txt")).text();
  ok("robots.txt blocks crawling outside production", /Disallow: \//.test(robots));

  // Admin & API protection
  const adm = await fetch(BASE + "/admin/", { redirect: "manual" });
  ok("Admin requires sign-in", [302, 303, 307, 308].includes(adm.status) && (adm.headers.get("location") || "").includes("/admin/login"));
  for (const p of ["/api/admin/export/leads/", "/api/admin/checkin/?q=test"]) {
    const r = await fetch(BASE + p);
    ok(`Protected API ${p} → 401/403`, r.status === 401 || r.status === 403, String(r.status));
  }
  const jobs = await fetch(BASE + "/api/jobs/run/");
  ok("Job runner requires CRON_SECRET", jobs.status === 401);
  const internal = await fetch(BASE + "/api/internal/redirects/");
  ok("No internal redirects HTTP endpoint (proxy reads DB directly)", internal.status === 404);

  // Health
  const health = await fetch(BASE + "/api/health/");
  ok("Health endpoint", health.status === 200 || health.status === 503, String(health.status));

  // Forms
  const post = (url, body, headers = {}) => fetch(BASE + url, { method: "POST", headers: { "Content-Type": "application/json", Origin: BASE, ...headers }, body: JSON.stringify(body) });
  const stall = { fullName: "Smoke Test", designation: "QA", company: "Smoke Co", email: `smoke+${Date.now()}@example.com`, phone: "9876543210", city: "Pune", state: "Maharashtra", country: "India", segments: ["ev-components"], productDescription: "Smoke test products", areaPreference: "Not sure yet", privacyAccepted: true, marketingOptIn: false, idempotencyKey: randomUUID(), startedAt: Date.now() - 10_000 };
  const s1 = await post("/api/forms/stall/", stall);
  const s1j = await s1.json();
  ok("Stall enquiry accepted with reference", s1.status === 201 && /^ST-27-/.test(s1j.ref), `${s1.status} ${s1j.ref}`);
  const s2 = await post("/api/forms/stall/", stall);
  ok("Retry with same idempotency key returns same ref", (await s2.json()).ref === s1j.ref);
  const bad = await post("/api/forms/stall/", { ...stall, email: "nope", idempotencyKey: randomUUID() });
  ok("Invalid input → 422 with field errors", bad.status === 422 && Boolean((await bad.json()).fieldErrors?.email));
  const cross = await post("/api/forms/contact/", { ...stall }, { Origin: "https://evil.example" });
  ok("Cross-origin POST rejected", cross.status === 403);
  const notJson = await fetch(BASE + "/api/forms/contact/", { method: "POST", headers: { "Content-Type": "text/plain", Origin: BASE }, body: "x" });
  ok("Non-JSON body rejected", notJson.status === 400 || notJson.status === 415);
  const bot = await post("/api/forms/contact/", { ...stall, website_url_confirm: "http://spam", idempotencyKey: randomUUID() });
  ok("Honeypot submission silently dropped", bot.status === 200 && (await bot.json()).ref === "RECEIVED");

  const vEmail = `smoke.visitor+${Date.now()}@example.com`;
  const visitor = { fullName: "Smoke Visitor", email: vEmail, phone: "9876543210", company: "Smoke Fleet", designation: "Manager", industry: "Fleet operator / logistics", city: "Pune", state: "Maharashtra", country: "India", reasonForVisit: "Other", sectorInterests: ["electric-vehicles"], privacyAccepted: true, marketingOptIn: false, idempotencyKey: randomUUID(), startedAt: Date.now() - 10_000 };
  const v1 = await post("/api/visitors/register/", visitor);
  const v1j = await v1.json();
  ok("Visitor registration", v1.status === 201 && /^VS-27-/.test(v1j.ref), `${v1.status} ${v1j.status}`);
  if (v1j.badgeAccess) {
    const pdf = await fetch(`${BASE}/api/badge/pdf/?t=${encodeURIComponent(v1j.badgeAccess)}`);
    const buf = Buffer.from(await pdf.arrayBuffer());
    ok("Badge PDF downloads", pdf.status === 200 && buf.subarray(0, 5).toString() === "%PDF-", `${buf.length} bytes`);
    const view = await fetch(`${BASE}/visit/badge/view/?t=${encodeURIComponent(v1j.badgeAccess)}`);
    const vh = await view.text();
    ok("Badge page shows QR + name, noindex", view.status === 200 && vh.includes("Smoke Visitor") && vh.includes("<svg") && /noindex/.test(vh));
  }
  const tampered = await fetch(`${BASE}/api/badge/pdf/?t=${encodeURIComponent((v1j.badgeAccess || "x") + "x")}`);
  ok("Tampered badge link rejected", tampered.status === 401);
  const v2 = await post("/api/visitors/register/", { ...visitor, idempotencyKey: randomUUID() });
  ok("Duplicate email registration → 409", v2.status === 409);
  const r1 = await post("/api/badge/request/", { email: vEmail });
  const r2 = await post("/api/badge/request/", { email: `nobody+${Date.now()}@example.com` });
  ok("Badge retrieval is enumeration-safe (identical responses)", r1.status === r2.status && (await r1.json()).message === (await r2.json()).message);

  const cal = await fetch(BASE + "/api/calendar/");
  ok("Calendar .ics", cal.status === 200 && (await cal.text()).includes("DTSTART;VALUE=DATE:20271111"));

  writeFileSync("qa-report.json", JSON.stringify({ base: BASE, at: new Date().toISOString(), passed: results.length - failed, failed, results }, null, 2));
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
