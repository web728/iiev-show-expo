// Real-browser form journeys (fills fields like a user, submits, verifies outcomes).
//   BASE_URL=http://localhost:3000 node scripts/forms-e2e.mjs
import puppeteer from "puppeteer-core";
import { existsSync, mkdirSync } from "node:fs";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const exe = [process.env.CHROME_PATH, "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Google/Chrome/Application/chrome.exe", "/usr/bin/google-chrome"].filter(Boolean).find((p) => existsSync(p));
mkdirSync("qa-screenshots/forms", { recursive: true });
let failed = 0;
const ok = (name, pass, detail = "") => { if (!pass) failed++; console.log(`${pass ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`); };
const stamp = Date.now();

const browser = await puppeteer.launch({ executablePath: exe, headless: true });
async function open(path, width = 390) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900, isMobile: width < 768, hasTouch: width < 768 });
  await page.setCookie({ name: "iiev_consent", value: "0%7C1", url: BASE });
  await page.goto(BASE + path, { waitUntil: "networkidle2", timeout: 60_000 });
  return page;
}
const type = (page, sel, v) => page.type(sel, v, { delay: 5 });

try {
  // 1. Validation on empty submit
  {
    const page = await open("/exhibit/book-a-stall/");
    await new Promise((r) => setTimeout(r, 2800));
    await page.click("form button[type=submit]");
    await page.waitForSelector("#form-error-summary", { timeout: 10_000 });
    const n = await page.$$eval("[id$='-error']", (els) => els.length);
    ok("Empty stall form shows inline errors", n >= 5, `${n} field errors`);
    await page.close();
  }

  // 2. Stall enquiry (mobile)
  {
    const page = await open("/exhibit/book-a-stall/");
    await type(page, "#fullName", "Priya Kulkarni");
    await type(page, "#designation", "Head of Business Development");
    await type(page, "#company", "VoltDrive Components Pvt Ltd");
    await type(page, "#email", `priya+${stamp}@example.com`);
    await type(page, "#phone", "9822012345");
    await type(page, "#website", "voltdrive.example");
    await page.select("#state", "Maharashtra");
    await type(page, "#city", "Pune");
    await page.click("input[name=segments][value=motors-drivetrain]");
    await page.click("input[name=segments][value=ev-components]");
    await type(page, "#productDescription", "BLDC hub motors and controllers for electric two-wheelers.");
    await page.select("#areaPreference", "19–36 sq m");
    await page.click("#privacyAccepted");
    await new Promise((r) => setTimeout(r, 1500));
    await page.click("form button[type=submit]");
    await page.waitForFunction(() => /ST-27-[A-Z0-9]{6}/.test(document.body.innerText), { timeout: 15_000 });
    const ref = await page.evaluate(() => /ST-27-[A-Z0-9]{6}/.exec(document.body.innerText)?.[0]);
    await page.screenshot({ path: "qa-screenshots/forms/stall-success.jpg", type: "jpeg", quality: 70 });
    ok("Stall enquiry submitted from the UI", Boolean(ref), ref);
    await page.close();
  }

  // 3. Visitor registration → badge (mobile)
  {
    const page = await open("/visit/register/");
    await type(page, "#fullName", "Rahul Deshmukh");
    await type(page, "#email", `rahul+${stamp}@example.com`);
    await type(page, "#phone", "+91 98220 11223");
    await type(page, "#company", "GreenFleet Logistics");
    await type(page, "#designation", "Fleet Manager");
    await page.select("#industry", "Fleet operator / logistics");
    await page.select("#state", "Maharashtra");
    await type(page, "#city", "Pune");
    await page.select("#reasonForVisit", "Evaluate technology for my business");
    await page.click("input[name=sectorInterests][value=electric-vehicles]");
    await page.click("input[name=sectorInterests][value=charging-infrastructure]");
    await page.click("#privacyAccepted");
    await new Promise((r) => setTimeout(r, 1500));
    await page.click("form button[type=submit]");
    await page.waitForFunction(() => document.body.innerText.includes("You're registered") || document.body.innerText.includes("Registration received"), { timeout: 15_000 });
    const ref = await page.evaluate(() => /VS-27-[A-Z0-9]{6}/.exec(document.body.innerText)?.[0]);
    await page.screenshot({ path: "qa-screenshots/forms/visitor-success.jpg", type: "jpeg", quality: 70 });
    ok("Visitor registration from the UI", Boolean(ref), ref);
    const badgeHref = await page.$eval("a[href*='/visit/badge/view/']", (a) => a.href).catch(() => null);
    if (badgeHref) {
      await page.goto(badgeHref, { waitUntil: "networkidle2" });
      const hasQr = await page.$("article svg");
      const name = await page.evaluate(() => document.querySelector("article h1")?.textContent);
      await page.screenshot({ path: "qa-screenshots/forms/badge.jpg", type: "jpeg", quality: 70 });
      ok("Badge page shows QR and name", Boolean(hasQr) && /RAHUL/i.test(name || ""), name || "");
    } else ok("Badge link shown after registration", false);
    await page.close();
  }

  // 4. Contact form (desktop)
  {
    const page = await open("/contact/", 1280);
    await type(page, "#fullName", "Ananya Iyer");
    await type(page, "#email", `ananya+${stamp}@example.com`);
    await page.select("#topic", "Media & press");
    await type(page, "#message", "I'd like media access for the 2027 edition for an EV trade publication.");
    await page.click("#privacyAccepted");
    await new Promise((r) => setTimeout(r, 2800));
    await page.click("form button[type=submit]");
    await page.waitForFunction(() => /CT-27-[A-Z0-9]{6}/.test(document.body.innerText), { timeout: 15_000 });
    ok("Contact form submitted from the UI", true);
    await page.close();
  }

  // 5. Journey picker + mobile menu interaction
  {
    const page = await open("/");
    const tabs = await page.$$("[role=tab]");
    await tabs[1].click();
    await new Promise((r) => setTimeout(r, 600));
    const panel = await page.$eval("[role=tabpanel] h3", (h) => h.textContent);
    ok("Journey picker switches path", /vehicles, batteries/i.test(panel || ""), panel || "");
    await page.click("button[aria-label='Open menu']");
    await page.waitForSelector("[role=dialog][aria-label='Site menu']");
    ok("Mobile menu opens", true);
    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 300));
    ok("Mobile menu closes with Escape", !(await page.$("[role=dialog][aria-label='Site menu']")));
    await page.close();
  }
} catch (e) {
  failed++;
  console.error("✗ error:", e.message);
} finally {
  await browser.close();
}
console.log(failed ? `\n${failed} failure(s)` : "\nAll form journeys passed");
process.exit(failed ? 1 : 0);
