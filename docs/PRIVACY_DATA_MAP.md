# Privacy data map

Legal review required before launch (DPDP Act 2023 applicability, notices, retention). This map supports that review; it is not legal advice.

| Data set | Fields | Purpose | Stored in | Shared with | Retention (default) | Access |
|---|---|---|---|---|---|---|
| Visitor registration | name, email, phone, company, designation, industry, location, reason, interests | Registration, badge, entry control | MongoDB `visitors` | Google Sheets (ops copy), email provider | 730 days | Registration, Super Admin |
| Check-ins | visitor ref, time, station, staff | Entry control, fraud prevention | `checkins` | — | with visitor record | Registration, Super Admin |
| Enquiries/applications | contact + form details | Respond, CRM | `leads` | Sheets, email | 1,095 days | Sales, Conference (view), Super Admin |
| Consent records | email, purpose, granted, notice version | Proof of consent | `consentrecords` | — | life of record + legal hold | Super Admin |
| Attribution | landing page, referrer origin, UTM | Marketing measurement | on lead/visitor | — | with record | as above |
| IP | keyed hash only | Abuse prevention | lead/visitor `ipHash`, rate-limit keys | — | rate-limit docs expire automatically | — |
| Admin users | name, email, role, hashed password, encrypted MFA seed | Access control | `adminusers` | — | until removed | Super Admin |
| Audit log | actor, action, entity id, redacted diff | Accountability | `auditevents` | — | retained | Super Admin |
| Analytics (consented) | pseudonymous usage | Site improvement | Google Analytics | Google | GA setting (set 14 months) | Analysts |

## Data subject requests
1. Verify identity (reply from the registered email).
2. Access: export the record from Admin (visitor/lead detail) → send securely.
3. Correction: edit in Admin (badge auto-reissued for name changes).
4. Deletion: cancel the visitor/lead, then remove from MongoDB via a Super Admin database operation and delete the Sheets row; record the request in the audit log. Keep consent/audit evidence where legally required.
5. Marketing withdrawal: set marketing opt-out (record a new consent record).

Retention enforcement: run a scheduled script (to be added once retention periods are approved) — see OPERATIONS_RUNBOOK.md.
