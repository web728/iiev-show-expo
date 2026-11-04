import "server-only";
import type { Model } from "mongoose";
import type { Permission } from "@/lib/auth/rbac";
import {
  Sector, Faq, PastEdition, Post, Speaker, Session, ExhibitorListing, GalleryAlbum, Video, Download, Partner, Page, Redirect,
  LISTING_STATUSES,
} from "@/models/content";
import { SECTOR_OPTIONS } from "@/config/options";

// Config-driven CMS resources. Each resource gets list/create/edit/publish/
// delete screens in the admin panel with server-side permission checks,
// audit logging and (where `versioned`) snapshot history with rollback.

export type FieldType =
  | "text" | "textarea" | "markdown" | "number" | "boolean" | "select" | "multiselect"
  | "tags" | "date" | "datetime" | "url" | "image" | "lines";

export type AdminField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: readonly (string | { value: string; label: string })[];
  help?: string;
  // "lines" fields: each line "a | b | c" maps to an object with these keys
  lineKeys?: string[];
  numberKeys?: string[];
  placeholder?: string;
  slugFrom?: string; // auto-generate slug from this field when empty
};

export type AdminResource = {
  key: string;
  label: string;
  singular: string;
  model: Model<unknown>;
  editPermission: Permission;
  publishPermission?: Permission;
  titleField: string;
  listColumns: { name: string; label: string }[];
  fields: AdminField[];
  defaultSort: Record<string, 1 | -1>;
  publishable: boolean; // has status field draft/review/published/archived
  versioned?: boolean;
  baseFilter?: Record<string, unknown>;
  defaults?: Record<string, unknown>;
  publicPath?: (doc: Record<string, unknown>) => string | null;
  searchFields: string[];
  uniqueSlugScope?: string[]; // fields that, with slug, must be unique
};

const sectorOptions = SECTOR_OPTIONS.map((s) => ({ value: s.value, label: s.label }));
const editionField: AdminField = { name: "edition", label: "Edition", type: "text", required: true, help: "Edition slug, e.g. 2027", placeholder: "2027" };
const seo: AdminField[] = [
  { name: "metaTitle", label: "SEO title", type: "text", help: "Max ~60 characters. Leave empty to use the title." },
  { name: "metaDescription", label: "SEO description", type: "textarea", help: "Max ~160 characters." },
  { name: "noindex", label: "Hide from search engines (noindex)", type: "boolean" },
];

const M = <T,>(m: Model<T>) => m as unknown as Model<unknown>;

