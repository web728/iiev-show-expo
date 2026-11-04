import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight, BatteryCharging,
  CarFront, Cpu, Factory, Handshake, MapPin, PlugZap, RadioTower,
  UsersRound, Wrench, Building2, TruckElectric, Download,
} from "lucide-react";
import { ImageLift, Reveal } from "@/components/home/reveal";
import { CompactHero } from "@/components/home/compact-hero";

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
  { number: "01", name: "Electric vehicles", desc: "Two- and three-wheelers, cars, buses, cargo vehicles and micro-mobility.", icon: CarFront },
  { number: "02", name: "Powertrains & components", desc: "Motors, controllers, drive systems, inverters, electronics and vehicle components.", icon: Cpu },
  { number: "03", name: "Charging infrastructure", desc: "AC/DC chargers, charging stations, connectors, platforms and swapping systems.", icon: PlugZap },
  { number: "04", name: "EV battery integration", desc: "Battery packs, management systems, thermal solutions and on-board charging.", icon: BatteryCharging },
  { number: "05", name: "Smart mobility", desc: "Telematics, fleet technology, connected vehicles, diagnostics and software.", icon: RadioTower },
  { number: "06", name: "Manufacturing & engineering", desc: "Assembly equipment, automation, precision engineering, testing and design.", icon: Factory },
];

const audience = [
  { title: "Automotive & manufacturing", desc: "Vehicle OEMs, component manufacturers, engineering and R&D teams.", icon: Wrench },
  { title: "Buyers & distribution", desc: "Dealers, distributors, sourcing teams and channel partners.", icon: Handshake },
  { title: "Fleet & transport", desc: "Fleet operators, logistics firms and commercial mobility businesses.", icon: TruckElectric },
  { title: "Charging & infrastructure", desc: "Charge-point operators, EPC companies, utilities and integrators.", icon: PlugZap },
  { title: "Government & institutions", desc: "Public-sector organisations, transport authorities and institutional buyers.", icon: Building2 },
  { title: "Research & investment", desc: "Investors, startups, research institutes, universities and consultants.", icon: UsersRound },
];

const steps = [
  { n: "01", title: "Discover", text: "Explore solutions across the electric mobility value chain." },
  { n: "02", title: "Evaluate", text: "Compare technology and speak directly with product teams." },
  { n: "03", title: "Connect", text: "Meet potential buyers, suppliers and industry professionals." },
  { n: "04", title: "Collaborate", text: "Discuss sourcing, manufacturing and business opportunities." },
];

function Kicker({ children, inverse = false }: { children: React.ReactNode; inverse?: boolean }) {
  return <p className={`text-[11px] font-extrabold uppercase tracking-[.2em] ${inverse ? "text-white/65" : "text-brand-dark"}`}>{children}</p>;
}

function Action({ children, href, secondary = false }: { children: React.ReactNode; href: string; secondary?: boolean }) {
  return (
    <Link
      href={href}
      className={secondary
        ? "group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/40 px-6 py-3 text-xs font-bold text-white transition-colors hover:bg-white/10 sm:text-sm"
        : "group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand px-6 py-3 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark sm:text-sm"}
    >{children}<ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
  );
}

