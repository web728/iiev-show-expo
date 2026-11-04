# India International EV Show 2027 — website & operations platform

Official website, CMS and event-operations system for the **9th India International EV Show**
(11–13 November 2027, Auto Cluster Exhibition Centre, Pimpri-Chinchwad, Pune). Built from scratch.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · Motion · MongoDB (Mongoose 9) ·
Google Sheets API · SMTP (Nodemailer) · pdf-lib + QR · jose/bcrypt auth with TOTP MFA · Vitest.

## Quick start (local)

```bash
npm install
npm run db:local          # terminal 1: real local MongoDB on :27027 (data in ~/.iiev-local-mongo)
cp .env.example .env.local  # fill APP_SECRET, APP_ENCRYPTION_KEY, MONGODB_URI=mongodb://127.0.0.1:27027/iiev
ADMIN_EMAIL=you@example.com ADMIN_NAME="Your Name" npm run seed   # prints a one-time admin invite link
npm run dev               # http://localhost:3000  ·  admin: /admin/
```

On Windows PowerShell set env vars first: `$env:ADMIN_EMAIL="you@example.com"; npm run seed`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Develop / production build / serve |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm test` | Unit + integration tests (real in-memory MongoDB) |
| `npm run test:e2e` | HTTP end-to-end smoke test against a running server (`BASE_URL=…`) → `qa-report.json` |
| `npm run seed` | Idempotent migrations (indexes) + content seed + optional Super Admin invite |
| `npm run db:local` | Local persistent MongoDB for development (data in `~/.iiev-local-mongo`, outside the project) |
| `npm run qa:screens` | Full-page screenshots at 375/768/1440 px + overflow & console-error check (needs Edge/Chrome installed) |
| `npm run qa:forms` | Real-browser form journeys: validation, stall enquiry, visitor registration → badge, contact |

## Where things are

```
src/app/(site)/      public pages (55+ routes)        src/app/admin/       CMS & operations (RBAC)
src/app/api/         forms, badge, check-in, export   src/lib/             auth, db, jobs, email, sheets, badge, seo, storage
src/models/          Mongoose models                  src/content/         seed content (sectors, FAQs, history, legal drafts)
src/config/          site/edition defaults, nav, redirects, options
scripts/             seed, local DB, smoke test       tests/               Vitest suites
docs/                all handover documentation (start with docs/IMPLEMENTATION_STATUS.md)
```

## Documentation

Start with **[docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md)** (honest feature status) and
**[docs/PENDING_APPROVALS.md](docs/PENDING_APPROVALS.md)** (what the organiser must supply). Then
[DEPLOYMENT_GUIDE](docs/DEPLOYMENT_GUIDE.md), [INTEGRATION_SETUP](docs/INTEGRATION_SETUP.md), [CMS_GUIDE](docs/CMS_GUIDE.md),
[BADGE_AND_CHECKIN_RUNBOOK](docs/BADGE_AND_CHECKIN_RUNBOOK.md), [QA_REPORT](docs/QA_REPORT.md).

## Ground rules

- No fabricated statistics, exhibitors, speakers, sponsors, prices or testimonials. Unknowns are CMS-managed with honest empty states.
- Staging is always `noindex`; production indexing requires `SITE_ENV=production` **and** `ALLOW_INDEXING=true`.
- Do not point iievshow.com at this build without explicit organiser authorisation.
