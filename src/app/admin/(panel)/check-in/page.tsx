import { requirePermission } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/ui";
import { CheckinStation } from "@/components/admin/checkin-station";

export const metadata = { title: "Check-in station" };

export default async function CheckinPage() {
  const admin = await requirePermission("checkin.scan");
  return (
    <>
      <AdminHeader title="Check-in station" subtitle="Online check-in. Server time and your account are recorded for every scan. See the badge & check-in runbook for the offline contingency." />
      <CheckinStation defaultStation={`Desk-${admin.name.split(" ")[0]}`} />
    </>
  );
}
