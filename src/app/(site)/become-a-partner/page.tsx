import type { Metadata } from "next";
import { PageHero } from "@/components/ui/layout-blocks";
import { FormLayout, AsideCard, ContactAside } from "@/components/sections/form-layout";
import { SmartForm } from "@/components/forms/smart-form";
import { partnerFields } from "@/components/forms/configs";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicSettings } from "@/lib/data/edition";

export const metadata: Metadata = pageMetadata({
  title: "Become a Partner",
  description: "Industry associations, media, research institutions and public bodies: propose a partnership with the India International EV Show 2027.",
  path: "/become-a-partner/",
});

export default async function BecomePartnerPage() {
  const settings = await getPublicSettings();
  return (
    <>
      <PageHero image={{ src: "/media/2026/b2b-lounge.webp" }} eyebrow="Partners" title="Become a partner" intro={<p>For industry associations, media, knowledge partners and public bodies who want to collaborate with the show.</p>} crumbs={[{ label: "Partners", href: "/partners/" }, { label: "Become a Partner", href: "/become-a-partner/" }]} />
      <FormLayout aside={<><AsideCard title="Commercial sponsorship?">Companies looking for brand visibility should use the <a href="/sponsorship/enquire/" className="font-semibold text-brand-blue underline">sponsorship enquiry</a>.</AsideCard><ContactAside settings={settings} topic="partnerships" /></>}>
        <SmartForm endpoint="/api/forms/partner/" formName="partner_enquiry" fields={partnerFields} submitLabel="Send proposal" consentPurpose="review my partnership proposal and contact me" submitEvent="partner_enquiry_submitted" />
      </FormLayout>
    </>
  );
}
