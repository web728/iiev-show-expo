"use client";



import Link from "next/link";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { AlertCircle, ArrowRight, CheckCircle2, ChevronDown, LoaderCircle, ShieldCheck } from "lucide-react";

import { COUNTRIES, INDIAN_STATES } from "@/config/options";

import { getAttribution, track, type AnalyticsEvent } from "@/lib/analytics/client";

import { FieldShell, inputCls, describedBy } from "./fields";

import { RecaptchaV2, type RecaptchaHandle } from "./recaptcha-v2";



export type FieldDef =

  | { kind: "text" | "email" | "tel" | "url"; name: string; label: string; required?: boolean; autoComplete?: string; hint?: string; placeholder?: string; half?: boolean; maxLength?: number }

  | { kind: "textarea"; name: string; label: string; required?: boolean; hint?: string; placeholder?: string; rows?: number; maxLength?: number }

  | { kind: "select"; name: string; label: string; required?: boolean; options: readonly string[] | readonly { value: string; label: string }[]; hint?: string; half?: boolean }

  | { kind: "checkboxes"; name: string; label: string; required?: boolean; options: readonly string[] | readonly { value: string; label: string }[]; hint?: string; columns?: 1 | 2 }

  | { kind: "location" }

  | { kind: "heading"; label: string; text?: string };

export type SuccessData = { ref?: string; status?: string; badgeAccess?: string; message?: string; [key: string]: unknown };

type Props = { endpoint: string; fields: FieldDef[]; submitLabel: string; consentPurpose: string; formName: string;

  startEvent?: AnalyticsEvent; submitEvent?: AnalyticsEvent; renderSuccess?: (data: SuccessData) => ReactNode; minimal?: boolean };

type FormStatus = { phase: "idle" | "submitting" } | { phase: "success"; data: SuccessData } |

  { phase: "error"; message: string; fieldErrors: Record<string, string> };

function options(f: Extract<FieldDef, { kind: "select" | "checkboxes" }>) {

  return f.options.map((v) => typeof v === "string" ? { value: v, label: v } : v);

}

const fieldClass = `${inputCls} w-full`;



