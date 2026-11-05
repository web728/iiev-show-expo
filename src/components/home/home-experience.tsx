"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowDown, ArrowUpRight, BatteryCharging, CalendarDays,
  CarFront, Check, ChevronLeft, ChevronRight, CircuitBoard, Factory,
  MapPin, PlugZap, RadioTower, Sparkles, MoveUpRight,
} from "lucide-react";

type Props = { editionLabel: string; year: number; dateLabel: string; venue: string };
const EASE = [0.22, 1, 0.36, 1] as const;

const sectors = [
  { n: "01", title: "Electric vehicles", short: "Vehicles", desc: "Two-wheelers, three-wheelers, passenger EVs and commercial mobility.", icon: CarFront, image: "/images/exhibitors.webp" },
  { n: "02", title: "Battery & energy storage", short: "Energy", desc: "Battery systems, BMS, pack integration and energy storage solutions.", icon: BatteryCharging, image: "/images/technology.webp" },
  { n: "03", title: "Charging infrastructure", short: "Charging", desc: "Charging hardware, connectors, software and supporting infrastructure.", icon: PlugZap, image: "/images/industry-floor.webp" },
  { n: "04", title: "Components & powertrains", short: "Components", desc: "Electric motors, controllers, power electronics and drivetrain systems.", icon: CircuitBoard, image: "/images/technology.webp" },
  { n: "05", title: "Connected mobility", short: "Connected", desc: "Fleet management, telematics, diagnostics and mobility software.", icon: RadioTower, image: "/images/networking.webp" },
  { n: "06", title: "Manufacturing technology", short: "Manufacturing", desc: "Assembly, testing, automation, machinery and engineering technology.", icon: Factory, image: "/images/discussions.webp" },
];

const gallery = [
  { n: "01", title: "Machines that move us", kicker: "PRODUCT DISCOVERY", caption: "Vehicles and technology brought onto the exhibition floor.", image: "/images/exhibitors.webp", alt: "Visitors exploring electric vehicles at an exhibition" },
  { n: "02", title: "Ideas in motion", kicker: "TECHNOLOGY SHOWCASE", caption: "Closer conversations around products, components and innovation.", image: "/images/technology.webp", alt: "Technology showcase at an EV exhibition" },
  { n: "03", title: "Connections that count", kicker: "INDUSTRY NETWORKING", caption: "Meet professionals from across the electric mobility ecosystem.", image: "/images/networking.webp", alt: "Industry professionals networking at the show" },
  { n: "04", title: "Conversations that matter", kicker: "INDUSTRY PROGRAMME", caption: "Past-edition sessions and conversations from the show.", image: "/images/conference.webp", alt: "Conference speakers and attendees at a previous edition" },
];

