
import type { Metadata } from "next";

import {
  LegalDocument,
  type LegalSection,
} from "@/components/sections/legal-document";

import { CookiePreferencesAction } from "@/components/sections/cookie-preferences-action";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Cookie Policy",
  description:
    "Learn how India International EV Show uses essential storage and optional analytics cookies, and how to manage your cookie preferences.",
  path: "/cookie-policy/",
});

const sections: LegalSection[] = [
  {
    id: "what-are-cookies",
    title: "What are cookies?",
    content: (
      <>
        <p>
          Cookies are small files that websites can
          store in your browser. Websites may also use
          similar browser storage technologies to
          remember preferences and support functionality.
        </p>
        <p>
          This policy explains how cookies and related
          technologies may be used on the India International
          EV Show (IIEV Show) website.
        </p>
      </>
    ),
  },
  {
    id: "essential-cookies",
    title: "Essential website storage",
    content: (
      <>
        <p>
          Essential storage supports functions such as
          remembering your cookie preference and maintaining
          necessary website functionality.
        </p>
        <p>
          Some essential functions may use browser storage
          rather than traditional cookies. The exact storage
          used depends on the website feature.
        </p>
        <p>
          Essential storage is not controlled by the optional
          analytics choice. Disabling required browser
          storage may affect how certain features work.
        </p>
      </>
    ),
  },
  {
    id: "analytics-cookies",
    title: "Optional analytics",
    content: (
      <>
        <p>
          When you choose to accept analytics, the website
          may use Google Analytics 4 to understand how
          visitors use its pages.
        </p>
        <p>
          Analytics information may include page views,
          visit activity, device and browser information,
          and approximate location derived from technical
          information.
        </p>
        <p>
          Google Analytics may set cookies such as
          <code className="mx-1 rounded bg-white px-1.5 py-0.5 text-[0.9em]">
            _ga
          </code>
          and related measurement cookies. Their duration
          depends on the configured analytics settings.
        </p>
        <p>
          The website's consent interface is intended
          to load optional analytics only after you
          select the analytics option.
        </p>
      </>
    ),
  },
  {
    id: "preferences",
    title: "Managing your preferences",
    content: (
      <>
        <p>
          The cookie notice provides two choices:
          <strong> Essential only </strong>
          and
          <strong> Accept analytics</strong>.
        </p>
        <p>
          You can revisit your choice using the
          Cookie settings control on the website.
          You can also manage or remove stored information
          through your browser settings.
        </p>
        <p>
          Changing a preference does not necessarily
          remove cookies already stored by a third-party
          service. Those cookies may also need to be
          deleted through browser controls.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party services",
    content: (
      <>
        <p>
          Some website features may involve third-party
          services, such as embedded video, registration
          systems or external websites.
        </p>
        <p>
          These services may have their own privacy
          and cookie policies. Where you leave the
          IIEV Show website, the destination site's
          policies apply.
        </p>
      </>
    ),
  },
  {
    id: "updates",
    title: "Changes to this policy",
    content: (
      <p>
        This policy may be revised when website features,
        analytics arrangements or applicable requirements
        change. The updated version will be published
        on this page.
      </p>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalDocument
      eyebrow="Website Privacy"
      title="Cookie"
      highlight="Policy"
      description="Understand how cookies and browser storage support this website, and how optional analytics preferences work."
      updated="18 November 2026"
      sections={sections}
    >
      <div
        id="cookie-preferences"
        className="scroll-mt-28 py-8"
      >
        <h2 className="text-xl font-extrabold text-[#102A1E]">
          Update your cookie choice
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-7 text-[#526658]">
          Open the website's cookie preferences to review
          or change your analytics choice.
        </p>

        <CookiePreferencesAction />
      </div>
    </LegalDocument>
  );
}
