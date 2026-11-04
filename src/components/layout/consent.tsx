"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { captureAttribution, readConsent, writeConsent } from "@/lib/analytics/client";
import { buttonClass } from "@/components/ui/button";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// The consent cookie is an external store: subscribe to changes made via writeConsent().
function subscribe(cb: () => void) {
  window.addEventListener("iiev:consent", cb);
  return () => window.removeEventListener("iiev:consent", cb);
}
const snapshot = () => {
  const c = readConsent();
  return c ? (c.analytics ? "analytics" : "essential") : "none";
};
const serverSnapshot = () => "ssr"; // never render the banner on the server (avoids flash/mismatch)

/** Cookie banner: equal-weight Accept / Reject; no analytics before opt-in. */
export function ConsentManager() {
  const consent = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [reopened, setReopened] = useState(false);
  const analytics = consent === "analytics";
  const decided = consent !== "none" && !reopened;
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
    const onOpen = () => setReopened(true);
    window.addEventListener("iiev:open-consent", onOpen);
    return () => window.removeEventListener("iiev:open-consent", onOpen);
  }, []);

  useEffect(() => {
    if (analytics && GA_ID) window.gtag?.("event", "page_view", { page_path: pathname });
  }, [pathname, analytics]);

  const choose = (a: boolean) => {
    writeConsent(a);
    setReopened(false);
  };

  return (
    <>
      {analytics && GA_ID ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true,send_page_view:false});`}
          </Script>
        </>
      ) : null}
      {!decided ? (
        <div role="region" aria-label="Cookie preferences" className="no-print fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-lift)] sm:inset-x-6 sm:bottom-6">
          <p className="text-[15px] font-bold text-ink">Your privacy choices</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
            We use essential cookies to run this site and secure forms. With your permission we also use analytics cookies to understand which pages help exhibitors and visitors. You can change this any time. See our{" "}
            <Link href="/cookie-policy/" className="font-semibold text-brand-blue underline underline-offset-2">cookie policy</Link>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => choose(true)} className={buttonClass("primary", "sm")}>Accept analytics</button>
            <button type="button" onClick={() => choose(false)} className={buttonClass("outline", "sm")}>Essential only</button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function CookieSettingsButton() {
  return (
    <button type="button" className="hover:text-white" onClick={() => window.dispatchEvent(new Event("iiev:open-consent"))}>
      Cookie settings
    </button>
  );
}
