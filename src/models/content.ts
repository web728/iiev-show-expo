import { Schema } from "mongoose";
import { defineModel, publishFields, seoFields } from "./_helpers";

// ---- Editions & settings ---------------------------------------------------

const EditionSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true }, // "2027"
    editionNumber: { type: Number, required: true },
    editionLabel: { type: String, required: true },
    year: { type: Number, required: true },
    isCurrent: { type: Boolean, default: false, index: true },
    startDate: { type: String, required: true }, // ISO date (Asia/Kolkata)
    endDate: { type: String, required: true },
    dateLabel: { type: String, required: true },
    openingHours: String,
    venue: {
      name: String, locality: String, city: String, region: String, country: String, countryName: String,
      postalCode: String, streetAddress: String, mapQuery: String,
    },
    logo: String,
    forecasts: {
      approved: { type: Boolean, default: false },
      items: [{ value: String, label: String, _id: false }],
      disclaimer: String,
    },
    conference: { name: String, titleApproved: Boolean, programmeAnnounced: Boolean },
    registration: {
      visitorOpen: { type: Boolean, default: true },
      approvalMode: { type: String, enum: ["auto", "review"], default: "auto" },
      admissionNote: String,
    },
    concurrentShows: [
      { key: String, name: String, editionLabel: String, strap: String, logo: String, url: String, approved: Boolean, _id: false },
    ],
    updatedBy: String,
  },
  { timestamps: true },
);
export const Edition = defineModel("Edition", EditionSchema);

const SiteSettingsSchema = new Schema(
  {
    key: { type: String, default: "global", unique: true },
    // Exactly two organiser notification recipients (configurable)
    notifyRecipients: { type: [String], default: [] },
    sendAcknowledgements: { type: Boolean, default: true },
    announcement: { text: String, href: String, active: { type: Boolean, default: false } },
    organiserContactsVerified: { type: Boolean, default: false },
    contacts: [{ name: String, phone: String, email: String, role: String, _id: false }],
    address: String,
    brochureUrl: String,
    floorPlanUrl: String,
    exhibitorManualUrl: String,
    privacyNoticeVersion: { type: String, default: "draft-2026-10" },
    retentionDays: { visitors: { type: Number, default: 730 }, leads: { type: Number, default: 1095 } },
    updatedBy: String,
  },
  { timestamps: true },
);
export const SiteSettings = defineModel("SiteSettings", SiteSettingsSchema);

// ---- Generic CMS page (legal pages, custom pages) --------------------------

const PageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    intro: String,
    body: { type: String, default: "" }, // lightweight Markdown
    ...seoFields,
    ...publishFields,
    lastReviewedAt: Date,
  },
  { timestamps: true },
);
export const Page = defineModel("Page", PageSchema);

// ---- Sectors ---------------------------------------------------------------

const SectorSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    group: { type: String, required: true },
    summary: { type: String, required: true },
    body: { type: String, default: "" },
    exhibitorExamples: [String],
    buyerQuestions: [String],
    relevantVisitors: [String],
    order: { type: Number, default: 100 },
    ...seoFields,
    ...publishFields,
  },
  { timestamps: true },
);
export const Sector = defineModel("Sector", SectorSchema);

// ---- Exhibitor directory ---------------------------------------------------

export const LISTING_STATUSES = ["draft", "submitted", "approved", "published", "archived"] as const;
const ExhibitorListingSchema = new Schema(
  {
    slug: { type: String, required: true },
    edition: { type: String, required: true, index: true },
    company: { type: String, required: true },
    country: { type: String, default: "India" },
    city: String,
    categories: [String], // sector slugs
    logo: String,
    profile: String,
    website: String,
    booth: String, // only when assigned
    status: { type: String, enum: LISTING_STATUSES, default: "draft", index: true },
    updatedBy: String,
  },
  { timestamps: true },
);
ExhibitorListingSchema.index({ edition: 1, slug: 1 }, { unique: true });
ExhibitorListingSchema.index({ company: "text", profile: "text" });
export const ExhibitorListing = defineModel("ExhibitorListing", ExhibitorListingSchema);

// ---- Conference ------------------------------------------------------------

const SpeakerSchema = new Schema(
  {
    slug: { type: String, required: true },
    edition: { type: String, required: true, index: true },
    name: { type: String, required: true },
    designation: String,
    organisation: String,
    image: String,
    bio: String,
    linkedin: String,
    consentToPublish: { type: Boolean, default: false },
    ...publishFields,
  },
  { timestamps: true },
);
SpeakerSchema.index({ edition: 1, slug: 1 }, { unique: true });
export const Speaker = defineModel("Speaker", SpeakerSchema);

