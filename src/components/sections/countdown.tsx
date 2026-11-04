"use client";

import { useEffect, useState } from "react";

/** Live countdown to show opening (Asia/Kolkata). Renders a stable placeholder on the server. */
export function Countdown({ target, label = "Show opens in" }: { target: string; label?: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const end = new Date(target).getTime();
  const diff = now === null ? null : Math.max(0, end - now);
  const parts = diff === null
    ? [["--", "Days"], ["--", "Hours"], ["--", "Mins"], ["--", "Secs"]]
    : [
        [Math.floor(diff / 86_400_000), "Days"],
        [Math.floor((diff / 3_600_000) % 24), "Hours"],
        [Math.floor((diff / 60_000) % 60), "Mins"],
        [Math.floor((diff / 1000) % 60), "Secs"],
      ];
  if (diff === 0) return <p className="font-semibold text-brand-yellow">The show is on — see you in the halls!</p>;
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">{label}</p>
      <dl className="mt-2 flex gap-2 sm:gap-3" aria-live="off">
        {parts.map(([v, l]) => (
          <div key={l as string} className="min-w-[3.6rem] rounded-xl border border-white/15 bg-white/10 px-2.5 py-2 text-center backdrop-blur-sm sm:min-w-[4.4rem]">
            <dd className="text-2xl font-extrabold tabular-nums text-white sm:text-3xl">{typeof v === "number" ? String(v).padStart(2, "0") : v}</dd>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/60 sm:text-[11px]">{l}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