export default function HomePage() {
  // The existing (site)/layout.tsx provides header, main, footer and global structured data.
  return <>
    <CompactHero />

        {/* Short center-led introduction */}
    <section id="about-show" className="scroll-mt-28 bg-white py-20 sm:py-28">
      <div className="container-site">
        <Reveal className="mx-auto max-w-4xl text-center"><Kicker>About IIEV 2027</Kicker><h2 className="mt-5 text-[clamp(2.1rem,5.1vw,4.4rem)] font-extrabold leading-[1.12] tracking-[-.055em] text-ink">Built for the entire <span className="text-brand-dark">EV value chain.</span></h2><p className="mx-auto mt-7 max-w-[760px] text-sm leading-8 text-copy sm:text-base">Organised by Futurex Group, the India International EV Show brings manufacturers, suppliers, engineers, charging specialists and business decision-makers together in Pune. The exhibition focuses on direct product discovery, supplier engagement and professional networking.</p></Reveal>
        <Reveal delay={0.12} className="mt-12 grid gap-3 border-t border-stroke pt-8 text-center sm:grid-cols-3 sm:gap-0"><div className="py-4 sm:border-r sm:border-stroke"><span className="text-3xl font-extrabold text-ink">9th</span><p className="mt-1 text-xs font-medium text-copy">Edition in 2027</p></div><div className="py-4 sm:border-r sm:border-stroke"><span className="text-3xl font-extrabold text-ink">3 days</span><p className="mt-1 text-xs font-medium text-copy">Of industry engagement</p></div><div className="py-4"><span className="text-3xl font-extrabold text-ink">Pune</span><p className="mt-1 text-xs font-medium text-copy">Automotive manufacturing region</p></div></Reveal>
      </div>
    </section>

    {/* Editorial rows, not repetitive icon cards */}
    <section id="show-sectors" className="scroll-mt-28 bg-soft py-20 sm:py-28">
      <div className="container-site">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><Kicker>Exhibitor profiles</Kicker><h2 className="mt-4 max-w-[670px] text-[clamp(2.1rem,4.5vw,4rem)] font-extrabold leading-[1.1] tracking-[-.05em]">Six sectors. <span className="text-brand-dark">One industry platform.</span></h2></div><p className="max-w-sm text-sm leading-7 text-copy">Discover solutions across the technologies, products and services shaping electric mobility.</p></Reveal>
        <div className="mt-12 border-t border-stroke">
          {sectors.map(({ number, name, desc, icon: Icon }, i) => <Reveal key={number} delay={Math.min(i, 3) * 0.035}><div className="group grid gap-4 border-b border-stroke py-6 transition-colors hover:bg-white/65 sm:grid-cols-[48px_68px_minmax(0,1fr)_minmax(0,1.1fr)_24px] sm:items-center sm:gap-6 sm:px-5 sm:py-8"><span className="text-xs font-bold text-brand-dark">{number}</span><span className="flex h-12 w-12 items-center justify-center rounded-full border border-stroke bg-white text-brand-dark"><Icon size={22} strokeWidth={1.7}/></span><h3 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{name}</h3><p className="max-w-md text-sm leading-7 text-copy">{desc}</p><ArrowUpRight size={19} aria-hidden className="hidden text-brand-dark transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 sm:block" /></div></Reveal>)}
        </div>
      </div>
    </section>

    {/* Offset images + factual venue description */}
    <section className="overflow-hidden bg-brand-deep py-20 text-white sm:py-28">
      <div className="container-site grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-18">
        <Reveal className="relative grid grid-cols-[1.2fr_.8fr] items-end gap-3"><div className="relative aspect-[4/4.6] overflow-hidden rounded-2xl"><Image src="/images/exhibitors.webp" alt="Visitors engaging with exhibitors at the previous show" fill sizes="(max-width:1024px) 55vw, 35vw" className="object-cover" /></div><div className="relative mb-9 aspect-[3/4] overflow-hidden rounded-2xl"><Image src="/images/discussions.webp" alt="Industry participants discussing technology at the previous edition" fill sizes="(max-width:1024px) 35vw, 20vw" className="object-cover" /></div><span className="absolute -bottom-4 right-6 rounded-full bg-brand px-5 py-3 text-xs font-bold">Pimpri-Chinchwad, Pune</span></Reveal>
        <Reveal delay={0.1}><Kicker inverse>Why Pune</Kicker><h2 className="mt-5 text-[clamp(2.1rem,4.5vw,4rem)] font-extrabold leading-[1.1] tracking-[-.05em]">Close to where India's vehicles <span className="text-brand">are built.</span></h2><p className="mt-7 text-sm leading-8 text-white/70 sm:text-base">Pune and Pimpri-Chinchwad have an established automotive engineering and manufacturing ecosystem. IIEV offers a meeting point for component suppliers, technology providers, manufacturers and commercial buyers.</p><p className="mt-6 flex items-start gap-3 text-sm font-semibold"><MapPin className="mt-0.5 shrink-0 text-brand" size={19}/> Auto Cluster Exhibition Centre, Pimpri-Chinchwad, Pune</p></Reveal>
      </div>
    </section>

    <section className="bg-white py-20 sm:py-28" id="industry-audience">
      <div className="container-site">
        <Reveal className="mx-auto max-w-3xl text-center"><Kicker>Industry audience</Kicker><h2 className="mt-5 text-[clamp(2.1rem,4.7vw,4rem)] font-extrabold leading-[1.1] tracking-[-.05em]">Meet people who make <span className="text-brand-dark">business happen.</span></h2><p className="mt-6 text-sm leading-8 text-copy">IIEV is designed for professional interaction across manufacturing, distribution, infrastructure, technology and research.</p></Reveal>
        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-stroke bg-stroke md:grid-cols-2 lg:grid-cols-3">
          {audience.map(({ title, desc, icon: Icon }, i) => <Reveal key={title} delay={(i % 3) * .05} className="h-full"><ImageLift className="h-full bg-white px-7 py-8 transition-colors hover:bg-soft sm:px-9"><Icon size={25} className="text-brand-dark" strokeWidth={1.8}/><h3 className="mt-8 text-lg font-extrabold leading-snug text-ink">{title}</h3><p className="mt-3 text-sm leading-7 text-copy">{desc}</p></ImageLift></Reveal>)}
        </div>
      </div>
    </section>

    <section className="bg-soft py-20 sm:py-28" id="experience">
      <div className="container-site">
        <Reveal className="max-w-3xl"><Kicker>Exhibition experience</Kicker><h2 className="mt-5 text-[clamp(2.1rem,4.7vw,4rem)] font-extrabold leading-[1.1] tracking-[-.05em]">Real products. <span className="text-brand-dark">Real conversations.</span></h2></Reveal>
        <div className="mt-12 grid gap-4 lg:grid-cols-[1.2fr_.8fr]"><Reveal className="relative min-h-[340px] overflow-hidden rounded-3xl sm:min-h-[510px]"><Image src="/images/vehicle-display.webp" alt="Vehicles on display at IIEV" fill sizes="(max-width:1024px) 100vw, 60vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-brand-night/80 via-transparent to-transparent"/><p className="absolute bottom-7 left-7 right-7 text-xl font-bold text-white sm:text-2xl">See the industry up close.</p></Reveal><div className="grid grid-cols-2 gap-3 lg:gap-4">{steps.map((s, i) => <Reveal key={s.n} delay={i * .05} className="flex flex-col justify-between rounded-2xl bg-brand-deep p-5 text-white sm:p-7"><span className="text-xs font-extrabold text-brand">{s.n} / 04</span><div><h3 className="mt-12 text-lg font-extrabold sm:text-xl">{s.title}</h3><p className="mt-3 text-xs leading-6 text-white/70 sm:text-sm">{s.text}</p></div></Reveal>)}</div></div>
      </div>
    </section>

    <section id="participate" className="scroll-mt-28 relative isolate overflow-hidden bg-brand-night py-18 text-white sm:py-24">
      <div aria-hidden className="pointer-events-none absolute -right-32 top-[-100px] h-[500px] w-[500px] rounded-full border-[45px] border-brand/15" />
      <div className="container-site relative z-10 text-center"><Reveal><Kicker inverse>Exhibit · Visit · Sponsor · Partner</Kicker><h2 className="mx-auto mt-5 max-w-4xl text-[clamp(2.3rem,5.4vw,4.7rem)] font-extrabold leading-[1.12] tracking-[-.055em]">Take your place in the <span className="text-brand">EV conversation.</span></h2><p className="mx-auto mt-6 max-w-xl text-sm leading-8 text-white/70">Discuss participation opportunities with the India International EV Show team.</p><div className="mt-9 flex flex-wrap justify-center gap-3"><Action href="mailto:namit@futurextrade.com?subject=IIEV%202027%20Participation%20Enquiry">Contact the team</Action><Link href="/brochure/IIEV-2027.pdf" target="_blank" className="inline-flex min-h-12 items-center gap-3 rounded-full border border-white/35 px-6 py-3 text-xs font-bold text-white transition-colors hover:bg-white/10 sm:text-sm"><Download size={17}/> View brochure</Link></div><p className="mt-7 text-xs text-white/55">14–16 October 2027 · Auto Cluster Exhibition Centre, Pune</p></Reveal></div>
    </section>
  </>;
}
