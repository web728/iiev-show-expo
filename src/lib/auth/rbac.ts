// Role-based access control. Enforced server-side on every admin page,
// server action and API route via requirePermission(). See docs/RBAC_MATRIX.md.

export const ROLES = ["super_admin", "content_editor", "sales", "registration", "conference", "media", "analyst"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  content_editor: "Content Editor",
  sales: "Sales",
  registration: "Registration",
  conference: "Conference",
  media: "Media",
  analyst: "Read-only Analyst",
};

export const PERMISSIONS = [
  "dashboard.view",
  "settings.manage",
  "users.manage",
  "audit.view",
  "integrations.manage",
  "content.view",
  "content.edit",
  "content.publish",
  "history.edit",
  "leads.view",
  "leads.edit",
  "leads.export",
  "visitors.view",
  "visitors.edit",
  "visitors.export",
  "checkin.scan",
  "conference.edit",
  "media.edit",
  "directory.edit",
  "redirects.manage",
  "reports.view",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const ALL = [...PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  super_admin: ALL,
  content_editor: [
    "dashboard.view", "content.view", "content.edit", "content.publish", "media.edit",
    "directory.edit", "redirects.manage", "conference.edit",
  ],
  sales: ["dashboard.view", "leads.view", "leads.edit", "leads.export", "directory.edit", "reports.view", "content.view"],
  registration: ["dashboard.view", "visitors.view", "visitors.edit", "visitors.export", "checkin.scan", "reports.view"],
  conference: ["dashboard.view", "conference.edit", "content.view", "leads.view", "media.edit"],
  media: ["dashboard.view", "media.edit", "content.view", "content.edit"],
  // Aggregated reporting only — no access to personal records (least privilege).
  analyst: ["dashboard.view", "reports.view", "content.view"],
};

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
