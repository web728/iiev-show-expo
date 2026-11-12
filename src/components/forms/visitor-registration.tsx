"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CheckCircle2, Download, QrCode } from "lucide-react";
import { SmartForm, type SuccessData } from "./smart-form";
import { visitorFields } from "./configs";
import { track } from "@/lib/analytics/client";

function VisitorSuccess({ data }: { data: SuccessData }) {
  const approved = (data.status === "approved" || data.status === "checked_in");
  const hasBadge = approved && typeof data.badgeAccess === "string" && data.badgeAccess.length > 0;
  const trackedRef = useRef(false);
  useEffect(() => {
    if (hasBadge && !trackedRef.current) {
      trackedRef.current = true;
      track("badge_issued");
    }
  }, [hasBadge]);

  return <div>
    <CheckCircle2 className="size-12 text-[#23A455]" aria-hidden="true" />
    <h2 className="mt-5 text-2xl font-extrabold text-[#102A1E]">
      {hasBadge ? "Registration Successful" : "Registration Received"}
    </h2>
    <p className="mt-3 text-sm leading-7 text-[#526357]">
      {data.message || "Your registration has been received."}
    </p>
    {(data.ref || data.reference) && <p className="mt-5 rounded-xl bg-white px-5 py-4 text-sm font-bold text-[#102A1E]">
      Registration ID: <span className="font-mono">{data.ref || data.reference}</span>
    </p>}
    {hasBadge && <div className="mt-6 flex flex-wrap gap-3">
      <a href={`/visit/badge/view/?t=${encodeURIComponent(data.badgeAccess!)}`}
        className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#23A455] px-5 text-sm font-bold text-white">
        <QrCode size={17} /> View My Badge
      </a>
      <a href={`/api/badge/pdf/?t=${encodeURIComponent(data.badgeAccess!)}`}
        target="_blank" rel="noopener noreferrer"
        className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#CEE0D2] bg-white px-5 text-sm font-bold text-[#102A1E]">
        <Download size={17} /> Download Badge PDF
      </a>
    </div>}
    <p className="mt-5 text-xs leading-6 text-[#647468]">
      Keep your badge QR private. <Link href="/visit/badge/"
        className="font-bold text-[#16893F] underline underline-offset-2">Retrieve your badge later</Link>.
    </p>
  </div>;
}

export function VisitorRegistrationForm() {
  return <SmartForm endpoint="/api/visitors/register/" formName="visitor_registration"
    fields={visitorFields} submitLabel="Register as Visitor"
    startEvent="visitor_registration_started"
    submitEvent="visitor_registration_submitted"
    renderSuccess={(data) => <VisitorSuccess data={data} />}
    minimal />;
}
