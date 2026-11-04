import Link from "next/link";

export const metadata = { title: "Not permitted" };

export default function ForbiddenPage() {
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-md rounded-2xl border border-line bg-white p-8 text-center">
        <h1 className="text-xl font-extrabold text-ink">You don&apos;t have access to this area</h1>
        <p className="mt-2 text-sm text-ink-muted">Your role doesn&apos;t include this permission. Ask a Super Admin if you need it.</p>
        <Link href="/admin/" className="mt-6 inline-block font-semibold text-brand-blue underline">Back to dashboard</Link>
      </div>
    </main>
  );
}
