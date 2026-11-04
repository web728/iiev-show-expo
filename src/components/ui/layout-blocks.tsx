import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";
import { DiagonalStripes, ChevronStripes } from "./motifs";
import { LinkButton } from "./button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";

export type Crumb = { label: string; href: string };

export function Breadcrumbs({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "dark" }) {
  const all = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className={`flex flex-wrap items-center gap-1.5 text-[13px] ${tone === "dark" ? "text-white/70" : "text-ink-muted"}`}>
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1.5">
              {i > 0 ? <Icon.Chevron className="size-3.5 opacity-60" /> : null}
              {i === all.length - 1 ? (
                <span aria-current="page" className={tone === "dark" ? "text-white" : "text-ink"}>{c.label}</span>
              ) : (
                <Link href={c.href} className="hover:underline underline-offset-4">{c.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbSchema(all)} />
    </>
  );
}

/** Inner-page hero: navy ground, stylescape stripes, one H1. */
export function PageHero({
  eyebrow,
  title,
  intro,
  crumbs,
  actions,
  aside,
  image,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  crumbs: Crumb[];
  actions?: ReactNode;
  aside?: ReactNode;
  image?: { src: string; alt?: string; position?: string; credit?: string };
}) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-navy text-white">
      {image ? (
        <>
          <Image src={image.src} alt="" fill priority sizes="100vw" className="-z-10 animate-[ken-burns_14s_ease-out_both] object-cover motion-reduce:animate-none" style={{ objectPosition: image.position ?? "center" }} />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-navy/95 via-brand-navy/70 to-brand-navy/10" aria-hidden="true" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-navy/50 to-transparent" aria-hidden="true" />
        </>
      ) : (
        <DiagonalStripes className="pointer-events-none absolute -right-10 top-0 h-full w-[38%] opacity-[0.05]" />
      )}
      <ChevronStripes className="pointer-events-none absolute -bottom-6 left-0 h-28 w-20 opacity-90 sm:h-36 sm:w-24" />
      <div className={`container-site relative ${image ? "py-16 sm:py-20 lg:py-28" : "py-12 sm:py-16 lg:py-20"}`}>
        <Breadcrumbs items={crumbs} tone="dark" />
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            {eyebrow ? <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-yellow">{eyebrow}</p> : null}
            <h1 className="text-3xl font-extrabold leading-[1.1] sm:text-4xl lg:text-5xl">{title}</h1>
            {intro ? <div className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{intro}</div> : null}
            {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
          </div>
          {aside}
        </div>
      </div>
      {image?.credit ? <p className="absolute bottom-3 right-4 text-[11px] font-medium text-white/60">{image.credit}</p> : null}
      <div className="h-1.5 bg-brand-gradient" />
    </section>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = "white",
  className = "",
  headingLevel = 2,
  align = "left",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: ReactNode;
  children?: ReactNode;
  tone?: "white" | "mist" | "navy";
  className?: string;
  headingLevel?: 2 | 3;
  align?: "left" | "center";
}) {
  const bg = tone === "mist" ? "bg-mist" : tone === "navy" ? "bg-brand-navy text-white" : "bg-white";
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <section id={id} className={`${bg} py-14 sm:py-20 ${className}`} aria-labelledby={title && id ? `${id}-title` : undefined}>
      <div className="container-site">
        {title || eyebrow ? (
          <div className={`mb-10 max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
            {eyebrow ? (
              <p className={`mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] ${tone === "navy" ? "text-brand-yellow" : "text-brand-green"}`}>
                <span className="inline-block h-0.5 w-6 bg-current" aria-hidden="true" />
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <H id={id ? `${id}-title` : undefined} className="text-2xl font-extrabold leading-tight sm:text-3xl lg:text-[2.35rem]">
                {title}
              </H>
            ) : null}
            {intro ? <div className={`mt-4 text-base leading-relaxed sm:text-lg ${tone === "navy" ? "text-white/75" : "text-ink-soft"}`}>{intro}</div> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function FeatureCard({ icon, title, children, href }: { icon?: IconName; title: string; children: ReactNode; href?: string }) {
  const I = icon ? Icon[icon] : null;
  const inner = (
    <>
      {I ? (
        <span className="mb-5 inline-flex size-12 items-center justify-center rounded-full border-2 border-brand-green/25 text-brand-green transition-colors group-hover:border-brand-green group-hover:bg-brand-green group-hover:text-white">
          <I className="size-6" />
        </span>
      ) : null}
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <div className="mt-2 text-[15px] leading-relaxed text-ink-soft">{children}</div>
      {href ? (
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue group-hover:text-brand-green">
          Learn more <Icon.Arrow className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      ) : null}
    </>
  );
  const cls = "group relative flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-6 transition-shadow hover:shadow-[var(--shadow-lift)]";
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function CheckList({ items, tone = "light" }: { items: ReactNode[]; tone?: "light" | "dark" }) {
  return (
    <ul className="grid gap-3">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3">
          <span className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full ${tone === "dark" ? "bg-brand-yellow text-brand-navy" : "bg-brand-green/10 text-brand-green"}`}>
            <Icon.Check className="size-4" />
          </span>
          <span className={tone === "dark" ? "text-white/85" : "text-ink-soft"}>{it}</span>
        </li>
      ))}
    </ul>
  );
}

