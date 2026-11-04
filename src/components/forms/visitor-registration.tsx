"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SmartForm, type SuccessData } from "./smart-form";
import { visitorFields } from "./configs";
import { Icon } from "@/components/ui/icons";
import { buttonClass } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";

function Success({ data }: { data: SuccessData }) {
  const approved = data.status === "approved" && data.badgeAccess;
  useEffect(() => {
    if (approved) track("badge_issued");
  }, [approved]);
  return (
    <div>
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-brand-green text-white">
        <Icon.Check className="size-6" />
      </span>
      <h2 className="mt-4 text-2xl font-extrabold text-ink">{approved ? "You're registered" : "Registration received"}</h2>
      <p className="mt-2 text-ink-soft">{data.message}</p>
      <p className="mt-4 rounded-xl bg-white px-4 py-3 text-ink">
        Registration ID: <strong className="whitespace-nowrap font-mono text-lg tracking-wide">{data.ref}</strong>
      </p>
      {approved ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a href={`/visit/badge/view/?t=${encodeURIComponent(String(data.badgeAccess))}`} className={buttonClass("primary", "lg")}>
            <Icon.QR className="size-5" /> View my badge
          </a>
          <a href={`/api/badge/pdf/?t=${encodeURIComponent(String(data.badgeAccess))}`} className={buttonClass("outline", "lg")} target="_blank" rel="noopener">
            <Icon.Download className="size-5" /> Download PDF
          </a>
        </div>
      ) : null}
      <p className="mt-6 text-sm text-ink-muted">
        Keep your QR code private — it is your personal entry credential. Lost it later? Use{" "}
        <Link href="/visit/badge/" className="font-semibold text-brand-blue underline underline-offset-2">Retrieve my badge</Link>.
      </p>
    </div>
  );
}

export function VisitorRegistrationForm() {
  return (
    <SmartForm
      endpoint="/api/visitors/register/"
      formName="visitor_registration"
      fields={visitorFields}
      submitLabel="Register"
      consentPurpose="process my visitor registration, issue my entry badge and manage entry at the show"
      startEvent="visitor_registration_started"
      submitEvent="visitor_registration_submitted"
      renderSuccess={(d) => <Success data={d} />}
    />
  );
}
