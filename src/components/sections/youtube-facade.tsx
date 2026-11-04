"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icons";

/** Loads the (privacy-enhanced) YouTube player only after a click — keeps pages fast and cookie-free. */
export function YouTubeFacade({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);
  const safeId = id.replace(/[^A-Za-z0-9_-]/g, "");
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-brand-navy">
      {play ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${safeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0 flex items-center justify-center bg-brand-gradient" aria-label={`Play video: ${title}`}>
          <Icon.Play className="size-16 text-white transition-transform group-hover:scale-110" />
          <span className="absolute bottom-3 left-4 right-4 truncate text-left text-sm font-semibold text-white/90">{title}</span>
        </button>
      )}
    </div>
  );
}
