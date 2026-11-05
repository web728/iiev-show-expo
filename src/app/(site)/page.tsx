import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { CompactHero } from "@/components/home/compact-hero";
import { Arc, Chevrons, FadeUp, FocusRow, Lines, Photo, Rule, Tab } from "@/components/home/motion-kit";

export const metadata: Metadata = {
  title: "India International EV Show 2027 | 14–16 October, Pune",
  description:
    "Attend the 9th India International EV Show on 14–16 October 2027 at Auto Cluster Exhibition Centre, Pimpri-Chinchwad, Pune. Explore EVs, charging, components and technology.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "India International EV Show 2027 | Pune",
    description: "Explore electric vehicles, charging infrastructure, EV components and mobility technology, 14–16 October 2027 in Pune.",
    url: "/",
    type: "website",
  },
};

const sectors = [
  { number: "01", name: "Electric vehicles", desc: "Two- and three-wheelers, cars, buses, cargo vehicles and micro-mobility." },
  { number: "02", name: "Powertrains & components", desc: "Motors, controllers, drive systems, inverters, electronics and vehicle components." },
  { number: "03", name: "Charging infrastructure", desc: "AC/DC chargers, charging stations, connectors, platforms and swapping systems." },
  { number: "04", name: "EV battery integration", desc: "Battery packs, management systems, thermal solutions and on-board charging." },
  { number: "05", name: "Smart mobility", desc: "Telematics, fleet technology, connected vehicles, diagnostics and software." },
  { number: "06", name: "Manufacturing & engineering", desc: "Assembly equipment, automation, precision engineering, testing and design." },
];

const audience = [
  { title: "Automotive & manufacturing", desc: "Vehicle OEMs, component manufacturers, engineering and R&D teams." },
  { title: "Buyers & distribution", desc: "Dealers, distributors, sourcing teams and channel partners." },
  { title: "Fleet & transport", desc: "Fleet operators, logistics firms and commercial mobility businesses." },
  { title: "Charging & infrastructure", desc: "Charge-point operators, EPC companies, utilities and integrators." },
  { title: "Government & institutions", desc: "Public-sector organisations, transport authorities and institutional buyers." },
  { title: "Research & investment", desc: "Investors, startups, research institutes, universities and consultants." },
];

const steps = [
  { n: "01", title: "Discover", text: "Explore solutions across the electric mobility value chain." },
  { n: "02", title: "Evaluate", text: "Compare technology and speak directly with product teams." },
  { n: "03", title: "Connect", text: "Meet potential buyers, suppliers and industry professionals." },
  { n: "04", title: "Collaborate", text: "Discuss sourcing, manufacturing and business opportunities." },
];

const aboutFacts = [
  { label: "Edition", value: "9th" },
  { label: "Dates", value: "14–16 October 2027" },
  { label: "Venue", value: "Auto Cluster Exhibition Centre, Pimpri-Chinchwad, Pune" },
  { label: "Organiser", value: "Futurex Group" },
];

const h2 = "text-[clamp(2rem,4.4vw,3.9rem)] font-light leading-[1.08] tracking-[-0.035em]";

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex min-h-12 items-center gap-4 rounded-full bg-brand py-2 pl-6 pr-2 text-sm font-bold text-white transition duration-300 hover:bg-brand-dark active:scale-[0.98] focus-visible:outline-offset-4">
      {children}
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-brand-dark transition-transform duration-300 group-hover:scale-105">
        <ArrowRight size={16} aria-hidden className="-rotate-45 transition-transform duration-300 group-hover:rotate-0" />
      </span>
    </Link>
  );
}

