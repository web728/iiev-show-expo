
"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import {
  COUNTRIES,
  INDIAN_STATES,
} from "@/config/options";
import {
  getAttribution,
  track,
  type AnalyticsEvent,
} from "@/lib/analytics/client";
import {
  ConsentBlock,
  FieldShell,
  describedBy,
  inputCls,
} from "./fields";

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
      options:
        | readonly string[]
        | readonly { value: string; label: string }[];
      hint?: string;
      half?: boolean;
    }
  | {
      kind: "checkboxes";
      name: string;
      label: string;
      required?: boolean;
      options:
        | readonly string[]
        | readonly { value: string; label: string }[];
      hint?: string;
      columns?: 1 | 2;
    }
  | { kind: "location" }
  | { kind: "heading"; label: string; text?: string };

export type SuccessData = {
  ref?: string;
  message?: string;
  badgeAccess?: string;
  status?: string;
  [key: string]: unknown;
};

type Props = {
  endpoint: string;
  fields: FieldDef[];
  submitLabel: string;
  consentPurpose: string;
  formName: string;
  startEvent?: AnalyticsEvent;
  submitEvent?: AnalyticsEvent;
  renderSuccess?: (data: SuccessData) => ReactNode;
  minimal?: boolean;
};

type State =
  | { phase: "idle" | "submitting" }
  | {
      phase: "error";
      message: string;
      fieldErrors: Record<string, string>;
    }
  | { phase: "success"; data: SuccessData };

type SelectField = Extract<
  FieldDef,
  { kind: "select" | "checkboxes" }
>;

function getOptions(field: SelectField) {
  return field.options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option }
      : option
  );
}

function createKey() {
  if (
    typeof crypto !== "undefined" &&
    "randomUUID" in crypto
  ) {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2)
  );
}

