# IIEV Show 2027 website: developer handover (start here)

This package contains the complete source code, content, media and documentation for the official website and
operations system of the **India International EV Show, 9th Edition (11–13 November 2027, Auto Cluster Exhibition Centre,
Pimpri-Chinchwad, Pune)**. It includes the public website, admin CMS, enquiry forms with CRM, visitor registration with QR
badges and gate check-in.

It is a standard **Next.js 16 + MongoDB** app. It has been built and tested locally, but it has **not been deployed anywhere yet**.

---

## 1. What's in this zip

| Folder / file | What it is |
|---|---|
| `iiev-website/` | The full project (source, media, scripts, tests, docs). `node_modules`, build output and secrets are excluded. |
| `iiev-website/docs/` | All documentation: deployment, integrations, CMS guide, badge/check-in runbook, RBAC, data map, QA evidence, fact register, pending approvals |
| `iiev-website/.env.example` | Every environment variable (names only, with explanations) |
| `brand-source/` | Original inputs from the organiser: EV Stylescape PDF, 9th-edition IIEV logo, Futurex logo, concurrent show logos |
| `IIEV_Show_2027_Final_Master_Website_Prompt.docx` | The original specification the site was built to |

## 2. Run it locally (about 10 minutes)

Requirements: Node.js 20.9+ (24 LTS recommended) and npm.

```bash
cd iiev-website
npm install
cp .env.example .env.local        # then fill APP_SECRET, APP_ENCRYPTION_KEY, MONGODB_URI (see below)
npm run db:local                  # terminal 1: local MongoDB on :27027 (or use an Atlas URI instead)
npm run seed                      # with ADMIN_EMAIL / ADMIN_NAME set → prints a one-time admin invite link
npm run dev                       # http://localhost:3000   ·   admin: http://localhost:3000/admin/
```

Generate secrets with:
`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
(use one for `APP_SECRET` and another for `APP_ENCRYPTION_KEY`).
For local DB: `MONGODB_URI=mongodb://127.0.0.1:27027/iiev`.

## 3. Verify (all of these pass on the delivered code)

| Command | Last result |
|---|---|
| `npm run typecheck` / `npm run lint` | 0 errors |
| `npm test` (unit + integration, real in-memory MongoDB) | 46 / 46 passed |
| `npm run build` | Success |
| `BASE_URL=http://localhost:3100 npm run test:e2e` (against `npm start -p 3100`) | 87 / 87 passed |
| `BASE_URL=… npm run qa:forms` (real browser: forms → database → badge/QR) | 8 / 8 passed |
| `BASE_URL=… npm run qa:screens` / `node scripts/site-audit.mjs` | Screenshots at 375/768/1440 px, overflow, console errors, broken images, axe WCAG 2.2 |

The browser scripts use an installed Edge or Chrome (`CHROME_PATH` to override).

## 4. Go-live steps

Full detail is in `docs/DEPLOYMENT_GUIDE.md` and `docs/INTEGRATION_SETUP.md`.

1. **Hosting:** Vercel is simplest (built-in cron). Render, Railway or any Node VPS behind HTTPS also works.
2. **Database:** MongoDB Atlas. Use separate staging and production clusters (M10+ for event week), and turn on backups.
3. **Staging first:** set `SITE_ENV=staging`, `STAGING_BASIC_AUTH=user:pass` and `NEXT_PUBLIC_SITE_URL=https://staging…`. Staging is automatically `noindex`.
4. **Environment variables:** set everything in `.env.example` in the host's encrypted settings, including:
   - `CRON_SECRET`.
   - `TRUSTED_PROXY_HOPS=1`.
   - SMTP: Gmail App Password to start, then a transactional provider for volume. Set up SPF, DKIM and DMARC.
   - Google Sheets service account.
   - S3/R2 bucket, which is required on serverless hosts for CMS uploads.
