import type { Metadata } from "next";
import { PageHero, Section, CtaBand, Notice } from "@/components/ui/layout-blocks";
import { Icon } from "@/components/ui/icons";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Travel & Stay — Getting to IIEV Show in Pune",
  description: "How to reach the Auto Cluster Exhibition Centre in Pimpri-Chinchwad, Pune by air, rail, metro and road, and where visitors usually stay.",
  path: "/visit/travel/",
});

const modes = [
  {
    icon: "Plane" as const,
    title: "By air",
    text: "Pune International Airport (Lohegaon) has domestic connections across India and limited international flights. Many international visitors fly into Mumbai and continue to Pune by road. From Pune airport, the venue is reachable by taxi or app cab; allow for traffic at peak hours.",
  },
  {
    icon: "Train" as const,
    title: "By rail & metro",
    text: "Pune Junction is the main long-distance station. Suburban trains on the Pune–Lonavala line stop at Pimpri, Chinchwad and Akurdi. The Pune Metro links central Pune with Pimpri-Chinchwad; check the latest route map and complete your journey by auto-rickshaw or cab.",
  },
  {
    icon: "Car" as const,
    title: "By road",
    text: "Pimpri-Chinchwad sits on the old Mumbai–Pune highway and close to the Mumbai–Pune Expressway, making it a day trip from Mumbai. App cabs and auto-rickshaws are widely available across Pune and Pimpri-Chinchwad.",
  },
  {
    icon: "Hotel" as const,
    title: "Where to stay",
    text: "Visitors usually stay in Pimpri-Chinchwad, Wakad, Hinjewadi, Baner or central Pune. Staying in Pimpri-Chinchwad or the western suburbs shortens the daily commute to the venue.",
  },
];

export default function TravelPage() {
  return (
    <>
      <PageHero image={{ src: "/media/2026/arrival-registration-tent.webp" }}
        eyebrow="Visit"
        title="Travel & stay"
        intro={<p>Practical guidance for reaching the Auto Cluster Exhibition Centre in Pimpri-Chinchwad, Pune.</p>}
        crumbs={[{ label: "Visit", href: "/visit/" }, { label: "Travel & Stay", href: "/visit/travel/" }]}
      />
      <Section>
        <ul className="grid gap-5 md:grid-cols-2">
          {modes.map((m) => {
            const I = Icon[m.icon];
            return (
              <li key={m.title} className="rounded-2xl border border-line bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand-green/10 text-brand-green"><I className="size-6" /></span>
                  <h2 className="text-lg font-bold text-ink">{m.title}</h2>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{m.text}</p>
              </li>
            );
          })}
        </ul>
        <div className="mt-8 max-w-3xl">
          <Notice>Travel times vary with traffic. The organiser has not announced official hotel partners or shuttle services for 2027; if they are arranged, details will appear here.</Notice>
        </div>
      </Section>
      <CtaBand title="Registered yet?" primary={{ label: "Register as Visitor", href: "/visit/register/" }} secondary={{ label: "Venue details", href: "/visit/venue/" }} />
    </>
  );
}
