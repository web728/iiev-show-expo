# Implementation status

Status as of **12 Oct 2026**. Every feature is assigned one factual status per the spec's Definition of Done:

- **(1) Implemented and tested** — end-to-end path verified by automated tests and/or the smoke test.
- **(2) Implemented — configuration pending** — code complete; needs real credentials/content to verify live.
- **(3) Blocked by organiser/service access** — needs organiser input or account access.
- **(4) Not implemented**.

Evidence: `npm test` (46 tests, real MongoDB), `npm run test:e2e` (87 HTTP checks), `npm run lint`, `npm run typecheck`, `npm run build` — all passing; see [QA_REPORT.md](QA_REPORT.md).

## Public website

| Feature | Status | Notes |
|---|---|---|
| Brand system (Montserrat, Stylescape palette & gradient, original logos, stroke icons, geometric motifs) | 1 | Logos used as supplied (transparent padding trimmed losslessly, no recolour). |
| Header (mega menu, accessible mobile drawer, CTAs) / footer | 1 | Keyboard, Esc, focus trap; tested at 375 px and 1440 px. |
| Homepage blueprint (hero, overview, sectors, exhibit/visit, conference, participants, history, venue, CTA) | 1 | Forecast KPIs and concurrent-show logos hidden until approved in CMS. |
| All IA route groups (core, exhibit, visit, sectors, directory, conference, commercial, editorial, utilities, legal, system) | 1 | 49 public routes smoke-tested: 200, one H1, unique title, description, canonical. |
| 10 substantive sector pages | 1 | Distinct buyer-oriented copy; no market-size claims. |
| Past-editions archive (2022–2026, 8 editions) with sources & confidence labels | 1 | Contradictions shown, not merged. Stats withheld until post-show reports. |
| Exhibitor directory (search, sector filter, edition archive, pagination, profiles) | 1 | Empty state until listings are published. |
| Conference hub, agenda (day/track filters, IST), speakers, delegate & speaker forms | 1 | Programme content is organiser-pending (status 3 for content). |
| News, insights, gallery (accessible lightbox), videos (privacy facade), downloads | 1 | Content pending. Gallery albums cannot publish without rights confirmation. |
| Site search, HTML site map, custom 404 / error pages | 1 | |
| Legal pages (privacy, terms, cookies, accessibility) | 2 | Drafts clearly labelled "under legal review"; replace via CMS Pages. |
| Cookie consent (equal-weight accept/reject), consent-gated GA4 | 2 | Needs `NEXT_PUBLIC_GA_ID`. Verified no analytics script loads without consent. |
| Hindi/Marathi | 4 | By design: launch in English; architecture allows later language routes. |

## Experience redesign (round 2, 12 Oct 2026)

| Feature | Status | Notes |
|---|---|---|
| Video hero from real 2026 footage, live countdown, "I'm here to" quick paths | 1 | Video pauses off-screen; poster only for reduced-motion / data-saver; pause button |
| Journey picker (Exhibit / Visit / Sponsor / Speak / Media) with tailored steps & CTAs | 1 | Accessible tabs, animated panels |
| Real event photography across site (59 photos), photo heroes on 35+ pages, marquee, bento moments, 2026 gallery album | 1 | See ASSET_MANIFEST |
| Exhibitor video testimonials (6) with modal player | 1 | Speaker names pending organiser |
| Magnific AI sector illustrations (10), labelled as AI | 1 | |
| Page transitions (React ViewTransition), scroll progress bar, count-up facts, sticky mobile CTA bar | 1 | All respect prefers-reduced-motion |
| Image & video sitemap, VideoObject schema, real photos in Event schema | 1 | |

## Forms, CRM and integrations

| Feature | Status | Notes |
|---|---|---|
| Stall / sponsorship / partner / speaker / delegate / contact forms | 1 | Server validation (zod), honeypot + timing check, rate limits, origin check, idempotency keys. |
| MongoDB primary record → queued Sheets → 2 organiser emails → acknowledgement | 1 (logic) / 2 (live) | Job queue, retries with backoff and truthful "skipped / failed" states tested. Live Gmail/Sheets not tested — no credentials supplied. |
| CRM pipeline (7 stages), owner assignment, notes, follow-up tasks, stage history, audit | 1 | |
| CSV exports (formula-injection safe, permission-checked, audited) | 1 | |
| Payment collection | 4 | Deliberately not built until pricing/tax/refund policy and provider are approved. |

## Visitor registration, badges, check-in

