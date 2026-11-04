import raw from "./media-2026.json";

// Real photography from the 8th edition (2–4 Oct 2026, Auto Cluster Exhibition
// Centre, Pune), supplied by the organiser via Google Drive. Images re-encoded
// (EXIF stripped, ≤2400px WebP). See docs/ASSET_MANIFEST.md.

export type Photo = { slug: string; src: string; width: number; height: number; alt: string; caption: string; group: Group };
type Group = "expo" | "arrival" | "inauguration" | "registration" | "b2b" | "conference" | "awards";

const META: Record<string, [string, string]> = {
  "expo-crowd-hall": ["Crowded exhibition hall with visitors walking between EV stands", "Packed aisles in the main hall"],
  "expo-aisle-busy": ["Visitors filling an exhibition aisle lined with EV stands", "Busy aisles on the show floor"],
  "expo-aisle-visitors": ["Business visitors browsing stands in the hall", "Buyers on the floor"],
  "expo-hall-overview": ["Overview of the exhibition hall with vehicles and stands", "The exhibition hall"],
  "expo-cars-crowd": ["Visitors gathered around electric cars on display", "Electric cars drew crowds"],
  "expo-stall-visitors": ["Visitors at an energy-storage stand", "Energy storage stands"],
  "expo-aisle-walk": ["Visitors walking down an aisle of exhibitor booths", "Walking the aisles"],
  "expo-hybrid-car": ["Visitors inspecting a hybrid sedan on display", "Hybrid and electric cars side by side"],
  "expo-two-wheeler-crowd": ["Crowd at an electric two-wheeler stand", "Electric two-wheelers"],
  "expo-scooters": ["Electric scooters on display with visitors", "Electric scooters"],
  "expo-scooter-red": ["Red electric scooter on a stand with visitors behind", "Scooter showcase"],
  "expo-esync-crowd": ["Students and visitors at a battery-technology company's stand", "Students at a battery-technology stand"],
  "expo-scooter-stage": ["Electric scooters on a rotating display stage", "Two-wheelers on display"],
  "expo-suv-lineup": ["Line-up of electric SUVs in the hall", "Electric SUVs"],
  "expo-cars-display": ["Electric cars displayed in the exhibition hall", "Car makers on the floor"],
  "expo-scooter-allrounder": ["Pastel blue electric scooter on display", "Scooters on display"],
  "expo-motorbike": ["Electric motorcycle on display", "Electric motorcycles"],
  "expo-erickshaw": ["Electric three-wheeler auto rickshaw on display", "Electric three-wheelers"],
  "expo-river-stall": ["Visitors at an electric scooter maker's stand", "Two-wheeler maker's stand"],
  "expo-microcar": ["Compact electric car with visitors", "Compact electric cars"],
  "expo-car-interest": ["Visitors looking inside an electric car", "Hands-on with the vehicles"],
  "expo-solar-car": ["Students showing a solar-powered race car", "Student innovation: a solar car"],
  "expo-suv-bonnet": ["Visitors examining an SUV with the bonnet open", "Under the bonnet"],
  "expo-battery-demo": ["Exhibitor demonstrating battery equipment to visitors", "Product demonstrations"],
  "expo-charging-stall": ["EV charging solutions stand with visitors", "Charging solutions"],
  "expo-students": ["Group of students visiting exhibitor stands", "Engineering students on the floor"],
  "expo-stall-discussion": ["Exhibitor explaining products to visitors", "Conversations at the stands"],
  "expo-camry": ["Hybrid sedan display with visitors around it", "Passenger-car display"],
  "expo-crowd-stall": ["Crowd of visitors around an exhibitor stand", "Busy stands"],
  "arrival-welcome-gate": ["Show welcome gate with branding for the EV, Battery and Solar shows", "The welcome gate"],
  "arrival-hall-entrance": ["Entrance to the exhibition hall with show branding", "Hall entrance"],
  "arrival-registration-tent": ["Visitors at the outdoor registration tent", "Registration"],
  "arrival-banner": ["India International Battery Show banner at the venue", "Three shows, one venue"],
  "inauguration-ribbon": ["Dignitaries cutting the ribbon at the inauguration", "Ribbon-cutting at the inauguration"],
  "inauguration-lamp": ["Guests lighting the ceremonial lamp at the inauguration", "Lamp lighting"],
  "inauguration-stage": ["Guests and dignitaries on the inauguration stage", "Inauguration ceremony"],
  "inauguration-gate-group": ["Group of guests at the welcome gate on opening day", "Opening day"],
  "inauguration-dais": ["Speakers on the dais at the inaugural session", "Inaugural session"],
  "registration-desk": ["Visitors registering at the registration desk", "Badge collection"],
  "registration-counter": ["Registration counter with visitors collecting badges", "Registration counters"],
  "b2b-roundtable": ["Round-table business meeting with industry leaders", "Round-table meetings"],
  "b2b-roundtable-2": ["Round-table meeting in progress at the show", "Round-table meeting"],
  "b2b-lounge": ["Business lounge with delegates in discussion", "Business lounge"],
  "b2b-meeting-room": ["Meeting room set up for B2B discussions", "B2B meeting room"],
  "conf-panel-stage": ["Leadership panel discussion on the conference stage", "Leadership panels"],
  "conf-panel-group": ["Panellists posing on stage after a session", "Panel speakers"],
  "conf-community": ["Large group of delegates on the conference stage", "The conference community"],
  "conf-lamp": ["Lamp-lighting ceremony at the conference", "Conference opening"],
  "conf-keynote": ["Keynote speaker addressing the audience", "Keynote address"],
  "conf-audience": ["Conference audience listening to a session", "Conference audience"],
  "conf-panel-wide": ["Wide view of a leadership panel on stage", "Leadership panel"],
  "conf-auditorium": ["Conference auditorium stage", "The conference hall"],
  "conf-speaker": ["Speaker answering a question on stage", "Speaker sessions"],
  "conf-panel-discussion": ["Panellists in discussion during a session", "Panel discussion"],
  "conf-panel-6": ["Panel of industry leaders on the conference stage", "Industry panel"],
  "conf-speaker-lithium": ["Speaker presenting on lithium and critical minerals", "Critical minerals session"],
  "awards-team": ["Exhibitor team receiving a recognition memento", "Recognising exhibitors"],
  "awards-booth": ["Exhibitor receiving a memento at their stand", "Exhibitor recognition"],
  "awards-exhibitor": ["Exhibitors receiving a memento", "Thank-you to exhibitors"],
};

