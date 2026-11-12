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
  ShieldCheck,
} from "lucide-react";
import { COUNTRIES, INDIAN_STATES } from "@/config/options";
import { getAttribution, track, type AnalyticsEvent } from "@/lib/analytics/client";
import { FieldShell, inputCls, describedBy } from "./fields";
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
  status?: string;
  badgeAccess?: string;
  message?: string;
  [key: string]: unknown;
};

type Props = {
  endpoint: string;
  fields: FieldDef[];
  submitLabel: string;
  // Retained so existing form wrappers don't break. No checkbox is inferred.
  consentPurpose?: string;
  formName: string;
  startEvent?: AnalyticsEvent;
  submitEvent?: AnalyticsEvent;
  renderSuccess?: (data: SuccessData) => ReactNode;
  minimal?: boolean;
};

type FormStatus =
  | { phase: "idle" | "submitting" }
  | { phase: "success"; data: SuccessData }
  | { phase: "error"; message: string; fieldErrors: Record<string, string> };

type ApiReply = {
  ok?: boolean;
  message?: string;
  code?: string;
  fieldErrors?: Record<string, string>;
  ref?: string;
  status?: string;
  badgeAccess?: string;
};

type ChoiceField = Extract<FieldDef, { kind: "select" | "checkboxes" }>;
const options = (field: ChoiceField) =>
  field.options.map((value) => typeof value === "string" ? { value, label: value } : value);

