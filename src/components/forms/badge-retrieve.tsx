"use client";
import { useCallback, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { RecaptchaV2, type RecaptchaHandle } from "./recaptcha-v2";
import { inputCls } from "./fields";

export function BadgeRetrieveForm() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"idle" | "submitting" | "success">("idle");
  const captcha = useRef<RecaptchaHandle>(null);
  const onCaptcha = useCallback((value: string) => { setToken(value); setError(""); }, []);
  const onError = useCallback((message: string) => setError(message), []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phase === "submitting") return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (!token) { setError("Complete the 'I'm not a robot' verification first."); return; }
    setPhase("submitting");
    try {
      const data = new FormData(form);
      const res = await fetch("/api/badge/request/", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(data.get("email") || "").trim(), recaptchaToken: token, website_url_confirm: "" }) });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) throw new Error(result.message || "Unable to process the request");
      setPhase("success");
    } catch (e) {
      setPhase("idle"); setError(e instanceof Error ? e.message : "Please retry"); captcha.current?.reset();
    }
  }
  if (phase === "success") return <div role="status" className="rounded-xl border border-[#CFE8D6] bg-[#F0FAF2] p-6"><CheckCircle2 className="size-9 text-[#23A455]"/><h3 className="mt-4 text-lg font-bold text-[#102A1E]">Check your inbox</h3><p className="mt-2 text-sm text-[#526357]">If your email matches an approved registration, you will receive a secure badge retrieval link.</p></div>;
  return <form onSubmit={submit} className="space-y-5">
    <div><label htmlFor="badge-retrieve-email" className="mb-2 block text-xs font-bold text-[#102A1E]">Registration Email</label><input className={inputCls} id="badge-retrieve-email" name="email" type="email" required autoComplete="email" placeholder="name@example.com"/></div>
    <RecaptchaV2 ref={captcha} onChange={onCaptcha} onError={onError}/>
    {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#23A455] px-5 text-sm font-bold text-white disabled:opacity-55" disabled={phase === "submitting" || !token} type="submit">{phase === "submitting" ? <><LoaderCircle size={17} className="animate-spin"/> Requesting…</> : <>Retrieve Badge <ArrowRight size={17}/></>}</button>
  </form>;
}
