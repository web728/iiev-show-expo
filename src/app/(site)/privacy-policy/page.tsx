
import type { Metadata } from "next";
import Link from "next/link";

import {
  LegalDocument,
  type LegalSection,
} from "@/components/sections/legal-document";

import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "Learn how India International EV Show may collect, use, share and retain personal information submitted through its website, including event enquiries and registrations.",
  path: "/privacy-policy/",
});

const sections: LegalSection[] = [
  {
    id: "about-this-policy",
    title: "About this Privacy Policy",
    content: (
      <>
        <p>
          This Privacy Policy describes how personal
          information may be handled in connection
          with the India International EV Show
          (IIEV Show) website.
        </p>

        <p>
          The exhibition is organised by Futurex Trade
          Fair & Events Pvt. Ltd. This policy relates
          to information collected through the website
          and associated event communications.
        </p>
      </>
    ),
  },
  {
    id: "information-collected",
    title: "Information we may collect",
    content: (
      <>
        <p>
          The information collected depends on how
          you interact with the website and which
          services you use.
        </p>

        <ul className="list-disc space-y-2 pl-5 marker:text-[#16893F]">
          <li>
            Contact details such as your name,
            email address and telephone number.
          </li>
          <li>
            Professional information such as your
            organisation, job role and business sector.
          </li>
          <li>
            Information supplied through exhibition,
            sponsorship, visitor or other enquiry forms.
          </li>
          <li>
            Information required to process an event
            registration or respond to a service request.
          </li>
          <li>
            Technical information associated with
            website access and, where permitted,
            analytics activity.
          </li>
        </ul>

        <p>
          Only information relevant to the feature
          or request should be submitted.
        </p>
      </>
    ),
  },
  {
    id: "how-information-is-used",
    title: "How information may be used",
    content: (
      <>
        <p>
          Personal information may be processed
          for purposes connected with the service
          or request for which it was supplied.
        </p>

        <ul className="list-disc space-y-2 pl-5 marker:text-[#16893F]">
          <li>
            Responding to visitor, exhibitor,
            sponsorship and partnership enquiries.
          </li>
          <li>
            Managing relevant event registrations
            and participation requests.
          </li>
          <li>
            Communicating event-related information
            and requested updates.
          </li>
          <li>
            Maintaining website operation,
            security and service reliability.
          </li>
          <li>
            Understanding website usage where
            optional analytics has been accepted.
          </li>
        </ul>

        <p>
          Where processing requires consent,
          the relevant choice or notice should
          be provided at the point of collection.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Sharing and service providers",
    content: (
      <>
        <p>
          Information may need to be made available
          to service providers involved in website
          hosting, communications, event administration
          or registration processing, where relevant
          to the requested service.
        </p>

        <p>
          Some website features or registration
          services may be operated by third parties.
          Those services can have additional notices
          describing how they process information.
        </p>

        <p>
          Information may also be disclosed where
          required by applicable law or a valid
          legal process.
        </p>

        <p>
          This policy does not establish that
          attendee contact information is automatically
          shared with exhibitors or sponsors.
          Any such arrangement should be disclosed
          specifically where it applies.
        </p>
      </>
    ),
  },
  {
    id: "cookies-and-analytics",
    title: "Cookies and website analytics",
    content: (
      <>
        <p>
          The website uses a cookie-preference
          mechanism that distinguishes essential
          functionality from optional analytics.
        </p>

        <p>
          Additional details about cookies,
          consent choices and browser storage
          are available in the{" "}
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
    id: "retention-security",
    title: "Data retention and security",
    content: (
      <>
        <p>
          Personal information should be retained
          only for as long as needed for the
          relevant purpose, subject to applicable
          record-keeping and legal requirements.
        </p>

        <p>
          Appropriate organisational and technical
          safeguards are important when handling
          personal information. However, no
          internet-based system can be guaranteed
          completely secure.
        </p>

        <p>
          Specific retention periods may differ
          depending on the type of record and
          the service involved.
        </p>
      </>
    ),
  },
  {
    id: "your-choices",
    title: "Your privacy choices and requests",
    content: (
      <>
        <p>
          Depending on applicable law and the
          circumstances of processing, you may
          be able to request access to, correction
          of or deletion of certain personal
          information, and withdraw consent
          where applicable.
        </p>

        <p>
          To make a privacy-related request,
          contact the IIEV Show team using
          the contact details provided below.
          Please describe the request and the
          relevant website service or interaction.
        </p>

        <p>
          We may need sufficient information
          to identify the records concerned
          before responding to a request.
        </p>
      </>
    ),
  },
  {
    id: "external-websites",
    title: "External websites",
    content: (
      <p>
        The website may link to websites
        operated by other organisations.
        Their privacy practices are governed
        by their respective policies.
        Review those notices before providing
        information on an external website.
      </p>
    ),
  },
  {
    id: "policy-updates",
    title: "Updates to this policy",
    content: (
      <p>
        This policy may be updated to reflect
        changes in website services, exhibition
        operations or applicable requirements.
        The revised version will appear
        on this page with its updated date.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      eyebrow="Your Information"
      title="Privacy"
      highlight="Policy"
      description="How personal information may be collected and used when you contact, register with or interact with India International EV Show."
      updated="18 November 2026"
      sections={sections}
    />
  );
}
