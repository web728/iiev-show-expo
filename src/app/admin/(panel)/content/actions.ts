"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isValidObjectId } from "mongoose";
import { requirePermission, audit } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { connectDb } from "@/lib/db/connect";
import { getResource, type AdminResource } from "@/lib/admin/resources";
import { parseResourceForm } from "@/lib/admin/form-parse";
import { ContentVersion } from "@/models/content";

const STATUSES = ["draft", "review", "published", "archived"] as const;

function go(path: string, msg: string, err = false): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}${err ? "error" : "ok"}=${encodeURIComponent(msg)}`);
}

function publishGuard(res: AdminResource, doc: Record<string, unknown>): string | null {
  if (res.key === "albums" && !doc.rightsConfirmed) return "Confirm usage rights before publishing this album.";
  if (res.key === "partners" && !doc.confirmationRef) return "Add the confirmation reference before publishing a partner.";
  if (res.key === "speakers" && !doc.consentToPublish) return "The speaker must confirm participation and consent before publishing.";
  return null;
}

async function snapshot(res: AdminResource, id: string, by: string) {
  if (!res.versioned) return;
  const current = await res.model.findById(id).lean<Record<string, unknown>>();
  if (!current) return;
  const count = await ContentVersion.countDocuments({ entity: res.key, entityId: id });
  await ContentVersion.create({ entity: res.key, entityId: id, version: count + 1, snapshot: current, by });
}

export async function saveResourceAction(key: string, id: string | null, fd: FormData) {
  const res = getResource(key);
  if (!res) go("/admin/", "Unknown resource", true);
  const admin = await requirePermission(res.editPermission);
  await connectDb();
  const base = `/admin/content/${key}/`;
  const { data, errors } = parseResourceForm(res, fd);
  if (Object.keys(errors).length) go(id ? `${base}${id}/` : `${base}new/`, Object.values(errors).join(" · "), true);

  // Exhibitor listings carry their own status; others go through the publish workflow.
  const requestedStatus = String(fd.get("_status") || "");
  if (res.publishable && STATUSES.includes(requestedStatus as (typeof STATUSES)[number])) {
    if (requestedStatus === "published" && !can(admin.role, res.publishPermission ?? res.editPermission)) go(id ? `${base}${id}/` : base, "You don't have permission to publish.", true);
    data.status = requestedStatus;
  }
  if (res.key === "exhibitors" && data.status === "published" && !can(admin.role, "directory.edit")) go(base, "Not allowed", true);

  try {
    if (id) {
      if (!isValidObjectId(id)) go(base, "Invalid id", true);
      const existing = await res.model.findById(id).lean<Record<string, unknown>>();
      if (!existing) go(base, "Not found", true);
      if (existing.locked && admin.role !== "super_admin") go(`${base}${id}/`, "This history record is locked. Only a Super Admin can edit it.", true);
      const merged = { ...existing, ...data };
      if (merged.status === "published") {
        const g = publishGuard(res, merged);
        if (g) go(`${base}${id}/`, g, true);
        if (!existing.publishedAt && !data.publishedAt) data.publishedAt = new Date();
      }
      await snapshot(res, id, admin.email);
      data.updatedBy = admin.email;
      if (res.key === "past-editions") data.version = Number(existing.version ?? 1) + 1;
      await res.model.updateOne({ _id: id }, { $set: data }, { runValidators: true });
      const changed = Object.keys(data).filter((k) => JSON.stringify(data[k]) !== JSON.stringify(existing[k]));
      await audit(admin, `content.update`, res.key, id, `${res.singular}: ${String(merged[res.titleField] ?? "")}`, { fields: changed });
    } else {
      const doc: Record<string, unknown> = { ...(res.defaults ?? {}), ...data, updatedBy: admin.email };
      if (doc.status === "published") {
        const g = publishGuard(res, doc);
        if (g) go(`${base}new/`, g, true);
        if (!doc.publishedAt) doc.publishedAt = new Date();
      }
      const created = await res.model.create(doc);
      await audit(admin, "content.create", res.key, String(created._id), `${res.singular}: ${String(doc[res.titleField] ?? "")}`);
      id = String(created._id);
    }
  } catch (e) {
    if ((e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw e;
    const err = e as { code?: number; message?: string };
    go(id ? `${base}${id}/` : `${base}new/`, err.code === 11000 ? "Another item already uses that slug / key." : `Could not save: ${err.message?.slice(0, 160)}`, true);
  }
  revalidatePath("/", "layout");
  go(`${base}${id}/`, "Saved");
}

export async function deleteResourceAction(key: string, id: string) {
  const res = getResource(key);
  if (!res) go("/admin/", "Unknown resource", true);
  const admin = await requirePermission(res.publishPermission ?? res.editPermission);
  await connectDb();
  const existing = await res.model.findById(id).lean<Record<string, unknown>>();
  if (!existing) go(`/admin/content/${key}/`, "Not found", true);
  if (existing.locked || res.key === "past-editions") go(`/admin/content/${key}/${id}/`, "History records can't be deleted — archive instead.", true);
  await snapshot({ ...res, versioned: true }, id, admin.email);
  await res.model.deleteOne({ _id: id });
  await audit(admin, "content.delete", res.key, id, `${res.singular}: ${String(existing[res.titleField] ?? "")}`);
  revalidatePath("/", "layout");
  go(`/admin/content/${key}/`, "Deleted (a snapshot was kept in version history)");
}

export async function rollbackAction(key: string, id: string, versionId: string) {
  const res = getResource(key);
  if (!res) go("/admin/", "Unknown resource", true);
  const admin = await requirePermission(res.publishPermission ?? res.editPermission);
  await connectDb();
  const v = await ContentVersion.findOne({ _id: versionId, entity: key, entityId: id }).lean<{ snapshot: Record<string, unknown>; version: number }>();
  if (!v) go(`/admin/content/${key}/${id}/`, "Version not found", true);
  const existing = await res.model.findById(id).lean<Record<string, unknown>>();
  if (existing?.locked && admin.role !== "super_admin") go(`/admin/content/${key}/${id}/`, "Locked record — Super Admin only.", true);
  await snapshot(res, id, admin.email);
  const { _id, __v, createdAt, ...rest } = v.snapshot;
  void _id; void __v; void createdAt;
  await res.model.updateOne({ _id: id }, { $set: { ...rest, updatedBy: admin.email } });
  await audit(admin, "content.rollback", res.key, id, `Rolled back to version ${v.version}`);
  revalidatePath("/", "layout");
  go(`/admin/content/${key}/${id}/`, `Restored version ${v.version}`);
}
