"use client";

import { useState, type FormEvent } from "react";
import { buttonClass } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { FieldShell, inputCls } from "./fields";

export function BadgeRetrieveForm() {
  const [state, setState] = useState<{ phase: "idle" | "sending" | "done" | "error"; message?: string; fieldError?: string }>({ phase: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState({ phase: "sending" });
    try {
      const res = await fetch("/api/badge/request/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fd.get("email"), website_url_confirm: fd.get("website_url_confirm") || "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) setState({ phase: "done", message: data.message });
      else setState({ phase: "error", message: data.message || "Please try again.", fieldError: data.fieldErrors?.email });
    } catch {
      setState({ phase: "error", message: "Network problem — please try again." });
    }
  }

  if (state.phase === "done") {
    return (
      <div role="status" className="rounded-2xl border border-brand-green/30 bg-brand-green/5 p-6">
        <p className="flex items-center gap-2 font-bold text-ink"><Icon.Mail className="size-5 text-brand-green" /> Check your inbox</p>
        <p className="mt-2 text-ink-soft">{state.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      {state.phase === "error" ? <p role="alert" className="rounded-xl border border-danger/40 bg-danger/5 p-3 text-sm font-semibold text-danger">{state.message}</p> : null}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input name="website_url_confirm" tabIndex={-1} autoComplete="off" />
      </div>
      <FieldShell id="email" label="Email you registered with" required error={state.fieldError}>
        <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" className={inputCls} aria-invalid={Boolean(state.fieldError)} />
      </FieldShell>
      <button type="submit" className={buttonClass("primary", "lg", "justify-self-start")} disabled={state.phase === "sending"}>
        {state.phase === "sending" ? "Sending…" : "Email me a secure link"}
      </button>
      <p className="text-[13px] text-ink-muted">For your privacy we never display badge details on this page — the link goes only to the registered inbox.</p>
    </form>
  );
}
