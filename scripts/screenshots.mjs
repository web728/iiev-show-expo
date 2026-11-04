// Visual QA: full-page screenshots at several widths + overflow & console-error checks.
//   BASE_URL=http://localhost:3000 node scripts/screenshots.mjs [path ...]
// Uses an installed Chromium-based browser (Edge/Chrome) via puppeteer-core.
// Output: qa-screenshots/<width>/<page>.jpg and qa-screenshots/report.json
import puppeteer from "puppeteer-core";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const browsers = [
  process.env.CHROME_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const executablePath = browsers.find((p) => existsSync(p));
if (!executablePath) throw new Error("No Chromium-based browser found; set CHROME_PATH");

const PAGES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/", "/exhibit/", "/exhibit/book-a-stall/", "/visit/", "/visit/register/", "/sectors/batteries-cells/", "/conference/", "/past-editions/2026-pune/", "/gallery/iiev-2026-pune/", "/videos/", "/contact/"];
const WIDTHS = (process.env.WIDTHS || "375,768,1440").split(",").map(Number);
const out = path.resolve("qa-screenshots");
const report = [];

const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--hide-scrollbars", "--autoplay-policy=no-user-gesture-required"] });
try {
  for (const width of WIDTHS) {
    mkdirSync(path.join(out, String(width)), { recursive: true });
    for (const p of PAGES) {
      const page = await browser.newPage();
      const errors = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
      page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
      await page.setViewport({ width, height: width < 768 ? 812 : 900, deviceScaleFactor: 1, isMobile: width < 768, hasTouch: width < 768 });
      await page.setCookie({ name: "iiev_consent", value: "0%7C1", url: BASE });
      await page.goto(BASE + p, { waitUntil: "networkidle2", timeout: 60_000 });
      // Scroll through to trigger lazy images and in-view animations
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
        window.scrollTo(0, 0);
      });
      await new Promise((r) => setTimeout(r, 800));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const name = (p === "/" ? "home" : p.replace(/^\/|\/$/g, "").replace(/\//g, "_")) + ".jpg";
      await page.screenshot({ path: path.join(out, String(width), name), fullPage: true, type: "jpeg", quality: 60 });
      report.push({ page: p, width, overflowPx: overflow, consoleErrors: errors });
      console.log(`${overflow > 1 || errors.length ? "✗" : "✓"} ${width} ${p}${overflow > 1 ? ` overflow ${overflow}px` : ""}${errors.length ? ` errors: ${errors[0]}` : ""}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
writeFileSync(path.join(out, "report.json"), JSON.stringify(report, null, 2));
