import { redirect } from "next/navigation";
import { requirePermission, audit } from "@/lib/auth/session";
import { connectDb } from "@/lib/db/connect";
import { MediaAsset } from "@/models/content";
import { AdminHeader, Card, Flash, StatusBadge, aInput } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/image-field";
import { storageMode } from "@/lib/storage";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Media library" };

async function updateAsset(id: string, fd: FormData) {
  "use server";
  const admin = await requirePermission("media.edit");
  await connectDb();
  const status = String(fd.get("licensingStatus") || "unknown");
  await MediaAsset.updateOne({ _id: id }, { $set: { alt: String(fd.get("alt") || "").slice(0, 200), owner: String(fd.get("owner") || "").slice(0, 120), usagePermission: String(fd.get("usagePermission") || "").slice(0, 300), licensingStatus: ["unknown", "pending", "licensed", "organiser_owned", "rejected"].includes(status) ? status : "unknown" } });
  await audit(admin, "media.update", "MediaAsset", id, status);
  redirect("/admin/media/?ok=Saved");
}

export default async function MediaPage({ searchParams }: PageProps<"/admin/media">) {
  await requirePermission("media.edit");
  const sp = await searchParams;
  await connectDb();
  const assets = await MediaAsset.find().sort({ createdAt: -1 }).limit(60).lean<{ _id: string; url: string; mime: string; width?: number; height?: number; bytes?: number; alt?: string; owner?: string; usagePermission?: string; licensingStatus: string; uploadedBy?: string; createdAt: Date }[]>();
  return (
    <>
      <AdminHeader title="Media library" subtitle={`Storage: ${storageMode()}. Images are re-encoded with EXIF/GPS metadata removed. Record rights before using any asset publicly.`} />
      <Flash sp={sp} />
      <Card title="Upload">
        <p className="mb-2 text-sm text-ink-muted">JPEG, PNG, WebP, AVIF or PDF up to 15 MB. Copy the URL into any content field.</p>
        <ImageField name="upload" />
      </Card>
      <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((a) => (
          <li key={String(a._id)} className="rounded-xl border border-line bg-white p-4">
            {a.mime.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.url} alt={a.alt || ""} className="h-40 w-full rounded-lg bg-mist object-contain" loading="lazy" />
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg bg-mist text-sm font-bold">PDF</div>
            )}
            <p className="mt-2 break-all font-mono text-[11px] text-ink-muted">{a.url}</p>
            <p className="text-xs text-ink-muted">{a.width ? `${a.width}×${a.height} · ` : ""}{a.bytes ? `${Math.round(a.bytes / 1024)} KB · ` : ""}{a.uploadedBy} · {formatDateTime(a.createdAt)}</p>
            <form action={updateAsset.bind(null, String(a._id))} className="mt-3 grid gap-2">
              <input name="alt" defaultValue={a.alt ?? ""} placeholder="Alt text" className={aInput} aria-label="Alt text" />
              <input name="owner" defaultValue={a.owner ?? ""} placeholder="Source / owner" className={aInput} aria-label="Owner" />
              <input name="usagePermission" defaultValue={a.usagePermission ?? ""} placeholder="Usage permission / licence" className={aInput} aria-label="Usage permission" />
              <div className="flex items-center justify-between gap-2">
                <select name="licensingStatus" defaultValue={a.licensingStatus} className={`${aInput} w-auto`} aria-label="Licensing status">
                  {["unknown", "pending", "licensed", "organiser_owned", "rejected"].map((x) => <option key={x}>{x}</option>)}
                </select>
                <StatusBadge value={a.licensingStatus === "licensed" || a.licensingStatus === "organiser_owned" ? "ok" : a.licensingStatus === "rejected" ? "failed" : "pending"} label={a.licensingStatus} />
                <button className="text-xs font-bold text-brand-blue">Save</button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
