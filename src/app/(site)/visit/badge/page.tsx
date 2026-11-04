import type { Metadata } from "next";
import { PageHero } from "@/components/ui/layout-blocks";
import { FormLayout, AsideCard, ContactAside } from "@/components/sections/form-layout";
import { BadgeRetrieveForm } from "@/components/forms/badge-retrieve";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicSettings } from "@/lib/data/edition";

export const metadata: Metadata = pageMetadata({
  title: "Retrieve My Badge",
  description: "Lost your IIEV Show badge email? Request a secure, time-limited link to view and download your visitor badge.",
  path: "/visit/badge/",
  noindex: true,
});

export default async function BadgeRetrievePage() {
  const settings = await getPublicSettings();
  return (
    <>
      <PageHero image={{ src: "/media/2026/registration-counter.webp" }} eyebrow="Visit" title="Retrieve my badge" intro={<p>We&apos;ll email a secure link to the address you registered with.</p>} crumbs={[{ label: "Visit", href: "/visit/" }, { label: "Retrieve my badge", href: "/visit/badge/" }]} />
      <FormLayout
        aside={
          <>
            <AsideCard title="Need to change your details?">Contact us with your registration ID. For security, corrections to the name on a badge are made by the registration team, who will reissue your badge.</AsideCard>
            <ContactAside settings={settings} topic="your registration" />
          </>
        }
      >
        <BadgeRetrieveForm />
      </FormLayout>
    </>
  );
}
