import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { connectDb } from "@/lib/db/connect";
import { getResource } from "@/lib/admin/resources";
import { ContentVersion } from "@/models/content";
import { AdminHeader, Card, Flash, StatusBadge, aBtnSecondary, aBtnDanger } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { formatDateTime } from "@/lib/format";
import { saveResourceAction, deleteResourceAction, rollbackAction } from "../../actions";

export const metadata = { title: "Edit" };

export default async function EditResource({ params, searchParams }: PageProps<"/admin/content/[resource]/[id]">) {
  const { resource, id } = await params;
  const res = getResource(resource);
  if (!res || !isValidObjectId(id)) notFound();
  const admin = await requirePermission(res.editPermission);
  const sp = await searchParams;
  await connectDb();
  const doc = await res.model.findById(id).lean<Record<string, unknown>>();
  if (!doc) notFound();
  const versions = res.versioned ? await ContentVersion.find({ entity: res.key, entityId: id }).sort({ version: -1 }).limit(15).select("version by createdAt").lean() : [];
  const canPublish = can(admin.role, res.publishPermission ?? res.editPermission);
  const pub = res.publicPath?.(doc);
  const locked = Boolean(doc.locked) && admin.role !== "super_admin";

  return (
    <>
      <AdminHeader
        title={String(doc[res.titleField] ?? res.singular)}
        subtitle={<>Last updated {formatDateTime(doc.updatedAt as Date)}{doc.updatedBy ? ` by ${doc.updatedBy}` : ""}</>}
        back={{ href: `/admin/content/${res.key}/`, label: res.label }}
        actions={
          <>
            {doc.status ? <StatusBadge value={String(doc.status)} /> : null}
            {pub && doc.status === "published" ? <Link href={pub} target="_blank" className={aBtnSecondary}>View live ↗</Link> : null}
          </>
        }
      />
      <Flash sp={sp} />
      {locked ? <p className="mb-4 rounded-lg bg-brand-yellow/20 px-4 py-3 text-sm font-semibold">This published history record is locked. Only a Super Admin can change it; all changes are versioned.</p> : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_18rem]">
        <Card>
          <fieldset disabled={locked} className="contents">
            <ResourceForm res={res} doc={doc} action={saveResourceAction.bind(null, res.key, id)} canPublish={canPublish} />
          </fieldset>
        </Card>
        <div className="grid content-start gap-6">
          {res.versioned ? (
            <Card title="Version history">
              <ul className="grid gap-2 text-xs">
                {(versions as unknown as { _id: string; version: number; by: string; createdAt: Date }[]).map((v) => (
                  <li key={String(v._id)} className="flex items-center justify-between gap-2">
                    <span>v{v.version} · {v.by}<span className="block text-ink-muted">{formatDateTime(v.createdAt)}</span></span>
                    {canPublish && !locked ? <form action={rollbackAction.bind(null, res.key, id, String(v._id))}><button className="font-semibold text-brand-blue">Restore</button></form> : null}
                  </li>
                ))}
                {!versions.length ? <li className="text-ink-muted">No earlier versions yet.</li> : null}
              </ul>
            </Card>
          ) : null}
          {canPublish && res.key !== "past-editions" ? (
            <Card title="Danger zone">
              <form action={deleteResourceAction.bind(null, res.key, id)}>
                <button className={aBtnDanger}>Delete {res.singular.toLowerCase()}</button>
              </form>
              <p className="mt-2 text-xs text-ink-muted">Prefer Archive to keep the record. Deletion keeps a snapshot in version history.</p>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
