import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Simple brand mark (bolt on navy) — the full logo is illegible at favicon size.
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#001433", borderRadius: 14 }}>
        <svg width="40" height="48" viewBox="0 0 64 96">
          <path d="M38 0 4 54h24L18 96 60 36H34z" fill="#f9c900" />
        </svg>
      </div>
    ),
    size,
  );
}
