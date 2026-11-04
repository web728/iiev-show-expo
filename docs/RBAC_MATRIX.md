# RBAC matrix

Source of truth: `src/lib/auth/rbac.ts`. Enforced server-side in every admin page (`requirePermission`), server action and admin API (`apiPermission`).

| Permission | Super Admin | Content Editor | Sales | Registration | Conference | Media | Read-only Analyst |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| dashboard.view | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| settings.manage | ✓ | | | | | | |
| users.manage | ✓ | | | | | | |
| audit.view | ✓ | | | | | | |
| integrations.manage | ✓ | | | | | | |
| content.view | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ |
| content.edit | ✓ | ✓ | | | | ✓ | |
| content.publish | ✓ | ✓ | | | | | |
| history.edit | ✓ | | | | | | |
| leads.view | ✓ | | ✓ | | ✓ | | |
| leads.edit / leads.export | ✓ | | ✓ | | | | |
| visitors.view / edit / export | ✓ | | | ✓ | | | |
| checkin.scan | ✓ | | | ✓ | | | |
| conference.edit | ✓ | ✓ | | | ✓ | | |
| media.edit | ✓ | ✓ | | | ✓ | ✓ | |
| directory.edit | ✓ | ✓ | ✓ | | | | |
| redirects.manage | ✓ | ✓ | | | | | |
| reports.view (aggregates only) | ✓ | | ✓ | ✓ | | | ✓ |

The Analyst role sees no personal data. Role changes and deactivation revoke the user's sessions immediately. Locked history records: Super Admin only.
