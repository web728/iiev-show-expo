import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icons";

export const aInput =
  "block w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20";
export const aBtn = "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:opacity-50";
export const aBtnPrimary = `${aBtn} bg-brand-green text-white hover:bg-[#176a37]`;
export const aBtnSecondary = `${aBtn} border border-line bg-white text-ink hover:border-brand-blue`;
export const aBtnDanger = `${aBtn} border border-danger/30 bg-white text-danger hover:bg-danger/5`;

export function AdminHeader({ title, subtitle, actions, back }: { title: string; subtitle?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back ? (
          <Link href={back.href} className="mb-1 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand-green">
            <Icon.Chevron className="size-3.5 rotate-180" /> {back.label}
          </Link>
        ) : null}
        <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
        {subtitle ? <div className="mt-1 text-sm text-ink-muted">{subtitle}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ title, children, actions, className = "" }: { title?: string; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line bg-white ${className}`}>
      {title ? (
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          {actions}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

const BADGE: Record<string, string> = {
  published: "bg-brand-green/10 text-brand-green",
  approved: "bg-brand-green/10 text-brand-green",
  confirmed: "bg-brand-green/10 text-brand-green",
  done: "bg-brand-green/10 text-brand-green",
  ok: "bg-brand-green/10 text-brand-green",
  checked_in: "bg-brand-blue/10 text-brand-blue",
  qualified: "bg-brand-blue/10 text-brand-blue",
  proposal_sent: "bg-brand-blue/10 text-brand-blue",
  negotiating: "bg-brand-blue/10 text-brand-blue",
  contacted: "bg-brand-blue/10 text-brand-blue",
  review: "bg-brand-yellow/25 text-[#6b5400]",
  pending_review: "bg-brand-yellow/25 text-[#6b5400]",
  pending: "bg-brand-yellow/25 text-[#6b5400]",
  queued: "bg-brand-yellow/25 text-[#6b5400]",
  running: "bg-brand-yellow/25 text-[#6b5400]",
  new: "bg-brand-yellow/25 text-[#6b5400]",
  submitted: "bg-brand-yellow/25 text-[#6b5400]",
  duplicate: "bg-brand-yellow/25 text-[#6b5400]",
  draft: "bg-mist text-ink-soft",
  archived: "bg-mist text-ink-muted",
  skipped: "bg-mist text-ink-muted",
  failed: "bg-danger/10 text-danger",
  rejected: "bg-danger/10 text-danger",
  cancelled: "bg-danger/10 text-danger",
  closed_lost: "bg-danger/10 text-danger",
  revoked: "bg-danger/10 text-danger",
  not_found: "bg-danger/10 text-danger",
};

export function StatusBadge({ value, label }: { value?: string | null; label?: string }) {
  if (!value) return <span className="text-ink-muted">—</span>;
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${BADGE[value] ?? "bg-mist text-ink-soft"}`}>{label ?? value.replace(/_/g, " ")}</span>;
}

export function Flash({ sp }: { sp: Record<string, string | string[] | undefined> }) {
  const ok = typeof sp.ok === "string" ? sp.ok : null;
  const err = typeof sp.error === "string" ? sp.error : null;
  if (!ok && !err) return null;
  return (
    <div role={err ? "alert" : "status"} className={`mb-5 rounded-lg border px-4 py-3 text-sm font-semibold ${err ? "border-danger/30 bg-danger/5 text-danger" : "border-brand-green/30 bg-brand-green/5 text-brand-green"}`}>
      {err ?? ok}
    </div>
  );
}

export function Stat({ label, value, href, hint }: { label: string; value: ReactNode; href?: string; hint?: string }) {
  const inner = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </>
  );
  return href ? (
    <Link href={href} className="block rounded-xl border border-line bg-white p-5 hover:border-brand-green">{inner}</Link>
  ) : (
    <div className="rounded-xl border border-line bg-white p-5">{inner}</div>
  );
}

export function Pager({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (p: number) => string }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
      {page > 1 ? <Link className={aBtnSecondary} href={hrefFor(page - 1)}>Previous</Link> : <span />}
      <span className="text-ink-muted">Page {page} of {pages}</span>
      {page < pages ? <Link className={aBtnSecondary} href={hrefFor(page + 1)}>Next</Link> : <span />}
    </nav>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line bg-mist/70 text-xs uppercase tracking-wider text-ink-muted">
          <tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {empty ? <p className="px-4 py-10 text-center text-ink-muted">Nothing here yet.</p> : null}
    </div>
  );
}

export function qsMerge(sp: Record<string, string | string[] | undefined>, patch: Record<string, string | number | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && v && !["ok", "error"].includes(k)) p.set(k, v);
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || v === "") p.delete(k);
    else p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}
