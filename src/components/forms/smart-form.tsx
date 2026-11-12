"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  LoaderCircle,
} from "lucide-react";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { COUNTRIES, INDIAN_STATES } from "@/config/options";
import { getAttribution, track, type AnalyticsEvent } from "@/lib/analytics/client";
import { FieldShell, describedBy, inputCls } from "./fields";
import { RecaptchaV2, type RecaptchaHandle } from "./recaptcha-v2";

export type FieldDef =
  | {
      kind: "text" | "email" | "tel" | "url";
      name: string;
      label: string;
      required?: boolean;
      autoComplete?: string;
      hint?: string;
      placeholder?: string;
      half?: boolean;
      maxLength?: number;
    }
  | {
      kind: "textarea";
      name: string;
      label: string;
      required?: boolean;
      hint?: string;
      placeholder?: string;
      rows?: number;
      maxLength?: number;
    }
  | {
      kind: "select";
      name: string;
      label: string;
      required?: boolean;
      options: readonly string[] | readonly { value: string; label: string }[];
      hint?: string;
      half?: boolean;
    }
  | {
      kind: "checkboxes";
      name: string;
      label: string;
      required?: boolean;
      options: readonly string[] | readonly { value: string; label: string }[];
      hint?: string;
      columns?: 1 | 2;
    }
  | { kind: "location" }
  | { kind: "heading"; label: string; text?: string };

export type SuccessData = {
  ref?: string;
  reference?: string;
  status?: string;
  badgeAccess?: string;
  message?: string;
  url?: string;
  [key: string]: unknown;
};

type WebForm =
  | "stall" | "visitor" | "contact" | "sponsorship" | "partner"
  | "speaker" | "delegate" | "media" | "brochure";

type Props = {
  endpoint: string;
  fields: FieldDef[];
  submitLabel: string;
  formName: string;
  consentPurpose?: string; // Backwards compatible. Does NOT invent consent.
  startEvent?: AnalyticsEvent;
  submitEvent?: AnalyticsEvent;
  renderSuccess?: (data: SuccessData) => ReactNode;
  minimal?: boolean;
  /** Set false only for forms that deliberately have no draft support. */
  autosave?: boolean;
  autosaveEndpoint?: string;
  autosaveForm?: WebForm;
};

type FormStatus =
  | { phase: "idle" | "submitting" }
  | { phase: "success"; data: SuccessData }
  | { phase: "error"; message: string; fieldErrors: Record<string, string> };
type DraftStatus = "idle" | "saving" | "saved" | "local";

type ApiReply = SuccessData & {
  ok?: boolean;
  code?: string;
  fieldErrors?: Record<string, string>;
};

type OptionField = Extract<FieldDef, { kind: "select" | "checkboxes" }>;
const optionsFor = (field: OptionField) =>
  field.options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );

const STORAGE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const AUTOSAVE_DELAY_MS = 1100;
const FORM_ALIAS: Record<string, WebForm> = {
  stall_enquiry: "stall",
  visitor_registration: "visitor",
  sponsorship_enquiry: "sponsorship",
  partner_enquiry: "partner",
  speaker_application: "speaker",
  delegate_registration: "delegate",
  contact: "contact",
  brochure: "brochure",
  media: "media",
};

const countryDisplay = new Intl.DisplayNames(["en"], { type: "region" });
const DIAL_OPTIONS = getCountries()
  .map((code) => ({
    value: code,
    name: countryDisplay.of(code) || code,
    dial: `+${getCountryCallingCode(code)}`,
  }))
  .sort((a, b) => {
    const priority: Record<string, number> = { IN: 0, AE: 1, US: 2, GB: 3 };
    const pa = priority[a.value] ?? 99;
    const pb = priority[b.value] ?? 99;
    return pa !== pb ? pa - pb : a.name.localeCompare(b.name);
  });

