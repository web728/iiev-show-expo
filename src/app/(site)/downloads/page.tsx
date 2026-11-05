import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownToLine, BookOpen, FileBarChart2, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { BrochureDownloadForm } from "@/components/forms/brochure-download-form";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Downloads | Brochure & Post Show Report",
  description: "Access the India International EV Show 2027 brochure and post-show report.",
  path: "/downloads/",
});

const REPORT = "/downloads/9th_India_International_EV_Show_2027_Post_Show_Report.pdf";

export default function DownloadsPage() {
  return (
    <>
      <PageHero
        eyebrow="IIEV Show Resources"
        title="Event"
        highlight="Downloads"
        description="Access the exhibition brochure and post-show report."
        image="/media/2026/expo-aisle-busy.webp"
        imagePosition="center 48%"
        crumbs={[{ label: "Media", href: "/media/" }, { label: "Downloads" }]}
      />
      <main className="bg-[#F5F9F5] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl space-y-12 px-5 sm:px-8 lg:px-10">
          <section aria-labelledby="brochure-title" className="overflow-hidden rounded-[26px] border border-[#DBE7DE] bg-white shadow-[0_22px_65px_-45px_rgba(9,27,19,.28)] lg:grid lg:grid-cols-[0.82fr_1.18fr]">
            <div className="relative overflow-hidden bg-[#102A1E] p-7 text-white sm:p-10 lg:p-12">
              <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-28 size-80 rounded-full border border-[#23A455]/20" />
              <div className="relative">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-[#78DFA0]"><BookOpen size={27} /></span>
                <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.18em] text-[#70DA98]">Exhibition Resources</p>
                <h2 id="brochure-title" className="mt-3 text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">IIEV Show 2027 Brochure</h2>
                <p className="mt-5 text-sm leading-8 text-white/70">Fill in your contact details to download the 9th edition exhibition brochure.</p>
                <div className="mt-9 flex gap-3 border-t border-white/15 pt-6 text-xs leading-6 text-white/65"><ShieldCheck className="mt-1 size-5 shrink-0 text-[#70DA98]" /><p>The download is available after successful submission.</p></div>
              </div>
            </div>
            <div className="p-6 sm:p-9 lg:p-12">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-[#16893F]">Get the Brochure</p>
              <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-[#102A1E]">Enter your details</h3>
              <p className="mb-7 mt-3 text-sm leading-7 text-[#617166]">The brochure will download once your form has been processed.</p>
              <BrochureDownloadForm />
            </div>
          </section>
          <section aria-labelledby="psr-title" className="rounded-[24px] border border-[#DBE7DE] bg-white p-7 sm:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-start gap-5">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF7EE] text-[#16893F]"><FileBarChart2 size={26} /></span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#16893F]">Official Document</p>
                  <h2 id="psr-title" className="mt-2 text-xl font-extrabold tracking-tight text-[#102A1E] sm:text-2xl">Post Show Report</h2>
                  <p className="mt-2 text-sm leading-7 text-[#617166]">Download the published report directly. No form required.</p>
                </div>
              </div>
              <Link href={REPORT} target="_self" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#23A455] px-6 text-sm font-bold text-white transition-colors hover:bg-[#16893F]">
                <ArrowDownToLine size={18} /> Download PSR
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