function SelectControl({
  id,
  name,
  options,
  required,
  defaultValue,
  autoComplete,
  error,
  hint,
}: {
  id: string;
  name: string;
  options: ReturnType<typeof getOptions>;
  required?: boolean;
  defaultValue?: string;
  autoComplete?: string;
  error?: string;
  hint?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={`${inputCls} cursor-pointer appearance-none pr-12`}
      >
        {defaultValue !== "India" && (
          <option value="">
            {required ? "Select an option" : "Select (optional)"}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={17}
        strokeWidth={2}
        aria-hidden="true"
        className="pointer-events-none absolute right-[17px] top-1/2 -translate-y-1/2 text-[#698471]"
      />
    </div>
  );
}

export function SmartForm({
  endpoint,
  fields,
  submitLabel,
  consentPurpose,
  formName,
  startEvent,
  submitEvent,
  renderSuccess,
  minimal = false,
}: Props) {
  const formId = useId().replace(/:/g, "");

  const [state, setState] = useState<State>({
    phase: "idle",
  });
  const [country, setCountry] = useState("India");

  const keyRef = useRef("");
  const startedAt = useRef(0);
  const startedRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    keyRef.current = createKey();
    startedAt.current = Date.now();
  }, []);

  const submitting = state.phase === "submitting";
  const fieldErrors =
    state.phase === "error"
      ? state.fieldErrors
      : {};

  function onFirstInput() {
    if (!startedRef.current && startEvent) {
      startedRef.current = true;
      track(startEvent, { form: formName });
    }
  }

  async function onSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) return;

    const form = event.currentTarget;

    // Native validation for minimal visitor/exhibitor forms.
    if (minimal && !form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    const payload: Record<string, unknown> = {};

    for (const field of fields) {
      if (field.kind === "heading") continue;

      if (field.kind === "location") {
        payload.country = String(
          formData.get("country") ?? ""
        ).trim();

        payload.state =
          String(formData.get("state") ?? "").trim() ||
          undefined;

        payload.city = String(
          formData.get("city") ?? ""
        ).trim();

        continue;
      }

      if (field.kind === "checkboxes") {
        payload[field.name] = formData
          .getAll(field.name)
          .map(String);
      } else {
        const value = String(
          formData.get(field.name) ?? ""
        ).trim();

        payload[field.name] =
          value === "" ? undefined : value;
      }
    }

    // Preserve the backend's existing privacy flags.
    // Minimal mode displays a submission privacy notice.
    payload.privacyAccepted = minimal
      ? true
      : formData.get("privacyAccepted") === "on";

    payload.marketingOptIn = minimal
      ? false
      : formData.get("marketingOptIn") === "on";

    payload.idempotencyKey =
      keyRef.current || createKey();

    payload.website_url_confirm = String(
      formData.get("website_url_confirm") ?? ""
    );

    payload.startedAt =
      startedAt.current || Date.now();

    payload.attribution = getAttribution();

    setState({ phase: "submitting" });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response
        .json()
        .catch(() => ({}));

      if (response.ok && data.ok) {
        if (submitEvent) {
          track(submitEvent, { form: formName });
        }

        setState({
          phase: "success",
          data,
        });

        requestAnimationFrame(() => {
          successRef.current?.focus();
        });

        return;
      }

      const errors: Record<string, string> =
        data.fieldErrors ?? {};

      setState({
        phase: "error",
        message:
          data.message ||
          "Please check your details and try again.",
        fieldErrors: errors,
      });

      requestAnimationFrame(() => {
        const firstName = Object.keys(errors)[0];
        const matchingInput = firstName
          ? Array.from(form.elements).find(
              (element) =>
                element instanceof HTMLInputElement ||
                element instanceof HTMLTextAreaElement ||
                element instanceof HTMLSelectElement
                  ? element.name === firstName
                  : false
            )
          : undefined;

        if (matchingInput instanceof HTMLElement) {
          matchingInput.focus();
        } else {
          errorRef.current?.focus();
        }
      });
    } catch {
      setState({
        phase: "error",
        message:
          "Unable to connect. Your details are still here. Please try again.",
        fieldErrors: {},
      });

      requestAnimationFrame(() => {
        errorRef.current?.focus();
      });
    }
  }

  /* ---------- SUCCESS ---------- */

  if (state.phase === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="rounded-[20px] border border-[#CFE8D6] bg-[#F3FBF5] p-7 outline-none sm:p-10"
      >
        {renderSuccess ? (
          renderSuccess(state.data)
        ) : (
          <>
            <span className="flex size-14 items-center justify-center rounded-full bg-[#23A455] text-white">
              <Check size={28} strokeWidth={2.5} />
            </span>

            <h2 className="mt-6 text-2xl font-extrabold tracking-[-0.04em] text-[#102A1E]">
              Enquiry Received
            </h2>

            <p className="mt-3 text-[14px] leading-7 text-[#526357]">
              {state.data.message ??
                "Your enquiry has been submitted successfully."}
            </p>

            {state.data.ref && (
              <div className="mt-6 rounded-xl border border-[#DCE8DF] bg-white px-5 py-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#71907B]">
                  Reference Number
                </p>
                <p className="mt-2 break-all font-mono text-lg font-bold text-[#102A1E]">
                  {state.data.ref}
                </p>
              </div>
            )}

            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-2 text-[13px] font-bold text-[#16893F]"
            >
              Back to Home
              <ArrowRight size={17} />
            </Link>
          </>
        )}
      </div>
    );
  }

  /* ---------- FORM ---------- */

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onInput={onFirstInput}
      noValidate
      aria-describedby={
        state.phase === "error"
          ? `${formId}-error-summary`
          : undefined
      }
      className="w-full min-w-0"
    >
      {state.phase === "error" && (
        <div
          ref={errorRef}
          id={`${formId}-error-summary`}
          tabIndex={-1}
          role="alert"
          className="mb-8 rounded-xl border border-red-200 bg-red-50 p-5 outline-none"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-red-600"
              aria-hidden="true"
            />

            <div>
              <p className="text-[13px] font-bold text-red-700">
                {state.message}
              </p>

              {Object.keys(fieldErrors).length > 0 && (
                <ul className="mt-2 list-disc pl-4 text-[12px] leading-6 text-red-600">
                  {Object.entries(fieldErrors).map(
                    ([field, message]) => (
                      <li key={field}>
                        {message}
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden spam prevention, not a visible field */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <input
          name="website_url_confirm"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Exactly the fields supplied in configs.ts */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-[26px] sm:grid-cols-2">
        {fields.map((field, index) => {
          if (field.kind === "heading") {
            return (
              <div
                key={`heading-${index}`}
                className="border-t border-[#E6EEE8] pt-6 first:border-0 first:pt-0 sm:col-span-2"
              >
                <h3 className="text-[15px] font-extrabold tracking-tight text-[#102A1E]">
                  {field.label}
                </h3>

                {field.text && (
                  <p className="mt-2 text-[12px] leading-6 text-[#718074]">
                    {field.text}
                  </p>
                )}
              </div>
            );
          }

          if (field.kind === "location") {
            return (
              <div
                key={`location-${index}`}
                className="grid gap-5 sm:col-span-2 sm:grid-cols-3"
              >
                <FieldShell
                  id="country"
                  label="Country"
                  required
                  error={fieldErrors.country}
                >
                  <div className="relative">
                    <select
                      id="country"
                      name="country"
                      value={country}
                      onChange={(event) =>
                        setCountry(event.target.value)
                      }
                      className={`${inputCls} cursor-pointer appearance-none pr-12`}
                    >
                      {COUNTRIES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#698471]"
                    />
                  </div>
                </FieldShell>

                <FieldShell
                  id="state"
                  label={
                    country === "India"
                      ? "State / UT"
                      : "State / Region"
                  }
                  required={country === "India"}
                  error={fieldErrors.state}
                >
                  {country === "India" ? (
                    <SelectControl
                      id="state"
                      name="state"
                      required
                      options={INDIAN_STATES.map(
                        (item) => ({
                          value: item,
                          label: item,
                        })
                      )}
                      error={fieldErrors.state}
                    />
                  ) : (
                    <input
                      id="state"
                      name="state"
                      autoComplete="address-level1"
                      className={inputCls}
                    />
                  )}
                </FieldShell>

                <FieldShell
                  id="city"
                  label="City"
                  required
                  error={fieldErrors.city}
                >
                  <input
                    id="city"
                    name="city"
                    required
                    maxLength={80}
                    autoComplete="address-level2"
                    className={inputCls}
                  />
                </FieldShell>
              </div>
            );
          }

          const error = fieldErrors[field.name];

          const common = {
            id: field.name,
            name: field.name,
            required: Boolean(field.required),
            "aria-invalid": Boolean(error),
            "aria-describedby": describedBy(
              field.name,
              error,
              field.hint
            ),
          };

          if (field.kind === "textarea") {
            return (
              <FieldShell
                key={field.name}
                id={field.name}
                label={field.label}
                required={field.required}
                hint={field.hint}
                error={error}
                className="sm:col-span-2"
              >
                <textarea
                  {...common}
                  rows={field.rows ?? 4}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  className={`${inputCls} !h-auto min-h-[150px] resize-y py-4 leading-7`}
                />
              </FieldShell>
            );
          }

          if (field.kind === "select") {
            return (
              <FieldShell
                key={field.name}
                id={field.name}
                label={field.label}
                required={field.required}
                hint={field.hint}
                error={error}
                className={
                  field.half === false
                    ? "sm:col-span-2"
                    : minimal
                      ? ""
                      : field.half
                        ? ""
                        : "sm:col-span-2"
                }
              >
                <SelectControl
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  options={getOptions(field)}
                  defaultValue={
                    field.name === "country"
                      ? "India"
                      : ""
                  }
                  autoComplete={
                    field.name === "country"
                      ? "country-name"
                      : undefined
                  }
                  error={error}
                  hint={field.hint}
                />
              </FieldShell>
            );
          }

          if (field.kind === "checkboxes") {
            return (
              <fieldset
                key={field.name}
                className="sm:col-span-2"
                aria-describedby={describedBy(
                  field.name,
                  error,
                  field.hint
                )}
              >
                <legend className="mb-3 text-[12px] font-extrabold text-[#102A1E]">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  )}
                </legend>

                <div
                  className={`grid gap-2 ${
                    field.columns === 1
                      ? ""
                      : "sm:grid-cols-2"
                  }`}
                >
                  {getOptions(field).map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#DCE6DE] bg-[#FAFCFA] px-4 py-3 text-[12px] font-medium text-[#405548] transition-colors has-[:checked]:border-[#23A455] has-[:checked]:bg-[#EDF8F0]"
                    >
                      <input
                        type="checkbox"
                        name={field.name}
                        value={option.value}
                        className="size-4 accent-[#23A455]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>

                {error && (
                  <p
                    id={`${field.name}-error`}
                    role="alert"
                    className="mt-2 text-xs text-red-600"
                  >
                    {error}
                  </p>
                )}
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
              className={
                field.half === false
                  ? "sm:col-span-2"
                  : ""
              }
            >
              <input
                {...common}
                type={field.kind}
                inputMode={
                  field.kind === "email"
                    ? "email"
                    : field.kind === "tel"
                      ? "tel"
                      : undefined
                }
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                maxLength={field.maxLength ?? 160}
                className={inputCls}
              />
            </FieldShell>
          );
        })}
      </div>

      {/* SUBMISSION FOOTER */}
      <div className="mt-9 border-t border-[#E4ECE5] pt-7">
        {minimal ? (
          <div className="mb-6 flex items-start gap-2.5">
            <ShieldCheck
              size={17}
              className="mt-0.5 shrink-0 text-[#16893F]"
              aria-hidden="true"
            />

            <p className="text-[11px] leading-6 text-[#7A897E]">
              By submitting, you acknowledge our{" "}
              <Link
                href="/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#16893F] underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              . Your details will be used to{" "}
              {consentPurpose}.
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <ConsentBlock
              privacyError={fieldErrors.privacyAccepted}
              purpose={consentPurpose}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          aria-disabled={submitting}
          className="group relative flex min-h-[56px] w-full items-center justify-center gap-3 overflow-hidden rounded-[13px] bg-[#23A455] px-7 text-[13px] font-extrabold tracking-[0.025em] text-white shadow-[0_12px_26px_-15px_rgba(35,164,85,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#178F44] hover:shadow-[0_15px_30px_-13px_rgba(35,164,85,0.48)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#16893F] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
        >
          {submitting ? (
            <>
              <LoaderCircle
                size={19}
                className="animate-spin"
                aria-hidden="true"
              />
              Submitting...
            </>
          ) : (
            <>
              {submitLabel}
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              />
            </>
          )}
        </button>

        <p className="mt-4 text-center text-[11px] leading-5 text-[#91A094]">
          Fields marked * are required.
        </p>
      </div>
    </form>
  );
}
