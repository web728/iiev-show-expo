"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ fontFamily: "Montserrat, Segoe UI, Arial, sans-serif", color: "#001433", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, background: "#fff" }}>
        <main style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 28 }}>India International EV Show</h1>
          <p>The website is temporarily unavailable. Please try again in a moment.</p>
          <button type="button" onClick={reset} style={{ background: "#1d8043", color: "#fff", border: 0, borderRadius: 999, padding: "12px 22px", fontWeight: 700, cursor: "pointer" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
