"use client";

import { useState } from "react";
import { aInput, aBtnSecondary } from "./ui";

/** URL input with direct upload to the media library. */
export function ImageField({ name, defaultValue, required, accept = "image/jpeg,image/png,image/webp,image/avif,application/pdf" }: { name: string; defaultValue?: string; required?: boolean; accept?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [state, setState] = useState<{ busy: boolean; error?: string }>({ busy: false });

  async function upload(file: File) {
    setState({ busy: true });
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload/", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Upload failed");
      setValue(data.url);
      setState({ busy: false });
    } catch (e) {
      setState({ busy: false, error: e instanceof Error ? e.message : "Upload failed" });
    }
  }

  const isImage = /\.(png|jpe?g|webp|avif)(\?|$)/i.test(value);
  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <input id={name} name={name} value={value} onChange={(e) => setValue(e.target.value)} required={required} className={aInput} placeholder="https://… or /uploads/…" />
        <label className={`${aBtnSecondary} cursor-pointer whitespace-nowrap`}>
          {state.busy ? "Uploading…" : "Upload"}
          <input type="file" accept={accept} className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} disabled={state.busy} />
        </label>
      </div>
      {state.error ? <p className="text-xs font-semibold text-danger" role="alert">{state.error}</p> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {value && isImage ? <img src={value} alt="" className="h-24 w-auto rounded border border-line object-contain" /> : null}
    </div>
  );
}
