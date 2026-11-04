# Database schema (MongoDB / Mongoose)

Models live in `src/models/`. Indexes are created by `npm run seed` (migrations). All timestamps UTC; displayed in Asia/Kolkata.

## Operations (`src/models/leads.ts`)
| Collection | Purpose | Key fields | Indexes |
|---|---|---|---|
| `leads` | All enquiries: stall, sponsorship, partner, speaker, delegate, contact, media | `ref` (ST-27-XXXXXX), `idempotencyKey`, `type`, `edition`, contact fields, `details` (type-specific, zod-validated), consent, `stage`, `assignedTo`, `notes[]`, `tasks[]`, `stageHistory[]`, `attribution`, `integrations{sheets,organiserEmail,ackEmail}`, `ipHash` | unique ref, unique idempotencyKey; type+edition+createdAt; email+type+edition |
| `visitors` | Registrations & badges | `ref` (VS-27-…), `idempotencyKey`, profile fields, `status` (submitted→validated→pending_review/approved→checked_in; rejected; cancelled), `statusHistory[]`, `badgeTokenHash` (SHA-256), `badgeTokenEnc` (AES-GCM), `badgeVersion`, `badgeRevokedAt`, `checkedInAt`, `checkInCount` | **unique (edition,email)** dedupe; unique ref/key; badgeTokenHash; text index |
| `checkins` | Every scan attempt | visitorId, result (ok/duplicate/revoked/not_found/not_approved/wrong_edition), method (qr/manual), station, scannedBy, server `createdAt` | edition+createdAt |
| `integrationjobs` | Sheets/email queue | kind, entity, entityId, **unique dedupeKey**, status, attempts, maxAttempts (6), nextRunAt (exp. backoff), lastError, lockedUntil | status, nextRunAt |
| `consentrecords` | Proof of consent | subjectEmail, purpose (privacy_notice/marketing/analytics_cookies), granted, noticeVersion | subjectEmail |

## Content (`src/models/content.ts`)
`editions` (one `isCurrent`; dates, venue, forecasts+approval flag, conference flags, registration mode, concurrent shows) ·
`sitesettings` (2 notification recipients, contacts, documents, announcement, retention days) · `pages` · `sectors` · `exhibitorlistings`
(draft→submitted→approved→published→archived; unique edition+slug) · `speakers` (consentToPublish) · `sessions` · `posts` (news/insight; unique kind+slug) ·
`galleryalbums` (rightsConfirmed gate) · `videos` · `downloads` · `partners` (confirmationRef gate) · `faqs` · `redirects` · `mediaassets`
(licensing status) · `pasteditions` (locked + version) · `contentversions` (snapshots for rollback).

Publishable docs share `status` (draft/review/published/archived), `publishedAt` (future = scheduled), `updatedBy`, SEO fields.

## Admin (`src/models/admin.ts`)
`adminusers` (role, bcrypt hash, MFA secret encrypted, lockout counters, hashed invite/reset tokens) · `adminsessions` (revocable, TTL-expiring) ·
`auditevents` (actor, action, entity, summary, redacted diff) · `ratelimits` (fixed windows, TTL).

## Retention
Defaults (CMS-editable): visitors 730 days, leads 1,095 days after creation. Deletion requests: see PRIVACY_DATA_MAP.md. Audit events are retained.
