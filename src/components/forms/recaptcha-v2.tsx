"use client";

import Script from "next/script";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type RecaptchaApi = {
  ready?: (callback: () => void) => void;
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      theme: "light";
      size: "normal";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => number;
  getResponse: (widgetId: number) => string;
  reset: (widgetId: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
  }
}

export type RecaptchaHandle = {
  getToken(): string;
  reset(): void;
};

type Props = {
  onChange: (token: string) => void;
  onError?: (message: string) => void;
};

/** Google reCAPTCHA v2 (checkbox). Safe on navigation and Strict Mode re-renders. */
export const RecaptchaV2 = forwardRef<RecaptchaHandle, Props>(function RecaptchaV2(
  { onChange, onError },
  ref,
) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const holderRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const changeRef = useRef(onChange);
  const errorRef = useRef(onError);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    changeRef.current = onChange;
    errorRef.current = onError;
  }, [onChange, onError]);

  const showError = useCallback((message: string) => {
    setError(message);
    errorRef.current?.(message);
  }, []);

  const renderCaptcha = useCallback(() => {
    const api = window.grecaptcha;
    if (!api || !siteKey) return;
    const mount = () => {
      const holder = holderRef.current;
      if (!holder || !holder.isConnected || widgetIdRef.current !== null) return;
      try {
        const id = api.render(holder, {
          sitekey: siteKey,
          theme: "light",
          size: "normal",
          callback(token) {
            setError("");
            changeRef.current(token);
          },
          "expired-callback"() {
            changeRef.current("");
            showError("Verification expired. Tick the checkbox again.");
          },
          "error-callback"() {
            changeRef.current("");
            showError("Verification could not finish. Please try again.");
          },
        });
        widgetIdRef.current = id; // Widget ID may legitimately be zero.
        setReady(true);
        setError("");
      } catch {
        showError("Google verification could not load. Refresh the page.");
      }
    };
    if (typeof api.ready === "function") api.ready(mount);
    else mount();
  }, [siteKey, showError]);

  useEffect(() => {
    // Handles a previously cached script after client-side navigation.
    if (window.grecaptcha) renderCaptcha();
  }, [renderCaptcha]);

  useImperativeHandle(ref, () => ({
    getToken() {
      if (widgetIdRef.current === null || !window.grecaptcha) return "";
      try { return window.grecaptcha.getResponse(widgetIdRef.current) || ""; }
      catch { return ""; }
    },
    reset() {
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try { window.grecaptcha.reset(widgetIdRef.current); }
        catch { /* Already navigated/unmounted */ }
      }
      setError("");
      changeRef.current("");
    },
  }), []);

  if (!siteKey) {
    return <p role="alert" className="text-sm text-red-700">reCAPTCHA site key is missing.</p>;
  }
  return (
    <div className="min-w-0 space-y-2">
      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderCaptcha}
        onError={() => showError("Google verification script failed to load. Check network/ad-block settings.")}
      />
      <div ref={holderRef} className="max-w-full overflow-x-auto" />
      {!ready && !error && <p className="text-xs text-[#718074]">Loading verification…</p>}
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
});
