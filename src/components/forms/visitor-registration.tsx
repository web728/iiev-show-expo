"use client";

import { CheckCircle2 } from "lucide-react";
import { SmartForm, type SuccessData } from "./smart-form";
import { visitorFields } from "./configs";

function VisitorSuccess({ data }: { data: SuccessData }) {
  const reference = typeof data.ref === "string"
    ? data.ref
    : typeof data.reference === "string" ? data.reference : "";

  return (
    <div>
      <CheckCircle2 className="size-12 text-[#23A455]" aria-hidden="true" />
      <h2 className="mt-5 text-2xl font-extrabold text-[#102A1E]">
        Registration Received
      </h2>
      <p className="mt-3 text-sm leading-7 text-[#526357]">
        {data.message || "Your visitor registration has been received successfully."}
      </p>
      {reference && (
        <p className="mt-5 rounded-xl bg-white px-5 py-4 text-sm font-bold text-[#102A1E]">
          Registration ID: <span className="font-mono">{reference}</span>
        </p>
      )}
    </div>
  );
}

export function VisitorRegistrationForm() {
  return (
    <SmartForm
      endpoint="/api/visitors/register/"
      formName="visitor_registration"
      fields={visitorFields}
      submitLabel="Register as Visitor"
      startEvent="visitor_registration_started"
      submitEvent="visitor_registration_submitted"
      renderSuccess={(data) => <VisitorSuccess data={data} />}
      minimal
    />
  );
}
