// Past-edition archive seed. Every record cites sources captured on 10 Oct 2026.
// Statistics are deliberately omitted from public display until the organiser
// supplies post-show reports (see docs/FACT_REGISTER.md → "Historic statistics").

export type PastEditionSeed = {
  slug: string;
  editionLabel: string;
  title: string;
  year: number;
  dates: string | null;
  city: string;
  venue: string | null;
  confidence: "high" | "medium" | "low";
  summary: string;
  contradictions?: string;
  sources: { label: string; url: string; capturedAt: string }[];
};

const C = "2026-10-10";

export const pastEditions: PastEditionSeed[] = [
  {
    slug: "2026-pune",
    editionLabel: "8th Edition",
    title: "India International EV Show 2026 — Pune",
    year: 2026,
    dates: "2–4 October 2026",
    city: "Pune",
    venue: "Auto Cluster Exhibition Centre, Pimpri-Chinchwad",
    confidence: "high",
    summary:
      "The eighth edition returned to the Auto Cluster Exhibition Centre and was announced alongside the India International Battery Show and India International Solar Show, broadening the floor to cells, battery manufacturing, storage and solar-linked charging.",
    sources: [
      { label: "iievshow.com (official site)", url: "https://iievshow.com/", capturedAt: C },
      { label: "The Machine Maker — Pune to host major EV, battery and solar expo in October (11 Aug 2026)", url: "https://themachinemaker.com/news/pune-to-host-major-ev-battery-and-solar-expo-in-october/", capturedAt: C },
    ],
  },
  {
    slug: "2025-pune",
    editionLabel: "7th Edition",
    title: "India International EV Show 2025 — Pune",
    year: 2025,
    dates: "5–7 December 2025",
    city: "Pune",
    venue: "Auto Cluster Exhibition Centre, Pimpri-Chinchwad",
    confidence: "medium",
    summary:
      "The seventh edition was held in Pune. The official site links a post-show report for the \"7th Pune EV Show\" (2025). Dates are taken from a third-party event listing and are awaiting organiser confirmation.",
    contradictions: "Dates come from a third-party listing only; official post-show report not yet reviewed.",
    sources: [
      { label: "Global Trade Fairs listing", url: "https://globaltradefairs.com/tradefairs/event-details/india-international-ev-show-2025-pune", capturedAt: C },
      { label: "iievshow.com — Post Show Report link (7th Pune EV Show 2025)", url: "https://iievshow.com/", capturedAt: C },
    ],
  },
  {
    slug: "2024-pune",
    editionLabel: "6th Edition",
    title: "India International EV Show 2024 — Pune",
    year: 2024,
    dates: "6–8 December 2024",
    city: "Pune",
    venue: "Auto Cluster Exhibition Centre",
    confidence: "high",
    summary:
      "The sixth edition took place in Pune with the Deccan Chamber of Commerce, Industries & Agriculture (DCCIA) as a support partner. The show floor covered EV manufacturing, batteries, energy storage, renewable energy and charging infrastructure.",
    contradictions: "The DCCIA circular names the organiser as \"Future Market Events (FME)\"; the official site credits Futurex. Organiser to confirm.",
    sources: [
      { label: "DCCIA circular #083/GEN/2024-25 (12 Dec 2024)", url: "https://dcciapune.org/wp-content/uploads/2024/12/DCCIA-partners-with-FurtureX-for-the-6th-edition-of-India-EV-International-Show-from-06th-to-08th-December-2024.pdf", capturedAt: C },
    ],
  },
  {
    slug: "2024-chennai",
    editionLabel: "5th Edition",
    title: "India International EV Show 2024 — Chennai",
    year: 2024,
    dates: null,
    city: "Chennai",
    venue: "Chennai Trade Centre, Nandambakkam",
    confidence: "low",
    summary:
      "The fifth edition was announced for the Chennai Trade Centre in 2024. Exact dates are being verified because published sources disagree.",
    contradictions: "Sources list both 7–9 June 2024 and 6–8 September 2024.",
    sources: [
      { label: "Hioki India event listing (Jun 2024)", url: "https://www.hioki.com/in-en/news/events/detail/id_1266747.html", capturedAt: C },
      { label: "The Machine Maker — Chennai to host India's major electric vehicle industry event", url: "https://themachinemaker.com/show-reports/chennai-to-host-indias-major-electric-vehicle-industry-event/", capturedAt: C },
    ],
  },
  {
    slug: "2024-new-delhi",
    editionLabel: "4th Edition",
    title: "India International EV Show 2024 — New Delhi",
    year: 2024,
    dates: null,
    city: "New Delhi",
    venue: "India International Convention & Expo Centre (Yashobhoomi), Dwarka",
    confidence: "low",
    summary:
      "A New Delhi edition was announced for March 2024 at the India International Convention & Expo Centre, Dwarka. Confirmation that it took place as announced is pending from the organiser.",
    contradictions: "Only pre-event announcements found (15–17 March 2024).",
    sources: [
      { label: "The Machine Maker — IIEV Delhi edition announcement", url: "https://themachinemaker.com/show-reports/iiev-delhi-edition-to-showcase-5000-cutting-edge-ev-technologies-charging-infra/", capturedAt: C },
    ],
  },
  {
    slug: "2023-pune",
    editionLabel: "3rd Edition",
    title: "India International EV Show 2023 — Pune",
    year: 2023,
    dates: "1–3 December 2023",
    city: "Pune",
    venue: "Auto Cluster Exhibition Centre, Pimpri-Chinchwad",
    confidence: "medium",
    summary:
      "The third edition was held in Pimpri-Chinchwad. Pre-event coverage reported that Maharashtra's then Deputy Chief Minister was expected to inaugurate the show.",
    sources: [
      { label: "The Machine Maker — Maharashtra Dy CM to inaugurate IIEV 2023", url: "https://themachinemaker.com/show-reports/maharashtra-dy-cm-ajit-pawar-to-inaugurate-iiev-2023/", capturedAt: C },
      { label: "Punekar News — EV exhibition kicks off from December 1 in Pimpri-Chinchwad", url: "https://www.punekarnews.in/pune-indias-largest-ev-exhibition-kick-starts-from-december-1-in-pimpri-chinchwad/", capturedAt: C },
    ],
  },
  {
    slug: "2023-chennai",
    editionLabel: "2nd Edition",
    title: "India International EV Show 2023 — Chennai",
    year: 2023,
    dates: "26–28 May 2023",
    city: "Chennai",
    venue: "Chennai Trade Centre, Nandambakkam",
    confidence: "medium",
    summary:
      "The second edition moved to Chennai, focusing on battery technologies, energy storage and charging infrastructure alongside vehicle displays.",
    sources: [
      { label: "AutoGuide India — India International EV Show 2023: May 26–28, Chennai", url: "https://www.autoguideindia.com/events/india-international-ev-show-2023-may-26-28-chennai/", capturedAt: C },
      { label: "e-Vehicleinfo — Chennai set to host IIEV Show 2023", url: "https://e-vehicleinfo.com/?p=31369", capturedAt: C },
    ],
  },
  {
    slug: "2022-pune",
    editionLabel: "1st Edition",
    title: "India International EV Show 2022 — Pune",
    year: 2022,
    dates: "13–15 November 2022",
    city: "Pune",
    venue: "Auto Cluster Exhibition Centre, Chinchwad",
    confidence: "medium",
    summary: "The first India International EV Show — an exhibition and conference — was held at the Auto Cluster Exhibition Centre in Chinchwad, Pune.",
    sources: [
      { label: "The Machine Maker — Unleash the potential of eMobility at India International EV Show Pune", url: "https://themachinemaker.com/?p=17997", capturedAt: C },
    ],
  },
];
