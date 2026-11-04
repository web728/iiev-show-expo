# Operations runbook

## Daily (registration open)
- Admin dashboard: pending reviews, failed jobs (Integrations → Retry failed).
- Leads: assign New leads within 1 working day.

## Monitoring
- Uptime: `GET /api/health/` every 1 min (expects 200; 503 = DB down).
- Logs are JSON lines with PII redacted (`form.*`, `job.*`, `email.sent`). Forward to the host's log drain.
- Alerts: Atlas connections/CPU; failed jobs > 20; health 503.

## Incidents
| Symptom | Likely cause | Action |
|---|---|---|
| Forms return "We couldn't save…" (503) | MongoDB unreachable | Check Atlas status/network allow-list; health endpoint; nothing was saved — users can retry |
| Emails not arriving, jobs `failed` | SMTP credentials/limits | Integrations page lastError; switch provider via env; Retry failed |
| Sheets rows missing | Service account access/quota | Re-share sheet; Retry; MongoDB still has every record |
| Admin locked out | 5 failed attempts | Wait 15 min or Super Admin → Users → Reset link |
| Lost MFA device | — | Super Admin → Reset MFA |
| Suspected badge sharing | — | Visitor → Reissue badge |
| Bot flood on forms | — | Rate limits active; tighten limits in code; add Cloudflare Turnstile/WAF in front |
| Staff member leaves | — | Users → untick Active (sessions revoked immediately) |

## Backups & restore
- Atlas continuous backup (M10+) or daily snapshots; **test a restore to a scratch cluster before the event**.
- Weekly CSV export of visitors/leads stored encrypted, deleted per retention policy.

## Secrets rotation
- `APP_SECRET`: rotating signs everyone out and invalidates badge links (badges themselves stay valid). Do outside event days.
- `APP_ENCRYPTION_KEY`: **do not rotate** without a re-encryption script — encrypted badge tokens/MFA seeds depend on it.

## Retention (after approval)
Implement a scheduled job to delete/anonymise visitors older than `retentionDays.visitors` and leads older than `retentionDays.leads` (settings already stored), excluding records under legal hold. Not yet automated — pending retention approval (B7).

## Post-event
Export final data; disable scanner accounts; review audit log; archive the edition (set next edition current); move 2027 history into Past editions with verified stats from the post-show report.
