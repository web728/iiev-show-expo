"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { aInput, aBtnPrimary, aBtnSecondary } from "./ui";

type Result = {
  result: "ok" | "duplicate" | "revoked" | "not_found" | "not_approved" | "wrong_edition";
  message: string;
  visitor?: { id: string; ref: string; fullName: string; company: string; designation?: string; checkInCount: number; firstCheckInAt?: string };
  at?: string;
};

type BarcodeDetectorLike = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };

const TONE: Record<Result["result"], string> = {
  ok: "bg-brand-green text-white",
  duplicate: "bg-brand-yellow text-brand-navy",
  revoked: "bg-danger text-white",
  not_found: "bg-danger text-white",
  not_approved: "bg-danger text-white",
  wrong_edition: "bg-danger text-white",
};

function beep(ok: boolean) {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = ok ? 880 : 220;
    g.gain.value = 0.08;
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + (ok ? 0.12 : 0.4));
  } catch {
    /* audio unavailable */
  }
}

export function CheckinStation({ defaultStation }: { defaultStation: string }) {
  const [station, setStation] = useState(defaultStation);
  const [last, setLast] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState<"off" | "starting" | "on" | "error">("off");
  const [camError, setCamError] = useState("");
  const [count, setCount] = useState(0);
  const [online, setOnline] = useState(true);
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState<{ id: string; ref: string; fullName: string; company: string; status: string; checkInCount: number }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastCodeRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });
  const wedgeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const up = () => setOnline(navigator.onLine);
    up();
    window.addEventListener("online", up);
    window.addEventListener("offline", up);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", up);
    };
  }, []);

  const submit = useCallback(
    async (payload: { qrText?: string; visitorId?: string }) => {
      if (!navigator.onLine) {
        setLast({ result: "not_found", message: "OFFLINE — use the contingency process (manual list) and re-scan when back online." });
        beep(false);
        return;
      }
      setBusy(true);
      try {
        const res = await fetch("/api/admin/checkin/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, station }) });
        if (res.status === 401) {
          setLast({ result: "not_found", message: "Session expired — sign in again." });
          return;
        }
        const data = (await res.json()) as Result & { ok: boolean };
        setLast(data);
        beep(data.result === "ok");
        if (data.result === "ok") setCount((c) => c + 1);
      } catch {
        setLast({ result: "not_found", message: "Network error — try again." });
        beep(false);
      } finally {
        setBusy(false);
        wedgeRef.current?.focus();
      }
    },
    [station],
  );

  const onCode = useCallback(
    (code: string) => {
      const now = Date.now();
      // Debounce the same code for 3 s (camera sees it on many frames)
      if (code === lastCodeRef.current.code && now - lastCodeRef.current.at < 3000) return;
      lastCodeRef.current = { code, at: now };
      void submit({ qrText: code });
    },
    [submit],
  );

  // Camera scanning loop: BarcodeDetector where supported, jsQR fallback.
  useEffect(() => {
    if (camera !== "on") return;
    let raf = 0;
    let stopped = false;
    let detector: BarcodeDetectorLike | null = null;
    const W = window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => BarcodeDetectorLike };
    if (W.BarcodeDetector) {
      try {
        detector = new W.BarcodeDetector({ formats: ["qr_code"] });
      } catch {
        detector = null;
      }
    }
    let jsQR: ((d: Uint8ClampedArray, w: number, h: number) => { data: string } | null) | null = null;
    if (!detector) import("jsqr").then((m) => (jsQR = m.default as typeof jsQR));

    const tick = async () => {
      if (stopped) return;
      const v = videoRef.current;
      if (v && v.readyState >= 2) {
        try {
          if (detector) {
            const codes = await detector.detect(v);
            if (codes[0]?.rawValue) onCode(codes[0].rawValue);
          } else if (jsQR && canvasRef.current) {
            const c = canvasRef.current;
            const w = (c.width = Math.min(640, v.videoWidth));
            const h = (c.height = Math.round((v.videoHeight / v.videoWidth) * w));
            const ctx = c.getContext("2d", { willReadFrequently: true })!;
            ctx.drawImage(v, 0, 0, w, h);
            const img = ctx.getImageData(0, 0, w, h);
            const r = jsQR(img.data, w, h);
            if (r?.data) onCode(r.data);
          }
        } catch {
          /* frame decode error — keep scanning */
        }
      }
      raf = window.setTimeout(() => requestAnimationFrame(tick), 180) as unknown as number;
    };
    tick();
    return () => {
      stopped = true;
      clearTimeout(raf);
    };
  }, [camera, onCode]);

  async function startCamera() {
    setCamera("starting");
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamera("on");
    } catch (e) {
      setCamera("error");
      setCamError(e instanceof Error && e.name === "NotAllowedError" ? "Camera permission denied. Allow camera access in the browser, or use a handheld scanner / manual search." : "No camera available. Use a handheld scanner or manual search.");
    }
  }
  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamera("off");
  }
  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  async function doSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim().length < 3) return;
    const res = await fetch(`/api/admin/checkin/?q=${encodeURIComponent(search.trim())}`);
    const data = await res.json();
    setMatches(data.results ?? []);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      <div className="grid content-start gap-4">
        <div className={`rounded-xl px-4 py-2 text-sm font-semibold ${online ? "bg-brand-green/10 text-brand-green" : "bg-danger text-white"}`} role="status">
          {online ? `Online · station "${station}" · ${count} checked in this session` : "OFFLINE — switch to contingency process"}
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-brand-navy">
          <video ref={videoRef} className={`h-full w-full object-cover ${camera === "on" ? "" : "hidden"}`} playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          {camera !== "on" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
              <Icon.Camera className="size-12 opacity-70" />
              <p className="text-sm text-white/80">{camError || "Use the camera, a handheld scanner (keyboard mode) or manual search."}</p>
              <button onClick={startCamera} className={aBtnPrimary} disabled={camera === "starting"}>{camera === "starting" ? "Starting…" : "Start camera"}</button>
            </div>
          ) : (
            <>
              <div className="pointer-events-none absolute inset-[18%] rounded-2xl border-4 border-brand-yellow/80" />
              <button onClick={stopCamera} className="absolute right-3 top-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold">Stop camera</button>
            </>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = wedgeRef.current?.value.trim();
            if (v) onCode(v);
            if (wedgeRef.current) wedgeRef.current.value = "";
          }}
          className="grid gap-2 sm:grid-cols-[1fr_auto]"
        >
          <label className="sr-only" htmlFor="wedge">Handheld scanner input</label>
          <input id="wedge" ref={wedgeRef} autoFocus autoComplete="off" placeholder="Handheld scanner: click here, then scan" className={aInput} />
          <button className={aBtnSecondary} disabled={busy}>Submit code</button>
        </form>
        <label className="flex items-center gap-2 text-sm">
          Station name
          <input value={station} onChange={(e) => setStation(e.target.value.slice(0, 40))} className={`${aInput} max-w-48`} />
        </label>
      </div>

      <div className="grid content-start gap-4">
        <div aria-live="assertive" className={`min-h-48 rounded-xl p-6 ${last ? TONE[last.result] : "border border-dashed border-line bg-white text-ink-muted"}`}>
          {last ? (
            <>
              <p className="text-3xl font-extrabold uppercase">{last.result === "ok" ? "Welcome" : last.result.replace(/_/g, " ")}</p>
              {last.visitor ? (
                <div className="mt-3">
                  <p className="text-2xl font-bold">{last.visitor.fullName}</p>
                  <p className="text-lg">{last.visitor.company}</p>
                  <p className="font-mono text-sm opacity-80">{last.visitor.ref}</p>
                </div>
              ) : null}
              <p className="mt-3 text-sm font-semibold">{last.message}</p>
            </>
          ) : (
            <p>Scan a badge to begin.</p>
          )}
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <h2 className="text-sm font-bold">Manual search</h2>
          <form onSubmit={doSearch} className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, company, phone, email or VS- ID" className={aInput} aria-label="Search visitors" />
            <button className={aBtnSecondary}>Search</button>
          </form>
          <ul className="mt-3 divide-y divide-line text-sm">
            {matches.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 py-2">
                <span>
                  <span className="font-semibold">{m.fullName}</span> · {m.company}
                  <span className="block text-xs text-ink-muted">{m.ref} · {m.status.replace(/_/g, " ")} · {m.checkInCount} scans</span>
                </span>
                <button onClick={() => submit({ visitorId: m.id })} className={aBtnPrimary} disabled={busy}>Check in</button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-muted">Manual check-ins are logged with your name. Ask for photo ID.</p>
        </div>
      </div>
    </div>
  );
}
