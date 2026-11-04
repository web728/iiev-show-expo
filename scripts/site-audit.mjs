// Whole-site browser audit: every sitemap route (+ utility routes) at several widths.
//   BASE_URL=http://localhost:3000 WIDTHS=375,768,1440 node scripts/site-audit.mjs [path ...]
// Per page/width it records: horizontal overflow, console errors, failed requests, broken or
// low-resolution images, missing alt text, small tap targets (mobile), heading outline,
// and (at the widest width) axe-core WCAG 2.2 AA violations. Full-page screenshots are saved.
// Output: qa-screenshots/<width>/<page>.jpg, qa-screenshots/audit.json, qa-screenshots/links.json
import puppeteer from "puppeteer-core";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const executablePath = [
  process.env.CHROME_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean).find((p) => existsSync(p));
if (!executablePath) throw new Error("No Chromium-based browser found; set CHROME_PATH");

async function routes() {
  if (process.argv.length > 2) return process.argv.slice(2);
  const xml = await (await fetch(BASE + "/sitemap.xml")).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const extra = ["/visit/badge/", "/search/?q=battery", "/site-map/", "/this-page-does-not-exist/"];
  return [...new Set([...locs, ...extra])];
}

const PAGES = await routes();
const WIDTHS = (process.env.WIDTHS || "375,768,1440").split(",").map(Number);
const AXE_WIDTH = Number(process.env.AXE_WIDTH || Math.max(...WIDTHS));
const SHOTS = process.env.SHOTS !== "0";
const out = path.resolve("qa-screenshots");
const report = [];
const links = new Map();

const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--hide-scrollbars", "--autoplay-policy=no-user-gesture-required"] });
try {
  for (const width of WIDTHS) {
    mkdirSync(path.join(out, String(width)), { recursive: true });
    for (const p of PAGES) {
      const page = await browser.newPage();
      const errors = [];
      const failed = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
      page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
      page.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("does-not-exist")) failed.push(`${r.status()} ${r.url().replace(BASE, "")}`); });
      page.on("requestfailed", (r) => { const f = r.failure()?.errorText || ""; if (!/ERR_ABORTED/.test(f)) failed.push(`${f} ${r.url().replace(BASE, "")}`); });
      const mobile = width < 768;
      await page.setViewport({ width, height: mobile ? 812 : 900, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
      await page.setCookie({ name: "iiev_consent", value: "0%7C1", url: BASE });
      const t0 = Date.now();
      const res = await page.goto(BASE + p, { waitUntil: "networkidle2", timeout: 90_000 });
      const loadMs = Date.now() - t0;
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 110)); }
        window.scrollTo(0, 0);
      });
      await new Promise((r) => setTimeout(r, 900));
      const info = await page.evaluate(() => {
        const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
        const imgs = [...document.images].filter(vis);
        const broken = imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src);
        const lowRes = imgs
          .filter((i) => i.naturalWidth > 0 && i.getBoundingClientRect().width > i.naturalWidth * 1.15 && !i.src.endsWith(".svg"))
          .map((i) => `${(i.currentSrc || i.src).replace(location.origin, "").slice(0, 90)} natural ${i.naturalWidth} shown ${Math.round(i.getBoundingClientRect().width)}`);
        const noAlt = [...document.images].filter((i) => !i.hasAttribute("alt")).map((i) => i.src.slice(0, 80));
        // Tap-target size is checked by axe-core's WCAG 2.2 "target-size" rule (accounts for spacing).
        const small = [];
        const deadLinks = [...document.querySelectorAll("a")].filter((a) => !a.getAttribute("href") || a.getAttribute("href") === "#").map((a) => a.textContent.trim().slice(0, 40));
        const headings = [...document.querySelectorAll("h1,h2,h3")].map((h) => `${h.tagName}:${h.textContent.trim().slice(0, 60)}`);
        const hrefs = [...new Set([...document.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => h.startsWith(location.origin)).map((h) => h.split("#")[0]))];
        const outbound = [...new Set([...document.querySelectorAll("a[href^='http']")].map((a) => a.href).filter((h) => !h.startsWith(location.origin)))];
        const clipped = [...document.querySelectorAll("h1,h2,h3,p,a,button,span,label")].filter(vis).filter((el) => el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow === "hidden" && !el.className.toString().includes("truncate") && !el.className.toString().includes("sr-only")).map((el) => el.textContent.trim().slice(0, 40));
        return { title: document.title, h1: document.querySelectorAll("h1").length, broken, lowRes, noAlt, small, deadLinks, headings, hrefs, outbound, clipped, height: document.body.scrollHeight, overflow: document.documentElement.scrollWidth - window.innerWidth };
      });
      for (const h of info.hrefs) { if (!links.has(h)) links.set(h, new Set()); links.get(h).add(p); }
      for (const h of info.outbound) { if (!links.has(h)) links.set(h, new Set()); links.get(h).add(p); }
      let axe = null;
      if (width === AXE_WIDTH || width === Math.min(...WIDTHS)) {
        await page.addScriptTag({ content: AXE });
        axe = await page.evaluate(async () => {
          const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } });
          return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes.slice(0, 3).map((n) => n.target.join(" ") + " :: " + (n.failureSummary || "").split("\n")[1]?.trim()) }));
        });
      }
      const name = (p === "/" ? "home" : p.replace(/^\/|\/$/g, "").replace(/[/?=]/g, "_")) + ".jpg";
      if (SHOTS) await page.screenshot({ path: path.join(out, String(width), name), fullPage: true, type: "jpeg", quality: 55 });
      const rest = { ...info }; delete rest.hrefs; delete rest.outbound;
      const row = { page: p, width, status: res?.status(), loadMs, ...rest, consoleErrors: errors, failedRequests: failed, axe };
      report.push(row);
      const problems = [
        info.overflow > 1 && `overflow ${info.overflow}px`, errors.length && `${errors.length} console errors`, failed.length && `${failed.length} failed requests`,
        info.broken.length && `${info.broken.length} broken images`, info.lowRes.length && `${info.lowRes.length} low-res images`, info.noAlt.length && `${info.noAlt.length} img without alt`,
        info.small.length && `${info.small.length} small targets`, info.deadLinks.length && `${info.deadLinks.length} dead links`, info.h1 !== 1 && `${info.h1} h1`,
        info.clipped.length && `${info.clipped.length} clipped`, axe?.length && `axe: ${axe.map((a) => `${a.id}(${a.n})`).join(",")}`,
      ].filter(Boolean);
      console.log(`${problems.length ? "✗" : "✓"} ${width} ${p} [${res?.status()}] ${problems.join("; ")}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
writeFileSync(path.join(out, "audit.json"), JSON.stringify(report, null, 2));
writeFileSync(path.join(out, "links.json"), JSON.stringify(Object.fromEntries([...links].map(([k, v]) => [k, [...v]])), null, 2));
