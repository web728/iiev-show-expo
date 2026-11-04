"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonClass } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error.digest ?? "client-error");
  }, [error]);
  return (
    <main id="main" className="flex min-h-[70dvh] items-center bg-white">
      <div className="container-site py-20 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-green">Something went wrong</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">This page couldn&apos;t load</h1>
        <p className="mx-auto mt-3 max-w-lg text-ink-soft">Please try again. If you were submitting a form, nothing was lost — you can safely resubmit.</p>
        {error.digest ? <p className="mt-2 font-mono text-xs text-ink-muted">Reference: {error.digest}</p> : null}
        <div className="mt-8 flex justify-center gap-3">
          <button type="button" onClick={reset} className={buttonClass("primary")}>Try again</button>
          <Link href="/" className={buttonClass("outline")}>Home</Link>
        </div>
      </div>
    </main>
  );
}
