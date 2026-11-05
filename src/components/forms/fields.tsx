
"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export const inputCls = [
  "block w-full min-h-12",
  "rounded-xl border border-[#DCE7DE]",
  "bg-white px-4 py-3",
  "text-[14px] font-medium text-[#102A1E]",
  "placeholder:text-[#96A79A]",
  "outline-none",
  "transition-[border-color,box-shadow] duration-200",
  "hover:border-[#AACAB3]",
  "focus:border-[#23A455]",
  "focus:ring-[3px] focus:ring-[#23A455]/15",
  "disabled:cursor-not-allowed disabled:bg-[#F5F8F5]",
  "aria-[invalid=true]:border-red-500",
  "aria-[invalid=true]:focus:ring-red-500/15",
].join(" ");

export function FieldShell({
  id,
  label,
  required,
  hint,
  error,
  children,
  className = "",
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-2 block text-[13px] font-bold text-[#102A1E]"
      >
        {label}

        {required ? (
          <span
            aria-hidden="true"
            className="ml-1 text-red-500"
          >
            *
          </span>
        ) : (
          <span className="ml-2 text-[11px] font-normal text-[#839386]">
            (optional)
          </span>
        )}
      </label>

      {children}

      {hint && !error && (
        <p
          id={`${id}-hint`}
          className="mt-2 text-[11px] leading-5 text-[#718074]"
        >
          {hint}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-[12px] font-semibold leading-5 text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(
  id: string,
  error?: string,
  hint?: string
) {
  return error
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined;
}

/*
  Retained for other forms.
  Exhibitor and Visitor minimal mode
  does not render this component.
*/
export function ConsentBlock({
  privacyError,
  purpose,
}: {
  privacyError?: string;
  purpose: string;
}) {
  return (
    <fieldset className="rounded-2xl border border-[#DCE7DE] bg-[#F7FAF7] p-5">
      <legend className="sr-only">
        Privacy and communication preferences
      </legend>
 

      {privacyError && (
        <p
          id="privacyAccepted-error"
          role="alert"
          className="mt-2 pl-8 text-xs font-semibold text-red-600"
        >
          {privacyError}
        </p>
      )}

      <div className="mt-5 flex items-start gap-3 border-t border-[#E2EAE4] pt-5">
        <input
          id="marketingOptIn"
          name="marketingOptIn"
          type="checkbox"
          className="mt-1 size-5 shrink-0 accent-[#23A455]"
        />

        <label
          htmlFor="marketingOptIn"
          className="text-[13px] leading-6 text-[#526357]"
        >
          Optional: send me occasional updates
          about the India International EV Show.
        </label>
      </div>
    </fieldset>
  );
}