export function SmartForm({ endpoint, fields, submitLabel, consentPurpose, formName, startEvent, submitEvent, renderSuccess, minimal = false }: Props) {

  const [status, setStatus] = useState<FormStatus>({ phase: "idle" });

  const [country, setCountry] = useState("India");

  const [captchaToken, setCaptchaToken] = useState("");

  const [captchaError, setCaptchaError] = useState("");

  const [restoring, setRestoring] = useState(true);

  const [draftState, setDraftState] = useState<"idle" | "saving" | "saved" | "failed">("idle");

  const formRef = useRef<HTMLFormElement>(null);

  const captchaRef = useRef<RecaptchaHandle>(null);

  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const keyRef = useRef("");

  const beganAt = useRef(0);

  const begun = useRef(false);

  const submitted = useRef(false);

  const busy = useRef(false);
  const pendingRestore = useRef<Record<string, unknown> | null>(null);



  useEffect(() => {

    const sessionKey = `iiev-form-key:${formName}`;

    const prior = window.sessionStorage.getItem(sessionKey);

    const key = prior && /^[0-9a-f-]{36}$/i.test(prior) ? prior : crypto.randomUUID();

    window.sessionStorage.setItem(sessionKey, key);

    keyRef.current = key;

    beganAt.current = Date.now();

    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };

  }, [formName]);



  // Drafts stay on this device; nothing is posted to the draft API.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`iiev-local-draft:${formName}`);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const item = parsed as { savedAt?: unknown; data?: unknown };
          if (typeof item.savedAt === "number" && Date.now() - item.savedAt <= 7 * 86400_000 &&
              item.data && typeof item.data === "object" && !Array.isArray(item.data)) {
            pendingRestore.current = item.data as Record<string, unknown>;
            const previousCountry = pendingRestore.current.country;
            if (typeof previousCountry === "string" && COUNTRIES.includes(previousCountry as typeof COUNTRIES[number])) {
              setCountry(previousCountry);
            }
          } else {
            window.localStorage.removeItem(`iiev-local-draft:${formName}`);
          }
        }
      }
    } catch { /* Storage may be disabled by the browser. */ }
    setRestoring(false);
  }, [formName]);

  useEffect(() => {
    if (restoring || !formRef.current || !pendingRestore.current) return;
    const saved = pendingRestore.current;
    const form = formRef.current;
    for (const f of fields) {
      if (f.kind === "heading") continue;
      const names = f.kind === "location" ? ["country", "state", "city"] : [f.name];
      for (const name of names) {
        if (name === "country") continue; // Controlled by React state.
        const value = saved[name];
        if (typeof value !== "string" && !Array.isArray(value)) continue;
        const controls = Array.from(form.elements).filter(
          (el): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
            (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) && el.name === name
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
    pendingRestore.current = null;
    setDraftState("saved");
  }, [country, fields, restoring]);

  const onCaptcha = useCallback((token: string) => { setCaptchaToken(token); setCaptchaError(""); }, []);

  const onCaptchaError = useCallback((message: string) => setCaptchaError(message), []);

  const fieldErrors = status.phase === "error" ? status.fieldErrors : {};

  const loading = status.phase === "submitting";



  const collect = useCallback(() => {

    const fd = new FormData(formRef.current!);

    const data: Record<string, unknown> = {};

    for (const f of fields) {

      if (f.kind === "heading") continue;

      if (f.kind === "location") {

        data.country = String(fd.get("country") ?? "").trim();

        data.city = String(fd.get("city") ?? "").trim();

        data.state = String(fd.get("state") ?? "").trim();

      } else if (f.kind === "checkboxes") {

        data[f.name] = fd.getAll(f.name).map(String);

      } else {

        const value = String(fd.get(f.name) ?? "").trim();

        data[f.name] = value || undefined;

      }

    }

    return data;

  }, [fields]);



  const saveDraft = useCallback(() => {
    if (restoring || submitted.current || busy.current || !formRef.current) return;
    const data = collect();
    const hasValue = Object.values(data).some((value) =>
      typeof value === "string" ? value.trim().length > 0 : Array.isArray(value) && value.length > 0
    );
    if (!hasValue) return;
    setDraftState("saving");
    try {
      window.localStorage.setItem(`iiev-local-draft:${formName}`,
        JSON.stringify({ savedAt: Date.now(), data }));
      setDraftState("saved");
    } catch {
      setDraftState("failed");
    }
  }, [collect, formName, restoring]);

  function scheduleSave() {

    if (draftTimer.current) clearTimeout(draftTimer.current);

    if (submitted.current || restoring) return;

    draftTimer.current = setTimeout(() => { void saveDraft(); }, 1300);

  }



  function firstInput() {

    if (!begun.current) {

      begun.current = true;

      if (startEvent) track(startEvent, { form: formName });

    }

    scheduleSave();

  }



  async function submit(e: FormEvent<HTMLFormElement>) {

    e.preventDefault();

    if (busy.current) return;

    const form = e.currentTarget;

    if (!form.reportValidity()) return;

    

    if (!captchaToken) { setCaptchaError("Please verify that you're not a robot."); return; }

    if (draftTimer.current) clearTimeout(draftTimer.current);

    busy.current = true;

    setStatus({ phase: "submitting" });

    try {

      const payload = {

        ...collect(), privacyAccepted: false, marketingOptIn: false,

        idempotencyKey: keyRef.current || crypto.randomUUID(),

        website_url_confirm: "", startedAt: beganAt.current || Date.now(),

        attribution: getAttribution(), recaptchaToken: captchaToken,

      };

      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

      const result = await response.json().catch(() => ({})) as { ok?: boolean; message?: string; fieldErrors?: Record<string, string>; code?: string; ref?: string };

      if (!response.ok || !result.ok) {

        setStatus({ phase: "error", message: result.message || "Unable to submit. Please try again.", fieldErrors: result.fieldErrors || {} });

        captchaRef.current?.reset(); // single-use token, including after server errors

        if (result.code === "RECAPTCHA_FAILED") setCaptchaError("Verification failed or expired. Please verify again.");

        return;

      }

      submitted.current = true;

      window.sessionStorage.removeItem(`iiev-form-key:${formName}`);
        try { window.localStorage.removeItem(`iiev-local-draft:${formName}`); } catch {}

      if (submitEvent) track(submitEvent, { form: formName });

      setStatus({ phase: "success", data: result });

    } catch {

      setStatus({ phase: "error", message: "Connection issue. Your entries are still available; please retry.", fieldErrors: {} });

      captchaRef.current?.reset();

    } finally { busy.current = false; }

  }



  if (status.phase === "success") {

    return <div role="status" aria-live="polite" className="rounded-2xl border border-[#CAE7D2] bg-[#F1FAF3] p-7 sm:p-9">

      {renderSuccess ? renderSuccess(status.data) : <>

        <CheckCircle2 className="size-12 text-[#23A455]" aria-hidden="true" />

        <h2 className="mt-5 text-2xl font-extrabold text-[#102A1E]">Submission Received</h2>

        <p className="mt-3 text-sm leading-7 text-[#526357]">{status.data.message ?? "Your form has been submitted."}</p>

        {status.data.ref && <p className="mt-4 rounded-lg bg-white p-4 text-sm font-bold text-[#102A1E]">Reference: {status.data.ref}</p>}

        <Link href="/" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#16893F]">Home <ArrowRight size={16}/></Link>

      </>}

    </div>;

  }



  return <form ref={formRef} onSubmit={submit} onInput={firstInput} onChange={scheduleSave} className="min-w-0 space-y-7">

    {status.phase === "error" && <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

      <AlertCircle className="size-5 shrink-0"/><div><p className="font-bold">{status.message}</p>

      {Object.entries(fieldErrors).map(([field, message]) => <p key={field} className="mt-1 text-xs">{field}: {message}</p>)}</div></div>}



    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">

      {fields.map((f, i) => {

        if (f.kind === "heading") return <div key={`h-${i}`} className="sm:col-span-2"><h3 className="text-base font-extrabold text-[#102A1E]">{f.label}</h3>{f.text && <p className="mt-1 text-sm text-[#647468]">{f.text}</p>}</div>;

        if (f.kind === "location") return <div key={`location-${i}`} className="grid gap-5 sm:col-span-2 sm:grid-cols-3">

          <FieldShell id="country" label="Country" required><div className="relative"><select className={`${fieldClass} appearance-none pr-10`} name="country" id="country" value={country} onChange={(e) => setCountry(e.target.value)} required>{COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#617166]"/></div></FieldShell>

          <FieldShell id="state" label={country === "India" ? "State / UT" : "State / Region"} required={country === "India"}>

            {country === "India" ? <select className={fieldClass} id="state" name="state" required defaultValue=""><option value="">Select State</option>{INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}</select> : <input className={fieldClass} id="state" name="state"/>}

          </FieldShell>

          <FieldShell id="city" label="City" required><input className={fieldClass} id="city" name="city" required/></FieldShell>

        </div>;

        const error = fieldErrors[f.name];

        const wrapper = f.kind === "textarea" || (f.kind !== "checkboxes" && f.half === false) ? "sm:col-span-2" : f.kind === "checkboxes" ? "sm:col-span-2" : !minimal && f.kind === "select" && !f.half ? "sm:col-span-2" : "";

        if (f.kind === "checkboxes") return <fieldset key={f.name} className={wrapper}><legend className="mb-3 text-xs font-bold text-[#102A1E]">{f.label}{f.required ? " *" : ""}</legend><div className={`grid gap-3 ${f.columns === 1 ? "" : "sm:grid-cols-2"}`}>{options(f).map((opt) => <label key={opt.value} className="flex items-center gap-3 rounded-xl border border-[#DCE7DE] bg-[#FAFCFA] p-3 text-sm"><input type="checkbox" name={f.name} value={opt.value} className="accent-[#23A455]"/>{opt.label}</label>)}</div>{error && <p className="mt-2 text-xs text-red-600">{error}</p>}</fieldset>;

        return <FieldShell key={f.name} id={f.name} label={f.label} required={f.required} hint={f.hint} error={error} className={wrapper}>

          {f.kind === "textarea" ? <textarea id={f.name} name={f.name} placeholder={f.placeholder} required={f.required} rows={f.rows ?? 4} maxLength={f.maxLength} aria-invalid={!!error} aria-describedby={describedBy(f.name, error, f.hint)} className={`${fieldClass} !h-auto min-h-[145px] py-4`}/> :

          f.kind === "select" ? <div className="relative"><select id={f.name} name={f.name} required={f.required} defaultValue={f.name === "country" ? "India" : ""} className={`${fieldClass} appearance-none pr-10`} aria-invalid={!!error} aria-describedby={describedBy(f.name, error, f.hint)}>

            {f.name !== "country" && <option value="">Select {f.required ? "an option" : "(optional)"}</option>}

            {options(f).map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}

          </select><ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#617166]"/></div> :

          <input id={f.name} name={f.name} type={f.kind} placeholder={f.placeholder} required={f.required} autoComplete={f.autoComplete} maxLength={f.maxLength ?? 160} aria-invalid={!!error} aria-describedby={describedBy(f.name, error, f.hint)} className={fieldClass}/>

          }

        </FieldShell>;

      })}

    </div>



    <div className="rounded-xl border border-[#DCE7DE] bg-[#F7FAF7] px-4 py-3 text-xs leading-6 text-[#526357]">
      <p>Your progress is saved automatically on this device for up to 7 days. It is not sent to the organiser until you submit the form.</p>
      <p className="mt-1">On submission, your information is used to {consentPurpose}. See the <Link href="/privacy-policy/" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#16893F] underline underline-offset-4">Privacy Policy</Link>.</p>
      <p role="status" className="mt-1 font-semibold text-[#16893F]">{draftState === "saving" ? "Saving progress…" : draftState === "saved" ? "Progress saved on this device." : draftState === "failed" ? "Browser autosave is unavailable." : "Browser autosave is on."}</p>
    </div>

    <div className="space-y-4 border-t border-[#E5EDE6] pt-6">

      <div><p className="mb-3 flex items-center gap-2 text-xs font-bold text-[#102A1E]"><ShieldCheck size={16} className="text-[#16893F]"/> Security verification</p>

        <RecaptchaV2 ref={captchaRef} onChange={onCaptcha} onError={onCaptchaError}/>

        {captchaError && <p role="alert" className="mt-2 text-xs text-red-600">{captchaError}</p>}

      </div>

      <button type="submit" disabled={loading || !captchaToken} className="group flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#23A455] px-7 text-sm font-extrabold text-white transition-colors hover:bg-[#16893F] disabled:cursor-not-allowed disabled:opacity-55">

        {loading ? <><LoaderCircle size={19} className="animate-spin"/> Submitting…</> : <>{submitLabel} <ArrowRight size={18} className="transition-transform group-hover:translate-x-1"/></>}

      </button>

      <p className="text-center text-[11px] text-[#829387]">* Required fields. Secure verification is required to submit.</p>

    </div>

  </form>;

}
