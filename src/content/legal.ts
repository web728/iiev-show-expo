// DRAFT legal content — must be reviewed by the organiser's legal adviser
// before production launch (see docs/PENDING_APPROVALS.md). Admins replace
// these via Admin → Pages; a CMS page with the same slug takes precedence.

export type LegalDraft = { slug: string; title: string; description: string; body: string };

export const legalDrafts: LegalDraft[] = [
  {
    slug: "privacy-policy",
    title: "Privacy notice",
    description: "How the India International EV Show collects, uses, stores and protects personal data submitted through this website.",
    body: `## Who we are
This website is operated by Futurex Trade Fair and Events Pvt. Ltd. ("Futurex", "we"), the organiser of the India International EV Show. Contact details are on the [Contact page](/contact/).

## What we collect
- **Visitor registration:** name, email, mobile number, company, designation, industry, location, reason for visit and areas of interest.
- **Enquiries and applications** (stall, sponsorship, partnership, speaker, delegate, contact): the details you enter in the form.
- **Entry records:** the time your badge is scanned at the venue and the scanning station.
- **Technical data:** a keyed hash of your IP address for abuse prevention (we do not store the raw address), and — only if you accept analytics cookies — usage analytics.

## Why we use it
- To process your registration, issue your badge and manage entry to the show.
- To respond to your enquiry or application.
- To keep the website and our forms secure and prevent abuse.
- To send you updates about the show **only if you opted in**. You can withdraw at any time.

## Who we share it with
- Our service providers who host the website, database, email and spreadsheets on our behalf, under contract.
- We do not sell your personal data. Exhibitors do not receive visitor data from this website unless a separate, clearly explained process asks for your consent.

## How long we keep it
Visitor registrations and enquiry records are kept for a limited period after the show for operational, audit and follow-up purposes, and then deleted or anonymised. The retention periods are set in our data retention schedule.

## Your rights
You can ask to access, correct or delete your personal data, or withdraw consent, by contacting us. We may need to verify your identity first. Some records may need to be retained where the law requires it.

## Security
Data is transmitted over HTTPS, access is restricted to authorised staff by role, badge codes contain no personal information, and administrative access is logged.

## Changes
We will update this notice when our practices change and show the date of the latest version.`,
  },
  {
    slug: "terms",
    title: "Terms of use",
    description: "Terms governing use of the India International EV Show website, registrations and badges.",
    body: `## Using this website
By using this website you agree to these terms. Information is provided in good faith; programme details, exhibitors and speakers can change, and the organiser's latest communication takes precedence.

## Registrations and badges
- Visitor badges are personal and non-transferable. The organiser may refuse entry or revoke a badge that appears to be shared, altered or obtained with false details.
- Submitting an enquiry, application or registration does not by itself create a contract, reserve space or guarantee a speaking slot or admission.
- Exhibitor participation is governed by the separate participation contract and exhibitor manual.

## Acceptable use
Do not attempt to access admin areas without authorisation, interfere with the site's operation, submit automated or false registrations, or scrape personal data.

## Intellectual property
The India International EV Show name and logos, and the Futurex name and logo, belong to their owners. Do not use them without permission.

## Liability
To the extent permitted by law, the organiser is not liable for indirect losses arising from use of this website.

## Governing law
These terms are governed by the laws of India.`,
  },
  {
    slug: "cookie-policy",
    title: "Cookie policy",
    description: "How the India International EV Show website uses cookies and how to change your choices.",
    body: `## Essential cookies
These are required for the site to work and cannot be switched off:
- **iiev_consent** — remembers your cookie choice (6 months).
- **Admin session cookie** — only for authorised staff signed in to the admin area.

## Analytics cookies (optional)
If you choose "Accept analytics", we load Google Analytics 4 to understand which pages are useful. We do not send names, emails or phone numbers to analytics. If you choose "Essential only", analytics is not loaded.

## Embedded videos
Videos use YouTube's privacy-enhanced mode and load only when you press play.

## Changing your choice
Use **Cookie settings** in the footer at any time.`,
  },
  {
    slug: "accessibility",
    title: "Accessibility statement",
    description: "Our commitment to making the India International EV Show website accessible, and how to report a problem.",
    body: `## Our goal
We aim for this website to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.

## What we have done
- Keyboard-accessible navigation, menus, forms and galleries, with visible focus.
- Text alternatives for meaningful images and accessible form error messages.
- Colour contrast checked against the brand palette.
- Respect for the "reduce motion" setting on your device.

## Known limitations
Some third-party documents (for example PDFs supplied by partners) may not be fully accessible. Tell us and we will provide the information in another format.

## Feedback
If you find a barrier, please [contact us](/contact/) and describe the page and the problem. We aim to respond within five working days.`,
  },
];
