"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, setPasswordAction, requestResetAction, type FormState } from "@/app/admin/actions";
import { aInput, aBtnPrimary } from "./ui";

function Msg({ state }: { state: FormState }) {
  if (!state?.error && !state?.ok) return null;
  return (
    <p role={state.error ? "alert" : "status"} className={`rounded-lg px-3 py-2 text-sm font-semibold ${state.error ? "bg-danger/5 text-danger" : "bg-brand-green/5 text-brand-green"}`}>
      {state.error ?? state.ok}
    </p>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="grid gap-4">
      <Msg state={state} />
      <input type="hidden" name="next" value={next ?? "/admin/"} />
      <label className="grid gap-1.5 text-sm font-semibold text-ink">
        Email
        <input name="email" type="email" required autoComplete="username" className={aInput} />
      </label>
      <label className="grid gap-1.5 text-sm font-semibold text-ink">
        Password
        <input name="password" type="password" required autoComplete="current-password" className={aInput} />
      </label>
      {state?.mfa ? (
        <label className="grid gap-1.5 text-sm font-semibold text-ink">
          Authenticator code
          <input name="totp" inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="one-time-code" autoFocus className={aInput} />
        </label>
      ) : null}
      <button className={`${aBtnPrimary} h-11`} disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      <Link href="/admin/forgot-password/" className="text-center text-sm text-ink-muted hover:text-brand-green">Forgot password?</Link>
    </form>
  );
}

export function SetPasswordForm({ token, kind }: { token: string; kind: "invite" | "reset" }) {
  const [state, action, pending] = useActionState(setPasswordAction, null);
  if (state?.ok) {
    return (
      <div className="grid gap-4">
        <Msg state={state} />
        <Link href="/admin/login/" className={`${aBtnPrimary} h-11`}>Go to sign in</Link>
      </div>
    );
  }
  return (
    <form action={action} className="grid gap-4">
      <Msg state={state} />
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="kind" value={kind} />
      <label className="grid gap-1.5 text-sm font-semibold text-ink">
        New password
        <input name="password" type="password" required minLength={12} autoComplete="new-password" className={aInput} />
        <span className="text-xs font-normal text-ink-muted">At least 12 characters with upper- and lower-case letters and a number.</span>
      </label>
      <label className="grid gap-1.5 text-sm font-semibold text-ink">
        Confirm password
        <input name="confirm" type="password" required autoComplete="new-password" className={aInput} />
      </label>
      <button className={`${aBtnPrimary} h-11`} disabled={pending}>{pending ? "Saving…" : "Set password"}</button>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestResetAction, null);
  return (
    <form action={action} className="grid gap-4">
      <Msg state={state} />
      <label className="grid gap-1.5 text-sm font-semibold text-ink">
        Email
        <input name="email" type="email" required autoComplete="username" className={aInput} />
      </label>
      <button className={`${aBtnPrimary} h-11`} disabled={pending}>{pending ? "Sending…" : "Email me a reset link"}</button>
      <Link href="/admin/login/" className="text-center text-sm text-ink-muted hover:text-brand-green">Back to sign in</Link>
    </form>
  );
}
