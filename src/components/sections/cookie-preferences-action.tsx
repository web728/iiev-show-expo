
"use client";

import { Settings2 } from "lucide-react";

export function CookiePreferencesAction() {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(
          new Event("iiev:open-consent")
        );
      }}
      className="mt-5 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#16893F] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#116B30] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16893F]"
    >
      <Settings2 size={17} aria-hidden="true" />
      Cookie settings
    </button>
  );
}
