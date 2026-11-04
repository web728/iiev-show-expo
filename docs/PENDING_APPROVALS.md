# Pending approvals & required organiser inputs

Nothing below has been invented on the site. Each item shows where it is entered once supplied.
(Also serves as APPROVAL_QUEUE.md.)

## Facts & claims

| # | Item | Current handling | Where to update |
|---|---|---|---|
| A1 | Approve projected figures (150+ exhibitors, 15,000+ visitors, 100+ speakers) | Hidden | Admin → Edition & settings → "Organiser has APPROVED…" |
| A2 | Use of tagline "Infused with E-Mobility Technology" | Shown (it is part of the supplied 9th-edition logo) | Confirm |
| A3 | 2027 conference title ("EV Dynamics" is historical) and programme | Generic "Conference 2027", "to be announced" | Edition settings; Sessions/Speakers |
| A4 | Battery & Solar shows co-located in 2027 | Logos only on Concurrent Events page, marked "to be confirmed" | Edition settings checkboxes |
| A5 | Organiser legal name (site shows "Futurex Trade Fair and Events Pvt. Ltd."; DCCIA 2024 circular says "Future Market Events") | Uses official-site name | `src/config/site.ts` / confirm |
| A6 | Contacts: Namit Gupta / Nidhi Gupta, E-52 Kalkaji address (from iievshow.com). Trade press quotes "Nidhi Sharma, Director" | Shown as on official site; flag unverified | Settings → Contacts, tick "re-confirmed" |
| A7 | Past-edition dates for 4th (Delhi, Mar 2024) and 5th (Chennai, Jun vs Sep 2024) editions | "Being verified" | Content → Past editions |
| A8 | Post-show reports / audited statistics for any edition | Not shown | Past editions → Verified statistics |
| A9 | Venue street address & PIN, opening hours, parking, gates | Omitted | Edition settings |

## Commercial & policy

| # | Item |
|---|---|
| B1 | Admission policy (free/paid, age, business-only) → Edition settings "Admission note" |
| B2 | Registration approval mode (auto vs review) — currently **auto** |
| B3 | Stall rates, stall types/inclusions, floor plan, exhibitor manual → Downloads / Settings URLs |
| B4 | Sponsorship packages and deliverables |
| B5 | Conference access rules / delegate fees (no payment collected until approved) |
| B6 | Badge correction/reissue authority and QR desk workflow sign-off |
| B7 | Data retention periods (defaults: visitors 730 days, leads 1,095 days) |

## Assets & rights

| # | Item |
|---|---|
| C1 | Licensed event photography & video with edition labels and photographer credit |
| C2 | Exhibitor, sponsor, partner and speaker confirmations + logos/portraits with publication consent |
| C3 | Official vector/hi-res logo files and usage approval (PNG supplied are used as-is) |
| C4 | Brochure PDF |

## Legal

| # | Item |
|---|---|
| D1 | Privacy notice, terms, cookie policy, accessibility statement legal review (DPDP Act applicability) — drafts live, labelled |
| D2 | Approval to use Google Analytics and which vendors |

## Access & accounts

| # | Item |
|---|---|
| E1 | Hosting account (e.g. Vercel/Render/Railway) and domain/DNS access for staging and go-live |
| E2 | MongoDB Atlas project (M10+ recommended for event week) |
| E3 | Sending domain + SMTP provider (Gmail App Password initially; transactional provider for volume), SPF/DKIM/DMARC |
| E4 | Google Sheet + service account |
| E5 | S3-compatible bucket (Cloudflare R2 recommended) |
| E6 | GA4 property, Search Console & Bing Webmaster verification |
| E7 | Admin user list with roles |
| E8 | **Written authorisation** before any change to the live iievshow.com |
