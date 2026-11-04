# Site map & user journeys

## Public routes
| Group | Routes |
|---|---|
| Core | `/` · `/about/` (incl. `#organiser`) · `/why-iiev/` · `/past-editions/` · `/past-editions/[slug]/` · `/concurrent-events/` |
| Exhibit | `/exhibit/` · `/exhibit/why-exhibit/` · `/exhibit/exhibitor-profile/` · `/exhibit/book-a-stall/` · `/exhibit/floor-plan/` · `/exhibit/information/` · `/exhibit/faqs/` |
| Visit | `/visit/` · `/visit/why-visit/` · `/visit/visitor-profile/` · `/visit/register/` · `/visit/venue/` · `/visit/travel/` · `/visit/faqs/` · `/visit/badge/` (noindex) · `/visit/badge/view/` (private) |
| Sectors | `/sectors/` · `/sectors/[slug]/` (10) |
| Directory | `/exhibitors/` (`?q`, `?category`, `?edition` → noindex) · `/exhibitors/[slug]/` |
| Conference | `/conference/` · `/conference/agenda/` · `/conference/speakers/` · `/conference/speakers/[slug]/` · `/conference/register/` · `/conference/apply-to-speak/` |
| Commercial | `/sponsorship/` · `/sponsorship/enquire/` · `/partners/` · `/become-a-partner/` |
| Editorial | `/media/` · `/news/` · `/news/[slug]/` · `/insights/` · `/insights/[slug]/` · `/gallery/` · `/gallery/[slug]/` · `/videos/` · `/downloads/` |
| Utilities | `/contact/` · `/search/` (noindex) · `/faq/` · `/site-map/` |
| Legal | `/privacy-policy/` · `/terms/` · `/cookie-policy/` · `/accessibility/` |
| System | 404, error, `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/icon`, `/api/calendar/` (.ics), `/api/health/` |

## Audience journeys (primary CTA → secondary)
| Audience | Entry | Path | Conversion |
|---|---|---|---|
| Potential exhibitor | Home hero, search "EV expo Pune exhibit" | Exhibit → Why exhibit / Sector page → Book a stall | Stall enquiry (`stall_enquiry_submitted`) |
| Buyer / dealer | Home, sector pages | Why visit → Exhibitors → Register | Visitor registration → badge |
| Sponsor | Exhibit/Sponsorship | Sponsorship → Enquire | Sponsorship enquiry |
| Delegate | Conference | Agenda/Speakers → Register | Delegate registration |
| Speaker | Conference | Apply to speak | Speaker application |
| Media | Media centre | News/Downloads → Contact | Contact (topic: Media) |
| Partner / association | Partners | Become a partner | Partner enquiry |
| Organiser staff | `/admin/` | Dashboard → Leads/Visitors/Check-in | CRM stage changes, check-ins |

Every page has one primary CTA in its hero or CTA band, a contextual secondary CTA and related links.
