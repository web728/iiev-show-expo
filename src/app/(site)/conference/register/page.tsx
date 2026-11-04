import type { Metadata } from "next";
import { PageHero } from "@/components/ui/layout-blocks";
import { FormLayout, AsideCard, ContactAside } from "@/components/sections/form-layout";
import { SmartForm } from "@/components/forms/smart-form";
import { delegateFields } from "@/components/forms/configs";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicSettings } from "@/lib/data/edition";

export const metadata: Metadata = pageMetadata({
  title: "Conference Delegate Registration",
  description: "Register your interest as a conference delegate at the India International EV Show 2027 and receive programme and access updates.",
  path: "/conference/register/",
});

export default async function DelegatePage() {
  const settings = await getPublicSettings();
  return (
    <>
      <PageHero image={{ src: "/media/2026/conf-audience.webp" }} eyebrow="Conference" title="Delegate registration" intro={<p>Register your interest now. We&apos;ll confirm delegate access, any fees and the programme once they are announced.</p>} crumbs={[{ label: "Conference", href: "/conference/" }, { label: "Delegate Registration", href: "/conference/register/" }]} />
      <FormLayout aside={<><AsideCard title="No payment now">This registration doesn&apos;t take payment. If the conference requires a paid pass, we&apos;ll tell you before anything is charged.</AsideCard><ContactAside settings={settings} topic="the conference" /></>}>
        <SmartForm endpoint="/api/forms/delegate/" formName="delegate_registration" fields={delegateFields} submitLabel="Register interest" consentPurpose="send me conference programme and access updates" submitEvent="conference_registration_submitted" />
      </FormLayout>
    </>
  );
}
