import type { Metadata } from "next";
import { PageHero, Section, Notice, CtaBand, RelatedLinks } from "@/components/ui/layout-blocks";
import { LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicSettings } from "@/lib/data/edition";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Exhibitor Information — Process, Manual & Logistics",
  description: "How exhibiting at IIEV Show 2027 works: participation process, stall types, exhibitor manual, badges, directory listing and on-site logistics.",
  path: "/exhibit/information/",
});

export default async function ExhibitorInfoPage() {
  const s = await getPublicSettings();
  return (
    <>
      <PageHero image={{ src: "/media/2026/arrival-hall-entrance.webp" }}
        eyebrow="Exhibit"
        title="Exhibitor information"
        intro={<p>A practical guide to taking part. Detailed deadlines, specifications and rules for 2027 are in the exhibitor manual.</p>}
        crumbs={[{ label: "Exhibit", href: "/exhibit/" }, { label: "Exhibitor Information", href: "/exhibit/information/" }]}
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div className="prose-iiev max-w-none">
            <h2>Participation process</h2>
            <ol>
              <li>Send a stall enquiry with your products, segments and approximate space.</li>
              <li>The exhibitor sales team shares available locations and participation terms.</li>
              <li>Confirm by completing the participation contract and the payment schedule in it.</li>
              <li>Receive the exhibitor manual, portal access and your directory-listing invitation.</li>
            </ol>
            <h2>Stall types</h2>
            <p>
              <strong>Shell scheme</strong> stalls come pre-built with walls, fascia and basic fittings — the simplest way to exhibit.{" "}
              <strong>Raw space</strong> is floor area only, for companies bringing a custom stand built by their own contractor. Exact inclusions
              for 2027 are listed in the exhibitor manual.
            </p>
            <h2>What the exhibitor manual covers</h2>
            <ul>
              <li>Build-up, show and dismantling timings</li>
              <li>Stand design approval and contractor rules for raw space</li>
              <li>Electrical load, furniture and additional services</li>
              <li>Vehicle and heavy-exhibit movement into the halls</li>
              <li>Exhibitor badges and car passes</li>
              <li>Health, safety and fire regulations</li>
            </ul>
            <h2>Directory listing</h2>
            <p>
              Each confirmed exhibitor is invited to submit a profile for the online exhibitor directory — company description, product
              categories, logo and website. Listings are checked before publishing and your stall number is added once allocated.
            </p>
            <h2>Badges for your team</h2>
            <p>Exhibitor badges are issued per stall. The allocation per stall size will be listed in the exhibitor manual.</p>
          </div>
          <div className="grid content-start gap-5">
            {s.exhibitorManualUrl ? (
              <LinkButton href={s.exhibitorManualUrl} target="_blank" rel="noopener" variant="primary">
                <Icon.Download className="size-4.5" /> Exhibitor manual
              </LinkButton>
            ) : (
              <Notice title="Exhibitor manual">The 2027 manual will be shared with confirmed exhibitors and published in Downloads.</Notice>
            )}
            <RelatedLinks
              links={[
                { label: "Book a stall", href: "/exhibit/book-a-stall/" },
                { label: "Floor plan", href: "/exhibit/floor-plan/" },
                { label: "Exhibitor FAQs", href: "/exhibit/faqs/" },
                { label: "Venue & travel", href: "/visit/venue/" },
              ]}
            />
          </div>
        </div>
      </Section>
      <CtaBand title="Questions about exhibiting?" primary={{ label: "Book Your Stall", href: "/exhibit/book-a-stall/" }} secondary={{ label: "Contact us", href: "/contact/" }} />
    </>
  );
}
