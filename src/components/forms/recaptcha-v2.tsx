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
    config: {
      sitekey: string;
      theme: "light";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => number;
  reset: (id: number) => void;
  getResponse: (id: number) => string;
};

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
  }
}

export type RecaptchaHandle = {
  getToken: () => string;
  reset: () => void;
};

type Props = {
  onChange: (token: string) => void;
  onError?: (message: string) => void;
};

/** Explicitly rendered v2 checkbox, safe across Next.js client-side navigation. */
export const RecaptchaV2 = forwardRef<RecaptchaHandle, Props>(function RecaptchaV2(
  { onChange, onError },
  ref,
) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const holderRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  const onErrorRef = useRef(onError);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
    onErrorRef.current = onError;
  }, [onChange, onError]);

  const mountWidget = useCallback(() => {
    const api = window.grecaptcha;
    if (!api || !siteKey) return;

    const render = () => {
      if (!holderRef.current || widgetIdRef.current !== null) return;
      try {
        widgetIdRef.current = api.render(holderRef.current, {
          sitekey: siteKey,
          theme: "light",
          callback(token) {
            onChangeRef.current(token);
          },
          "expired-callback"() {
            onChangeRef.current("");
            onErrorRef.current?.("Verification expired. Tick the checkbox again.");
          },
          "error-callback"() {
            onChangeRef.current("");
            onErrorRef.current?.("Verification could not be completed. Please retry.");
          },
        });
        setLoaded(true);
        setLoadError(false);
      } catch {
        setLoadError(true);
        onErrorRef.current?.("Security verification could not be displayed. Refresh the page.");
      }
    };

    // The API script may be downloaded before its iframe dependencies are ready.
    if (typeof api.ready === "function") api.ready(render);
    else render();
  }, [siteKey]);

  useEffect(() => {
    // Covers previously loaded scripts when returning via client navigation.
    if (window.grecaptcha) mountWidget();
  }, [mountWidget]);

  useImperativeHandle(ref, () => ({
    getToken() {
      if (widgetIdRef.current === null || !window.grecaptcha) return "";
      try {
        return window.grecaptcha.getResponse(widgetIdRef.current) || "";
      } catch {
        return "";
      }
    },
    reset() {
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch {
          // A widget may have been unmounted during navigation.
        }
      }
      onChangeRef.current("");
    },
  }), []);

  if (!siteKey) {
    return <p role="alert" className="text-sm text-red-700">reCAPTCHA site key is not configured.</p>;
  }

  return (
    <div className="min-w-0 space-y-2">
      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={mountWidget}
        onError={() => {
          setLoadError(true);
          onErrorRef.current?.("Verification script failed to load. Check your network or browser settings.");
        }}
      />
      <div ref={holderRef} className="max-w-full overflow-x-auto" />
      {!loaded && !loadError && (
        <p className="text-xs text-[#718074]" aria-live="polite">Loading security verification…</p>
      )}
      {loadError && (
        <p role="alert" className="text-xs text-red-600">
          Google verification could not load. Check network/content blockers and reload.
        </p>
      )}
    </div>
  );
});