export default function HomePage() {
  // The existing (site)/layout.tsx provides header, main, footer and global structured data.
  // Colour rule for the page: green is the accent (bold words, numbers, bars), navy and white are the ground.
  return (
    <>
      <CompactHero />

      {/* About: one statement, then the plain facts */}
      <section id="about-show" className="relative scroll-mt-28 overflow-hidden bg-white py-20 sm:py-28">
        <Chevrons className="pointer-events-none absolute -right-6 top-10 h-52 w-40 rotate-180 text-brand/[0.1]" />
        <div className="container-site relative grid gap-8 lg:grid-cols-12">
          <FadeUp className="lg:col-span-3"><p className="text-sm font-semibold text-brand-dark">About the show</p></FadeUp>
          <div className="lg:col-span-9">
            <FadeUp>
              <h2 className="text-[clamp(1.6rem,3.3vw,2.9rem)] font-light leading-[1.22] tracking-[-0.03em] text-ink">
                The India International EV Show puts manufacturers, suppliers, engineers and charging specialists <span className="font-bold text-brand-dark">in one place in Pune</span>, so discovery and sourcing happen face to face.
              </h2>
            </FadeUp>
            <dl className="mt-14 grid gap-x-8 gap-y-6 pt-6 sm:grid-cols-2 lg:grid-cols-4">
              <Rule className="col-span-full -mt-6 mb-6" />
              {aboutFacts.map((f, i) => (
                <FadeUp key={f.label} delay={i * 0.07}>
                  <dt className="text-xs text-copy">{f.label}</dt>
                  <dd className="mt-1.5 text-sm font-bold leading-6 text-brand-dark">{f.value}</dd>
                </FadeUp>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Sectors: heading stays put; the row in the middle of the screen lights up */}
      <section id="show-sectors" className="scroll-mt-28 bg-soft py-20 sm:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <FadeUp><p className="text-sm font-semibold text-brand-dark">Exhibitor profiles</p></FadeUp>
              <Lines as="h2" className={`mt-4 text-ink ${h2}`} lines={["Six sectors,", <span key="b" className="font-bold text-brand-dark">one platform.</span>]} />
            </div>
          </div>
          <ul className="lg:col-span-8">
            <li aria-hidden><Rule tone="bg-ink" /></li>
            {sectors.map(({ number, name, desc }, i) => (
              <li key={number}>
                <FadeUp delay={Math.min(i, 2) * 0.05}>
                  <FocusRow className="group relative border-b border-stroke py-7 transition-[padding] duration-500 hover:pl-4 data-[active=true]:pl-4 sm:py-8">
                    <span aria-hidden className="absolute left-0 top-1/2 h-0 w-[3px] -translate-y-1/2 bg-gradient-to-b from-[#3BB36B] to-[#1D8043] transition-all duration-500 group-hover:h-12 group-data-[active=true]:h-12" />
                    <div className="grid grid-cols-[2.25rem_1fr] gap-x-3 gap-y-2 sm:grid-cols-[3rem_1fr_1fr_1.5rem] sm:items-center sm:gap-x-6">
                      <span className="text-xs font-bold text-brand-dark">{number}</span>
                      <h3 className="text-xl font-bold tracking-tight text-ink transition-colors duration-500 group-hover:text-brand-dark group-data-[active=true]:text-brand-dark sm:text-2xl">{name}</h3>
                      <p className="col-start-2 text-sm leading-7 text-copy sm:col-start-auto">{desc}</p>
                      <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden h-5 w-5 -translate-x-2 translate-y-2 text-brand-dark opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-data-[active=true]:translate-x-0 group-data-[active=true]:translate-y-0 group-data-[active=true]:opacity-100 sm:block">
                        <path d="M7 17 17 7M8 7h9v9" />
                      </svg>
                    </div>
                  </FocusRow>
                </FadeUp>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why Pune: photo-led, second photo overlaps the first */}
      <section className="relative overflow-hidden bg-brand-night py-20 text-white sm:py-28">
        <Arc opacity={0.5} thickness="40px" className="pointer-events-none absolute -left-44 top-[44%] aspect-square w-[460px]" />
        <div className="container-site relative">
          <div className="grid gap-6 lg:grid-cols-12">
            <FadeUp className="lg:col-span-3"><p className="text-sm font-semibold text-brand">Why Pune</p></FadeUp>
            <Lines as="h2" className={`lg:col-span-9 ${h2}`} lines={["Close to where", <span key="b" className="font-bold text-brand">India's vehicles are built.</span>]} />
          </div>
          <Photo className="mt-12 aspect-[16/10] rounded-md sm:aspect-[2/1]">
            <Image src="/images/exhibitors.webp" alt="Visitors engaging with exhibitors at the previous show" fill sizes="(max-width:1280px) 100vw, 1200px" className="object-cover" />
          </Photo>
          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            <FadeUp className="lg:col-span-5">
              <p className="text-sm leading-8 text-white/75 sm:text-base">
                Pune and Pimpri-Chinchwad have an established automotive engineering and manufacturing ecosystem. IIEV gives component suppliers, technology providers, manufacturers and commercial buyers a place to meet.
              </p>
            </FadeUp>
            <div className="lg:col-span-4 lg:col-start-8 lg:-mt-44">
              <Photo className="aspect-[4/5] rounded-md border-[6px] border-brand-night">
                <Image src="/images/discussions.webp" alt="Industry participants discussing technology at the previous edition" fill sizes="(max-width:1024px) 100vw, 400px" className="object-cover" />
              </Photo>
            </div>
          </div>
        </div>
      </section>

      {/* Audience: plain typographic grid, no cards */}
      <section id="industry-audience" className="bg-white py-20 sm:py-28">
        <div className="container-site">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <Lines as="h2" className={`text-ink lg:col-span-7 ${h2}`} lines={["The people you'll meet", <span key="b" className="font-bold text-brand-dark">on the floor.</span>]} />
            <FadeUp className="lg:col-span-4 lg:col-start-9"><p className="text-sm leading-8 text-copy">Professional conversations across manufacturing, distribution, infrastructure, technology and research.</p></FadeUp>
          </div>
          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {audience.map((a, i) => (
              <FadeUp key={a.title} delay={(i % 3) * 0.08}>
                <Rule />
                <h3 className="mt-5 text-lg font-bold leading-snug text-ink">{a.title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-7 text-copy">{a.desc}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Experience: one wide photo, then the four-step visit */}
      <section id="experience" className="bg-soft py-20 sm:py-28">
        <div className="container-site">
          <Lines as="h2" className={`text-ink ${h2}`} lines={["Real products.", <span key="b" className="font-bold text-brand-dark">Real conversations.</span>]} />
          <Photo className="mt-12 aspect-[4/3] rounded-md sm:aspect-[21/9]">
            <Image src="/images/vehicle-display.webp" alt="Vehicles on display at IIEV" fill sizes="(max-width:1280px) 100vw, 1200px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-night/70 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 text-lg font-bold text-white sm:bottom-7 sm:left-7 sm:text-2xl">See the industry up close.</p>
          </Photo>
          <ol className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.n}>
                <FadeUp delay={i * 0.08}>
                  <div className="relative">
                    <Rule />
                    <Tab className="absolute -top-px left-0" />
                    <span className="mt-6 block text-xs font-bold text-brand-dark">{s.n}</span>
                    <h3 className="mt-3 text-xl font-bold text-ink">{s.title}</h3>
                    <p className="mt-2 max-w-[15rem] text-sm leading-7 text-copy">{s.text}</p>
                  </div>
                </FadeUp>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing call: bookends the hero with the same arc */}
      <section id="participate" className="relative isolate scroll-mt-28 overflow-hidden bg-brand-night py-24 text-white sm:py-32">
        <Arc className="pointer-events-none absolute -right-[14%] -top-[40%] -z-10 aspect-square w-[min(60vw,700px)]" />
        {/* flat brand-green ring and chevrons instead of any glow */}
        <div aria-hidden className="pointer-events-none absolute -bottom-52 -left-40 -z-10 aspect-square w-[460px] rounded-full border border-brand/30 bg-brand/[0.08]" />
        <Chevrons className="pointer-events-none absolute bottom-10 right-6 -z-10 hidden h-44 w-32 text-white/[0.06] sm:block" />
        <div className="container-site">
          <Lines as="h2" className="max-w-4xl text-[clamp(2.3rem,5.6vw,5rem)] font-light leading-[1.05] tracking-[-0.035em]" lines={["Take your place", <span key="b" className="font-bold text-brand">in the EV conversation.</span>]} />
          <FadeUp delay={0.15}>
            <p className="mt-7 max-w-md text-sm leading-8 text-white/75 sm:text-base">Exhibit, visit, sponsor or partner. Talk to the India International EV Show team about taking part.</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <PrimaryLink href="mailto:namit@futurextrade.com?subject=IIEV%202027%20Participation%20Enquiry">Contact the team</PrimaryLink>
              <Link href="/brochure/IIEV-2027.pdf" target="_blank" className="inline-flex items-center gap-2 text-sm font-bold underline decoration-white/40 underline-offset-[6px] transition-colors duration-300 hover:decoration-brand focus-visible:outline-offset-4">
                <Download size={16} aria-hidden /> View brochure
              </Link>
            </div>
          </FadeUp>
          <div className="mt-20">
            <Rule tone="bg-white/20" />
            <FadeUp delay={0.2}><p className="pt-5 text-xs text-white/60">14–16 October 2027, Auto Cluster Exhibition Centre, Pune</p></FadeUp>
          </div>
        </div>
      </section>
    </>
  );
}