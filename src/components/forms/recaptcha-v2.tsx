"use client";

import Script from "next/script";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

type RecaptchaApi = {
  render: (node: HTMLElement, config: {
    sitekey: string;
    theme: "light";
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
  }) => number;
  reset: (id: number) => void;
};

declare global {
  interface Window { grecaptcha?: RecaptchaApi }
}

export type RecaptchaHandle = { reset: () => void };

export const RecaptchaV2 = forwardRef<RecaptchaHandle, {
  onChange: (token: string) => void;
  onError?: (message: string) => void;
}>(function RecaptchaV2({ onChange, onError }, ref) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const holder = useRef<HTMLDivElement>(null);
  const widget = useRef<number | null>(null);
  const changeRef = useRef(onChange);
  const errorRef = useRef(onError);
  const [ready, setReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => { changeRef.current = onChange; errorRef.current = onError; }, [onChange, onError]);

  useImperativeHandle(ref, () => ({
    reset() {
      if (widget.current !== null && window.grecaptcha) {
        try { window.grecaptcha.reset(widget.current); } catch { /* script unmounted */ }
      }
      changeRef.current("");
    },
  }), []);

  const renderWidget = useCallback(() => {
    if (!siteKey || !ready || !holder.current || !window.grecaptcha || widget.current !== null) return;
    try {
      widget.current = window.grecaptcha.render(holder.current, {
        sitekey: siteKey,
        theme: "light",
        callback: (token) => changeRef.current(token),
        "expired-callback": () => {
          changeRef.current("");
          errorRef.current?.("Verification expired. Please verify again.");
        },
        "error-callback": () => {
          changeRef.current("");
          errorRef.current?.("Verification failed to load. Please retry.");
        },
      });
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
      errorRef.current?.("Verification widget could not be displayed.");
    }
  }, [ready, siteKey]);

  useEffect(() => { renderWidget(); }, [renderWidget]);

  if (!siteKey) return <p role="alert" className="text-sm text-red-700">reCAPTCHA site key is missing.</p>;

  return (
    <div className="min-w-0 space-y-2">
      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={() => {
          setLoadFailed(true);
          errorRef.current?.("Google verification script was blocked or unavailable.");
        }}
      />
      <div ref={holder} className="max-w-full overflow-x-auto" />
      {loadFailed ? <p role="alert" className="text-xs text-red-600">Google verification did not load. Check your connection and try refreshing.</p> : null}
    </div>
  );
});
