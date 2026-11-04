# Form workflows

```
Browser form ──► API route ──► guards ──► zod validation ──► MongoDB insert (system of record)
                                                               │
                                                               ├─► consent records
                                                               └─► IntegrationJob ×N (unique dedupeKey)
Response (ref) ◄──────────────────────────────────────────────┘        │ after() + cron /api/jobs/run
                                                                       ├─ sheets_append  → Google Sheets tab
                                                                       ├─ email_organiser → 2 configured recipients
                                                                       └─ email_ack / email_badge → submitter
```

1. **Guards:** same-origin, JSON only, size ≤64 KB, IP rate limit (Mongo-backed), honeypot + <2.5 s timing check (bots get a fake success; nothing stored).
2. **Idempotency:** the browser generates a UUID per form render and keeps it across retries; the unique index guarantees one record even under concurrent double-submits (tested with 8 parallel requests).
3. **Persist first:** the reference is only shown after the MongoDB write succeeds. If MongoDB is unreachable → 503 "nothing was sent" (truthful).
4. **Integrations never block:** jobs run after the response. Not configured → `skipped` (with reason). Errors → `failed`, retried with backoff 30 s → 1 h, max 6 attempts. Admin can re-run per lead or globally.
5. **Sheets safety:** operational fields only; every cell sanitised against formula injection; service account limited to Sheets scope and the shared sheet.
6. **Emails:** organiser notifications go to exactly the two configured recipients (CMS → env fallback); acknowledgements can be disabled in Settings.

## Visitor specifics
- Dedupe: one registration per email per edition. A second attempt returns 409 with a pointer to badge retrieval (does not reveal the record).
- `approvalMode=auto` → status `approved`, badge issued, 24 h access link returned to the browser, badge emailed with PDF.
- `approvalMode=review` → `pending_review`; acknowledgement emailed; staff approve in Admin → badge email.
- Who may correct/reissue: Registration and Super Admin roles (`visitors.edit`). Name/company corrections automatically reissue the badge.

## Partial save
Not enabled (spec: "only if explicitly configured").
