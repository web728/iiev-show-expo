import { requirePermission } from "@/lib/auth/session";
import { AdminHeader, Card, Flash, aInput, aBtnPrimary } from "@/components/admin/ui";
import { SECTOR_OPTIONS, VISITOR_INDUSTRY_OPTIONS, INDIAN_STATES } from "@/config/options";
import { walkInAction } from "../actions";

export const metadata = { title: "Walk-in registration" };

export default async function WalkInPage({ searchParams }: PageProps<"/admin/visitors/new">) {
  await requirePermission("visitors.edit");
  const sp = await searchParams;
  return (
    <>
      <AdminHeader title="Walk-in registration" subtitle="For visitors registering at the desk. The badge is approved immediately." back={{ href: "/admin/visitors/", label: "Visitors" }} />
      <Flash sp={sp} />
      <Card>
        <form action={walkInAction} className="grid gap-4 sm:grid-cols-2">
          {([
            ["fullName", "Full name", "text"], ["email", "Email", "email"], ["phone", "Mobile", "tel"], ["company", "Company", "text"], ["designation", "Designation", "text"], ["city", "City", "text"],
          ] as const).map(([n, l, t]) => (
            <label key={n} className="grid gap-1 text-sm font-semibold">{l}<input name={n} type={t} required className={aInput} /></label>
          ))}
          <label className="grid gap-1 text-sm font-semibold">State
            <select name="state" className={aInput} defaultValue="Maharashtra">{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
          <label className="grid gap-1 text-sm font-semibold">Country<input name="country" defaultValue="India" className={aInput} /></label>
          <label className="grid gap-1 text-sm font-semibold sm:col-span-2">Industry
            <select name="industry" required className={aInput} defaultValue="">{["", ...VISITOR_INDUSTRY_OPTIONS].map((s) => <option key={s} value={s} disabled={!s}>{s || "Select…"}</option>)}</select>
          </label>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-semibold">Interests</legend>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {SECTOR_OPTIONS.map((s) => <label key={s.value} className="flex items-center gap-2 text-sm"><input type="checkbox" name="sectorInterests" value={s.value} className="accent-brand-green" /> {s.label}</label>)}
            </div>
          </fieldset>
          <label className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" name="privacyAccepted" required className="mt-1 accent-brand-green" /> Visitor has been shown the privacy notice and agrees to registration.</label>
          <button className={`${aBtnPrimary} justify-self-start`}>Register & approve</button>
        </form>
      </Card>
    </>
  );
}
