# Deployment guide

**Do not deploy to production or touch iievshow.com without written organiser authorisation (Pending E8).**

## Hosting options
The app is a standard Next.js 16 Node server. Compatible: Vercel (simplest; built-in cron), Render, Railway, Fly.io, AWS (Amplify / ECS), or any VPS with Node ≥20.9 (`npm run build && npm start` behind Nginx/Caddy with HTTPS).
Serverless hosts: configure S3-compatible storage (local uploads don't persist).

## Staging
1. Create the hosting project from the repository; Node 20.9+ (24 LTS recommended).
2. Environment (encrypted): `SITE_ENV=staging`, `NEXT_PUBLIC_SITE_URL=https://staging.iievshow.com` (or host URL), `STAGING_BASIC_AUTH=user:pass`, secrets (`APP_SECRET`, `APP_ENCRYPTION_KEY` = 32 random bytes base64, `CRON_SECRET`), `TRUSTED_PROXY_HOPS=1`, `MONGODB_URI` (staging DB), integrations as available. **Do not** set `ALLOW_INDEXING`.
3. Build `npm run build`, start `npm start`.
4. `ADMIN_EMAIL=… npm run seed` against the staging DB → invite link.
5. Schedule `/api/jobs/run/` every 5 min with the bearer secret.
6. Run `BASE_URL=https://staging… npm run test:e2e` (add basic-auth handling or temporarily unset it for the run) and Lighthouse; record results in QA_REPORT.md.

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Production go-live checklist
- [ ] Organiser sign-off on content, facts (FACT_REGISTER), legal pages, approvals queue.
- [ ] Production MongoDB (separate from staging), backups verified by a test restore.
- [ ] `SITE_ENV=production`, `NEXT_PUBLIC_SITE_URL=https://iievshow.com`, **`ALLOW_INDEXING=true` only at launch**; no `STAGING_BASIC_AUTH`.
- [ ] Email domain authenticated (SPF/DKIM/DMARC) and test emails received.
- [ ] Redirect map reviewed against a full crawl / Search Console export.
- [ ] DNS: lower TTL a day before; point apex + www; HTTPS certificate issued; `www → apex` (or reverse) redirect.
- [ ] Verify `/robots.txt` allows, `/sitemap.xml` correct, pages `index,follow`, canonical = production domain.
- [ ] Submit sitemap to Search Console & Bing; GA4 receiving consented hits.
- [ ] Uptime monitor on `/api/health/`; error alerts.
- [ ] Super Admin MFA enabled; staff accounts invited with least privilege.

## Rollback
Hosting platforms keep previous deployments — promote the last good build. Database changes are additive (no destructive migrations); if a release must be reverted, redeploy the previous build — the schema stays compatible. Restore data only from Atlas snapshots in a genuine data incident. DNS rollback: repoint to the old host (keep old site available for 2 weeks after launch).

## Cache invalidation
Public pages revalidate every 5 min (history/sitemap hourly); any CMS save triggers immediate revalidation. CDN purge is only needed for media files replaced at the same URL (uploads always get new URLs).

## Recurring costs (indicative — confirm current pricing)
Hosting (Vercel Pro / Render / VPS), MongoDB Atlas (M10+ during event period), transactional email (volume-based), Cloudflare R2 (storage), domain/DNS, optional uptime/error monitoring. None are assumed free at production scale.