const SessionSchema = new Schema(
  {
    edition: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: String,
    // Stored as UTC; entered & displayed in Asia/Kolkata.
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    room: String,
    track: String,
    format: { type: String, enum: ["keynote", "panel", "presentation", "workshop", "launch", "networking", "other"], default: "panel" },
    speakerSlugs: [String],
    sessionStatus: { type: String, enum: ["tentative", "confirmed", "cancelled"], default: "tentative" },
    ...publishFields,
  },
  { timestamps: true },
);
SessionSchema.index({ edition: 1, startsAt: 1 });
export const Session = defineModel("Session", SessionSchema);

// ---- Editorial -------------------------------------------------------------

const PostSchema = new Schema(
  {
    kind: { type: String, enum: ["news", "insight"], required: true, index: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    excerpt: String,
    body: { type: String, default: "" },
    category: String,
    author: String,
    sourceName: String, // for external coverage summaries
    sourceUrl: String,
    coverImage: String,
    coverAlt: String,
    edition: String,
    ...seoFields,
    ...publishFields,
  },
  { timestamps: true },
);
PostSchema.index({ kind: 1, slug: 1 }, { unique: true });
PostSchema.index({ kind: 1, status: 1, publishedAt: -1 });
PostSchema.index({ title: "text", excerpt: "text", body: "text" });
export const Post = defineModel("Post", PostSchema);

const GalleryAlbumSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    edition: String,
    description: String,
    images: [
      {
        src: { type: String, required: true },
        width: Number,
        height: Number,
        alt: { type: String, required: true },
        caption: String,
        credit: String,
        focalX: { type: Number, default: 50 },
        focalY: { type: Number, default: 50 },
        _id: false,
      },
    ],
    rightsConfirmed: { type: Boolean, default: false },
    ...publishFields,
  },
  { timestamps: true },
);
export const GalleryAlbum = defineModel("GalleryAlbum", GalleryAlbumSchema);

const VideoSchema = new Schema(
  {
    title: { type: String, required: true },
    youtubeId: { type: String, required: true },
    edition: String,
    description: String,
    ...publishFields,
  },
  { timestamps: true },
);
export const Video = defineModel("Video", VideoSchema);

const DownloadSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: "PDF" },
    fileSizeLabel: String,
    edition: String,
    category: { type: String, enum: ["brochure", "report", "manual", "floor-plan", "media-kit", "other"], default: "other" },
    ...publishFields,
  },
  { timestamps: true },
);
export const Download = defineModel("Download", DownloadSchema);

const PartnerSchema = new Schema(
  {
    name: { type: String, required: true },
    kind: { type: String, enum: ["sponsor", "association", "media", "supporting", "knowledge"], default: "supporting" },
    tier: String,
    logo: String,
    url: String,
    edition: { type: String, index: true },
    order: { type: Number, default: 100 },
    confirmationRef: String, // where the organiser confirmed this partnership
    ...publishFields,
  },
  { timestamps: true },
);
export const Partner = defineModel("Partner", PartnerSchema);

const FaqSchema = new Schema(
  {
    audience: { type: String, enum: ["general", "exhibitor", "visitor", "conference"], required: true, index: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    order: { type: Number, default: 100 },
    ...publishFields,
  },
  { timestamps: true },
);
export const Faq = defineModel("Faq", FaqSchema);

const RedirectSchema = new Schema(
  {
    from: { type: String, required: true, unique: true },
    to: { type: String, required: true },
    statusCode: { type: Number, enum: [301, 302, 308], default: 301 },
    note: String,
    active: { type: Boolean, default: true },
    hits: { type: Number, default: 0 },
  },
  { timestamps: true },
);
export const Redirect = defineModel("Redirect", RedirectSchema);

const MediaAssetSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    mime: String,
    bytes: Number,
    width: Number,
    height: Number,
    alt: String,
    owner: String,
    usagePermission: String,
    licensingStatus: { type: String, enum: ["unknown", "pending", "licensed", "organiser_owned", "rejected"], default: "unknown" },
    uploadedBy: String,
  },
  { timestamps: true },
);
export const MediaAsset = defineModel("MediaAsset", MediaAssetSchema);

// ---- History (immutable once published; edits audited) -------------------

const PastEditionSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    editionLabel: String,
    year: { type: Number, required: true, index: true },
    dates: String,
    city: String,
    venue: String,
    summary: String,
    body: String,
    verifiedStats: [{ value: String, label: String, source: String, _id: false }],
    sources: [{ label: String, url: String, capturedAt: String, _id: false }],
    confidence: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    contradictions: String,
    reportUrl: String,
    locked: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    ...seoFields,
    ...publishFields,
  },
  { timestamps: true },
);
export const PastEdition = defineModel("PastEdition", PastEditionSchema);

const ContentVersionSchema = new Schema(
  {
    entity: { type: String, required: true },
    entityId: { type: String, required: true, index: true },
    version: Number,
    snapshot: Schema.Types.Mixed,
    by: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
export const ContentVersion = defineModel("ContentVersion", ContentVersionSchema);
