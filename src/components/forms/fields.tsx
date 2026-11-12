"use client";

import type { ReactNode } from "react";

export const inputCls = [
  "block w-full min-h-12 rounded-xl border border-[#DCE7DE]",
  "bg-white px-4 py-3 text-[14px] font-medium text-[#102A1E]",
  "placeholder:text-[#96A79A] outline-none",
  "transition-[border-color,box-shadow] duration-200",
  "hover:border-[#AACAB3] focus:border-[#23A455]",
  "focus:ring-[3px] focus:ring-[#23A455]/15",
  "disabled:cursor-not-allowed disabled:bg-[#F5F8F5]",
  "aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/15",
].join(" ");

export function FieldShell({ id, label, required = false, hint, error, children, className = "" }: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>
    <label htmlFor={id} className="mb-2 block text-[13px] font-bold text-[#102A1E]">
      {label}{required ? <span aria-hidden="true" className="ml-1 text-red-500">*</span> :
        <span className="ml-2 text-[11px] font-normal text-[#839386]">(optional)</span>}
    </label>
    {children}
    {hint && !error && <p id={`${id}-hint`} className="mt-2 text-[11px] leading-5 text-[#718074]">{hint}</p>}
    {error && <p id={`${id}-error`} role="alert" className="mt-2 text-[12px] font-semibold text-red-600">{error}</p>}
  </div>;
}

export function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

/** Informational only. Does not create or imply checkbox consent. */
export function ConsentBlock({ privacyError, purpose }: { privacyError?: string; purpose: string }) {
  return <div className="rounded-xl border border-[#DCE7DE] bg-[#F7FAF7] p-4 text-sm text-[#526357]">
    Submitted information will be used to {purpose}.
    {privacyError && <p role="alert" className="mt-2 text-xs text-red-600">{privacyError}</p>}
  </div>;
}
