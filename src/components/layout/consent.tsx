
"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Cookie,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  captureAttribution,
  readConsent,
  writeConsent,
} from "@/lib/analytics/client";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function subscribe(callback: () => void) {
  window.addEventListener("iiev:consent", callback);

  return () => {
    window.removeEventListener("iiev:consent", callback);
  };
}

function snapshot() {
  const consent = readConsent();

  return consent
    ? consent.analytics
      ? "analytics"
      : "essential"
    : "none";
}

function serverSnapshot() {
  return "ssr";
}

export function ConsentManager() {
  const consent = useSyncExternalStore(
    subscribe,
    snapshot,
    serverSnapshot
  );

  const [reopened, setReopened] = useState(false);
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();

  const analytics = consent === "analytics";
  const visible =
    consent !== "ssr" &&
    (consent === "none" || reopened);

  useEffect(() => {
    captureAttribution();

    const onOpen = () => setReopened(true);

    window.addEventListener(
      "iiev:open-consent",
      onOpen
    );

    return () => {
      window.removeEventListener(
        "iiev:open-consent",
        onOpen
      );
    };
  }, []);

  useEffect(() => {
    if (!analytics || !GA_ID) return;

    window.gtag?.("event", "page_view", {
      page_path: pathname,
    });
  }, [analytics, pathname]);

  const choose = (allowAnalytics: boolean) => {
    writeConsent(allowAnalytics);
    setReopened(false);
  };

  const close = () => {
    if (consent !== "none") {
      setReopened(false);
    }
  };

  return (
    <>
      {analytics && GA_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
              GA_ID
            )}`}
            strategy="afterInteractive"
          />

          <Script id="iiev-ga4" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              window.gtag = function(){window.dataLayer.push(arguments);};
              window.gtag('js', new Date());
              window.gtag('config', ${JSON.stringify(GA_ID)}, {
                anonymize_ip: true,
                send_page_view: false
              });
            `}
          </Script>
        </>
      ) : null}

      <AnimatePresence>
        {visible ? (
          <motion.div
            key="iiev-consent-panel"
            initial={
              reducedMotion
                ? false
                : { opacity: 0, y: 30, scale: 0.98 }
            }
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    y: 20,
                    scale: 0.98,
                  }
            }
            transition={{
              duration: reducedMotion ? 0 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="no-print fixed inset-x-3 bottom-3 z-[100] mx-auto w-auto max-w-[510px] sm:inset-x-auto sm:bottom-7 sm:left-7 sm:w-[510px]"
          >
            <section
              role="region"
              aria-label="Cookie preferences"
              className="relative overflow-hidden rounded-[22px] border border-[#DCE7DE] bg-white shadow-[0_24px_90px_-20px_rgba(0,20,51,0.35)]"
            >
              {/* Premium dark header */}
              <div className="relative overflow-hidden bg-[#001433] px-5 pb-5 pt-5 text-white sm:px-6">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-[#1D8043]/40 blur-[65px]"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:36px_36px]"
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-[13px] border border-white/15 bg-white/10">
                      <ShieldCheck
                        size={22}
                        strokeWidth={1.7}
                        className="text-[#F9C900]"
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#F9C900]">
                        IIEV SHOW · PRIVACY
                      </p>

                      <h2 className="mt-1 text-[19px] font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-[21px]">
                        Your privacy matters.
                      </h2>
                    </div>
                  </div>

                  {consent !== "none" && (
                    <button
                      type="button"
                      onClick={close}
                      aria-label="Close cookie preferences"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <p className="relative mt-4 max-w-[410px] text-[12px] leading-[1.75] text-white/75 sm:text-[13px]">
                  You are in control of your experience.
                  Choose whether we can use analytics to
                  understand how visitors interact with
                  the IIEV Show website.
                </p>
              </div>

              {/* Consent options */}
              <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
                <div className="grid gap-2.5">
                  <div className="flex items-start gap-3 rounded-[13px] border border-[#E3EAE5] bg-[#F7FAF7] p-3.5">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#E4F1E8] text-[#1D8043]">
                      <LockKeyhole
                        size={16}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-[12px] font-extrabold text-[#102A1E]">
                          Essential cookies
                        </h3>

                        <span className="inline-flex items-center gap-1 rounded-full bg-[#E2F2E6] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.04em] text-[#1D8043]">
                          <Check size={10} />
                          Always active
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] leading-[1.6] text-[#6D7E72]">
                        Required for core website
                        functionality and form security.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-[13px] border border-[#E3EAE5] bg-white p-3.5">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF7D8] text-[#9B7800]">
                      <Cookie
                        size={16}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-[12px] font-extrabold text-[#102A1E]">
                          Analytics cookies
                        </h3>

                        <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#9B7800]">
                          Optional
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] leading-[1.6] text-[#6D7E72]">
                        Help us improve the exhibition
                        website by understanding page usage.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Equal-weight choice buttons */}
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => choose(false)}
                    className="inline-flex min-h-[46px] items-center justify-center rounded-[11px] border border-[#C7D7CC] bg-white px-3 text-center text-[11px] font-extrabold text-[#102A1E] transition-all duration-200 hover:border-[#1D8043] hover:bg-[#F3F8F4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D8043] sm:text-[12px]"
                  >
                    Essential only
                  </button>

                  <button
                    type="button"
                    onClick={() => choose(true)}
                    className="group inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[11px] border border-[#1D8043] bg-[#1D8043] px-3 text-center text-[11px] font-extrabold text-white transition-all duration-200 hover:border-[#166D38] hover:bg-[#166D38] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D8043] sm:text-[12px]"
                  >
                    Accept analytics
                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </button>
                </div>

                {/* Footer */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-[#E6ECE7] pt-3.5">
                  <p className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#758478]">
                    <LockKeyhole
                      size={12}
                      aria-hidden="true"
                    />
                    Your choice can be changed anytime
                  </p>

                  <Link
                    href="/cookie-policy/"
                    className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#1D8043] underline decoration-[#1D8043]/35 underline-offset-4 transition-colors hover:text-[#125E30]"
                  >
                    Cookie policy
                    <ArrowUpRight
                      size={12}
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="h-[3px] w-full bg-[linear-gradient(90deg,#1D8043_0%,#1D8043_65%,#F9C900_65%,#F9C900_100%)]"
              />
            </section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F9C900]"
      onClick={() =>
        window.dispatchEvent(
          new Event("iiev:open-consent")
        )
      }
    >
      Cookie settings
    </button>
  );
}
