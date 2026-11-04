"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PublicSession, PublicSpeaker } from "@/lib/data/public";

const TZ = "Asia/Kolkata";
const dayKey = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
const dayLabel = (iso: string) => new Intl.DateTimeFormat("en-IN", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" }).format(new Date(iso));
const time = (iso: string) => new Intl.DateTimeFormat("en-IN", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(iso));

/** Day/track filters; all times rendered in Asia/Kolkata regardless of device timezone. */
export function Agenda({ sessions, speakers }: { sessions: PublicSession[]; speakers: PublicSpeaker[] }) {
  const days = useMemo(() => [...new Map(sessions.map((s) => [dayKey(s.startsAt), dayLabel(s.startsAt)])).entries()], [sessions]);
  const tracks = useMemo(() => [...new Set(sessions.map((s) => s.track).filter(Boolean))] as string[], [sessions]);
  const [day, setDay] = useState(days[0]?.[0] ?? "");
  const [track, setTrack] = useState("");
  const bySlug = useMemo(() => new Map(speakers.map((s) => [s.slug, s])), [speakers]);
  const list = sessions.filter((s) => dayKey(s.startsAt) === day && (!track || s.track === track));

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Conference days" className="flex flex-wrap gap-2">
          {days.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={day === k} onClick={() => setDay(k)} className={`rounded-full px-4 py-2 text-sm font-semibold ${day === k ? "bg-brand-navy text-white" : "border border-line bg-white text-ink hover:border-brand-green"}`}>
              {label}
            </button>
          ))}
        </div>
        {tracks.length > 1 ? (
          <label className="flex items-center gap-2 text-sm font-semibold text-ink">
            Track
            <select value={track} onChange={(e) => setTrack(e.target.value)} className="rounded-full border border-line bg-white px-3 py-2">
              <option value="">All tracks</option>
              {tracks.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        ) : null}
      </div>
      <p className="mt-3 text-xs text-ink-muted">All times are India Standard Time (IST, UTC+5:30).</p>
      <ol className="mt-6 grid gap-4" aria-live="polite">
        {list.map((s) => (
          <li key={s._id} className="grid gap-3 rounded-2xl border border-line bg-white p-5 sm:grid-cols-[9rem_1fr]">
            <div className="text-sm font-bold text-brand-green">
              {time(s.startsAt)} – {time(s.endsAt)}
              {s.room ? <span className="block font-normal text-ink-muted">{s.room}</span> : null}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {s.track ? <span className="rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs font-bold text-brand-blue">{s.track}</span> : null}
                {s.format ? <span className="rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold capitalize text-ink-soft">{s.format}</span> : null}
                {s.sessionStatus === "tentative" ? <span className="rounded-full bg-brand-yellow/20 px-2.5 py-0.5 text-xs font-bold text-[#7a6000]">Tentative</span> : null}
                {s.sessionStatus === "cancelled" ? <span className="rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-bold text-danger">Cancelled</span> : null}
              </div>
              <h3 className="mt-2 text-lg font-bold text-ink">{s.title}</h3>
              {s.description ? <p className="mt-1 text-[15px] text-ink-soft">{s.description}</p> : null}
              {s.speakerSlugs?.length ? (
                <p className="mt-2 text-sm text-ink-soft">
                  {s.speakerSlugs.map((slug, i) => {
                    const sp = bySlug.get(slug);
                    return sp ? (
                      <span key={slug}>
                        {i > 0 ? ", " : ""}
                        <Link href={`/conference/speakers/${slug}/`} className="font-semibold text-brand-blue hover:underline">{sp.name}</Link>
                        {sp.organisation ? ` (${sp.organisation})` : ""}
                      </span>
                    ) : null;
                  })}
                </p>
              ) : null}
            </div>
          </li>
        ))}
        {!list.length ? <li className="text-ink-muted">No sessions for this selection.</li> : null}
      </ol>
    </div>
  );
}
