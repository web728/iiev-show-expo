// Default edition + organisation facts. These are FALLBACKS used when the CMS
// (MongoDB "editions" / "settings") is unavailable. Admins override everything
// edition-specific in Admin → Editions & Settings without a rebuild.
//
// Every fact carries a provenance note. See docs/FACT_REGISTER.md.

export const siteConfig = {
  name: "India International EV Show",
  shortName: "IIEV Show",
  domain: "iievshow.com",
  // Canonical base: set NEXT_PUBLIC_SITE_URL per environment (staging/production).
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_IN",
  timezone: "Asia/Kolkata",
  tagline: "Infused with E-Mobility Technology", // appears in the supplied official 9th edition logo artwork
  social: {
    // Source: iievshow.com header/footer, captured 10 Oct 2026
    facebook: "https://www.facebook.com/iievshow",
    instagram: "https://www.instagram.com/iievshow/",
    linkedin: "https://www.linkedin.com/company/iievshow/",
    x: "https://twitter.com/iievshow",
  },
} as const;

export const defaultEdition = {
  slug: "2027",
  editionNumber: 9,
  editionLabel: "9th Edition",
  year: 2027,
  // Organiser-supplied brief (10 Oct 2026). Displayed consistently.
  startDate: "2027-11-11",
  endDate: "2027-11-13",
  dateLabel: "11–13 November 2027",
  openingHours: null as string | null, // unknown — CMS
  venue: {
    name: "Auto Cluster Exhibition Centre",
    locality: "Pimpri-Chinchwad",
    city: "Pune",
    region: "Maharashtra",
    country: "IN",
    countryName: "India",
    postalCode: null as string | null, // to verify with venue
    streetAddress: null as string | null, // to verify with venue
    mapQuery: "Auto Cluster Exhibition Centre, Pimpri-Chinchwad, Pune",
  },
  // Proposed promotional forecasts — require organiser approval before display.
  forecasts: {
    approved: false,
    items: [
      { value: "150+", label: "Exhibitors (projected)" },
      { value: "15,000+", label: "Business visitors (projected)" },
      { value: "100+", label: "Industry speakers (projected)" },
    ],
    disclaimer: "Projected figures for the 2027 edition, based on organiser planning targets. Not audited attendance.",
  },
  conference: {
    // "EV Dynamics" appears historically on iievshow.com; 2027 title not reconfirmed.
    name: "EV Dynamics",
    titleApproved: false,
    programmeAnnounced: false,
  },
  registration: {
    visitorOpen: true,
    approvalMode: "auto" as "auto" | "review",
    admissionNote: null as string | null, // admission policy unknown — CMS
  },
  concurrentShows: [
    {
      key: "battery",
      name: "India International Battery Show",
      editionLabel: "2nd Edition", // per supplied logo artwork
      strap: "Production • Processing • Products",
      logo: "/brand/concurrent/india-international-battery-show-trimmed.png",
      approved: false, // 2027 co-location to be confirmed by organiser
    },
    {
      key: "solar",
      name: "India International Solar Show",
      editionLabel: "2nd Edition",
      strap: "Connecting Solar Industry",
      logo: "/brand/concurrent/india-international-solar-show-trimmed.png",
      approved: false,
    },
  ],
};

export type EditionConfig = typeof defaultEdition;

export const organiser = {
  brand: "Futurex",
  // Source: iievshow.com/about-organisers/ (10 Oct 2026) — legal name to be reconfirmed.
  legalName: "Futurex Trade Fair and Events Pvt. Ltd.",
  website: "https://futurextrade.com/",
  logo: "/brand/futurex-logo.png",
  // Source: iievshow.com/contact-us/ (10 Oct 2026). Publicly listed; organiser to reconfirm for 2027.
  address: "E-52, 1st Floor, Kalkaji, New Delhi – 110019, India",
  contacts: [
    { name: "Mr. Namit Gupta", phone: "+91 98108 55697", email: "namit@futurextrade.com" },
    { name: "Ms. Nidhi Gupta", phone: "+91 98718 39040", email: "nidhi@futurextrade.com" },
  ],
  contactsVerifiedFor2027: false,
};

export type NavItem = { label: string; href: string; description?: string; children?: NavItem[] };

