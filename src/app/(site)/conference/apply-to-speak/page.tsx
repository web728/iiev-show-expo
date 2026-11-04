import type { Metadata } from "next";
import { PageHero } from "@/components/ui/layout-blocks";
import { FormLayout, AsideCard, ContactAside } from "@/components/sections/form-layout";
import { SmartForm } from "@/components/forms/smart-form";
import { speakerFields } from "@/components/forms/configs";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicSettings } from "@/lib/data/edition";

export const metadata: Metadata = pageMetadata({
  title: "Apply to Speak",
  description: "Propose a session for the India International EV Show 2027 conference. Share your topic, abstract and bio with the programme committee.",
  path: "/conference/apply-to-speak/",
});

export default async function ApplyToSpeakPage() {
  const settings = await getPublicSettings();
  return (
    <>
      <PageHero image={{ src: "/media/2026/conf-keynote.webp" }} eyebrow="Conference" title="Apply to speak" intro={<p>We look for practical, evidence-based sessions that help the audience make better decisions.</p>} crumbs={[{ label: "Conference", href: "/conference/" }, { label: "Apply to Speak", href: "/conference/apply-to-speak/" }]} />
      <FormLayout
        aside={
          <>
            <AsideCard title="What the committee looks for">
              <ul className="grid gap-2">
                <li>• Specific lessons, data or case studies</li>
                <li>• Relevance to Indian electric-mobility businesses</li>
                <li>• No product pitches</li>
                <li>• Speakers who can take audience questions</li>
              </ul>
            </AsideCard>
            <AsideCard title="Please note">Submitting doesn&apos;t guarantee a slot. Sponsored speaking opportunities are handled separately through <a href="/sponsorship/" className="font-semibold text-brand-blue underline">sponsorship</a>.</AsideCard>
            <ContactAside settings={settings} topic="speaking" />
          </>
        }
      >
        <SmartForm endpoint="/api/forms/speaker/" formName="speaker_application" fields={speakerFields} submitLabel="Submit application" consentPurpose="review my speaking application and contact me about the conference" submitEvent="speaker_application_submitted" />
      </FormLayout>
    </>
  );
}
