import type { Metadata } from "next";
import { PageHero } from "@/components/ui/layout-blocks";
import { FormLayout, ContactAside, AsideCard } from "@/components/sections/form-layout";
import { SmartForm } from "@/components/forms/smart-form";
import { sponsorshipFields } from "@/components/forms/configs";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicSettings } from "@/lib/data/edition";

export const metadata: Metadata = pageMetadata({
  title: "Sponsorship Enquiry",
  description: "Send a sponsorship enquiry for the India International EV Show 2027.",
  path: "/sponsorship/enquire/",
});

export default async function SponsorshipEnquiryPage() {
  const settings = await getPublicSettings();
  return (
    <>
      <PageHero image={{ src: "/media/2026/arrival-welcome-gate.webp" }} eyebrow="Sponsorship" title="Sponsorship enquiry" crumbs={[{ label: "Sponsorship", href: "/sponsorship/" }, { label: "Enquire", href: "/sponsorship/enquire/" }]} />
      <FormLayout aside={<><AsideCard title="What happens next">Our partnerships team reviews your objectives and shares the approved options that fit.</AsideCard><ContactAside settings={settings} topic="sponsorship" /></>}>
        <SmartForm endpoint="/api/forms/sponsorship/" formName="sponsorship_enquiry" fields={sponsorshipFields} submitLabel="Send enquiry" consentPurpose="respond to my sponsorship enquiry" submitEvent="sponsorship_enquiry_submitted" />
      </FormLayout>
    </>
  );
}
