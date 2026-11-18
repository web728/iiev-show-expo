
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ShieldCheck, X } from "lucide-react";

import {
  captureAttribution,
  readConsent,
  writeConsent,
} from "@/lib/analytics/client";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type ConsentState =
  | "loading"
  | "none"
  | "essential"
  | "analytics";

const ease = [0.22, 1, 0.36, 1] as const;

/* =========================================================
   CONSENT STORE
   Keeps server and initial client render consistent.
========================================================= */

function subscribe(callback: () => void) {
  window.addEventListener("iiev:consent", callback);

  return () => {
    window.removeEventListener("iiev:consent", callback);
  };
}

function getSnapshot(): ConsentState {
  const saved = readConsent();

  if (!saved) return "none";

  return saved.analytics ? "analytics" : "essential";
}

function getServerSnapshot(): ConsentState {
  return "loading";
}

/* =========================================================
   GOOGLE ANALYTICS
   Loaded only when analytics consent exists.
========================================================= */

function ConsentAnalytics() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready || !GA_ID) return;

    window.gtag?.("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [ready, pathname]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        id="iiev-analytics-config"
        strategy="afterInteractive"
      >
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function() {
            window.dataLayer.push(arguments);
          };
          window.gtag("js", new Date());
          window.gtag("config", ${JSON.stringify(GA_ID)}, {
            send_page_view: false
          });
        `}
      </Script>

      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
          GA_ID
        )}`}
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
    </>
  );
}

/* =========================================================
   MAIN CONSENT MANAGER
========================================================= */

export function ConsentManager() {
  const consent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const [reopened, setReopened] = useState(false);

  const analyticsAllowed = consent === "analytics";

  const visible =
    consent !== "loading" &&
    (consent === "none" || reopened);

  useEffect(() => {
    captureAttribution();

    const openSettings = () => {
      setReopened(true);
    };

    window.addEventListener(
      "iiev:open-consent",
      openSettings
    );

    return () => {
      window.removeEventListener(
        "iiev:open-consent",
        openSettings
      );
    };
  }, []);

  const saveChoice = (allowAnalytics: boolean) => {
    writeConsent(allowAnalytics);
    setReopened(false);
  };

  const closeSettings = () => {
    if (consent !== "none") {
      setReopened(false);
    }
  };

  return (
    <>
      {/* ===============================================
          ANALYTICS — CONSENT REQUIRED
      =============================================== */}

      {analyticsAllowed && <ConsentAnalytics />}

      {/* ===============================================
          COOKIE NOTICE
      =============================================== */}

      <AnimatePresence initial={false}>
        {visible && (
          <motion.div
            key="cookie-consent"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 12,
            }}
            transition={{
              duration: 0.35,
              ease,
            }}
            className="no-print fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-[440px] sm:inset-x-auto sm:bottom-7 sm:left-7 sm:mx-0 sm:w-[440px] motion-reduce:transform-none"
          >
            <section
              role="region"
              aria-labelledby="cookie-consent-title"
              aria-describedby="cookie-consent-description"
              className="overflow-hidden rounded-xl border border-[#DDE7DF] bg-white shadow-[0_18px_55px_rgba(0,25,15,0.16)]"
            >
              {/* ======================================
                  HEADER
              ====================================== */}

              <div className="border-b border-[#E8EEE9] px-5 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    {/* Brand mark */}
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#EDF6EF] text-[#16893F]">
                      <ShieldCheck
                        size={21}
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#16893F]">
                        IIEV Show
                      </p>

                      <h2
                        id="cookie-consent-title"
                        className="mt-1 text-lg font-bold leading-tight tracking-[-0.03em] text-[#102A1E]"
                      >
                        Your privacy matters
                      </h2>
                    </div>
                  </div>

                  {/* Close only when choice already saved */}
                  {consent !== "none" && (
                    <button
                      type="button"
                      onClick={closeSettings}
                      aria-label="Close cookie preferences"
                      className="flex size-8 shrink-0 items-center justify-center rounded-md text-[#6A776D] transition-colors hover:bg-[#F1F5F2] hover:text-[#102A1E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16893F]"
                    >
                      <X
                        size={18}
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* ======================================
                  MAIN CONTENT
              ====================================== */}

              <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
                <p
                  id="cookie-consent-description"
                  className="text-[13px] leading-[1.8] text-[#526258]"
                >
                  We use essential cookies to keep the
                  website working. With your permission,
                  we also use analytics to understand
                  website usage and improve your experience.
                </p>

                {/* Cookie categories */}
                <div className="mt-5 divide-y divide-[#E8EEE9] border-y border-[#E8EEE9]">
                  {/* Essential */}
                  <div className="flex items-start justify-between gap-4 py-3.5">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#102A1E]">
                        Essential cookies
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-[#718077]">
                        Required for core website functionality.
                      </p>
                    </div>

                    <span className="shrink-0 text-[10px] font-bold text-[#16893F]">
                      Always active
                    </span>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-start justify-between gap-4 py-3.5">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#102A1E]">
                        Analytics cookies
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-[#718077]">
                        Help us measure and improve website usage.
                      </p>
                    </div>

                    <span className="shrink-0 text-[10px] font-medium text-[#718077]">
                      Optional
                    </span>
                  </div>
                </div>

                {/* ==================================
                    CONSENT ACTIONS
                ================================== */}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => saveChoice(false)}
                    className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#C9D8CD] bg-white px-3 py-3 text-center text-[12px] font-bold text-[#102A1E] transition-colors duration-200 hover:border-[#16893F] hover:bg-[#F4F9F5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16893F]"
                  >
                    Essential only
                  </button>

                  <button
                    type="button"
                    onClick={() => saveChoice(true)}
                    className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#16893F] px-3 py-3 text-center text-[12px] font-bold text-white transition-colors duration-200 hover:bg-[#116B30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16893F]"
                  >
                    Accept analytics
                  </button>
                </div>

                {/* ==================================
                    FOOTER
                ================================== */}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[#E8EEE9] pt-4">
                  <p className="text-[11px] leading-5 text-[#718077]">
                    You can change your choice anytime.
                  </p>

                  <Link
                    href="/cookie-policy/"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#16893F] underline decoration-[#16893F]/30 underline-offset-4 transition-colors hover:text-[#116B30] hover:decoration-[#16893F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16893F]"
                  >
                    Cookie policy

                    <ArrowUpRight
                      size={13}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* =========================================================
   FOOTER — REOPEN COOKIE SETTINGS
========================================================= */

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(
          new Event("iiev:open-consent")
        );
      }}
      className="transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16893F]"
    >
      Cookie settings
    </button>
  );
}