const fieldClass = inputCls;
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function SmartForm({
  endpoint,
  fields,
  submitLabel,
  formName,
  startEvent,
  submitEvent,
  renderSuccess,
  minimal = false,
}: Props) {
  const [status, setStatus] = useState<FormStatus>({ phase: "idle" });
  const [country, setCountry] = useState("India");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [restoredDraft, setRestoredDraft] = useState<Record<string, unknown> | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const captchaRef = useRef<RecaptchaHandle>(null);
  const busyRef = useRef(false);
  const submittedRef = useRef(false);
  const beganRef = useRef(false);
  const keyRef = useRef("");
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const sessionKey = `iiev-form-key:${formName}`;
    let key = window.crypto.randomUUID();

    try {
      const previous = window.sessionStorage.getItem(sessionKey);
      if (previous && /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(previous)) {
        key = previous;
      }
      window.sessionStorage.setItem(sessionKey, key);
    } catch {
      // The form still works if browser storage is blocked.
    }
    keyRef.current = key;

    try {
      const raw = window.localStorage.getItem(`iiev-local-draft:${formName}`);
      if (raw) {
        const saved: unknown = JSON.parse(raw);
        if (saved && typeof saved === "object" && !Array.isArray(saved)) {
          const item = saved as { savedAt?: unknown; data?: unknown };
          if (
            typeof item.savedAt === "number" &&
            Date.now() - item.savedAt >= 0 &&
            Date.now() - item.savedAt < DRAFT_TTL_MS &&
            item.data && typeof item.data === "object" && !Array.isArray(item.data)
          ) {
            const data = item.data as Record<string, unknown>;
            if (
              typeof data.country === "string" &&
              COUNTRIES.some((c) => c === data.country)
            ) {
              setCountry(data.country);
            }
            setRestoredDraft(data);
          } else {
            window.localStorage.removeItem(`iiev-local-draft:${formName}`);
          }
        }
      }
    } catch {
      // Draft restore is optional.
    }

    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [formName]);

  useEffect(() => {
    if (!restoredDraft || !formRef.current) return;
    // Wait until controlled country select has received its saved value.
    if (typeof restoredDraft.country === "string" && restoredDraft.country !== country) return;

    const form = formRef.current;
    for (const field of fields) {
      if (field.kind === "heading") continue;
      const names = field.kind === "location" ? ["city", "state", "country"] : [field.name];

      for (const name of names) {
        if (name === "country") continue;
        const value = restoredDraft[name];
        if (typeof value !== "string" && !Array.isArray(value)) continue;

        const controls = Array.from(form.elements).filter(
          (element): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =>
            (element instanceof HTMLInputElement ||
              element instanceof HTMLSelectElement ||
              element instanceof HTMLTextAreaElement) &&
            element.name === name,
        );
        for (const control of controls) {
          if (control instanceof HTMLInputElement && control.type === "checkbox") {
            control.checked = Array.isArray(value) && value.includes(control.value);
          } else if (typeof value === "string") {
            control.value = value;
          }
        }
      }
    }
    setRestoredDraft(null);
  }, [country, fields, restoredDraft]);

  const onCaptcha = useCallback((token: string) => {
    setCaptchaToken(token);
    setCaptchaError("");
  }, []);
  const onCaptchaError = useCallback((message: string) => {
    setCaptchaToken("");
    setCaptchaError(message);
  }, []);

  const collect = useCallback((): Record<string, unknown> => {
    if (!formRef.current) return {};
    const formData = new FormData(formRef.current);
    const data: Record<string, unknown> = {};

    for (const field of fields) {
      if (field.kind === "heading") continue;
      if (field.kind === "location") {
        data.country = country;
        data.city = String(formData.get("city") ?? "").trim();
        data.state = String(formData.get("state") ?? "").trim() || undefined;
      } else if (field.kind === "checkboxes") {
        data[field.name] = formData.getAll(field.name).map(String);
      } else if (field.name === "country") {
        data.country = country;
      } else {
        const value = String(formData.get(field.name) ?? "").trim();
        data[field.name] = value || undefined;
      }
    }
    return data;
  }, [country, fields]);

  const saveDraft = useCallback(() => {
    if (submittedRef.current || busyRef.current) return;
    const data = collect();
    if (!Object.values(data).some((value) =>
      typeof value === "string" ? value.trim().length > 0 : Array.isArray(value) && value.length > 0
    )) return;

    try {
      window.localStorage.setItem(
        `iiev-local-draft:${formName}`,
        JSON.stringify({ savedAt: Date.now(), data }),
      );
    } catch {
      // Private browsing / storage restrictions should not block submission.
    }
  }, [collect, formName]);

  const scheduleSave = useCallback(() => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    if (submittedRef.current) return;
    draftTimerRef.current = setTimeout(saveDraft, 1000);
  }, [saveDraft]);

  function firstInput() {
    if (!beganRef.current) {
      beganRef.current = true;
      if (startEvent) track(startEvent, { form: formName });
    }
    scheduleSave();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current || !formRef.current) return;
    if (!event.currentTarget.reportValidity()) return;

    const values = collect();
    const missingChoice = fields.find((field) => {
      if (field.kind !== "checkboxes" || !field.required) return false;
      const selected = values[field.name];
      return !Array.isArray(selected) || selected.length === 0;
    });
    if (missingChoice && "name" in missingChoice) {
      setStatus({
        phase: "error",
        message: "Please complete all required fields.",
        fieldErrors: { [missingChoice.name]: "Choose at least one option." },
      });
      return;
    }

    // Check the live widget, not only a possibly stale React state snapshot.
    const token = captchaRef.current?.getToken() ?? captchaToken;
    if (!token) {
      setCaptchaError("Please tick the security verification checkbox.");
      return;
    }

    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    busyRef.current = true;
    setStatus({ phase: "submitting" });
    setCaptchaError("");

    try {
      const formData = new FormData(event.currentTarget);
      const payload = {
        ...values,
        // Never send affirmative consent if the form has no opt-in input.
        idempotencyKey: keyRef.current || window.crypto.randomUUID(),
        website_url_confirm: String(formData.get("website_url_confirm") ?? ""),
        attribution: getAttribution(),
        recaptchaToken: token,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      const result = (await response.json().catch(() => ({}))) as ApiReply;

      if (!response.ok || result.ok !== true) {
        if (result.code === "KEY_CONFLICT") {
          // Old form / edition: don't keep retrying with the same session UUID.
          keyRef.current = window.crypto.randomUUID();
          try {
            window.sessionStorage.setItem(`iiev-form-key:${formName}`, keyRef.current);
          } catch {
            // Storage is optional.
          }
        }
        setStatus({
          phase: "error",
          message: result.message || "Unable to submit. Please try again.",
          fieldErrors: result.fieldErrors || {},
        });

        if (result.code === "RECAPTCHA_FAILED" || result.code === "RECAPTCHA_UNAVAILABLE") {
          captchaRef.current?.reset();
          setCaptchaError(
            result.code === "RECAPTCHA_UNAVAILABLE"
              ? "Security verification is temporarily unavailable. Try again later."
              : "Verification failed or expired. Tick the checkbox again.",
          );
        } else if (response.status !== 422) {
          // The server may already have consumed this single-use token.
          captchaRef.current?.reset();
        }
        return;
      }

      submittedRef.current = true;
      try {
        window.sessionStorage.removeItem(`iiev-form-key:${formName}`);
        window.localStorage.removeItem(`iiev-local-draft:${formName}`);
      } catch {
        // The success response is not dependent on storage.
      }
      if (submitEvent) track(submitEvent, { form: formName });
      setStatus({ phase: "success", data: result });
    } catch {
      setStatus({
        phase: "error",
        message: "Network error. Your entries are still here; please retry.",
        fieldErrors: {},
      });
      captchaRef.current?.reset();
    } finally {
      busyRef.current = false;
    }
  }

  if (status.phase === "success") {
    return (
      <div role="status" aria-live="polite" className="rounded-2xl border border-[#CAE7D2] bg-[#F1FAF3] p-7 sm:p-9">
        {renderSuccess ? renderSuccess(status.data) : (
          <>
            <CheckCircle2 className="size-12 text-[#23A455]" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-extrabold text-[#102A1E]">Submission Received</h2>
            <p className="mt-3 text-sm leading-7 text-[#526357]">{status.data.message ?? "Your form has been submitted."}</p>
            {status.data.ref && (
              <p className="mt-4 rounded-lg bg-white p-4 text-sm font-bold text-[#102A1E]">
                Reference: {status.data.ref}
              </p>
            )}
            <Link href="/" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#16893F]">
              Home <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    );
  }

  const fieldErrors = status.phase === "error" ? status.fieldErrors : {};
  const loading = status.phase === "submitting";

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      onInput={firstInput}
      onChange={scheduleSave}
      className="min-w-0 space-y-7"
    >
      {status.phase === "error" && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="size-5 shrink-0" />
          <div>
            <p className="font-bold">{status.message}</p>
            {Object.entries(fieldErrors).map(([name, message]) => (
              <p key={name} className="mt-1 text-xs">{name}: {message}</p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        {fields.map((field, index) => {
          if (field.kind === "heading") {
            return (
              <div key={`heading-${index}`} className="sm:col-span-2">
                <h3 className="text-base font-extrabold text-[#102A1E]">{field.label}</h3>
                {field.text && <p className="mt-1 text-sm text-[#647468]">{field.text}</p>}
              </div>
            );
          }

          if (field.kind === "location") {
            return (
              <div key={`location-${index}`} className="grid gap-5 sm:col-span-2 sm:grid-cols-3">
                <FieldShell id="country" label="Country" required error={fieldErrors.country}>
                  <div className="relative">
                    <select
                      className={`${fieldClass} appearance-none pr-10`}
                      id="country"
                      name="country"
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                      aria-invalid={!!fieldErrors.country}
                      aria-describedby={describedBy("country", fieldErrors.country)}
                      required
                    >
                      {COUNTRIES.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#617166]" />
                  </div>
                </FieldShell>

                <FieldShell id="state" label={country === "India" ? "State / UT" : "State / Region"} required={country === "India"} error={fieldErrors.state}>
                  {country === "India" ? (
                    <select key="india-state" className={fieldClass} id="state" name="state" required defaultValue="" aria-invalid={!!fieldErrors.state}>
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                    </select>
                  ) : (
                    <input key="other-state" className={fieldClass} id="state" name="state" aria-invalid={!!fieldErrors.state} />
                  )}
                </FieldShell>

                <FieldShell id="city" label="City" required error={fieldErrors.city}>
                  <input className={fieldClass} id="city" name="city" maxLength={80} required aria-invalid={!!fieldErrors.city} />
                </FieldShell>
              </div>
            );
          }

          const error = fieldErrors[field.name];
          const wrapper = field.kind === "textarea" || field.kind === "checkboxes" ||
            ("half" in field && field.half === false) ||
            (!minimal && field.kind === "select" && !field.half)
            ? "sm:col-span-2"
            : "";

          if (field.kind === "checkboxes") {
            return (
              <fieldset key={field.name} className={wrapper} aria-invalid={!!error} aria-describedby={error ? `${field.name}-error` : undefined}>
                <legend className="mb-3 text-xs font-bold text-[#102A1E]">
                  {field.label}{field.required ? " *" : ""}
                </legend>
                <div className={`grid gap-3 ${field.columns === 1 ? "" : "sm:grid-cols-2"}`}>
                  {options(field).map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 rounded-xl border border-[#DCE7DE] bg-[#FAFCFA] p-3 text-sm">
                      <input type="checkbox" name={field.name} value={opt.value} className="accent-[#23A455]" />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {error && <p id={`${field.name}-error`} role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
              </fieldset>
            );
          }

          return (
            <FieldShell
              key={field.name}
              id={field.name}
              label={field.label}
              required={field.required}
              hint={field.hint}
              error={error}
              className={wrapper}
            >
              {field.kind === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={field.rows ?? 4}
                  maxLength={field.maxLength}
                  aria-invalid={!!error}
                  aria-describedby={describedBy(field.name, error, field.hint)}
                  className={`${fieldClass} !h-auto min-h-[145px] py-4`}
                />
              ) : field.kind === "select" ? (
                <div className="relative">
                  <select
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    {...(field.name === "country"
                      ? { value: country, onChange: (event: ChangeEvent<HTMLSelectElement>) => setCountry(event.target.value) }
                      : { defaultValue: "" })}
                    className={`${fieldClass} appearance-none pr-10`}
                    aria-invalid={!!error}
                    aria-describedby={describedBy(field.name, error, field.hint)}
                  >
                    {field.name !== "country" && (
                      <option value="">Select {field.required ? "an option" : "(optional)"}</option>
                    )}
                    {options(field).map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#617166]" />
                </div>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.kind === "url" ? "text" : field.kind}
                  inputMode={field.kind === "url" ? "url" : undefined}
                  placeholder={field.placeholder}
                  required={field.required}
                  autoComplete={field.autoComplete}
                  maxLength={field.maxLength ?? 160}
                  aria-invalid={!!error}
                  aria-describedby={describedBy(field.name, error, field.hint)}
                  className={fieldClass}
                />
              )}
            </FieldShell>
          );
        })}
      </div>

      {/* Real honeypot, off-screen and inaccessible to keyboard navigation. */}
      <div className="absolute -left-[10000px] -top-[10000px]" aria-hidden="true">
        <label htmlFor={`${formName}-website-confirm`}>Leave this field empty</label>
        <input
          id={`${formName}-website-confirm`}
          name="website_url_confirm"
          type="text"
          autoComplete="off"
          tabIndex={-1}
        />
      </div>

      <div className="space-y-4 border-t border-[#E5EDE6] pt-6">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-bold text-[#102A1E]">
            <ShieldCheck size={16} className="text-[#16893F]" /> Security verification
          </p>
          <RecaptchaV2 ref={captchaRef} onChange={onCaptcha} onError={onCaptchaError} />
          {captchaError && <p role="alert" className="mt-2 text-xs text-red-600">{captchaError}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#23A455] px-7 text-sm font-extrabold text-white transition-colors hover:bg-[#16893F] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {loading ? (
            <><LoaderCircle size={19} className="animate-spin" /> Submitting…</>
          ) : (
            <>{submitLabel} <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></>
          )}
        </button>
        <p className="text-center text-[11px] text-[#829387]">
          * Required fields. Complete security verification before submitting.
        </p>
      </div>
    </form>
  );
}
