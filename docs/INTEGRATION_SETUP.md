# Integration setup

Status: all adapters implemented; **none tested with live credentials** (none supplied). After configuring, verify with the steps below.

## MongoDB Atlas
1. Create project + cluster (M10+ for event period; M0/M2 acceptable for staging). Region: Mumbai (ap-south-1).
2. Database user with readWrite on `iiev` only. Network access: host's egress IPs (or Atlas private endpoint); avoid 0.0.0.0/0 in production.
3. `MONGODB_URI=mongodb+srv://…/iiev?retryWrites=true&w=majority`, then `npm run seed` (creates indexes, content, first admin invite).
4. Enable continuous backups / snapshots (M10+). Verify: Admin dashboard shows "Database connected"; `/api/health/` → `db: ok`.

## Email (SMTP)
- **Initial (Gmail/Workspace):** enable 2-Step Verification → create an App Password. `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=address`, `SMTP_PASS=app password`, `EMAIL_FROM="IIEV Show <address>"`. Gmail sending limits apply (≈500/day consumer, ≈2,000/day Workspace) — **not suitable for visitor-registration peaks**.
- **Recommended for volume:** Amazon SES, Postmark, SendGrid, Brevo or Zoho ZeptoMail via their SMTP relay — same variables, no code change.
- **DNS:** SPF include for provider; DKIM keys; DMARC `p=none` → `quarantine` after monitoring. Use a sending subdomain (e.g. `mail.iievshow.com`).
- Recipients: Admin → Settings → two notification emails.
- Verify: submit a contact form → Admin → Leads → Integrations shows `done`; check inbox and spam folder.

## Google Sheets
1. Google Cloud project → enable Sheets API → service account → JSON key.
2. Create the spreadsheet with tabs: `Stall Enquiries`, `Sponsorship`, `Partners`, `Speaker Applications`, `Delegates`, `Contact`, `Media`, `Visitors` (add header rows matching email field order).
3. Share the sheet with the service-account email as **Editor** (no other Drive access).
4. Set `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_KEY` (escape newlines as `\n`).
5. Verify: submit a stall enquiry → row appears → lead shows `sheets: done`.
PII minimisation: Sheets receives operational fields only; restrict sheet sharing to staff who need it.

## Job runner (retries)
Schedule `GET /api/jobs/run/` every 5 minutes with header `Authorization: Bearer $CRON_SECRET` (Vercel Cron, Render cron, GitHub Actions or an uptime pinger with headers).

## Media storage (S3-compatible)
Cloudflare R2 recommended (no egress fees). Create bucket + public custom domain (e.g. `media.iievshow.com`) → API token (object read/write on bucket) → set `S3_*` and `MEDIA_CDN_HOST`. Verify via Admin → Media library upload.

## Analytics & search consoles
GA4 property → `NEXT_PUBLIC_GA_ID` (loads only after consent; IP anonymised; no PII sent). Search Console: domain property via DNS TXT (preferred) or `GOOGLE_SITE_VERIFICATION`. Bing: `BING_SITE_VERIFICATION`. Submit `/sitemap.xml` after launch.
