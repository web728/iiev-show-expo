import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { connectDb } from "@/lib/db/connect";
import { Visitor } from "@/models/leads";
import { verifyBadgeAccessToken } from "@/lib/badge/access";
import { qrPayload } from "@/lib/badge/token";
import { decrypt } from "@/lib/security/crypto";
import { getCurrentEdition } from "@/lib/data/edition";
import { EmptyState } from "@/components/ui/layout-blocks";
import { LinkButton, buttonClass } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Badge",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function BadgeViewPage({ searchParams }: PageProps<"/visit/badge/view">) {
  const { t } = await searchParams;
  const token = typeof t === "string" ? t : "";
  const access = token ? await verifyBadgeAccessToken(token) : null;

  let v: { ref: string; fullName: string; company: string; designation?: string; status: string; badgeVersion: number; badgeTokenEnc?: string; badgeRevokedAt?: Date } | null = null;
  if (access) {
    await connectDb();
    v = await Visitor.findById(access.visitorId).select("+badgeTokenEnc").lean();
  }
  const valid = access && v && v.badgeVersion === access.version && v.badgeTokenEnc && !v.badgeRevokedAt && ["approved", "checked_in"].includes(v.status);

  if (!valid) {
    return (
      <div className="container-site py-16">
        <EmptyState icon="Alert" title="This badge link is invalid or has expired" action={<LinkButton href="/visit/badge/">Request a new link</LinkButton>}>
          Links expire after 7 days and stop working when a badge is reissued. Request a fresh link to the email you registered with.
        </EmptyState>
      </div>
    );
  }

  const edition = await getCurrentEdition();
  const svg = await QRCode.toString(qrPayload(decrypt(v!.badgeTokenEnc!)), { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: "#001433", light: "#ffffff" } });
  const pdfHref = `/api/badge/pdf/?t=${encodeURIComponent(token)}`;

  return (
    <section className="bg-mist py-10 sm:py-14">
      <div className="container-site grid gap-8 lg:grid-cols-[24rem_1fr] lg:items-start">
        <article className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-lift)]" aria-label="Visitor badge">
          <div className="flex h-2"><div className="flex-[62] bg-brand-green" /><div className="flex-[38] bg-brand-yellow" /></div>
          <div className="px-6 pb-6 pt-5 text-center">
            <Image src="/brand/iiev-9th-edition-logo-trimmed.png" alt="India International EV Show, 9th Edition" width={1538} height={734} className="mx-auto h-20 w-auto" sizes="170px" priority />
            <p className="mt-3 text-sm font-semibold text-ink">{edition.dateLabel}</p>
            <p className="text-xs text-ink-muted">{edition.venue.name}, {edition.venue.locality}, {edition.venue.city}</p>
            <h1 className="mt-5 text-2xl font-extrabold uppercase leading-tight text-ink">{v!.fullName}</h1>
            <p className="mt-1 font-semibold text-brand-blue">{v!.company}</p>
            {v!.designation ? <p className="text-sm text-ink-muted">{v!.designation}</p> : null}
            <div className="mx-auto mt-5 w-52 [&_svg]:h-auto [&_svg]:w-full" role="img" aria-label="Entry QR code" dangerouslySetInnerHTML={{ __html: svg }} />
            <p className="mt-2 font-mono text-sm font-semibold tracking-wider text-ink">{v!.ref}</p>
          </div>
          <div className="flex items-center justify-between bg-brand-navy px-6 py-3">
            <span className="text-lg font-extrabold tracking-wide text-white">VISITOR</span>
            <span className="rounded bg-white px-2 py-1"><Image src="/brand/futurex-logo.png" alt="Futurex" width={1000} height={209} className="h-5 w-auto" sizes="100px" /></span>
          </div>
        </article>
        <div className="grid content-start gap-5">
          <h2 className="text-2xl font-extrabold text-ink">Your entry badge</h2>
          <p className="text-ink-soft">Show this QR code on your phone at the registration desk, or download and print the PDF. Bring photo ID in case staff need to verify your identity.</p>
          <div className="flex flex-wrap gap-3">
            <a href={pdfHref} className={buttonClass("primary", "lg")} target="_blank" rel="noopener">
              <Icon.Download className="size-5" /> Download PDF badge
            </a>
          </div>
          <ul className="grid gap-2 text-sm text-ink-muted">
            <li>• Your badge is personal and non-transferable.</li>
            <li>• Don&apos;t share screenshots of your QR code publicly.</li>
            <li>• If your details are wrong, <Link href="/contact/" className="font-semibold text-brand-blue underline">contact us</Link> with your registration ID.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