5. **Seed and admin:** run `npm run seed` against the database to get the Super Admin invite. Enable MFA for that account, then invite staff with the correct roles (`docs/RBAC_MATRIX.md`).
6. **Cron:** call `GET /api/jobs/run/` every 5 minutes with `Authorization: Bearer <CRON_SECRET>`. This retries Sheets and email jobs.
7. **Test on staging:**
   - `npm run test:e2e`, `qa:forms` and `site-audit` against the staging URL.
   - Lighthouse on key pages.
   - Real email, Sheets and S3 checks.
   - A QR scanner rehearsal on real phones at `/admin/check-in/`.
8. **Production:**
   - Only with **written organiser authorisation** to touch iievshow.com.
   - Set `SITE_ENV=production`, `NEXT_PUBLIC_SITE_URL=https://iievshow.com`, and **`ALLOW_INDEXING=true` only at launch**.
   - Point DNS.
   - Apply the old-URL redirect map (`docs/SEO_MIGRATION.csv`).
   - Submit the sitemap to Search Console and Bing.
   - Set up an uptime monitor on `/api/health/`.

## 5. Things the organiser must still provide or approve

The full list is in `docs/PENDING_APPROVALS.md`. **Nothing has been invented on the site; unknowns are hidden or marked "to be announced".**

- **Approve or decline the projected figures** (150+ exhibitors, 15,000+ visitors, 100+ speakers). They are currently hidden; there's a toggle in Admin → Edition settings.
- **Business details:**
  - Admission policy.
  - Stall rates and floor plan.
  - Exhibitor manual.
  - Brochure.
  - Sponsorship packages.
  - The 2027 conference title and programme.
- **Partners:** whether the Battery and Solar shows are co-located in 2027, plus exhibitor, partner and speaker lists with logos and consent.
- **Organiser details:** legal name, contacts and venue street address, reconfirmed for 2027.
- **Legal review** of the privacy, terms, cookie and accessibility pages. They are live as clearly labelled drafts.
- **Testimonial videos:** names and designations of the speakers in the 6 exhibitor videos. They are currently labelled only by stand.
- **Accounts and credentials:** hosting, domain/DNS, Atlas, SMTP sending domain, Google Sheet and service account, S3/R2, GA4 and Search Console.

## 6. Known open items (not blockers for staging)

- **AI sector illustrations:** 5 of the 10 sector images are AI illustrations, labelled "AI illustration" on the site: components, motors, manufacturing, fleet software and testing/recycling. The other 5 use real 2026 photos. Replace them with real photos when available (`public/media/sectors/` and `src/content/sectors.ts → VISUALS`).
- **Accessibility:** minor axe findings remain — one contrast item on `/past-editions/`, and tap-target spacing on `/contact/` and on the home page. `node scripts/site-audit.mjs` lists them.
- **Not yet testable locally:** Lighthouse/Core Web Vitals, live email/Sheets/S3, real-device camera scanning, load testing and Safari/Firefox. All of these need the staging environment.
- **Payments:** deliberately not built until prices, tax and refund policy, and the payment provider are approved.

## 7. Security changes in the final round

- The proxy now reads CMS redirects directly from MongoDB. It no longer makes an HTTP self-call built from the request Host header, which could have poisoned the redirect cache. The `/api/internal/redirects` route and `INTERNAL_API_KEY` were removed.
- Rate-limit IP detection no longer trusts the client-supplied left-most `X-Forwarded-For` value (see `TRUSTED_PROXY_HOPS`).
- Redirect destinations entered in the CMS are validated: a site path or an `https://` URL only.
- The export `edition` parameter is sanitised, and the staging Basic-auth comparison is now timing-safe.

## 8. Ground rules (please keep)

- Never publish unverified statistics, exhibitors, speakers, sponsors, prices or testimonials. Content is managed in the CMS.
- Don't recolour or redraw the official logos. The brand follows the Stylescape:
  - Font: Montserrat.
  - Colours: #1D8043, #F9C900, #001433, #0068AF.
  - Gradient: #0068AF → #16893F.
- Event photos and videos come from the organiser's 2026 Google Drive. Provenance is in `docs/ASSET_MANIFEST.md` and `src/content/media-2026.json`.
