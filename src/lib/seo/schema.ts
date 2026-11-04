import { siteConfig, organiser } from "@/config/site";
import type { CurrentEdition } from "@/lib/data/edition";
import { absoluteUrl } from "./metadata";

// Structured data follows Google Search Central guidance. Only facts that are
// visible on the page are emitted. No offers/prices unless verified in CMS.

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organiser`,
    name: organiser.legalName,
    alternateName: organiser.brand,
    url: organiser.website,
    logo: absoluteUrl(organiser.logo),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    publisher: { "@id": `${siteConfig.url}/#organiser` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteConfig.url}/search/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Event schema for the single canonical leaf page of the real 2027 event (homepage). */
export function eventSchema(edition: CurrentEdition) {
  const v = edition.venue;
  return {
    "@context": "https://schema.org",
    "@type": "ExhibitionEvent",
    "@id": `${siteConfig.url}/#event-${edition.slug}`,
    name: `${siteConfig.name} ${edition.year} (${edition.editionLabel})`,
    description: `${edition.editionLabel} of the India International EV Show, a business-to-business exhibition for electric mobility manufacturers, technology providers, buyers and channel partners, at ${v.name}, ${v.locality}, ${v.city}.`,
    startDate: edition.startDate,
    endDate: edition.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: v.name,
      address: {
        "@type": "PostalAddress",
        ...(v.streetAddress ? { streetAddress: v.streetAddress } : {}),
        addressLocality: `${v.locality}, ${v.city}`,
        addressRegion: v.region,
        ...(v.postalCode ? { postalCode: v.postalCode } : {}),
        addressCountry: v.country,
      },
    },
    image: [absoluteUrl("/media/2026/expo-crowd-hall.webp"), absoluteUrl("/media/2026/expo-cars-crowd.webp"), absoluteUrl("/opengraph-image")],
    organizer: { "@type": "Organization", name: organiser.legalName, url: organiser.website },
    url: siteConfig.url + "/",
  };
}

export function breadcrumbSchema(items: { label: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: absoluteUrl(c.href) })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
}

export function articleSchema(a: { title: string; description?: string; path: string; published?: string; modified?: string; author?: string; image?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    mainEntityOfPage: absoluteUrl(a.path),
    ...(a.published ? { datePublished: a.published } : {}),
    ...(a.modified ? { dateModified: a.modified } : {}),
    author: a.author ? { "@type": "Person", name: a.author } : { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: organiser.legalName, logo: { "@type": "ImageObject", url: absoluteUrl(organiser.logo) } },
    ...(a.image ? { image: [absoluteUrl(a.image)] } : {}),
  };
}