const COUNTRY_SYNONYMS: Record<string, string> = {
  "united states of america": "US",
  usa: "US",
  uk: "GB",
  "united kingdom": "GB",
  uae: "AE",
  "united arab emirates": "AE",
  india: "IN",
};
function matchDialCountry(name: string): string | undefined {
  const lower = name.toLowerCase().trim();
  return COUNTRY_SYNONYMS[lower] ||
    DIAL_OPTIONS.find((option) => option.name.toLowerCase() === lower)?.value;
}
function isUuid(key: unknown): key is string {
  return typeof key === "string" &&
    /^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(key);
}
function newKey(): string {
  // This application runs on HTTPS. crypto.randomUUID is available there.
  return crypto.randomUUID();
}
function isControl(
  element: Element,
): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement;
}
function hasUserData(data: Record<string, unknown>): boolean {
  return Object.entries(data).some(([key, value]) => {
    if (key === "country" || key === "phoneCountry") return false;
    return typeof value === "string" ? value.trim().length > 0 :
      Array.isArray(value) && value.length > 0;
  });
}

export function SmartForm({
  endpoint,
  fields,
  submitLabel,
  formName,
  startEvent,
  submitEvent,
  renderSuccess,
  minimal = false,
  autosave = true,
  autosaveEndpoint = "/api/forms/autosave/",
  autosaveForm,
}: Props) {
  const [status, setStatus] = useState<FormStatus>({ phase: "idle" });
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("idle");
  const [country, setCountry] = useState("India");
  const [phoneCountry, setPhoneCountry] = useState("IN");
  const [captchaError, setCaptchaError] = useState("");
  const [restoredDraft, setRestoredDraft] = useState<Record<string, unknown> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const captchaRef = useRef<RecaptchaHandle>(null);
  const keyRef = useRef("");
  const pendingDraftRef = useRef<Record<string, unknown> | null>(null);
  const draftVersionRef = useRef(0);
  const savedVersionRef = useRef(0);
  const inFlightRef = useRef(false);
  const busyRef = useRef(false);
  const submittedRef = useRef(false);
  const beganRef = useRef(false);
  const manualDialChoiceRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushRef = useRef<() => void>(() => {});
  const serverForm = autosaveForm ?? FORM_ALIAS[formName];
  const localKey = `iiev-local-draft:${formName}`;
  const sessionKey = `iiev-form-key:${formName}`;

  // Must preserve the SAME UUID across refresh, tab close and final submission.
  useEffect(() => {
    let key = "";
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) {
        const saved: unknown = JSON.parse(raw);
        if (saved && typeof saved === "object" && !Array.isArray(saved)) {
          const item = saved as { submissionKey?: unknown; savedAt?: unknown; data?: unknown };
          if (typeof item.savedAt === "number" &&
              Date.now() >= item.savedAt && Date.now() - item.savedAt < STORAGE_TTL_MS &&
              item.data && typeof item.data === "object" && !Array.isArray(item.data)) {
            const data = item.data as Record<string, unknown>;
            if (isUuid(item.submissionKey)) key = item.submissionKey;
            setRestoredDraft(data);
            pendingDraftRef.current = data;
            draftVersionRef.current = 1;
            timerRef.current = setTimeout(() => flushRef.current(), AUTOSAVE_DELAY_MS);
          } else {
            localStorage.removeItem(localKey);
          }
        }
      }
      if (!key) {
        const previous = sessionStorage.getItem(sessionKey);
        if (isUuid(previous)) key = previous;
      }
    } catch {
      // Private browsing/storage disabled: forms still submit normally.
    }
    if (!key) key = newKey();
    keyRef.current = key;
    try { sessionStorage.setItem(sessionKey, key); } catch { /* optional */ }
  }, [localKey, sessionKey]);

  // Restore normal inputs and actual checkbox groups (not a consent checkbox).
  useEffect(() => {
    if (!restoredDraft || !formRef.current) return;
    const savedCountry = restoredDraft.country;
    const savedDial = restoredDraft.phoneCountry;
    if (typeof savedCountry === "string" && (COUNTRIES as readonly string[]).includes(savedCountry) && savedCountry !== country) {
      setCountry(savedCountry);
      return;
    }
    if (typeof savedDial === "string" &&
        DIAL_OPTIONS.some((entry) => entry.value === savedDial) && savedDial !== phoneCountry) {
      manualDialChoiceRef.current = true;
      setPhoneCountry(savedDial);
      return;
    }
    const controls = Array.from(formRef.current.elements).filter(isControl);
    for (const field of fields) {
      if (field.kind === "heading") continue;
      const names = field.kind === "location" ? ["city", "state"] : [field.name];
      for (const name of names) {
        if (name === "country" || name === "phoneCountry") continue;
        const value = restoredDraft[name];
        if (typeof value !== "string" && !Array.isArray(value)) continue;
        for (const control of controls.filter((element) => element.name === name)) {
          if (control instanceof HTMLInputElement && control.type === "checkbox") {
            control.checked = Array.isArray(value) && value.includes(control.value);
          } else if (typeof value === "string") {
            control.value = value;
          }
        }
      }
    }
    setRestoredDraft(null);
  }, [restoredDraft, country, phoneCountry, fields]);

  const collect = useCallback((): Record<string, unknown> => {
    if (!formRef.current) return {};
    const fd = new FormData(formRef.current);
    const data: Record<string, unknown> = {};
    for (const field of fields) {
      if (field.kind === "heading") continue;
      if (field.kind === "location") {
        data.country = String(fd.get("country") ?? country);
        data.city = String(fd.get("city") ?? "").trim();
        data.state = String(fd.get("state") ?? "").trim();
      } else if (field.kind === "checkboxes") {
        data[field.name] = fd.getAll(field.name).map(String);
      } else if (field.name === "country") {
        data.country = String(fd.get("country") ?? country);
      } else {
        data[field.name] = String(fd.get(field.name) ?? "").trim();
      }
    }
    if (fields.some((field) => field.kind === "tel")) {
      const dial = String(fd.get("phoneCountry") ?? phoneCountry);
      data.phoneCountry = manualDialChoiceRef.current
        ? dial
        : matchDialCountry(String(fd.get("country") ?? country)) || dial;
    }
    return data;
  }, [country, fields, phoneCountry]);

  const flushDraft = useCallback(async () => {
    if (!autosave || !serverForm || submittedRef.current || busyRef.current ||
        inFlightRef.current || !keyRef.current || !pendingDraftRef.current) return;
    if (savedVersionRef.current >= draftVersionRef.current) return;

    const version = draftVersionRef.current;
    const snapshot = pendingDraftRef.current;
    inFlightRef.current = true;
    setDraftStatus("saving");
    try {
      const response = await fetch(autosaveEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ submissionKey: keyRef.current, form: serverForm, data: snapshot }),
      });
      const result: { saved?: boolean } = await response.json().catch(() => ({}));
      if (!response.ok || result.saved !== true) throw new Error("Draft autosave failed");
      savedVersionRef.current = Math.max(savedVersionRef.current, version);
      setDraftStatus(savedVersionRef.current === draftVersionRef.current ? "saved" : "saving");
    } catch {
      // A local copy exists; retry while editing or when coming back online.
      setDraftStatus("local");
    } finally {
      inFlightRef.current = false;
      if (draftVersionRef.current > version && !submittedRef.current && !busyRef.current) {
        window.setTimeout(() => flushRef.current(), AUTOSAVE_DELAY_MS);
      }
    }
  }, [autosave, autosaveEndpoint, serverForm]);
  useEffect(() => {
    flushRef.current = () => { void flushDraft(); };
  }, [flushDraft]);

  const saveLocalAndSchedule = useCallback(() => {
    if (submittedRef.current || busyRef.current || !keyRef.current) return;
    const data = collect();
    if (!hasUserData(data)) return;
    pendingDraftRef.current = data;
    draftVersionRef.current += 1;
    try {
      localStorage.setItem(localKey, JSON.stringify({
        submissionKey: keyRef.current,
        savedAt: Date.now(),
        data,
      }));
    } catch { /* local storage optional; server save still attempted */ }
    setDraftStatus("local");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => flushRef.current(), AUTOSAVE_DELAY_MS);
  }, [collect, localKey]);

  // Browser close sends a last best-effort save. Earlier debounce saves are primary.
  useEffect(() => {
    const onPageHide = () => {
      if (!autosave || !serverForm || submittedRef.current || !keyRef.current) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      const data = collect();
      if (!hasUserData(data)) return;
      try {
        localStorage.setItem(localKey, JSON.stringify({
          submissionKey: keyRef.current, savedAt: Date.now(), data,
        }));
      } catch { /* optional */ }
      const body = JSON.stringify({ submissionKey: keyRef.current, form: serverForm, data });
      if (body.length < 50_000 && navigator.sendBeacon) {
        navigator.sendBeacon(autosaveEndpoint, new Blob([body], { type: "application/json" }));
      }
    };
    const onOnline = () => flushRef.current();
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("online", onOnline);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autosave, autosaveEndpoint, collect, localKey, serverForm]);

  function onFormInput() {
    if (!beganRef.current) {
      beganRef.current = true;
      if (startEvent) track(startEvent, { form: formName });
    }
    saveLocalAndSchedule();
  }

  function onCountryChange(value: string) {
    setCountry(value);
    if (!manualDialChoiceRef.current) {
      const iso = matchDialCountry(value);
      if (iso) setPhoneCountry(iso);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current || !formRef.current) return;
    if (!event.currentTarget.reportValidity()) return;
    const data = collect();
    const invalidChoice = fields.find((field) =>
      field.kind === "checkboxes" && field.required &&
      (!Array.isArray(data[field.name]) || (data[field.name] as unknown[]).length === 0),
    );
    if (invalidChoice && "name" in invalidChoice) {
      setStatus({ phase: "error", message: "Please complete the required fields.",
        fieldErrors: { [invalidChoice.name]: "Select at least one option." } });
      return;
    }

    // Clients submit a NORMALIZED international phone number. The user types only
    // the local number; the server validates this again with libphonenumber-js.
    const rawPhone = typeof data.phone === "string" ? data.phone.trim() : "";
    if (rawPhone) {
      try {
        const code = String(data.phoneCountry ?? "IN") as CountryCode;
        const parsed = parsePhoneNumberFromString(rawPhone, { defaultCountry: code, extract: false });
        if (!parsed?.isValid() || parsed.ext) throw new Error("Invalid phone");
        data.phone = parsed.number;
      } catch {
        setStatus({ phase: "error", message: "Please check your mobile number.",
          fieldErrors: { phone: "Enter a valid number for the selected country code." } });
        return;
      }
    }

    const token = captchaRef.current?.getToken() ?? "";
    if (!token) {
      setCaptchaError("Tick the I'm not a robot checkbox before submitting.");
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    busyRef.current = true;
    setStatus({ phase: "submitting" });
    setCaptchaError("");

    try {
      const fd = new FormData(event.currentTarget);
      const submissionKey = keyRef.current || newKey();
      keyRef.current = submissionKey;
      const payload = {
        ...data,
        idempotencyKey: submissionKey,
        submissionKey, // for legacy website-lead endpoints; Zod ignores if unused
        form: serverForm,
        attribution: getAttribution(),
        website_url_confirm: String(fd.get("website_url_confirm") ?? ""),
        recaptchaToken: token,
      };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as ApiReply;
      if (!response.ok || result.ok !== true) {
        if (result.code === "KEY_CONFLICT") {
          // Only reset on an explicit server-confirmed conflict, never on a timeout.
          keyRef.current = newKey();
          try { sessionStorage.setItem(sessionKey, keyRef.current); } catch { /* optional */ }
        }
        setStatus({ phase: "error", message: result.message || "Submission failed. Please try again.",
          fieldErrors: result.fieldErrors || {} });
        // A server error may have consumed this one-time token. On a validation-only
        // 422 the CAPTCHA was not verified, so its response remains valid.
        if (response.status !== 422 || result.code?.startsWith("RECAPTCHA")) {
          captchaRef.current?.reset();
          setCaptchaError(result.code?.startsWith("RECAPTCHA") ?
            "Verification expired or failed. Please tick the checkbox again." : "");
        }
        return;
      }
      submittedRef.current = true;
      pendingDraftRef.current = null;
      try {
        localStorage.removeItem(localKey);
        sessionStorage.removeItem(sessionKey);
      } catch { /* optional */ }
      if (submitEvent) track(submitEvent, { form: formName });
      setStatus({ phase: "success", data: result });
    } catch {
      // A timeout/network failure does NOT prove the server failed to save.
      // Retain the UUID so the retry reaches the SAME MongoDB record.
      setStatus({ phase: "error", message: "Network problem. Your details are kept; retry using the same form.",
        fieldErrors: {} });
      captchaRef.current?.reset();
    } finally {
      busyRef.current = false;
    }
  }

  if (status.phase === "success") {
    const data = status.data;
    return (
      <div role="status" aria-live="polite" className="rounded-2xl border border-[#CAE7D2] bg-[#F1FAF3] p-7 sm:p-9">
        {renderSuccess ? renderSuccess(data) : (
          <>
            <CheckCircle2 className="size-12 text-[#23A455]" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-extrabold text-[#102A1E]">Submission Received</h2>
            <p className="mt-3 text-sm leading-7 text-[#526357]">{data.message || "Your form has been submitted."}</p>
            {(data.ref || data.reference) && <p className="mt-4 rounded-lg bg-white p-4 text-sm font-bold text-[#102A1E]">
              Reference: {data.ref || data.reference}
            </p>}
            <Link href="/" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#16893F]">
              Home <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    );
  }

  const errors = status.phase === "error" ? status.fieldErrors : {};
  const loading = status.phase === "submitting";
  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onInput={onFormInput}
      onChange={saveLocalAndSchedule}
      className="min-w-0 space-y-7"
    >
      {status.phase === "error" && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <div>
            <p className="font-bold">{status.message}</p>
            {Object.entries(errors).map(([key, message]) => (
              <p key={key} className="mt-1 text-xs">{key}: {message}</p>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        {fields.map((field, index) => {
          if (field.kind === "heading") {
            return <div key={`heading-${index}`} className="sm:col-span-2">
              <h3 className="text-base font-extrabold text-[#102A1E]">{field.label}</h3>
              {field.text && <p className="mt-1 text-sm text-[#647468]">{field.text}</p>}
            </div>;
          }
          if (field.kind === "location") {
            return <div key={`location-${index}`} className="grid gap-5 sm:col-span-2 sm:grid-cols-3">
              <FieldShell id="country" label="Country" required error={errors.country}>
                <div className="relative">
                  <select id="country" name="country" value={country}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => onCountryChange(event.target.value)}
                    required className={`${inputCls} appearance-none pr-10`}
                    aria-invalid={!!errors.country} aria-describedby={describedBy("country", errors.country)}>
                    {COUNTRIES.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#617166]" />
                </div>
              </FieldShell>
              <FieldShell id="state" label={country === "India" ? "State / UT" : "State / Region"}
                required={country === "India"} error={errors.state}>
                {country === "India" ?
                  <select key="india" id="state" name="state" required defaultValue=""
                    className={inputCls} aria-invalid={!!errors.state}
                    aria-describedby={describedBy("state", errors.state)}>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                  </select> :
                  <input key="other" id="state" name="state" maxLength={80}
                    className={inputCls} aria-invalid={!!errors.state}
                    aria-describedby={describedBy("state", errors.state)} />}
              </FieldShell>
              <FieldShell id="city" label="City" required error={errors.city}>
                <input id="city" name="city" maxLength={80} required className={inputCls}
                  aria-invalid={!!errors.city} aria-describedby={describedBy("city", errors.city)} />
              </FieldShell>
            </div>;
          }
          const error = errors[field.name];
          const span = field.kind === "textarea" || field.kind === "checkboxes" ||
            ("half" in field && field.half === false) ||
            (!minimal && field.kind === "select" && !field.half) ? "sm:col-span-2" : "";

          if (field.kind === "checkboxes") {
            return <fieldset key={field.name} className={span}
              aria-invalid={!!error} aria-describedby={error ? `${field.name}-error` : undefined}>
              <legend className="mb-3 text-xs font-bold text-[#102A1E]">
                {field.label}{field.required ? " *" : ""}
              </legend>
              <div className={`grid gap-3 ${field.columns === 1 ? "" : "sm:grid-cols-2"}`}>
                {optionsFor(field).map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 rounded-xl border border-[#DCE7DE] bg-[#FAFCFA] p-3 text-sm">
                    <input type="checkbox" name={field.name} value={opt.value} className="accent-[#23A455]" />
                    {opt.label}
                  </label>
                ))}
              </div>
              {error && <p id={`${field.name}-error`} role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
            </fieldset>;
          }
          return <FieldShell key={field.name} id={field.name} label={field.label}
            required={field.required} hint={field.hint} error={error} className={span}>
            {field.kind === "textarea" ?
              <textarea id={field.name} name={field.name} placeholder={field.placeholder}
                required={field.required} rows={field.rows ?? 4} maxLength={field.maxLength}
                aria-invalid={!!error} aria-describedby={describedBy(field.name, error, field.hint)}
                className={`${inputCls} !h-auto min-h-[145px] py-4`} /> :
              field.kind === "select" ?
                <div className="relative">
                  <select id={field.name} name={field.name} required={field.required}
                    {...(field.name === "country"
                      ? { value: country, onChange: (event: ChangeEvent<HTMLSelectElement>) => onCountryChange(event.target.value) }
                      : { defaultValue: "" })}
                    className={`${inputCls} appearance-none pr-10`} aria-invalid={!!error}
                    aria-describedby={describedBy(field.name, error, field.hint)}>
                    {field.name !== "country" && <option value="">Select an option</option>}
                    {optionsFor(field).map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#617166]" />
                </div> :
              field.kind === "tel" ?
                <div className="flex min-w-0 gap-2">
                  <select id="phoneCountry" name="phoneCountry" aria-label="Country calling code"
                    title="Country calling code" value={phoneCountry}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => { manualDialChoiceRef.current = true; setPhoneCountry(event.target.value); }}
                    className={`${inputCls} !w-[134px] shrink-0 !px-2 text-xs sm:!w-[155px]`}
                    aria-invalid={!!errors.phoneCountry}>
                    {DIAL_OPTIONS.map((option) => <option key={option.value} value={option.value}>
                      {option.dial} · {option.name}
                    </option>)}
                  </select>
                  <input type="tel" id={field.name} name={field.name}
                    inputMode="tel" autoComplete="tel-national" required={field.required}
                    placeholder={field.placeholder || "Mobile number"}
                    maxLength={field.maxLength ?? 24}
                    aria-invalid={!!error} aria-describedby={describedBy(field.name, error, field.hint)}
                    className={`${inputCls} min-w-0 flex-1`} />
                </div> :
                <input id={field.name} name={field.name}
                  type={field.kind === "url" ? "text" : field.kind}
                  inputMode={field.kind === "url" ? "url" : undefined}
                  placeholder={field.placeholder} required={field.required}
                  autoComplete={field.autoComplete} maxLength={field.maxLength ?? 160}
                  aria-invalid={!!error} aria-describedby={describedBy(field.name, error, field.hint)}
                  className={inputCls} />}
          </FieldShell>;
        })}
      </div>

      {/* Anti-bot honeypot; invisible to users and assistive input navigation. */}
      <div className="absolute -left-[10000px] -top-[10000px]" aria-hidden="true">
        <label htmlFor={`${formName}-confirm`}>Leave empty</label>
        <input id={`${formName}-confirm`} name="website_url_confirm" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="space-y-4 border-t border-[#E5EDE6] pt-6">
        <RecaptchaV2 ref={captchaRef} onChange={() => setCaptchaError("")}
          onError={setCaptchaError} />
        {captchaError && <p role="alert" className="text-xs text-red-600">{captchaError}</p>}
        <button type="submit" disabled={loading}
          className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#23A455] px-7 text-sm font-extrabold text-white hover:bg-[#16893F] disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? <><LoaderCircle size={19} className="animate-spin" /> Submitting…</> :
            <>{submitLabel} <ArrowRight size={18} /></>}
        </button>
        {autosave && serverForm && draftStatus !== "idle" &&
          <p role="status" className="text-center text-[11px] text-[#718074]">
            {draftStatus === "saving" ? "Saving draft…" :
              draftStatus === "saved" ? "Draft saved" : "Draft kept on this device; syncing automatically"}
          </p>}
      </div>
    </form>
  );
}
