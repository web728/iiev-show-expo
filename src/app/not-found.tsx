import Link from "next/link";
import Image from "next/image";
import { buttonClass } from "@/components/ui/button";
import { ChevronStripes } from "@/components/ui/motifs";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main id="main" className="relative flex min-h-dvh items-center overflow-hidden bg-white">
      <ChevronStripes className="pointer-events-none absolute bottom-0 left-0 h-40 w-28" />
      <div className="container-site py-20 text-center">
        <Link href="/" className="inline-block"><Image src="/brand/iiev-9th-edition-logo-trimmed.png" alt="India International EV Show — home" width={1538} height={734} className="mx-auto h-16 w-auto" sizes="140px" /></Link>
        <p className="mt-10 text-sm font-bold uppercase tracking-[0.16em] text-brand-green">Error 404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">We can&apos;t find that page</h1>
        <p className="mx-auto mt-3 max-w-lg text-ink-soft">It may have moved when we rebuilt the website. Try one of these instead:</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonClass("primary")}>Home</Link>
          <Link href="/exhibit/book-a-stall/" className={buttonClass("outline")}>Book a stall</Link>
          <Link href="/visit/register/" className={buttonClass("outline")}>Register to visit</Link>
          <Link href="/search/" className={buttonClass("ghost")}>Search the site</Link>
        </div>
      </div>
    </main>
  );
}
