import { requirePermission } from "@/lib/auth/session";
import { connectDb } from "@/lib/db/connect";
import { SiteSettings } from "@/models/content";
import { getCurrentEdition } from "@/lib/data/edition";
import { organiser } from "@/config/site";
import { envNotifyRecipients } from "@/lib/email";
import { AdminHeader, Card, Flash, aInput, aBtnPrimary } from "@/components/admin/ui";
import { saveEditionAction, saveSiteSettingsAction } from "./actions";

export const metadata = { title: "Settings" };

const L = ({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) => (
  <label className={`grid gap-1 text-sm font-semibold text-ink ${wide ? "sm:col-span-2" : ""}`}>{label}{children}</label>
);
const Check = ({ name, label, checked }: { name: string; label: string; checked?: boolean }) => (
  <label className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" name={name} defaultChecked={checked} className="mt-1 accent-brand-green" /> {label}</label>
);

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  await requirePermission("settings.manage");
  const sp = await searchParams;
  await connectDb();
  const e = await getCurrentEdition();
  const s = (await SiteSettings.findOne({ key: "global" }).lean<Record<string, unknown>>()) ?? {};
  const recipients = ((s.notifyRecipients as string[]) ?? []).length ? (s.notifyRecipients as string[]) : envNotifyRecipients();
  const contacts = ((s.contacts as { name: string; phone?: string; email?: string; role?: string }[]) ?? organiser.contacts) as { name: string; phone?: string; email?: string; role?: string }[];
  const ann = (s.announcement as { text?: string; href?: string; active?: boolean }) ?? {};
  const ret = (s.retentionDays as { visitors?: number; leads?: number }) ?? {};

  return (
    <>
      <AdminHeader title="Edition & settings" subtitle="Changes apply to the live site within a minute — no rebuild required." />
      <Flash sp={sp} />
      <div className="grid gap-6">
        <Card title="Current edition">
          <form action={saveEditionAction} className="grid gap-4 sm:grid-cols-2">
            <L label="Edition slug"><input name="slug" defaultValue={e.slug} className={aInput} /></L>
            <L label="Edition number"><input name="editionNumber" type="number" defaultValue={e.editionNumber} className={aInput} /></L>
            <L label="Edition label"><input name="editionLabel" defaultValue={e.editionLabel} className={aInput} /></L>
            <L label="Date label (displayed)"><input name="dateLabel" defaultValue={e.dateLabel} required className={aInput} /></L>
            <L label="Start date"><input name="startDate" type="date" defaultValue={e.startDate} required className={aInput} /></L>
            <L label="End date"><input name="endDate" type="date" defaultValue={e.endDate} required className={aInput} /></L>
            <L label="Opening hours (leave empty until confirmed)" wide><input name="openingHours" defaultValue={e.openingHours ?? ""} className={aInput} placeholder="10:00–18:00 IST daily" /></L>
            <L label="Venue name"><input name="venueName" defaultValue={e.venue.name} required className={aInput} /></L>
            <L label="Locality"><input name="venueLocality" defaultValue={e.venue.locality} className={aInput} /></L>
            <L label="City"><input name="venueCity" defaultValue={e.venue.city} className={aInput} /></L>
            <L label="State"><input name="venueRegion" defaultValue={e.venue.region} className={aInput} /></L>
            <L label="Street address (verified)"><input name="venueStreet" defaultValue={e.venue.streetAddress ?? ""} className={aInput} /></L>
            <L label="PIN code (verified)"><input name="venuePostalCode" defaultValue={e.venue.postalCode ?? ""} className={aInput} /></L>
            <L label="Map search query" wide><input name="venueMapQuery" defaultValue={e.venue.mapQuery} className={aInput} /></L>

            <h3 className="mt-2 text-sm font-bold sm:col-span-2">Projected figures</h3>
            <L label="Forecast items (value | label, one per line)" wide>
              <textarea name="forecastItems" rows={3} defaultValue={e.forecasts.items.map((i) => `${i.value} | ${i.label}`).join("\n")} className={`${aInput} font-mono text-xs`} />
            </L>
            <L label="Disclaimer (always shown with figures)" wide><input name="forecastDisclaimer" defaultValue={e.forecasts.disclaimer} className={aInput} /></L>
            <Check name="forecastsApproved" checked={e.forecasts.approved} label="Organiser has APPROVED publishing these projected figures (shown on homepage with disclaimer)" />

            <h3 className="mt-2 text-sm font-bold sm:col-span-2">Conference</h3>
            <L label="Conference name"><input name="conferenceName" defaultValue={e.conference.name} className={aInput} /></L>
            <span />
            <Check name="conferenceTitleApproved" checked={e.conference.titleApproved} label="Conference title approved for 2027" />
            <Check name="programmeAnnounced" checked={e.conference.programmeAnnounced} label="Programme announced (hides 'to be announced' notices)" />

            <h3 className="mt-2 text-sm font-bold sm:col-span-2">Visitor registration</h3>
            <Check name="visitorOpen" checked={e.registration.visitorOpen} label="Visitor registration open" />
            <L label="Approval mode">
              <select name="approvalMode" defaultValue={e.registration.approvalMode} className={aInput}>
                <option value="auto">Automatic approval (badge issued immediately)</option>
                <option value="review">Reviewed approval (staff approve each registration)</option>
              </select>
            </L>
            <L label="Admission note (public)" wide><textarea name="admissionNote" rows={2} defaultValue={e.registration.admissionNote ?? ""} className={aInput} placeholder="e.g. Entry is free for registered business visitors aged 18+." /></L>

            <h3 className="mt-2 text-sm font-bold sm:col-span-2">Concurrent shows confirmed for this edition</h3>
            {e.concurrentShows.map((s) => <Check key={s.key} name={`show_${s.key}`} checked={s.approved} label={`${s.name} (${s.editionLabel})`} />)}

            <button className={`${aBtnPrimary} justify-self-start sm:col-span-2`}>Save edition</button>
          </form>
        </Card>

        <Card title="Notifications, contacts & documents">
          <form action={saveSiteSettingsAction} className="grid gap-4 sm:grid-cols-2">
            <L label="Organiser notification recipient 1"><input name="notify1" type="email" defaultValue={recipients[0] ?? ""} className={aInput} /></L>
            <L label="Organiser notification recipient 2"><input name="notify2" type="email" defaultValue={recipients[1] ?? ""} className={aInput} /></L>
            <Check name="sendAcknowledgements" checked={(s.sendAcknowledgements as boolean) ?? true} label="Send acknowledgement emails to people who submit forms" />
            <L label="Public contacts (name | phone | email | role, one per line)" wide>
              <textarea name="contacts" rows={3} defaultValue={contacts.map((c) => [c.name, c.phone, c.email, c.role].filter((x) => x !== undefined).join(" | ")).join("\n")} className={`${aInput} font-mono text-xs`} />
            </L>
            <L label="Organiser address" wide><input name="address" defaultValue={(s.address as string) ?? organiser.address} className={aInput} /></L>
            <Check name="organiserContactsVerified" checked={Boolean(s.organiserContactsVerified)} label="Contacts and address re-confirmed by the organiser for 2027" />
            <L label="Brochure URL"><input name="brochureUrl" defaultValue={(s.brochureUrl as string) ?? ""} className={aInput} /></L>
            <L label="Floor plan URL"><input name="floorPlanUrl" defaultValue={(s.floorPlanUrl as string) ?? ""} className={aInput} /></L>
            <L label="Exhibitor manual URL"><input name="exhibitorManualUrl" defaultValue={(s.exhibitorManualUrl as string) ?? ""} className={aInput} /></L>
            <L label="Privacy notice version"><input name="privacyNoticeVersion" defaultValue={(s.privacyNoticeVersion as string) ?? "draft-2026-10"} className={aInput} /></L>
            <L label="Announcement bar text" wide><input name="announcementText" defaultValue={ann.text ?? ""} className={aInput} /></L>
            <L label="Announcement link"><input name="announcementHref" defaultValue={ann.href ?? ""} className={aInput} /></L>
            <Check name="announcementActive" checked={ann.active} label="Show announcement bar" />
            <L label="Retain visitor records (days)"><input name="retentionVisitors" type="number" defaultValue={ret.visitors ?? 730} className={aInput} /></L>
            <L label="Retain leads (days)"><input name="retentionLeads" type="number" defaultValue={ret.leads ?? 1095} className={aInput} /></L>
            <button className={`${aBtnPrimary} justify-self-start sm:col-span-2`}>Save settings</button>
          </form>
        </Card>
      </div>
    </>
  );
}