/** Final focused CTA band — one primary action, one contextual secondary. */
export function CtaBand({
  title,
  text,
  primary,
  secondary,
}: {
  title: string;
  text?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="relative overflow-hidden bg-brand-gradient text-white">
      <DiagonalStripes className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/2 opacity-[0.07]" />
      <div className="container-site relative flex flex-col items-start gap-6 py-14 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
          {text ? <p className="mt-3 text-white/85 sm:text-lg">{text}</p> : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={primary.href} variant="secondary" size="lg" arrow>
            {primary.label}
          </LinkButton>
          {secondary ? (
            <LinkButton href={secondary.href} variant="outline-light" size="lg">
              {secondary.label}
            </LinkButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function Notice({ tone = "info", title, children }: { tone?: "info" | "warn" | "success"; title?: string; children: ReactNode }) {
  const styles = {
    info: "border-brand-blue/30 bg-brand-blue/5 text-ink",
    warn: "border-brand-yellow bg-brand-yellow/10 text-ink",
    success: "border-brand-green/40 bg-brand-green/5 text-ink",
  }[tone];
  const I = tone === "warn" ? Icon.Alert : tone === "success" ? Icon.Check : Icon.Info;
  return (
    <div className={`flex gap-3 rounded-xl border p-4 text-[15px] leading-relaxed ${styles}`} role={tone === "warn" ? "note" : undefined}>
      <I className={`mt-0.5 size-5 shrink-0 ${tone === "warn" ? "text-[#8a6d00]" : tone === "success" ? "text-brand-green" : "text-brand-blue"}`} />
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="text-ink-soft">{children}</div>
      </div>
    </div>
  );
}

/** Honest empty state used where approved content does not yet exist. */
export function EmptyState({ icon = "Info", title, children, action }: { icon?: IconName; title: string; children?: ReactNode; action?: ReactNode }) {
  const I = Icon[icon];
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line bg-mist/60 px-6 py-12 text-center">
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-full bg-white text-brand-green shadow-[var(--shadow-card)]">
        <I className="size-7" />
      </span>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {children ? <div className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-soft">{children}</div> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function RelatedLinks({ title = "Related", links }: { title?: string; links: { label: string; href: string; text?: string }[] }) {
  return (
    <aside aria-label={title} className="rounded-[var(--radius-card)] border border-line bg-white p-6">
      <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink-muted">{title}</h2>
      <ul className="mt-4 divide-y divide-line">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="group flex items-center justify-between gap-4 py-3">
              <span>
                <span className="font-semibold text-ink group-hover:text-brand-green">{l.label}</span>
                {l.text ? <span className="block text-sm text-ink-muted">{l.text}</span> : null}
              </span>
              <Icon.Arrow className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-green" />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
