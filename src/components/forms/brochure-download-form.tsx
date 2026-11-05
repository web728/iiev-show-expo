"use client";

import { useEffect } from "react";
import { ArrowDownToLine, CheckCircle2 } from "lucide-react";
import { SmartForm, type FieldDef, type SuccessData } from "./smart-form";

const brochureFields: FieldDef[] = [
  { kind: "text", name: "fullName", label: "Full Name", required: true, autoComplete: "name", placeholder: "Your full name" },
  { kind: "text", name: "company", label: "Company / Organisation", required: true, autoComplete: "organization", placeholder: "Company or organisation" },
  { kind: "email", name: "email", label: "Business Email", required: true, autoComplete: "email", placeholder: "name@company.com" },
  { kind: "tel", name: "phone", label: "Mobile / WhatsApp", required: true, autoComplete: "tel", placeholder: "+91 98765 43210" },
];

function BrochureSuccess({ data }: { data: SuccessData }) {
  const url = typeof data.url === "string" && data.url.startsWith("/api/downloads/brochure/") ? data.url : null;
  useEffect(() => { if (url) window.location.assign(url); }, [url]);
  return <div>
    <CheckCircle2 size={48} className="text-[#23A455]" aria-hidden="true"/>
    <h3 className="mt-5 text-xl font-extrabold text-[#102A1E]">Brochure Ready</h3>
    <p className="mt-2 text-sm leading-7 text-[#526357]">Your details have been recorded. The brochure download should begin automatically.</p>
    {url && <a href={url} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#23A455] px-6 text-sm font-bold text-white"><ArrowDownToLine size={18}/> Download Brochure</a>}
  </div>;
}

export function BrochureDownloadForm() {
  return <SmartForm endpoint="/api/downloads/brochure/" formName="brochure" fields={brochureFields}
    submitLabel="Submit & Download Brochure" consentPurpose="process your brochure request"
    renderSuccess={(data) => <BrochureSuccess data={data} />} minimal/>;
}
