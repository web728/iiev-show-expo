import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { getResource } from "@/lib/admin/resources";
import { getCurrentEdition } from "@/lib/data/edition";
import { AdminHeader, Card, Flash } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { saveResourceAction } from "../../actions";

export const metadata = { title: "New item" };

export default async function NewResource({ params, searchParams }: PageProps<"/admin/content/[resource]/new">) {
  const { resource } = await params;
  const res = getResource(resource);
  if (!res) notFound();
  const admin = await requirePermission(res.editPermission);
  const sp = await searchParams;
  const e = await getCurrentEdition();
  const defaults: Record<string, unknown> = { edition: e.slug, active: true, order: 100, statusCode: 301, status: res.key === "exhibitors" ? "draft" : undefined };
  return (
    <>
      <AdminHeader title={`New ${res.singular.toLowerCase()}`} back={{ href: `/admin/content/${res.key}/`, label: res.label }} />
      <Flash sp={sp} />
      <Card>
        <ResourceForm res={res} doc={defaults} action={saveResourceAction.bind(null, res.key, null)} canPublish={can(admin.role, res.publishPermission ?? res.editPermission)} />
      </Card>
    </>
  );
}