export const mainNav: NavItem[] = [
  {
    label: "About",
    href: "/about/",
    children: [
      { label: "About the Show", href: "/about/", description: "Purpose, audience and organiser" },
        {
  label: "Organiser",
  href: "/organiser/",
},
      { label: "Why IIEV Show", href: "/why-iiev/", description: "What makes the platform useful" },
      { label: "Past Editions", href: "/past-editions/", description: "Verified history since 2022" },
      { label: "Concurrent Events", href: "/concurrent-events/", description: "Battery and Solar shows" },
    
    ],
  },
  {
    label: "Exhibit",
    href: "/exhibit/",
    children: [
      { label: "Why Exhibit", href: "/exhibit/why-exhibit/", description: "Business outcomes for exhibitors" },
      { label: "Exhibitor Profile", href: "/exhibit/exhibitor-profile/", description: "Who should exhibit" },
      { label: "Book a Stall", href: "/exhibit/book-a-stall/", description: "Send a stall enquiry" },
      // { label: "Floor Plan", href: "/exhibit/floor-plan/", description: "Hall layout and availability" },
      // { label: "Exhibitor Information", href: "/exhibit/information/", description: "Process, timelines, manual" },
      // { label: "Exhibitor FAQs", href: "/exhibit/faqs/" },
    ],
  },
  {
    label: "Visit",
    href: "/visit/",
    children: [
      { label: "Why Visit", href: "/visit/why-visit/", description: "Sourcing, partners and learning" },
      { label: "Visitor Profile", href: "/visit/visitor-profile/", description: "Who attends" },
      { label: "Register as Visitor", href: "/visit/register/", description: "Get your entry badge" },
      { label: "Venue", href: "/visit/venue/", description: "Auto Cluster Exhibition Centre" },
      // { label: "Travel & Stay", href: "/visit/travel/", description: "Reaching Pimpri-Chinchwad" },
      // { label: "Visitor FAQs", href: "/visit/faqs/" },
    ],
  },
  // { label: "Sectors", href: "/sectors/" },
  // {
  //   label: "Conference",
  //   href: "/conference/",
  //   children: [
  //     { label: "Conference Overview", href: "/conference/" },
  //     { label: "Agenda", href: "/conference/agenda/" },
  //     { label: "Speakers", href: "/conference/speakers/" },
  //     { label: "Delegate Registration", href: "/conference/register/" },
  //     { label: "Apply to Speak", href: "/conference/apply-to-speak/" },
  //   ],
  // },
  // { label: "Exhibitors", href: "/exhibitors/" },
  {
    label: "Media",
    href: "/media/",
    children: [
      // { label: "News", href: "/news/" },
      // { label: "Insights", href: "/insights/" },
      { label: "Gallery", href: "/gallery/" },
      { label: "Videos", href: "/videos/" },
      { label: "Downloads", href: "/downloads/" },
    ],
  },
  { label: "Contact", href: "/contact/" },
];

export const footerNav: {
  title: string;
  links: NavItem[];
}[] = [
  {
    title: "About",
    links: [
      {
        label: "About the Show",
        href: "/about/",
      },
      {
        label: "Why IIEV Show",
        href: "/why-iiev/",
      },
      {
        label: "Past Editions",
        href: "/past-editions/",
      },
      {
        label: "Organiser",
        href: "/organiser/",
      },
      {
        label: "Concurrent Events",
        href: "/concurrent-events/",
      },
    ],
  },
  {
    title: "Exhibit",
    links: [
      {
        label: "Why Exhibit",
        href: "/exhibit/why-exhibit/",
      },
      {
        label: "Exhibitor Profile",
        href: "/exhibit/exhibitor-profile/",
      },
      {
        label: "Book a Stall",
        href: "/exhibit/book-a-stall/",
      },
    ],
  },
  {
    title: "Visit",
    links: [
      {
        label: "Why Visit",
        href: "/visit/why-visit/",
      },
      {
        label: "Visitor Profile",
        href: "/visit/visitor-profile/",
      },
      {
        label: "Register as Visitor",
        href: "/visit/register/",
      },
      {
        label: "Venue & Directions",
        href: "/visit/venue/",
      },
    ],
  },
  {
    title: "Media",
    links: [
      {
        label: "Photo Gallery",
        href: "/gallery/",
      },
      {
        label: "Videos",
        href: "/videos/",
      },
      {
        label: "Downloads",
        href: "/downloads/",
      },
    ],
  },
];

export const legalNav: NavItem[] = [
  { label: "Privacy Policy", href: "/privacy-policy/" },
  { label: "Terms", href: "/terms/" },
  { label: "Cookie Policy", href: "/cookie-policy/" },
  { label: "Accessibility", href: "/accessibility/" },
  { label: "Site map", href: "/site-map/" },
];