| Feature | Status | Notes |
|---|---|---|
| Registration (auto or reviewed approval), dedupe per email/edition, explicit statuses | 1 | |
| Opaque 256-bit QR tokens (hash for lookup, AES-GCM at rest), no PII in QR | 1 | |
| Branded A6 PDF badge (official logo, Montserrat, QR, ID) and on-screen badge | 1 | |
| Email-verified badge retrieval (enumeration-safe), 7-day signed links invalidated on reissue | 1 (logic) / 2 (email) | |
| Admin approve/reject/cancel/correct/reissue/resend; walk-in desk registration | 1 | |
| Check-in station: camera (BarcodeDetector/jsQR), handheld scanner, manual search; duplicate/revoked handling; server timestamps | 1 (server) / 2 (devices) | Concurrency-safe counts tested. Camera tested only for permission flow — test real devices at the venue. |
| Offline check-in | 4 (decision) | Online-only with documented contingency — see BADGE_AND_CHECKIN_RUNBOOK.md. |
| Mobile wallet passes | 4 | Optional enhancement, not claimed. |

## CMS & security

| Feature | Status | Notes |
|---|---|---|
| Admin auth (bcrypt, DB-backed revocable sessions, lockout, rate limits, invite & reset flows) | 1 | |
| TOTP MFA (RFC 6238 test vector verified) | 1 | |
| RBAC: 7 roles, server-side checks on every page/action/API | 1 | Analyst role has no access to personal data. |
| Content CRUD for 13 resource types, draft/review/publish/archive, scheduling via publish date, version history + rollback | 1 | Locked history records editable by Super Admin only. |
| Edition & site settings (dates, venue, approval mode, forecasts gate, recipients, contacts, documents) | 1 | No rebuild needed. |
| Media uploads: magic-byte check, EXIF/GPS stripping, size limits, S3/R2 adapter | 1 (local) / 2 (S3) | |
| Redirects (code + CMS), sitemap.xml, robots.txt, metadata, JSON-LD (Event, Org, Breadcrumb, FAQ, Article, Person) | 1 | |
| Security headers (CSP, HSTS in prod, XFO, nosniff, Permissions-Policy), staging basic auth + noindex | 1 | |
| Health endpoint, PII-redacting structured logs, audit log | 1 | |
| Backups, uptime monitoring, error tracking | 3 | Depends on chosen host/Atlas tier — see OPERATIONS_RUNBOOK.md. |
| Lighthouse / Core Web Vitals field data | 3 | Must be measured on the deployed staging URL. No scores are claimed. |
| Staging deployment | 3 | Needs hosting account access. |

## Round 3 — audit fixes (12 Oct 2026)

Verified after these changes: `npm run build` OK, `tsc` 0 errors, `npm run lint` 0 errors, `npm test` 46/46, `npm run test:e2e` 87/87 against the production build, `npm run qa:forms` 8/8 in a real browser (stall enquiry, visitor registration → badge with QR, contact, validation, journey picker, mobile menu).
- Security: `src/proxy.ts` no longer self-fetches redirects via a Host-derived URL (cache-poisoning / key leak) — reads MongoDB via `src/lib/data/redirect-map.ts`; `/api/internal/redirects` and `INTERNAL_API_KEY` removed. `clientIp` no longer trusts the left-most X-Forwarded-For (`TRUSTED_PROXY_HOPS`). CMS redirect `to` validated (site path or https). Export `edition` param sanitised. Staging basic auth timing-safe.
- Visual/content: sector images now `sectorVisual()` in `src/content/sectors.ts` (5 real 2026 photos + 5 AI illustrations labelled); homepage sector grid redesigned (light editorial cards); testimonial cards (play button no longer covers label; a11y name fix; focus trap); hero simplified (no ping dot, no duplicate quick paths, no hidden tagline, calendar link); sticky mobile CTA appears after first screen; copy de-hyped (home, journeys, captions); 2026 conference correctly named "Bharat E-Mobility & Minerals Leadership Summit" (from organiser photos).
- New tooling: `scripts/site-audit.mjs` (all sitemap routes × widths, axe-core WCAG 2.2, broken/low-res images, failed requests, screenshots → `qa-screenshots/audit.json`). Dev deps: axe-core, @playwright/test.

Open items for the developer (not blockers for staging):
1. Optionally replace the 5 remaining AI sector illustrations (public/media/sectors/: ev-components, motors-drivetrain, manufacturing-equipment, fleet-software, testing-recycling) with real photos or lighter daylight artwork — they are labelled "AI illustration" on the site.
2. Run 
ode scripts/site-audit.mjs (all routes, axe WCAG 2.2) on staging and fix the remaining minor axe findings (one colour-contrast item on /past-editions/, tap-target spacing on /contact/ and one on the home page).
3. Lighthouse / Core Web Vitals on staging; real-device QR scanner rehearsal; live SMTP/Sheets/S3 verification.

## Continuation note

If work resumes in a new session: read this file, then `docs/PENDING_APPROVALS.md`. Start the local DB (`npm run db:local`), `npm run dev`,
and run `npm test` + `npm run test:e2e` to confirm baseline. Next priorities: deploy staging, configure SMTP/Sheets/S3 with organiser
credentials, run live integration tests, Lighthouse on staging, real-device scanner test.
