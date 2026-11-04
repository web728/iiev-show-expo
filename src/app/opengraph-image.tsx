import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCurrentEdition } from "@/lib/data/edition";

export const alt = "India International EV Show 2027 — 11–13 November, Pune";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function OgImage() {
  const e = await getCurrentEdition();
  const root = process.cwd();
  const [logo, bold, semi] = await Promise.all([
    readFile(path.join(root, "public/brand/iiev-9th-edition-logo-trimmed.png")),
    readFile(path.join(root, "node_modules/@fontsource/montserrat/files/montserrat-latin-800-normal.woff")),
    readFile(path.join(root, "node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#001433", fontFamily: "Montserrat", position: "relative" }}>
        <div style={{ position: "absolute", right: -160, top: -220, width: 720, height: 720, borderRadius: 999, border: "56px solid #f9c900", display: "flex" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 420, background: "linear-gradient(120deg,#0068af,#16893f)", display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, width: 820 }}>
          <div style={{ display: "flex", background: "#ffffff", borderRadius: 24, padding: "22px 28px", width: 420 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (Satori) requires <img> */}
            <img src={logoSrc} width={364} height={174} alt="" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 600, color: "#f9c900" }}>{`${e.editionLabel} · ${e.year}`}</div>
            <div style={{ fontSize: 58, fontWeight: 800, color: "#ffffff", lineHeight: 1.05, marginTop: 8 }}>{e.dateLabel}</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginTop: 14 }}>
              {`${e.venue.name}, ${e.venue.locality}, ${e.venue.city}`}
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 12, background: "linear-gradient(90deg,#1d8043,#0068af)", display: "flex" }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Montserrat", data: bold, weight: 800, style: "normal" },
        { name: "Montserrat", data: semi, weight: 600, style: "normal" },
      ],
    },
  );
}
