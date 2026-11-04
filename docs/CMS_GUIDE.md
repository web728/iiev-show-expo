# CMS guide (Admin panel: `/admin/`)

## Signing in
Invite link (72 h) → set password (12+ chars, upper/lower/number) → sign in. Enable MFA under **My account**. 5 wrong passwords → 15-minute lock.

## Everyday tasks
| Task | Where |
|---|---|
| Change dates, venue, approval mode, publish projected figures, confirm concurrent shows | Edition & settings → Current edition |
| Set the two notification emails, public contacts, brochure/floor plan/manual URLs, announcement bar | Edition & settings → Notifications… |
| Work stall/sponsor/partner/speaker leads | Leads & enquiries → open lead → stage, owner, notes, tasks |
| Approve/reject visitors, print badges, walk-ins | Visitors |
| Publish news/insights, sectors, FAQs, partners, speakers, sessions, downloads, gallery, videos, legal pages | Content → (type) |
| Add exhibitor directory listings | Content → Exhibitor directory (status: published to show) |
| Add redirects | Content → Redirects (live within 60 s) |
| Upload images/PDFs and record rights | Media library |
| Users and roles | Users & roles |
| See failed emails/Sheets syncs and retry | Integrations & jobs |
| Who changed what | Audit log |

## Publishing workflow
Save draft → Submit for review → **Publish** (Content Editor/Super Admin; others can't publish). A future publish date schedules the item.
Versioned types (sectors, history, news, insights, pages) keep snapshots — **Restore** any version. Delete keeps a snapshot; prefer Archive.

## Guard-rails built in
- Gallery albums need "usage rights confirmed"; partners need a confirmation reference; speakers need consent before publishing.
- Published, high-confidence history records are **locked** — only Super Admin can edit; every change is versioned and audited.
- Projected figures appear only after the approval tick and always with the disclaimer.

## Markdown in body fields
`## Heading`, `### Subheading`, `- bullet`, `1. numbered`, `**bold**`, `*italic*`, `[link text](/path)` or full https links.

## New edition (e.g. 2028)
Edition & settings → change slug to `2028`, dates, label, number → Save. The previous edition's content stays in archives (directory edition filter, past editions). Add a Past edition record for 2027.
