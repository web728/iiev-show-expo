// Legacy iievshow.com URL → new canonical URL map (HTTP 301).
// Source: crawl of https://iievshow.com/ navigation on 10 Oct 2026. See docs/SEO_MIGRATION.csv.
// Additional redirects can be managed in the CMS (Admin → Redirects) without a rebuild.
export type LegacyRedirect = { from: string; to: string; note: string };

export const legacyRedirects: LegacyRedirect[] = [
  { from: "/about-us/", to: "/about/", note: "About show" },
  { from: "/about-organisers/", to: "/about/#organiser", note: "Organiser section now within About" },
  { from: "/why-exhibit/", to: "/exhibit/why-exhibit/", note: "Exhibitor information" },
  { from: "/exhibitor-registration/", to: "/exhibit/book-a-stall/", note: "Stall enquiry form" },
  { from: "/why-visit/", to: "/visit/why-visit/", note: "Visitor information" },
  { from: "/visitor-registration/", to: "/visit/register/", note: "Visitor registration" },
  { from: "/ev-dynamics-conference-glimpses/", to: "/conference/", note: "Conference glimpses → conference hub (archive section)" },
  { from: "/contact-us/", to: "/contact/", note: "Contact" },
  { from: "/brochure/", to: "/downloads/", note: "Brochure → downloads centre" },
];