export const RESOURCES: AdminResource[] = [
  {
    key: "sectors", label: "Sectors", singular: "Sector", model: M(Sector), editPermission: "content.edit", publishPermission: "content.publish",
    titleField: "name", defaultSort: { order: 1 }, publishable: true, versioned: true, searchFields: ["name", "summary"],
    listColumns: [{ name: "name", label: "Name" }, { name: "group", label: "Group" }, { name: "order", label: "Order" }],
    publicPath: (d) => `/sectors/${d.slug}/`,
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, slugFrom: "name" },
      { name: "group", label: "Group", type: "select", required: true, options: ["Vehicles", "Powertrain & energy", "Charging & infrastructure", "Manufacturing & services"] },
      { name: "summary", label: "Summary", type: "textarea", required: true },
      { name: "body", label: "Body", type: "markdown" },
      { name: "exhibitorExamples", label: "Typical exhibitors", type: "tags", help: "One per line" },
      { name: "buyerQuestions", label: "Buyer questions", type: "tags", help: "One per line" },
      { name: "relevantVisitors", label: "Relevant visitors", type: "tags", help: "One per line" },
      { name: "order", label: "Order", type: "number" },
      ...seo,
    ],
  },
  {
    key: "faqs", label: "FAQs", singular: "FAQ", model: M(Faq), editPermission: "content.edit", publishPermission: "content.publish",
    titleField: "question", defaultSort: { audience: 1, order: 1 }, publishable: true, searchFields: ["question", "answer"],
    listColumns: [{ name: "question", label: "Question" }, { name: "audience", label: "Audience" }, { name: "order", label: "Order" }],
    fields: [
      { name: "audience", label: "Audience", type: "select", required: true, options: ["general", "exhibitor", "visitor", "conference"] },
      { name: "question", label: "Question", type: "text", required: true },
      { name: "answer", label: "Answer", type: "textarea", required: true },
      { name: "order", label: "Order", type: "number" },
    ],
  },
  {
    key: "past-editions", label: "Past editions", singular: "Past edition", model: M(PastEdition), editPermission: "history.edit", publishPermission: "history.edit",
    titleField: "title", defaultSort: { year: -1 }, publishable: true, versioned: true, searchFields: ["title", "city"],
    listColumns: [{ name: "title", label: "Title" }, { name: "year", label: "Year" }, { name: "locked", label: "Locked" }],
    publicPath: (d) => `/past-editions/${d.slug}/`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, slugFrom: "title" },
      { name: "editionLabel", label: "Edition label", type: "text", placeholder: "6th Edition" },
      { name: "year", label: "Year", type: "number", required: true },
      { name: "dates", label: "Dates", type: "text", placeholder: "6–8 December 2024" },
      { name: "city", label: "City", type: "text", required: true },
      { name: "venue", label: "Venue", type: "text" },
      { name: "confidence", label: "Verification level", type: "select", options: ["high", "medium", "low"] },
      { name: "summary", label: "Summary", type: "textarea", required: true },
      { name: "body", label: "Full write-up", type: "markdown" },
      { name: "verifiedStats", label: "Verified statistics", type: "lines", lineKeys: ["value", "label", "source"], help: "One per line: value | label | source (e.g. 100+ | Exhibitors | Post-show report 2024)" },
      { name: "sources", label: "Sources", type: "lines", lineKeys: ["label", "url", "capturedAt"], help: "One per line: label | url | captured date" },
      { name: "contradictions", label: "Open verification points", type: "textarea" },
      { name: "reportUrl", label: "Post-show report URL", type: "url" },
      { name: "locked", label: "Locked (published history — edits require Super Admin)", type: "boolean" },
      ...seo,
    ],
  },
  {
    key: "news", label: "News", singular: "News post", model: M(Post), editPermission: "content.edit", publishPermission: "content.publish",
    titleField: "title", defaultSort: { publishedAt: -1, createdAt: -1 }, publishable: true, versioned: true, searchFields: ["title", "excerpt"],
    baseFilter: { kind: "news" }, defaults: { kind: "news" }, uniqueSlugScope: ["kind"],
    listColumns: [{ name: "title", label: "Title" }, { name: "category", label: "Category" }, { name: "publishedAt", label: "Published" }],
    publicPath: (d) => `/news/${d.slug}/`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, slugFrom: "title" },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "body", label: "Body", type: "markdown", required: true },
      { name: "category", label: "Category", type: "text" },
      { name: "author", label: "Author", type: "text" },
      { name: "edition", label: "Edition", type: "text" },
      { name: "coverImage", label: "Cover image", type: "image" },
      { name: "coverAlt", label: "Cover image alt text", type: "text" },
      { name: "sourceName", label: "Source name (for coverage summaries)", type: "text" },
      { name: "sourceUrl", label: "Source URL", type: "url" },
      { name: "publishedAt", label: "Publish date/time (IST)", type: "datetime", help: "Future date = scheduled" },
      ...seo,
    ],
  },
  {
    key: "insights", label: "Insights", singular: "Insight", model: M(Post), editPermission: "content.edit", publishPermission: "content.publish",
    titleField: "title", defaultSort: { publishedAt: -1, createdAt: -1 }, publishable: true, versioned: true, searchFields: ["title", "excerpt"],
    baseFilter: { kind: "insight" }, defaults: { kind: "insight" }, uniqueSlugScope: ["kind"],
    listColumns: [{ name: "title", label: "Title" }, { name: "category", label: "Category" }, { name: "publishedAt", label: "Published" }],
    publicPath: (d) => `/insights/${d.slug}/`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, slugFrom: "title" },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "body", label: "Body", type: "markdown", required: true },
      { name: "category", label: "Category", type: "text" },
      { name: "author", label: "Author", type: "text" },
      { name: "coverImage", label: "Cover image", type: "image" },
      { name: "coverAlt", label: "Cover image alt text", type: "text" },
      { name: "publishedAt", label: "Publish date/time (IST)", type: "datetime" },
      ...seo,
    ],
  },
  {
    key: "speakers", label: "Speakers", singular: "Speaker", model: M(Speaker), editPermission: "conference.edit",
    titleField: "name", defaultSort: { name: 1 }, publishable: true, searchFields: ["name", "organisation"], uniqueSlugScope: ["edition"],
    listColumns: [{ name: "name", label: "Name" }, { name: "organisation", label: "Organisation" }, { name: "edition", label: "Edition" }, { name: "consentToPublish", label: "Consent" }],
    publicPath: (d) => `/conference/speakers/${d.slug}/`,
    fields: [
      editionField,
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, slugFrom: "name" },
      { name: "designation", label: "Designation", type: "text" },
      { name: "organisation", label: "Organisation", type: "text" },
      { name: "image", label: "Portrait", type: "image" },
      { name: "bio", label: "Bio", type: "markdown" },
      { name: "linkedin", label: "LinkedIn", type: "url" },
      { name: "consentToPublish", label: "Speaker has confirmed participation and consented to publication", type: "boolean" },
    ],
  },
  {
    key: "sessions", label: "Sessions", singular: "Session", model: M(Session), editPermission: "conference.edit",
    titleField: "title", defaultSort: { startsAt: 1 }, publishable: true, searchFields: ["title", "track"],
    listColumns: [{ name: "title", label: "Title" }, { name: "startsAt", label: "Starts (IST)" }, { name: "track", label: "Track" }, { name: "sessionStatus", label: "Status" }],
    fields: [
      editionField,
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "startsAt", label: "Starts (IST)", type: "datetime", required: true },
      { name: "endsAt", label: "Ends (IST)", type: "datetime", required: true },
      { name: "room", label: "Room / hall", type: "text" },
      { name: "track", label: "Track", type: "text" },
      { name: "format", label: "Format", type: "select", options: ["keynote", "panel", "presentation", "workshop", "launch", "networking", "other"] },
      { name: "speakerSlugs", label: "Speaker slugs", type: "tags", help: "One per line; must match speaker slugs" },
      { name: "sessionStatus", label: "Session status", type: "select", options: ["tentative", "confirmed", "cancelled"] },
    ],
  },
  {
    key: "exhibitors", label: "Exhibitor directory", singular: "Exhibitor listing", model: M(ExhibitorListing), editPermission: "directory.edit",
    titleField: "company", defaultSort: { company: 1 }, publishable: false, searchFields: ["company", "city"], uniqueSlugScope: ["edition"],
    listColumns: [{ name: "company", label: "Company" }, { name: "edition", label: "Edition" }, { name: "booth", label: "Stall" }, { name: "status", label: "Status" }],
    publicPath: (d) => (d.status === "published" ? `/exhibitors/${d.slug}/` : null),
    fields: [
      editionField,
      { name: "company", label: "Company", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, slugFrom: "company" },
      { name: "status", label: "Listing status", type: "select", required: true, options: LISTING_STATUSES },
      { name: "country", label: "Country", type: "text" },
      { name: "city", label: "City", type: "text" },
      { name: "categories", label: "Sectors", type: "multiselect", options: sectorOptions },
      { name: "logo", label: "Logo", type: "image" },
      { name: "profile", label: "Profile", type: "markdown" },
      { name: "website", label: "Website", type: "url" },
      { name: "booth", label: "Stall number (only when assigned)", type: "text" },
    ],
  },
  {
    key: "albums", label: "Gallery albums", singular: "Album", model: M(GalleryAlbum), editPermission: "media.edit",
    titleField: "title", defaultSort: { createdAt: -1 }, publishable: true, searchFields: ["title"],
    listColumns: [{ name: "title", label: "Title" }, { name: "edition", label: "Edition" }, { name: "rightsConfirmed", label: "Rights" }],
    publicPath: (d) => `/gallery/${d.slug}/`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, slugFrom: "title" },
      { name: "edition", label: "Edition / year", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "images", label: "Images", type: "lines", lineKeys: ["src", "alt", "caption", "width", "height", "credit"], numberKeys: ["width", "height"], help: "One per line: image URL | alt text | caption | width | height | credit" },
      { name: "rightsConfirmed", label: "Usage rights confirmed by organiser (required to publish)", type: "boolean" },
    ],
  },
  {
    key: "videos", label: "Videos", singular: "Video", model: M(Video), editPermission: "media.edit",
    titleField: "title", defaultSort: { createdAt: -1 }, publishable: true, searchFields: ["title"],
    listColumns: [{ name: "title", label: "Title" }, { name: "edition", label: "Edition" }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "youtubeId", label: "YouTube video ID", type: "text", required: true, help: "The part after watch?v=" },
      { name: "edition", label: "Edition", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  {
    key: "downloads", label: "Downloads", singular: "Download", model: M(Download), editPermission: "content.edit", publishPermission: "content.publish",
    titleField: "title", defaultSort: { createdAt: -1 }, publishable: true, searchFields: ["title"],
    listColumns: [{ name: "title", label: "Title" }, { name: "category", label: "Category" }, { name: "edition", label: "Edition" }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "category", label: "Category", type: "select", options: ["brochure", "report", "manual", "floor-plan", "media-kit", "other"] },
      { name: "fileUrl", label: "File", type: "image", required: true, help: "Upload a PDF or paste a URL" },
      { name: "fileType", label: "File type", type: "text", placeholder: "PDF" },
      { name: "fileSizeLabel", label: "File size", type: "text", placeholder: "2.4 MB" },
      { name: "edition", label: "Edition", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  {
    key: "partners", label: "Partners", singular: "Partner", model: M(Partner), editPermission: "content.edit", publishPermission: "content.publish",
    titleField: "name", defaultSort: { order: 1 }, publishable: true, searchFields: ["name"],
    listColumns: [{ name: "name", label: "Name" }, { name: "kind", label: "Type" }, { name: "edition", label: "Edition" }],
    fields: [
      editionField,
      { name: "name", label: "Name", type: "text", required: true },
      { name: "kind", label: "Type", type: "select", options: ["sponsor", "association", "media", "supporting", "knowledge"] },
      { name: "tier", label: "Tier / role", type: "text" },
      { name: "logo", label: "Logo", type: "image" },
      { name: "url", label: "Website", type: "url" },
      { name: "order", label: "Order", type: "number" },
      { name: "confirmationRef", label: "Confirmation reference (internal)", type: "text", help: "Where the organiser confirmed this partnership — required before publishing" },
    ],
  },
  {
    key: "pages", label: "Pages", singular: "Page", model: M(Page), editPermission: "content.edit", publishPermission: "content.publish",
    titleField: "title", defaultSort: { slug: 1 }, publishable: true, versioned: true, searchFields: ["title", "slug"],
    listColumns: [{ name: "title", label: "Title" }, { name: "slug", label: "Slug" }],
    publicPath: (d) => `/${d.slug}/`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, help: "privacy-policy, terms, cookie-policy and accessibility replace the built-in drafts" },
      { name: "intro", label: "Intro", type: "textarea" },
      { name: "body", label: "Body", type: "markdown", required: true },
      { name: "lastReviewedAt", label: "Last legal/editorial review", type: "date" },
      ...seo,
    ],
  },
  {
    key: "redirects", label: "Redirects", singular: "Redirect", model: M(Redirect), editPermission: "redirects.manage",
    titleField: "from", defaultSort: { from: 1 }, publishable: false, searchFields: ["from", "to"],
    listColumns: [{ name: "from", label: "From" }, { name: "to", label: "To" }, { name: "statusCode", label: "Code" }, { name: "active", label: "Active" }],
    fields: [
      { name: "from", label: "From path", type: "text", required: true, placeholder: "/old-page/" },
      { name: "to", label: "To (path or URL)", type: "text", required: true, placeholder: "/new-page/" },
      { name: "statusCode", label: "Status code", type: "select", options: ["301", "302", "308"] },
      { name: "note", label: "Note", type: "text" },
      { name: "active", label: "Active", type: "boolean" },
    ],
  },
];

export function getResource(key: string) {
  return RESOURCES.find((r) => r.key === key) ?? null;
}
