# SEO keyword map

**No search volumes, rankings, difficulty or authority scores are stated** — none were measured with a dated tool.
Populate the "Volume (tool, date, region)" column from Google Search Console / Keyword Planner exports after access is granted.

| Query theme (examples) | Intent | Target page | Volume (tool, date, region) | Status |
|---|---|---|---|---|
| iiev show, india international ev show, iiev show 2027, iiev pune | Branded/navigational | `/` | unverified | Live |
| ev expo pune, ev exhibition pune 2027, electric vehicle show pune | Commercial | `/` , `/exhibit/` | unverified | Live |
| ev exhibition india 2027, electric vehicle expo india | Commercial | `/` , `/why-iiev/` | unverified | Live |
| book stall ev expo, ev expo exhibitor registration | Transactional | `/exhibit/book-a-stall/` | unverified | Live |
| ev expo visitor registration, iiev visitor pass | Transactional | `/visit/register/` | unverified | Live |
| ev conference india 2027, ev dynamics conference | Informational | `/conference/` | unverified | Live (title pending A3) |
| ev charger exhibition, charging infrastructure expo india | Commercial | `/sectors/charging-infrastructure/` | unverified | Live |
| battery expo india, bms exhibition, lithium battery show pune | Commercial | `/sectors/batteries-cells/` (+ Battery show) | unverified | Live |
| ev components expo, ev motor controller exhibition | Commercial | `/sectors/ev-components/`, `/sectors/motors-drivetrain/` | unverified | Live |
| electric two wheeler dealership expo | Commercial | `/sectors/electric-vehicles/`, `/visit/why-visit/` | unverified | Live |
| auto cluster exhibition centre pimpri chinchwad | Navigational | `/visit/venue/` | unverified | Live |
| iiev show 2024 / 2025 / 2026 | Navigational (historic) | `/past-editions/[slug]/` | unverified | Live |

## Technical foundations in place
Server-rendered pages; unique titles/descriptions/H1; canonical per environment; breadcrumbs; ExhibitionEvent (single leaf: homepage) with
dates/location/organiser only (no offers until verified); Organization, WebSite+SearchAction, FAQPage, Article, Person, BreadcrumbList;
XML sitemap of canonical indexable routes only; robots gated by launch flag; legacy 301 map; OG/Twitter images.

## Post-launch
Submit sitemap in GSC/Bing; monitor coverage, 404s, redirects, CWV and organic conversions monthly. No ranking guarantees; no purchased links.
AI-search discoverability relies only on accurate, crawlable facts and structured entities.
