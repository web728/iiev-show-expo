
import type { Metadata } from "next";
import Link from "next/link";

import {
  LegalDocument,
  type LegalSection,
} from "@/components/sections/legal-document";

import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description:
    "Read the terms governing use of the India International EV Show website, including website content, external links, event information and registration-related conditions.",
  path: "/terms/",
});

const sections: LegalSection[] = [
  {
    id: "scope",
    title: "Scope of these terms",
    content: (
      <>
        <p>
          These Terms of Use apply to the
          India International EV Show
          (IIEV Show) website.
        </p>

        <p>
          The website provides information
          about the exhibition, participation
          opportunities, visitor services
          and related event activities.
        </p>

        <p>
          Use of specific services, including
          exhibition space bookings or visitor
          registrations, may be subject to
          additional terms presented during
          the relevant process.
        </p>
      </>
    ),
  },
  {
    id: "permitted-use",
    title: "Permitted website use",
    content: (
      <>
        <p>
          Visitors may use the website to
          access event information, explore
          available services and submit
          genuine enquiries.
        </p>

        <p>
          When using the website, you should not:
        </p>

        <ul className="list-disc space-y-2 pl-5 marker:text-[#16893F]">
          <li>
            Attempt to gain unauthorised access
            to website systems or accounts.
          </li>
          <li>
            Interfere with website operation,
            availability or security.
          </li>
          <li>
            Submit malicious code, fraudulent
            enquiries or intentionally misleading
            information.
          </li>
          <li>
            Use website content in a way that
            infringes applicable rights or laws.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "event-information",
    title: "Event information and changes",
    content: (
      <>
        <p>
          The website publishes information
          about exhibition dates, venues,
          programmes, participants and
          related services.
        </p>

        <p>
          Event information may change,
          including schedules, available
          facilities, programme details
          and participation arrangements.
        </p>

        <p>
          Visitors should review the latest
          event information and obtain
          confirmation where a particular
          arrangement is important to
          their plans.
        </p>

        <p>
          For the advertised 2027 edition,
          the current website information
          identifies 14–16 October 2027
          at Auto Cluster Exhibition Centre,
          Pune, India.
        </p>
      </>
    ),
  },
  {
    id: "registrations",
    title: "Registrations and participation",
    content: (
      <>
        <p>
          Submission of an enquiry or
          registration form does not, by
          itself, guarantee acceptance,
          a confirmed exhibition space
          or a particular event service.
        </p>

        <p>
          Applicable eligibility requirements,
          confirmations, payments, cancellation
          arrangements and other participation
          conditions should be communicated
          through the relevant booking
          or registration process.
        </p>

        <p>
          Exhibitors and commercial participants
          should review the applicable written
          agreement before making commitments.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Content and intellectual property",
    content: (
      <>
        <p>
          Website text, images, graphics,
          branding, videos and other materials
          may be protected by intellectual
          property rights belonging to the
          organiser or relevant third parties.
        </p>

        <p>
          Access to the website does not
          grant permission to reproduce,
          redistribute or commercially use
          protected content beyond what
          is permitted by law or expressly
          authorised by the rights holder.
        </p>

        <p>
          Event images and third-party logos
          may have separate ownership
          or usage restrictions.
        </p>
      </>
    ),
  },
  {
    id: "external-links",
    title: "External links and services",
    content: (
      <>
        <p>
          The website may contain links
          to external websites, registration
          services, event partners or
          other online resources.
        </p>

        <p>
          Those services operate under
          their own policies and terms.
          A link does not necessarily
          imply responsibility for all
          content or services provided
          by the external website.
        </p>
      </>
    ),
  },
  {
    id: "availability",
    title: "Website availability and accuracy",
    content: (
      <>
        <p>
          Reasonable efforts may be made
          to maintain accurate information
          and website availability, but
          temporary interruptions, errors
          or outdated information can occur.
        </p>

        <p>
          Website information is provided
          for general event-related
          purposes and should not replace
          specific written confirmations
          or agreements.
        </p>

        <p>
          Any limitations of responsibility
          remain subject to applicable
          law and cannot exclude rights
          that cannot lawfully be excluded.
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    title: "Privacy and personal information",
    content: (
      <>
        <p>
          Information submitted through
          the website is addressed in
          the{" "}
          <Link
            href="/privacy-policy/"
            className="font-semibold text-[#16893F] underline underline-offset-4 hover:text-[#102A1E]"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <p>
          Information about optional
          analytics and cookie preferences
          appears in the{" "}
          <Link
            href="/cookie-policy/"
            className="font-semibold text-[#16893F] underline underline-offset-4 hover:text-[#102A1E]"
          >
            Cookie Policy
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    content: (
      <p>
        These Terms of Use may be updated
        when website functionality,
        event arrangements or applicable
        requirements change. The revised
        terms will be published on this
        page with an updated date.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Website Information"
      title="Terms of"
      highlight="Use"
      description="Information about using the India International EV Show website and understanding its event-related services."
      updated="18 November 2026"
      sections={sections}
    />
  );
}