const figures = [
  { value: "100+", label: "Exhibitors" },
  { value: "5,000+", label: "Dealers / distributors" },
  { value: "20,000+", label: "Attendees over 3 days" },
  { value: "300+", label: "Participating brands" },
];

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className}
      initial={reduce ? false : { opacity: 0, y: 34 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduce ? 0 : 0.75, delay: reduce ? 0 : delay, ease: EASE }}>
      {children}
    </motion.div>
  );
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.22em] sm:text-[11px] ${light ? "text-[#9BE9B6]" : "text-[#178544]"}`}><span className="h-px w-8 bg-[#23A455]" />{children}</p>;
}

function MainTitle({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <h2 className={`mt-5 text-[clamp(2.25rem,4.3vw,4.7rem)] font-extrabold leading-[1.06] tracking-[-0.065em] ${light ? "text-white" : "text-[#102A1E]"}`}>{children}</h2>;
}

function Action({ href, children, secondary = false, light = false }: { href: string; children: ReactNode; secondary?: boolean; light?: boolean }) {
  const base = "group inline-flex min-h-[52px] items-center justify-center gap-4 rounded-full px-6 text-[12px] font-extrabold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#23A455] sm:text-[13px]";
  const variant = secondary ? (light ? "border border-white/30 bg-white/5 text-white hover:bg-white/15" : "border border-[#B9D4C0] bg-white text-[#102A1E] hover:border-[#23A455]") : "bg-[#23A455] text-white shadow-[0_14px_30px_-16px_#23A455] hover:bg-[#1C8D47]";
  return <Link href={href} className={`${base} ${variant}`}>{children}<ArrowUpRight aria-hidden="true" size={17} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>;
}

function Marquee() {
  const reduce = useReducedMotion();
  const words = ["EXHIBIT", "DISCOVER", "CONNECT", "INNOVATE", "COLLABORATE"];
  const unit = <div className="flex shrink-0 items-center">{words.map(w => <span key={w} className="flex items-center gap-8 px-8 sm:gap-12 sm:px-12"><span className="whitespace-nowrap text-[clamp(1.4rem,3.4vw,3.3rem)] font-black tracking-[-0.065em]">{w}</span><span aria-hidden="true" className="size-2.5 rotate-45 border-2 border-[#4FE084]" /></span>)}</div>;
  return <div aria-label="Exhibit, discover, connect, innovate and collaborate" className="overflow-hidden border-y border-white/10 bg-[#102A1E] py-5 text-white sm:py-6"><motion.div aria-hidden="true" className="flex w-max" animate={reduce ? undefined : { x: ["0%", "-50%"] }} transition={reduce ? undefined : { duration: 38, repeat: Infinity, ease: "linear" }}>{unit}{unit}</motion.div></div>;
}

export function HomeExperience({ editionLabel, year, dateLabel, venue }: Props) {
  const reduce = useReducedMotion();
  const [activeSector, setActiveSector] = useState(0);
  const [activeGallery, setActiveGallery] = useState(0);
  const selected = sectors[activeSector];
  const currentGallery = gallery[activeGallery];
  const goGallery = (n: number) => setActiveGallery((n + gallery.length) % gallery.length);

  return <main className="overflow-hidden bg-[#F5F8F3] selection:bg-[#23A455] selection:text-white">
    {/* 01 / IMMERSIVE HERO */}
    <section aria-labelledby="home-hero-title" className="relative isolate min-h-[720px] overflow-hidden bg-[#091B13] text-white lg:min-h-[780px]">
      <div className="absolute inset-0">
        <Image src="/images/hero-exhibition.webp" alt="Electric vehicles exhibited at the India International EV Show" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,24,14,.97)_0%,rgba(6,24,14,.90)_34%,rgba(6,24,14,.35)_75%,rgba(6,24,14,.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(6,24,14,.85),transparent_40%)]" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-12 size-[500px] rounded-full border border-[#8EDEAA]/15 sm:size-[650px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-10 top-32 size-[400px] rounded-full border border-[#8EDEAA]/15 sm:size-[500px]" />
      <div className="relative mx-auto flex min-h-[720px] max-w-[1440px] flex-col justify-center px-5 pb-36 pt-24 sm:px-10 lg:min-h-[780px] lg:px-16">
        <motion.div initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease: EASE }} className="max-w-[850px]">
          <div className="inline-flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#ADEFC3] sm:text-[11px]"><span className="inline-block size-2 rounded-full bg-[#58E68D] shadow-[0_0_20px_#58E68D]" />{editionLabel} · {year}<span className="mx-1 h-4 w-px bg-white/25" />PUNE, INDIA</div>
          <p className="mt-11 text-[11px] font-extrabold uppercase tracking-[.28em] text-white/80 sm:text-[12px]">INDIA INTERNATIONAL EV SHOW</p>
          <h1 id="home-hero-title" className="mt-5 max-w-[890px] text-[clamp(3.4rem,8.1vw,8.7rem)] font-black leading-[.92] tracking-[-.084em]">Powering the <span className="block text-[#69E797]">next move.</span></h1>
          <p className="mt-8 max-w-[505px] text-[14px] leading-[1.85] text-white/75 sm:text-[17px]">One exhibition. The people, products and partnerships shaping the future of electric mobility.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Action href="/exhibit/book-a-stall/">Book a Stall</Action><Action href="/visit/register/" secondary light>Register to Visit</Action></div>
        </motion.div>
        <div className="absolute bottom-8 left-5 right-5 flex flex-col gap-5 border-t border-white/25 pt-5 sm:left-10 sm:right-10 md:flex-row md:items-center md:justify-between lg:left-16 lg:right-16">
          <div className="flex flex-wrap gap-x-9 gap-y-3 text-[12px] font-semibold sm:text-[13px]"><span className="inline-flex items-center gap-2.5"><CalendarDays size={17} className="text-[#69E797]" />{dateLabel}</span><span className="inline-flex items-center gap-2.5"><MapPin size={17} className="shrink-0 text-[#69E797]" />{venue}</span></div>
          <Link href="#about-show" className="group inline-flex items-center gap-3 self-start text-[10px] font-bold uppercase tracking-[.17em] text-white/75 hover:text-white">Scroll to explore<span className="flex size-9 items-center justify-center rounded-full border border-white/35 transition-transform group-hover:translate-y-1"><ArrowDown size={16} /></span></Link>
        </div>
      </div>
      <div aria-hidden="true" className="absolute right-0 top-[18%] hidden text-[9px] font-bold uppercase tracking-[.3em] text-white/55 [writing-mode:vertical-rl] xl:block">WHERE MOBILITY MEETS OPPORTUNITY — {year}</div>
    </section>

    {/* 02 / INTRO WITH ASYMMETRIC COLLAGE */}
    <section id="about-show" className="scroll-mt-24 bg-[#F5F8F3] py-24 sm:py-32">
      <div className="mx-auto grid max-w-[1300px] items-center gap-16 px-5 sm:px-9 lg:grid-cols-[1.05fr_.95fr] lg:gap-24">
        <Reveal className="relative pb-10 pr-8 sm:pr-16">
          <div className="relative aspect-[5/5.4] overflow-hidden rounded-[26px] bg-[#D9E6DA] sm:aspect-[5/4.4]"><Image src="/images/industry-floor.webp" alt="Visitors discovering EV products on the exhibition floor" fill sizes="(max-width:1024px) 100vw, 600px" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#091B13]/35 to-transparent" /></div>
          <div className="absolute -bottom-3 right-0 w-[50%] overflow-hidden rounded-[22px] border-[7px] border-[#F5F8F3] bg-[#102A1E] shadow-2xl sm:w-[46%]"><div className="relative aspect-[4/3]"><Image src="/images/networking.webp" alt="Professionals discussing EV technologies" fill sizes="300px" className="object-cover" /></div><div className="px-4 py-3 text-[9px] font-extrabold uppercase tracking-[.17em] text-[#8CE5A8] sm:text-[10px]">PEOPLE. PRODUCTS. PROGRESS.</div></div>
          <span className="absolute -left-3 top-7 rounded-full bg-[#23A455] px-5 py-3 text-[11px] font-extrabold uppercase tracking-[.16em] text-white shadow-lg">THE EV INDUSTRY, TOGETHER</span>
        </Reveal>
        <Reveal delay={.12}>
          <Eyebrow>01 / About the show</Eyebrow>
          <MainTitle>More than a show. <span className="text-[#229B50]">A meeting point for what’s next.</span></MainTitle>
          <p className="mt-7 max-w-[540px] text-[15px] leading-[1.95] text-[#607365]">India International EV Show brings engineers, manufacturers, suppliers, decision-makers and innovators together to discover technology and build useful connections across the electric mobility value chain.</p>
          <p className="mt-4 max-w-[540px] text-[15px] leading-[1.95] text-[#607365]">From vehicles and batteries to charging, components and manufacturing, it’s a place for meaningful, face-to-face industry conversations.</p>
          <div className="mt-9 flex flex-wrap gap-x-9 gap-y-4"><Link href="/about/" className="group inline-flex items-center gap-2 border-b-2 border-[#23A455] pb-2 text-[13px] font-extrabold text-[#102A1E]">Explore IIEV <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link><Link href="/downloads/#brochure" className="group inline-flex items-center gap-2 border-b-2 border-[#BBD0C0] pb-2 text-[13px] font-extrabold text-[#102A1E]">Get brochure <ArrowUpRight size={17} /></Link></div>
        </Reveal>
      </div>
    </section>

    <Marquee />

    {/* 03 / INTERACTIVE SECTOR SHOWCASE */}
    <section id="show-sectors" className="scroll-mt-24 bg-[#EAF1E9] py-24 sm:py-32">
      <div className="mx-auto max-w-[1300px] px-5 sm:px-9">
        <Reveal className="flex flex-col justify-between gap-7 md:flex-row md:items-end"><div><Eyebrow>02 / Explore the sectors</Eyebrow><MainTitle>The entire EV <span className="text-[#229B50]">ecosystem.</span></MainTitle></div><p className="max-w-[360px] text-[14px] leading-7 text-[#607365]">Choose a sector to discover the technologies and businesses represented across the exhibition.</p></Reveal>
        <div className="mt-12 grid overflow-hidden rounded-[24px] border border-[#CFDFD0] bg-white lg:grid-cols-[.94fr_1.06fr]">
          <div className="divide-y divide-[#E5EEE5]" role="tablist" aria-label="Exhibition sectors">{sectors.map((sector, i) => {const Icon = sector.icon; const active = i === activeSector; return <button key={sector.n} type="button" role="tab" id={`sector-tab-${i}`} aria-selected={active} aria-controls="sector-panel" onClick={() => setActiveSector(i)} className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#23A455] sm:px-7 sm:py-5 ${active ? "bg-[#102A1E] text-white" : "bg-white text-[#102A1E] hover:bg-[#F0F7EF]"}`}><span className={`text-[10px] font-extrabold ${active ? "text-[#8EDFB1]" : "text-[#89A190]"}`}>{sector.n}</span><Icon size={22} strokeWidth={1.7} className={active ? "text-[#73E99D]" : "text-[#229B50]"} /><span className="flex-1 text-[14px] font-bold sm:text-[17px]">{sector.title}</span><ArrowUpRight size={18} className={`transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 ${active ? "text-[#73E99D]" : "text-[#839A89]"}`} /></button>;})}</div>
          <div id="sector-panel" role="tabpanel" aria-labelledby={`sector-tab-${activeSector}`} className="relative min-h-[430px] overflow-hidden bg-[#102A1E] text-white sm:min-h-[540px]">
            <AnimatePresence mode="wait"><motion.div key={selected.n} initial={reduce ? false : { opacity: 0, scale: 1.035 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: reduce ? 0 : .45 }} className="absolute inset-0"><Image src={selected.image} alt="" fill sizes="(max-width:1024px) 100vw, 700px" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#061B10] via-[#061B10]/40 to-[#061B10]/5" /></motion.div></AnimatePresence>
            <div className="absolute inset-x-0 bottom-0 z-10 p-7 sm:p-12"><p className="text-[11px] font-extrabold uppercase tracking-[.21em] text-[#9CE9BA]">SECTOR / {selected.n} — 06</p><h3 className="mt-3 max-w-[520px] text-[clamp(2rem,4vw,3.8rem)] font-extrabold leading-[1.1] tracking-[-.05em]">{selected.title}</h3><p className="mt-4 max-w-[430px] text-[14px] leading-7 text-white/80">{selected.desc}</p><Link href="/exhibit/book-a-stall/" className="mt-7 inline-flex items-center gap-2 text-[12px] font-bold text-[#9CE9BA] hover:text-white">Exhibit in this ecosystem <ArrowUpRight size={16} /></Link></div>
          </div>
        </div>
      </div>
    </section>

    {/* 04 / LEGACY FIGURES — NEVER MISREPRESENTED AS 2027 ACTUALS */}
    <section aria-labelledby="show-figures-title" className="relative overflow-hidden bg-[#0A2015] py-20 text-white sm:py-24"><div aria-hidden="true" className="absolute -right-32 -top-40 size-[650px] rounded-full border border-[#49BA74]/20" /><div aria-hidden="true" className="absolute -right-12 -top-20 size-[500px] rounded-full border border-[#49BA74]/20" />
      <div className="relative mx-auto max-w-[1300px] px-5 sm:px-9"><Reveal className="flex flex-wrap items-end justify-between gap-5"><div><Eyebrow light>03 / The IIEV footprint</Eyebrow><h2 id="show-figures-title" className="mt-4 text-[clamp(2rem,3.6vw,3.7rem)] font-extrabold tracking-[-.055em]">A platform built for <span className="text-[#6EE899]">connection.</span></h2></div><Link href="/past-editions/" className="inline-flex items-center gap-2 text-[13px] font-bold text-[#9BE9B6]">Explore past editions <ArrowUpRight size={17} /></Link></Reveal>
        <div className="mt-11 grid grid-cols-2 border-y border-white/20 md:grid-cols-4">{figures.map((figure, i) => <Reveal key={figure.label} delay={i*.07} className={`px-4 py-9 first:pl-0 sm:px-7 md:py-11 ${i !== 0 ? "border-l border-white/15" : ""} ${i === 2 ? "max-md:border-l-0 max-md:pl-0" : ""}`}><p className="text-[clamp(2.35rem,4.5vw,5.2rem)] font-black leading-none tracking-[-.07em] text-white">{figure.value}</p><p className="mt-4 text-[12px] font-semibold leading-5 text-[#9FC5AB] sm:text-[13px]">{figure.label}</p></Reveal>)}</div>
        <p className="mt-5 max-w-[940px] text-[11px] leading-6 text-white/50">Previously published promotional figures from the IIEV 2026 website. These figures are not independently audited and are not confirmed attendance, exhibitors or outcomes for {year}.</p>
      </div>
    </section>

    {/* 05 / LOCATION STORY */}
    <section id="why-pune" className="scroll-mt-24 bg-[#F5F8F3] py-24 sm:py-32"><div className="mx-auto grid max-w-[1300px] items-center gap-12 px-5 sm:px-9 lg:grid-cols-[.8fr_1.2fr] lg:gap-20"><Reveal><Eyebrow>04 / Why Pune</Eyebrow><MainTitle>Rooted in India's <span className="text-[#229B50]">automotive heartland.</span></MainTitle><p className="mt-7 max-w-[460px] text-[15px] leading-[1.9] text-[#607365]">Pune and Pimpri-Chinchwad are home to an established automotive, engineering and supplier ecosystem—making the region a natural meeting place for electric mobility businesses.</p><div className="mt-8 flex items-start gap-3 border-l-2 border-[#23A455] pl-4"><MapPin size={20} className="mt-1 shrink-0 text-[#23A455]" /><div><p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-[#1D8846]">The venue</p><p className="mt-1 text-[15px] font-bold text-[#102A1E]">Auto Cluster Exhibition Centre</p><p className="text-[13px] text-[#607365]">Pimpri-Chinchwad, Pune</p></div></div><div className="mt-9"><Link href="/visit/venue/" className="inline-flex items-center gap-3 border-b-2 border-[#23A455] pb-2 text-[13px] font-extrabold text-[#102A1E]">Plan your visit <ArrowUpRight size={17} /></Link></div></Reveal>
      <Reveal delay={.12} className="relative pb-10 sm:pl-14"><div className="relative aspect-[5/4.5] overflow-hidden rounded-[28px] bg-[#D5E2D6]"><Image src="/images/discussions.webp" alt="Industry representatives speaking at an IIEV exhibition" fill sizes="(max-width:1024px) 100vw, 710px" className="object-cover transition-transform duration-700 hover:scale-105" /></div><div className="absolute bottom-0 left-0 w-[65%] rounded-[18px] bg-[#102A1E] px-6 py-6 text-white shadow-xl sm:w-[56%] sm:px-8 sm:py-8"><span className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#89E9A9]">LOCATION ADVANTAGE</span><p className="mt-2 text-[clamp(1.1rem,2.1vw,1.8rem)] font-extrabold leading-tight tracking-[-.045em]">Where industry already moves.</p></div></Reveal></div></section>

    {/* 06 / DIFFERENTIATED BENEFITS */}
    <section id="why-attend" className="scroll-mt-24 bg-white py-24 sm:py-32"><div className="mx-auto max-w-[1300px] px-5 sm:px-9"><Reveal className="max-w-[850px]"><Eyebrow>05 / Reasons to attend</Eyebrow><MainTitle>Come curious. <span className="text-[#229B50]">Leave connected.</span></MainTitle><p className="mt-5 max-w-[580px] text-[15px] leading-8 text-[#607365]">Make every conversation count—from product discovery to industry introductions.</p></Reveal>
      <div className="mt-12 grid gap-4 md:grid-cols-3"><Reveal className="group relative min-h-[360px] overflow-hidden rounded-[24px] bg-[#102A1E] p-8 text-white sm:p-9"><div aria-hidden="true" className="absolute -right-20 -top-20 size-64 rounded-full border border-[#4ADC7C]/30 transition-transform duration-700 group-hover:scale-125" /><div className="relative flex h-full flex-col justify-between"><span className="text-[11px] font-bold tracking-[.15em] text-[#A5EDBE]">01 / DISCOVER</span><div><Sparkles size={30} className="mb-7 text-[#79E99E]" /><h3 className="text-[30px] font-extrabold tracking-[-.05em]">See what's new.</h3><p className="mt-3 text-[14px] leading-7 text-white/70">Explore vehicles, components, manufacturing and emerging mobility technologies in person.</p></div></div></Reveal>
        <Reveal delay={.08} className="group relative min-h-[360px] overflow-hidden rounded-[24px] bg-[#DDF2E2] p-8 sm:p-9"><div aria-hidden="true" className="absolute -right-16 -top-20 size-60 rounded-full border border-[#23A455]/25 transition-transform duration-700 group-hover:scale-125" /><div className="relative flex h-full flex-col justify-between"><span className="text-[11px] font-bold tracking-[.15em] text-[#1B8846]">02 / CONNECT</span><div><MoveUpRight size={30} className="mb-7 text-[#229B50]" /><h3 className="text-[30px] font-extrabold tracking-[-.05em] text-[#102A1E]">Meet your people.</h3><p className="mt-3 text-[14px] leading-7 text-[#597361]">Start direct conversations with manufacturers, suppliers, buyers and specialists.</p></div></div></Reveal>
        <Reveal delay={.16} className="group relative min-h-[360px] overflow-hidden rounded-[24px] bg-[#EDF2ED] p-8 sm:p-9"><div aria-hidden="true" className="absolute -right-16 -top-20 size-60 rounded-full border border-[#23A455]/20 transition-transform duration-700 group-hover:scale-125" /><div className="relative flex h-full flex-col justify-between"><span className="text-[11px] font-bold tracking-[.15em] text-[#1B8846]">03 / GROW</span><div><ArrowUpRight size={30} className="mb-7 text-[#229B50]" /><h3 className="text-[30px] font-extrabold tracking-[-.05em] text-[#102A1E]">Find your next move.</h3><p className="mt-3 text-[14px] leading-7 text-[#597361]">Explore partnerships, compare solutions and follow relevant industry conversations.</p></div></div></Reveal></div>
      <Reveal className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-[22px] border border-[#DCE8DC] bg-[#F5F8F3] px-6 py-6 sm:px-9"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-[#DDF2E2] text-[#229B50]"><Check size={21} /></span><p className="max-w-[540px] text-[13px] font-semibold leading-6 text-[#33533B]">For industry professionals, buyers, suppliers, innovators and electric mobility enthusiasts.</p></div><Link href="/visit/register/" className="inline-flex items-center gap-2 text-[13px] font-extrabold text-[#168641]">Register as a visitor <ArrowUpRight size={17} /></Link></Reveal>
    </div></section>

    {/* 07 / INTERACTIVE PHOTOGRAPHIC SHOWCASE */}
    <section id="experiences" className="scroll-mt-24 bg-[#EAF1E9] py-24 sm:py-32"><div className="mx-auto max-w-[1300px] px-5 sm:px-9"><Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><Eyebrow>06 / Inside IIEV</Eyebrow><MainTitle>The energy of <span className="text-[#229B50]">being there.</span></MainTitle></div><p className="max-w-[360px] text-[13px] leading-7 text-[#647B69]">Photography from previous editions. Activities and sessions for {year} are subject to the confirmed programme.</p></Reveal>
      <div className="mt-12 grid gap-4 lg:grid-cols-[1.5fr_.5fr]"><div className="relative h-[450px] overflow-hidden rounded-[25px] bg-[#102A1E] sm:h-[600px]"><AnimatePresence mode="wait"><motion.div key={currentGallery.image} initial={reduce ? false : { opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: reduce ? 0 : .5 }} className="absolute inset-0"><Image src={currentGallery.image} alt={currentGallery.alt} fill sizes="(max-width:1024px) 100vw, 900px" className="object-cover" /></motion.div></AnimatePresence><div className="absolute inset-0 bg-gradient-to-t from-[#091B13]/95 via-[#091B13]/10 to-transparent" /><div className="absolute bottom-0 left-0 right-0 flex flex-col gap-6 p-7 text-white sm:flex-row sm:items-end sm:justify-between sm:p-10"><div><p className="text-[11px] font-extrabold tracking-[.2em] text-[#9DEBB8]">{currentGallery.kicker}</p><h3 className="mt-3 text-[clamp(2rem,4vw,4rem)] font-extrabold leading-[1.05] tracking-[-.055em]">{currentGallery.title}</h3><p className="mt-3 max-w-[470px] text-[13px] leading-6 text-white/75">{currentGallery.caption}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => goGallery(activeGallery-1)} aria-label="Previous gallery image" className="flex size-11 items-center justify-center rounded-full border border-white/40 bg-white/10 transition-colors hover:bg-[#23A455] focus-visible:outline-2 focus-visible:outline-white"><ChevronLeft size={20} /></button><button type="button" onClick={() => goGallery(activeGallery+1)} aria-label="Next gallery image" className="flex size-11 items-center justify-center rounded-full border border-white/40 bg-white/10 transition-colors hover:bg-[#23A455] focus-visible:outline-2 focus-visible:outline-white"><ChevronRight size={20} /></button></div></div></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">{gallery.map((item,i) => <button key={item.n} type="button" onClick={() => setActiveGallery(i)} aria-pressed={i===activeGallery} className={`group relative min-h-[112px] overflow-hidden rounded-[17px] border-2 text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23A455] sm:min-h-[137px] ${i===activeGallery ? "border-[#23A455]" : "border-transparent hover:border-[#81C99A]"}`}><Image src={item.image} alt="" fill sizes="(max-width:1024px) 50vw, 320px" className="object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-r from-[#081D11]/90 to-[#081D11]/20" /><div className="relative flex h-full flex-col justify-end p-4 text-white sm:p-5"><span className="text-[10px] font-bold text-[#9FE8B8]">{item.n} / 04</span><span className="mt-1 text-[12px] font-extrabold leading-tight sm:text-[15px]">{item.title}</span></div></button>)}</div></div>
    </div></section>

    {/* 08 / IMMERSIVE FINAL CALL TO ACTION */}
    <section id="participate" className="relative isolate overflow-hidden bg-[#091B13] py-28 text-white sm:py-36"><Image src="/images/hero-exhibition.webp" alt="" fill sizes="100vw" className="-z-20 object-cover object-center" /><div className="absolute inset-0 -z-10 bg-[#071B10]/90" /><div aria-hidden="true" className="absolute left-1/2 top-1/2 -z-10 size-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#87E5A5]/20" /><div className="relative mx-auto max-w-[1050px] px-5 text-center sm:px-9"><Reveal><p className="text-[11px] font-extrabold uppercase tracking-[.24em] text-[#9CE9B6]">YOUR NEXT CONNECTION STARTS HERE</p><h2 className="mx-auto mt-6 text-[clamp(3rem,7vw,7rem)] font-black leading-[.96] tracking-[-.075em]">Be where the <span className="text-[#6DE997]">future meets.</span></h2><p className="mx-auto mt-7 max-w-[600px] text-[15px] leading-8 text-white/70">Join the electric mobility ecosystem at India International EV Show {year} in Pune.</p><div className="mt-9 flex flex-wrap justify-center gap-3"><Action href="/exhibit/book-a-stall/">Book a Stall</Action><Action href="/visit/register/" secondary light>Register to Visit</Action></div><p className="mt-9 text-[12px] font-semibold text-white/55">{dateLabel} <span className="mx-2 text-[#6DE997]">•</span> {venue}</p></Reveal></div></section>
  </main>;
}
