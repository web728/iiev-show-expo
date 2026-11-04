# API reference

All JSON endpoints: `Content-Type: application/json`, same-origin `Origin` required for POST in production, `Cache-Control: no-store`, `X-Robots-Tag: noindex`.
Error shape: `{ ok:false, code, message, fieldErrors? }`. Stable codes listed per endpoint.

## Public
| Method | Path | Body / query | Success | Errors |
|---|---|---|---|---|
| POST | `/api/forms/{stall\|sponsorship\|partner\|speaker\|delegate\|contact}/` | fields per `src/lib/validation/forms.ts` + `idempotencyKey` (uuid), `privacyAccepted:true`, `marketingOptIn`, optional `attribution`, honeypot `website_url_confirm`, `startedAt` | 201 `{ok,ref,message}` (200 on idempotent retry) | 400 BAD_REQUEST/UNSUPPORTED_MEDIA, 403 BAD_ORIGIN, 404 UNKNOWN_FORM, 413, 422 VALIDATION_FAILED, 429 RATE_LIMITED (8/10 min/IP), 503 SERVICE_UNAVAILABLE, 500 INTERNAL_ERROR |
| POST | `/api/visitors/register/` | visitor fields | 201 `{ok,ref,status,badgeAccess?,message}` | + 409 ALREADY_REGISTERED, 403 REGISTRATION_CLOSED; 6/10 min/IP |
| POST | `/api/badge/request/` | `{email}` | 200 identical message regardless of existence | 429 (5/15 min) |
| GET | `/api/badge/pdf/?t=` | signed access token | `application/pdf` | 401 LINK_INVALID, 410 BADGE_NOT_AVAILABLE |
| GET | `/api/calendar/` | — | `.ics` | — |
| GET | `/api/health/` | — | `{ok,checks}` 200/503 | — |

## Admin (session cookie + permission)
| Method | Path | Permission | Notes |
|---|---|---|---|
| POST | `/api/admin/checkin/` | checkin.scan | `{qrText}` or `{visitorId}`, `station` → `{result,message,visitor,at}` |
| GET | `/api/admin/checkin/?q=` | checkin.scan | min 3 chars; minimal fields; current edition only |
| GET | `/api/admin/export/{leads\|visitors\|checkins}/` | leads.export / visitors.export | CSV, formula-safe, audited |
| POST | `/api/admin/upload/` | media.edit or content.edit | multipart `file`; JPEG/PNG/WebP/AVIF/PDF ≤15 MB; EXIF stripped |

Most admin mutations are **Server Actions** (built-in origin/CSRF protection) in `src/app/admin/**/actions.ts`.

## System
| Method | Path | Auth |
|---|---|---|
| GET | `/api/jobs/run/` | `Authorization: Bearer $CRON_SECRET` — processes ≤50 due jobs |
