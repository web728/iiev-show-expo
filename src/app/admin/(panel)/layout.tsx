import Image from "next/image";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/session";
import { can, ROLE_LABELS, type Permission } from "@/lib/auth/rbac";
import { Icon, type IconName } from "@/components/ui/icons";
import { RESOURCES } from "@/lib/admin/resources";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

type NavLink = { href: string; label: string; icon: IconName; perm: Permission };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requirePermission("dashboard.view");
  const ops: NavLink[] = [
    { href: "/admin/", label: "Dashboard", icon: "Gauge", perm: "dashboard.view" },
    { href: "/admin/leads/", label: "Leads & enquiries", icon: "Handshake", perm: "leads.view" },
    { href: "/admin/visitors/", label: "Visitors", icon: "Users", perm: "visitors.view" },
    { href: "/admin/check-in/", label: "Check-in station", icon: "QR", perm: "checkin.scan" },
    { href: "/admin/reports/", label: "Reports", icon: "Layers", perm: "reports.view" },
  ];
  const content: NavLink[] = RESOURCES.map((r) => ({ href: `/admin/content/${r.key}/`, label: r.label, icon: "News" as IconName, perm: r.editPermission }));
  const system: NavLink[] = [
    { href: "/admin/media/", label: "Media library", icon: "Image", perm: "media.edit" },
    { href: "/admin/settings/", label: "Edition & settings", icon: "Calendar", perm: "settings.manage" },
    { href: "/admin/users/", label: "Users & roles", icon: "Shield", perm: "users.manage" },
    { href: "/admin/integrations/", label: "Integrations & jobs", icon: "Plug", perm: "integrations.manage" },
    { href: "/admin/audit/", label: "Audit log", icon: "Clock", perm: "audit.view" },
  ];
  const section = (title: string, links: NavLink[]) => {
    const visible = links.filter((l) => can(admin.role, l.perm));
    if (!visible.length) return null;
    return (
      <div className="mt-5">
        <p className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">{title}</p>
        <ul className="mt-1.5 grid gap-0.5">
          {visible.map((l) => {
            const I = Icon[l.icon];
            return (
              <li key={l.href}>
                <Link href={l.href} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] text-white/80 hover:bg-white/10 hover:text-white">
                  <I className="size-4.5 shrink-0" /> {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };
  const nav = (
    <>
      {section("Operations", ops)}
      {section("Content", content)}
      {section("System", system)}
    </>
  );

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15.5rem_1fr]">
      <aside className="hidden bg-brand-navy px-3 py-5 lg:block">
        <Link href="/admin/" className="mx-2 block rounded-lg bg-white p-2">
          <Image src="/brand/iiev-9th-edition-logo-trimmed.png" alt="IIEV Show admin" width={1538} height={734} className="h-10 w-auto" sizes="100px" />
        </Link>
        <nav aria-label="Admin">{nav}</nav>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 sm:px-6">
          <details className="relative lg:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold">
              <Icon.Menu className="size-5" /> Menu
            </summary>
            <nav aria-label="Admin" className="absolute left-0 top-12 z-50 max-h-[75dvh] w-64 overflow-y-auto rounded-xl bg-brand-navy p-3 shadow-xl">{nav}</nav>
          </details>
          <p className="hidden text-sm text-ink-muted lg:block">
            <Link href="/" className="hover:text-brand-green" target="_blank">View website ↗</Link>
          </p>
          <div className="flex items-center gap-3">
            <Link href="/admin/account/" className="text-right text-sm">
              <span className="block font-semibold text-ink">{admin.name}</span>
              <span className="block text-xs text-ink-muted">{ROLE_LABELS[admin.role]}{admin.mfaEnabled ? " · MFA on" : ""}</span>
            </Link>
            <form action={logoutAction}>
              <button className="inline-flex size-9 items-center justify-center rounded-lg border border-line hover:border-danger hover:text-danger" aria-label="Sign out">
                <Icon.Logout className="size-4.5" />
              </button>
            </form>
          </div>
        </header>
        <main id="main" className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
