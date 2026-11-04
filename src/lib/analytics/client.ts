"use client";

// Consent-aware analytics. Nothing is sent to Google Analytics unless the
// visitor has opted in. Never pass personal data (names, emails, phones) here.

export const CONSENT_COOKIE = "iiev_consent";
export const CONSENT_VERSION = "1";

export type AnalyticsEvent =
  | "stall_enquiry_started"
  | "stall_enquiry_submitted"
  | "visitor_registration_started"
  | "visitor_registration_submitted"
  | "visitor_registration_approved"
  | "badge_issued"
  | "sponsorship_enquiry_submitted"
  | "speaker_application_submitted"
  | "conference_registration_submitted"
  | "partner_enquiry_submitted"
  | "contact_submitted"
  | "download";

type Consent = { analytics: boolean; v: string } | null;

export function readConsent(): Consent {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  if (!m) return null;
  const [a, v] = decodeURIComponent(m[1]).split("|");
  if (v !== CONSENT_VERSION) return null;
  return { analytics: a === "1", v };
}

export function writeConsent(analytics: boolean) {
  const value = encodeURIComponent(`${analytics ? "1" : "0"}|${CONSENT_VERSION}`);
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent("iiev:consent", { detail: { analytics } }));
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: AnalyticsEvent, params: Record<string, string | number | boolean | undefined> = {}) {
  if (!readConsent()?.analytics) return;
  window.gtag?.("event", event, params);
}

// ---- Attribution (first-party; attached to submissions only with consent) ----

const ATTR_KEY = "iiev_attr";

export function captureAttribution() {
  try {
    if (sessionStorage.getItem(ATTR_KEY)) return;
    const u = new URL(location.href);
    const p = u.searchParams;
    const data = {
      landingPage: u.pathname,
      referrer: document.referrer ? new URL(document.referrer).origin : undefined,
      utmSource: p.get("utm_source") || undefined,
      utmMedium: p.get("utm_medium") || undefined,
      utmCampaign: p.get("utm_campaign") || undefined,
      utmTerm: p.get("utm_term") || undefined,
      utmContent: p.get("utm_content") || undefined,
    };
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable */
  }
}

export function getAttribution(): Record<string, string | undefined> | undefined {
  if (!readConsent()?.analytics) return undefined;
  try {
    const raw = sessionStorage.getItem(ATTR_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}
