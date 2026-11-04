import "server-only";
import { getSectors, getPastEditions, getPosts, getSpeakers, getExhibitors, getAlbums } from "@/lib/data/public";

// Canonical, indexable public routes. Used by app/sitemap.ts and the HTML
// site map. Utility/private routes (badge, search, admin, success states) are excluded.

export const STATIC_ROUTES: { path: string; label: string; group: string; priority?: number }[] = [
  { path: "/", label: "Home", group: "Core", priority: 1 },
  { path: "/about/", label: "About the show", group: "Core" },
  { path: "/why-iiev/", label: "Why IIEV Show", group: "Core" },
  { path: "/past-editions/", label: "Past editions", group: "Core" },
  { path: "/concurrent-events/", label: "Concurrent events", group: "Core" },
  { path: "/exhibit/", label: "Exhibit", group: "Exhibit", priority: 0.9 },
  { path: "/exhibit/why-exhibit/", label: "Why exhibit", group: "Exhibit" },
  { path: "/exhibit/exhibitor-profile/", label: "Exhibitor profile", group: "Exhibit" },
  { path: "/exhibit/book-a-stall/", label: "Book a stall", group: "Exhibit", priority: 0.9 },
  { path: "/exhibit/floor-plan/", label: "Floor plan", group: "Exhibit" },
  { path: "/exhibit/information/", label: "Exhibitor information", group: "Exhibit" },
  { path: "/exhibit/faqs/", label: "Exhibitor FAQs", group: "Exhibit" },
  { path: "/visit/", label: "Visit", group: "Visit", priority: 0.9 },
  { path: "/visit/why-visit/", label: "Why visit", group: "Visit" },
  { path: "/visit/visitor-profile/", label: "Visitor profile", group: "Visit" },
  { path: "/visit/register/", label: "Register as visitor", group: "Visit", priority: 0.9 },
  { path: "/visit/venue/", label: "Venue", group: "Visit" },
  { path: "/visit/travel/", label: "Travel & stay", group: "Visit" },
  { path: "/visit/faqs/", label: "Visitor FAQs", group: "Visit" },
  { path: "/sectors/", label: "Industry sectors", group: "Sectors", priority: 0.8 },
  { path: "/conference/", label: "Conference", group: "Conference", priority: 0.8 },
  { path: "/conference/agenda/", label: "Agenda", group: "Conference" },
  { path: "/conference/speakers/", label: "Speakers", group: "Conference" },
  { path: "/conference/register/", label: "Delegate registration", group: "Conference" },
  { path: "/conference/apply-to-speak/", label: "Apply to speak", group: "Conference" },
  { path: "/exhibitors/", label: "Exhibitor directory", group: "Directory" },
  { path: "/sponsorship/", label: "Sponsorship", group: "Commercial" },
  { path: "/sponsorship/enquire/", label: "Sponsorship enquiry", group: "Commercial" },
  { path: "/partners/", label: "Partners", group: "Commercial" },
  { path: "/become-a-partner/", label: "Become a partner", group: "Commercial" },
  { path: "/media/", label: "Media centre", group: "Media" },
  { path: "/news/", label: "News", group: "Media" },
  { path: "/insights/", label: "Insights", group: "Media" },
  { path: "/gallery/", label: "Gallery", group: "Media" },
  { path: "/videos/", label: "Videos", group: "Media" },
  { path: "/downloads/", label: "Downloads", group: "Media" },
  { path: "/faq/", label: "FAQ", group: "Help" },
  { path: "/contact/", label: "Contact", group: "Help" },
  { path: "/site-map/", label: "Site map", group: "Help" },
  { path: "/privacy-policy/", label: "Privacy notice", group: "Legal" },
  { path: "/terms/", label: "Terms of use", group: "Legal" },
  { path: "/cookie-policy/", label: "Cookie policy", group: "Legal" },
  { path: "/accessibility/", label: "Accessibility", group: "Legal" },
];

export async function dynamicRoutes() {
  const [sectors, history, news, insights, speakers, exhibitors, albums] = await Promise.all([
    getSectors(),
    getPastEditions(),
    getPosts("news", { perPage: 500 }),
    getPosts("insight", { perPage: 500 }),
    getSpeakers(),
    getExhibitors({ perPage: 2000 }),
    getAlbums(),
  ]);
  return [
    ...sectors.map((s) => ({ path: `/sectors/${s.slug}/`, label: s.name, group: "Sectors" })),
    ...history.map((h) => ({ path: `/past-editions/${h.slug}/`, label: h.title, group: "Past editions" })),
    ...news.items.map((p) => ({ path: `/news/${p.slug}/`, label: p.title, group: "News", lastModified: p.updatedAt })),
    ...insights.items.map((p) => ({ path: `/insights/${p.slug}/`, label: p.title, group: "Insights", lastModified: p.updatedAt })),
    ...speakers.map((s) => ({ path: `/conference/speakers/${s.slug}/`, label: s.name, group: "Speakers" })),
    ...exhibitors.items.map((x) => ({ path: `/exhibitors/${x.slug}/`, label: x.company, group: "Exhibitors" })),
    ...albums.map((a) => ({ path: `/gallery/${a.slug}/`, label: a.title, group: "Gallery" })),
  ] as { path: string; label: string; group: string; lastModified?: string }[];
}
