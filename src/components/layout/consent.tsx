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
const ease = [0.22, 1, 0.36, 1] as const;

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

  // Inner pieces rise in one after another once the panel is open.
  const rise = (i: number) => ({
    initial: reducedMotion ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reducedMotion ? 0 : 0.6,
      delay: reducedMotion ? 0 : 0.18 + i * 0.07,
      ease,
    },
  });

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
                : { opacity: 0, y: 36, scale: 0.97 }
            }
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: reducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 240, damping: 28, mass: 0.9 },
            }}
            exit={
              reducedMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : {
                    opacity: 0,
                    y: 20,
                    scale: 0.98,
                    transition: { duration: 0.35, ease },
                  }
            }
            className="no-print fixed inset-x-3 bottom-3 z-[100] mx-auto w-auto max-w-[510px] sm:inset-x-auto sm:bottom-7 sm:left-7 sm:w-[510px]"
          >
            <section
              role="region"
              aria-label="Cookie preferences"
              className="relative overflow-hidden rounded-[22px] border border-[#DCE7DE] bg-white shadow-[0_28px_70px_-28px_rgba(0,20,51,0.45)]"
            >
              {/* Header: navy, with the brand's green arc in the corner */}
              <div className="relative overflow-hidden bg-[#001433] px-5 pb-5 pt-5 text-white sm:px-6">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 200"
                  fill="none"
                  className="pointer-events-none absolute -right-20 -top-24 h-60 w-60"
                >
                  <defs>
                    <linearGradient id="iiev-consent-arc" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#3BB36B" />
                      <stop offset="1" stopColor="#1D8043" />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="86" stroke="url(#iiev-consent-arc)" strokeWidth="18" />
                  <circle cx="100" cy="100" r="99" stroke="#3BB36B" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 6" />
                </svg>

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#3BB36B]/60 bg-[#1D8043]/20">
                      <ShieldCheck
                        size={21}
                        strokeWidth={1.7}
                        className="text-[#3BB36B]"
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#3BB36B]">
                        <span aria-hidden="true" className="h-px w-5 bg-[#3BB36B]" />
                        IIEV Show · Privacy
                      </p>

                      <h2 className="mt-1.5 text-[20px] font-light leading-tight tracking-[-0.03em] text-white sm:text-[23px]">
                        Your privacy{" "}
                        <span className="font-bold text-[#3BB36B]">matters.</span>
                      </h2>
                    </div>
                  </div>

                  {consent !== "none" && (
                    <button
                      type="button"
                      onClick={close}
                      aria-label="Close cookie preferences"
                      className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-white/25 bg-[#001433]/60 text-white/80 transition-colors duration-300 hover:border-white/60 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <p className="relative mt-4 max-w-[390px] text-[12px] leading-[1.75] text-white/80 sm:text-[13px]">
                  You are in control of your experience.
                  Choose whether we can use analytics to
                  understand how visitors interact with
                  the IIEV Show website.
                </p>
              </div>

              {/* Consent options */}
              <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
                <div className="grid gap-2.5">
                  <motion.div
                    {...rise(0)}
                    className="flex items-start gap-3 rounded-[14px] border border-[#E3EAE5] bg-[#F7FAF7] p-3.5"
                  >
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-[#1D8043]/35 text-[#1D8043]">
                      <LockKeyhole
                        size={16}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-[12px] font-extrabold text-[#1D8043]">
                          Essential cookies
                        </h3>

                        <span className="inline-flex items-center gap-1 rounded-full bg-[#1D8043] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.06em] text-white">
                          <Check size={10} />
                          Always active
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] leading-[1.6] text-[#5F7266]">
                        Required for core website
                        functionality and form security.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    {...rise(1)}
                    className="flex items-start gap-3 rounded-[14px] border border-[#E3EAE5] bg-white p-3.5"
                  >
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-[#1D8043]/35 text-[#1D8043]">
                      <Cookie
                        size={16}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-[12px] font-extrabold text-[#1D8043]">
                          Analytics cookies
                        </h3>

                        <span className="rounded-full border border-[#C7D7CC] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-[#5F7266]">
                          Optional
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] leading-[1.6] text-[#5F7266]">
                        Help us improve the exhibition
                        website by understanding page usage.
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Choice buttons: same size, same placement, nothing hidden */}
                <motion.div {...rise(2)} className="mt-5 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => choose(false)}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#C7D7CC] bg-white px-3 text-center text-[11px] font-extrabold text-[#0E2A1C] transition duration-300 hover:border-[#1D8043] hover:bg-[#F3F8F4] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D8043] sm:text-[12px]"
                  >
                    Essential only
                  </button>

                  <button
                    type="button"
                    onClick={() => choose(true)}
                    className="group inline-flex min-h-[48px] items-center justify-between gap-2 rounded-full bg-[#1D8043] py-1.5 pl-4 pr-1.5 text-[11px] font-extrabold text-white transition duration-300 hover:bg-[#166D38] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D8043] sm:text-[12px]"
                  >
                    Accept analytics
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-[#1D8043] transition-transform duration-300 group-hover:scale-105">
                      <ArrowUpRight
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </button>
                </motion.div>

                {/* Footer */}
                <motion.div
                  {...rise(3)}
                  className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-[#E6ECE7] pt-3.5"
                >
                  <p className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#6D7E72]">
                    <LockKeyhole
                      size={12}
                      aria-hidden="true"
                    />
                    Your choice can be changed anytime
                  </p>

                  <Link
                    href="/cookie-policy/"
                    className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#1D8043] underline decoration-[#1D8043]/35 underline-offset-4 transition-colors duration-300 hover:text-[#125E30] hover:decoration-[#1D8043]"
                  >
                    Cookie policy
                    <ArrowUpRight
                      size={12}
                      aria-hidden="true"
                    />
                  </Link>
                </motion.div>
              </div>

              {/* Closing bar draws itself in, all brand green */}
              <motion.div
                aria-hidden="true"
                className="h-[3px] w-full origin-left bg-gradient-to-r from-[#1D8043] to-[#3BB36B]"
                initial={reducedMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.9, delay: reducedMotion ? 0 : 0.45, ease }}
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
      className="transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3BB36B]"
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