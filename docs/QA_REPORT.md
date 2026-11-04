# QA report

**Environment:** Windows 11, Node 24.20, Next.js 16.4.0 (Turbopack), local MongoDB 8 via mongodb-memory-server (persistent), no live SMTP/Sheets/S3.
**Date:** 12 Oct 2026. All results below were actually run; nothing is extrapolated.

## Automated
| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | 0 errors, 0 warnings |
| Types | `npm run typecheck` | 0 errors |
| Unit + integration (real MongoDB) | `npm test` | **46 / 46 passed** |
| Production build | `npm run build` | Success — 78 static pages + dynamic routes |
| HTTP E2E smoke vs production build (`next start`) | `BASE_URL=http://localhost:3100 npm run test:e2e` | **87 / 87 passed** (`qa-report.json`) |

### Integration tests cover
Lead persistence & idempotency (incl. 8 concurrent duplicates → 1 record) · job queuing · unconfigured integrations recorded as *skipped* ·
SMTP failure keeps the lead and schedules retry with backoff · visitor auto/review approval · email dedupe · opaque QR without PII ·
first-scan OK / repeat = duplicate with 5 concurrent scans · reissue revokes old QR · cancellation → revoked · foreign QR rejected ·
badge links invalidated by reissue · badge PDF render with very long names · rate limiting · RFC 6238 TOTP vector · AES-GCM tamper detection ·
formula-injection sanitising · log redaction · RBAC rules · validation (phones, consent, enum injection) · IST date handling · file signature sniffing.

### E2E smoke covers
49 public routes (200, exactly one H1, unique title, meta description, canonical, no lorem ipsum) · noindex outside production ·
ExhibitionEvent JSON-LD · unapproved forecasts hidden · 5 security headers, no X-Powered-By · 5 legacy 301 redirects · 404 status ·
sitemap includes canonical / excludes private routes · robots disallow outside production · admin redirect to login · admin APIs 401 ·
cron & internal APIs protected · health · stall enquiry + idempotent retry · 422 field errors · cross-origin 403 · non-JSON rejected ·
honeypot silently dropped · visitor registration → badge PDF + badge page (noindex) · tampered link 401 · duplicate email 409 ·
enumeration-safe badge retrieval · .ics calendar.

## Manual / browser checks (built-in browser)
- Admin: invite → set password → sign-in → dashboard (truthful integration status) → lead detail (notes/stage/tasks/integration states) → check-in API: OK, duplicate, foreign QR, unknown token.
- Badge: on-screen badge and PDF visually verified (logo, Montserrat, QR, ID, organiser logo).
- Responsive: 375 px (home, book-a-stall, register, sector, past editions, contact, directory) — **no horizontal overflow**; 1440 px home sections.
- Fixed during QA: header CTA buttons not hiding on mobile (display class conflict); hero arc reducing headline legibility on mobile; reveal animation that could leave content invisible (now slide-only); success message promising email when SMTP isn't configured.

## Round 2 — experience redesign (12 Oct 2026)
| Check | Command | Result |
|---|---|---|
| Lint / types | `npm run lint`, `npm run typecheck` | 0 errors |
| Unit + integration | `npm test` | 46 / 46 passed |
| Production build | `npm run build` | Success |
| HTTP smoke | `npm run test:e2e` | 87 / 87 passed |
| Real-browser form journeys (Edge via puppeteer-core) | `npm run qa:forms` | 8 / 8 passed — empty-form validation (10 inline errors), stall enquiry → ST- ref, visitor registration → VS- ref → badge page with QR, contact form, journey picker switching, mobile menu open/Esc |
| Visual sweep | `npm run qa:screens` | 11 key pages × 375 / 768 / 1440 px: **0 horizontal overflow, 0 console errors**; screenshots in `qa-screenshots/` |
| Sitemap | GET `/sitemap.xml` | Includes 96 image entries and 7 video entries |

Fixed during round 2: dev reload loop (browser-log forwarding → disabled; local MongoDB data moved outside the project), mobile journey tabs truncation (short labels), hero over-stretch on very tall screens (height cap), overly dark photo heroes (overlay tuned), reference IDs wrapping.

## Not yet tested (honest gaps)
| Item | Why | How to close |
|---|---|---|
| Live email delivery, Google Sheets append, S3 upload | No credentials | INTEGRATION_SETUP verification steps on staging |
| Lighthouse / Core Web Vitals | Must be measured on deployed staging over real network | Run Lighthouse mobile on 5 key pages; record here. **No scores claimed.** |
| Camera scanning on real devices (Android/iOS), handheld scanners, badge printers | Hardware | Venue rehearsal per runbook |
| Screen-reader pass (NVDA/VoiceOver), 200% zoom audit | Time | Manual audit before launch; structure (landmarks, labels, focus) built in |
| Load test of registration/check-in peaks | Needs staging + agreed concurrency target | k6/Artillery on staging |
| Widths 320/360/390/414/768/1024/1280/1920 individually | Spot-checked 375/1440 only | Screenshot sweep on staging |
| Cross-browser (Safari, Firefox) | Chromium only here | BrowserStack or devices |
