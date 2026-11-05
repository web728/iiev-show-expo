"use client";

import Script from "next/script";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

type RecaptchaApi = {
  render: (node: HTMLElement, config: {
    sitekey: string;
    theme: "light";
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
  }) => number;
  reset: (widgetId: number) => void;
};

declare global {
  interface Window { grecaptcha?: RecaptchaApi }
}

export type RecaptchaHandle = { reset: () => void };

export const RecaptchaV2 = forwardRef<RecaptchaHandle, {
  onChange: (value: string) => void;
  onError?: (message: string) => void;
}>(function RecaptchaV2({ onChange, onError }, ref) {
  const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const holder = useRef<HTMLDivElement>(null);
  const widget = useRef<number | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widget.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(widget.current);
      }
      onChange("");
    },
  }), [onChange]);

  useEffect(() => {
    if (!scriptLoaded || !key || !holder.current || !window.grecaptcha || widget.current !== null) return;
    try {
      widget.current = window.grecaptcha.render(holder.current, {
        sitekey: key,
        theme: "light",
        callback: (token) => onChange(token),
        "expired-callback": () => { onChange(""); onError?.("Verification expired. Please verify again."); },
        "error-callback": () => { onChange(""); onError?.("Google verification could not load. Please retry."); },
      });
    } catch {
      onError?.("Google verification could not be displayed.");
    }
  }, [key, scriptLoaded, onChange, onError]);

  if (!key) {
    return <p role="alert" className="text-sm text-red-700">reCAPTCHA is not configured. Please contact the organiser.</p>;
  }

  return (
    <div className="min-w-0 space-y-2">
      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptLoaded(true)}
        onLoad={() => setScriptLoaded(true)}
      />
      <div className="max-w-full overflow-x-auto" ref={holder} />
    </div>
  );
});
