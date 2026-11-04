# Analytics events

Implementation: `src/lib/analytics/client.ts` (`track()`), GA4 loaded by `ConsentManager` only after "Accept analytics". No names, emails, phones or registration IDs are ever sent.

| Event | Fired when | Params |
|---|---|---|
| `page_view` | Route change (consented) | page_path |
| `stall_enquiry_started` / `stall_enquiry_submitted` | First input / success | form |
| `visitor_registration_started` / `visitor_registration_submitted` | First input / success | form |
| `badge_issued` | Auto-approved badge shown | — |
| `sponsorship_enquiry_submitted`, `partner_enquiry_submitted`, `speaker_application_submitted`, `conference_registration_submitted`, `contact_submitted` | Success | form |
| `download` | Download clicked | file_title |
| `visitor_registration_approved`, `checked_in` | **Server-side milestones** — counted in Admin → Reports (not sent to GA) | — |

## Funnel definitions (do not mix)
1. **Marketing enquiry** — a submitted form (Leads, stage New).
2. **Qualified lead** — stage Qualified or later.
3. **Commercial confirmation** — stage Confirmed.
4. **Physical attendance** — a check-in with result `ok`.

## Attribution
On first page view the landing page, referrer origin and UTM parameters are kept in sessionStorage; they are attached to submissions **only with analytics consent** and shown on the lead record and in Reports by source.
Mark GA4 key events: `stall_enquiry_submitted`, `visitor_registration_submitted`, `sponsorship_enquiry_submitted`.
