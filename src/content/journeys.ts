import type { Journey } from "@/components/sections/journey-picker";
import { photo } from "./media";

const img = (slug: string) => ({ src: photo(slug).src, alt: photo(slug).alt });

export const journeys: Journey[] = [
  {
    key: "exhibit",
    label: "I want to exhibit", short: "Exhibit",
    icon: "Layers",
    headline: "Meet dealers, fleet buyers and OEM sourcing teams in Pune",
    text: "The show floor brings vehicle makers and suppliers together with the people who sell, buy and specify their products. Stall space is allocated as participation is confirmed.",
    steps: ["Send a stall enquiry (about 3 minutes)", "The sales team shares available space and terms", "Confirm participation; receive the exhibitor manual and directory listing"],
    cta: { label: "Book your stall", href: "/exhibit/book-a-stall/" },
    secondary: { label: "Why exhibit", href: "/exhibit/why-exhibit/" },
    image: img("expo-cars-crowd"),
  },
  {
    key: "visit",
    label: "I want to visit", short: "Visit",
    icon: "Ticket",
    headline: "See vehicles, batteries, charging and components in one place",
    text: "Business visitors can compare products side by side, talk to the companies that make them and look for dealership, sourcing or partnership opportunities.",
    steps: ["Register online in about two minutes", "Download or print your QR badge", "Show the QR code at the entrance to check in"],
    cta: { label: "Get my visitor badge", href: "/visit/register/" },
    secondary: { label: "Why visit", href: "/visit/why-visit/" },
    image: img("expo-aisle-visitors"),
  },
  {
    key: "sponsor",
    label: "I want to sponsor", short: "Sponsor",
    icon: "Handshake",
    headline: "Reach exhibitors, visitors and conference delegates",
    text: "Sponsorship options cover the venue, registration, the conference and digital channels. Tell us who you want to reach and we will share what is available for 2027.",
    steps: ["Tell us your objectives and target audience", "The partnerships team shares available options", "Agree the package and deliverables in writing"],
    cta: { label: "Enquire about sponsorship", href: "/sponsorship/enquire/" },
    secondary: { label: "Sponsorship options", href: "/sponsorship/" },
    image: img("arrival-welcome-gate"),
  },
  {
    key: "speak",
    label: "I want to speak", short: "Speak",
    icon: "Mic",
    headline: "Share what you know with the people building EVs in India",
    text: "In 2026 the conference ran leadership panels on batteries, charging, critical minerals and policy. Proposals for the 2027 programme are open.",
    steps: ["Submit a topic, abstract and bio", "The programme committee reviews it", "Shortlisted speakers are contacted"],
    cta: { label: "Apply to speak", href: "/conference/apply-to-speak/" },
    secondary: { label: "Conference", href: "/conference/" },
    image: img("conf-panel-stage"),
  },
  {
    key: "media",
    label: "I'm from the media", short: "Media",
    icon: "News",
    headline: "Media access, releases and photographs",
    text: "Journalists covering electric mobility can request media access and interviews, and find official releases and photographs in the media centre.",
    steps: ["Contact the team with your publication details", "Receive media access information", "Use releases and photos from the media centre"],
    cta: { label: "Contact the media team", href: "/contact/" },
    secondary: { label: "Media centre", href: "/media/" },
    image: img("inauguration-ribbon"),
  },
];