const groupOf = (slug: string): Group => {
  const p = slug.split("-")[0];
  return (({ expo: "expo", arrival: "arrival", inauguration: "inauguration", registration: "registration", b2b: "b2b", conf: "conference", awards: "awards" }) as Record<string, Group>)[p] ?? "expo";
};

export const photos2026: Photo[] = (raw as { slug: string; src: string; width: number; height: number }[]).map((r) => ({
  slug: r.slug,
  src: r.src,
  width: r.width,
  height: r.height,
  alt: META[r.slug]?.[0] ?? "IIEV Show 2026",
  caption: META[r.slug]?.[1] ?? "",
  group: groupOf(r.slug),
}));

export function photo(slug: string): Photo {
  const p = photos2026.find((x) => x.slug === slug);
  if (!p) throw new Error(`Unknown photo ${slug}`);
  return p;
}

export const heroVideo = { src: "/media/video/iiev-2026-hero.mp4", poster: "/media/video/iiev-2026-hero-poster.jpg" };

export type Testimonial = { code: string; src: string; poster: string; stand: string };
// Speaker names/designations to be added by the organiser (Admin → Videos).
export const testimonials: Testimonial[] = [
  { code: "c1423", stand: "River", src: "/media/video/testimonial-c1423.mp4", poster: "/media/video/testimonial-c1423.jpg" },
  { code: "c1421", stand: "Youhonk", src: "/media/video/testimonial-c1421.mp4", poster: "/media/video/testimonial-c1421.jpg" },
  { code: "c1418", stand: "Binder", src: "/media/video/testimonial-c1418.mp4", poster: "/media/video/testimonial-c1418.jpg" },
  { code: "c1420", stand: "Evonzaa", src: "/media/video/testimonial-c1420.mp4", poster: "/media/video/testimonial-c1420.jpg" },
  { code: "c1440", stand: "Hyundai dealership", src: "/media/video/testimonial-c1440.mp4", poster: "/media/video/testimonial-c1440.jpg" },
  { code: "c1441", stand: "Kinetic", src: "/media/video/testimonial-c1441.mp4", poster: "/media/video/testimonial-c1441.jpg" },
];
