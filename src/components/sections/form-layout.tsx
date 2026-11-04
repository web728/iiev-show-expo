import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import type { PublicSettings } from "@/lib/data/edition";

/** Two-column form page: form card + reassurance aside. */
export function FormLayout({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  return (
    <section className="bg-mist py-12 sm:py-16">
      <div className="container-site grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="rounded-3xl border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">{children}</div>
        <aside className="grid gap-5 lg:sticky lg:top-28">{aside}</aside>
      </div>
    </section>
  );
}

export function AsideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      <div className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}

export function Steps({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ol className="grid gap-4">
      {items.map((s, i) => (
        <li key={s.title} className="flex gap-3">
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">{i + 1}</span>
          <span>
            <span className="block font-semibold text-ink">{s.title}</span>
            <span className="block text-sm text-ink-muted">{s.text}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function ContactAside({ settings, topic = "this" }: { settings: PublicSettings; topic?: string }) {
  const c = settings.contacts[0];
  return (
    <AsideCard title="Prefer to talk?">
      <p>Speak to the organiser team about {topic}.</p>
      {c ? (
        <ul className="mt-3 grid gap-2">
          {c.phone ? (
            <li>
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 font-semibold text-brand-blue hover:text-brand-green">
                <Icon.Phone className="size-4" /> {c.phone}
              </a>
            </li>
          ) : null}
          {c.email ? (
            <li>
              <a href={`mailto:${c.email}`} className="inline-flex items-center gap-2 font-semibold text-brand-blue hover:text-brand-green">
                <Icon.Mail className="size-4" /> {c.email}
              </a>
            </li>
          ) : null}
        </ul>
      ) : null}
      <p className="mt-3">
        <Link href="/contact/" className="text-sm font-semibold text-ink underline underline-offset-2">All contact options</Link>
      </p>
    </AsideCard>
  );
}
