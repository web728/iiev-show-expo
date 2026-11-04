import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/session";
import { connectDb } from "@/lib/db/connect";
import { getResource } from "@/lib/admin/resources";
import { AdminHeader, Table, StatusBadge, Pager, Flash, aInput, aBtnPrimary, aBtnSecondary, qsMerge } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Content" };

export default async function ResourceList({ params, searchParams }: PageProps<"/admin/content/[resource]">) {
  const { resource } = await params;
  const res = getResource(resource);
  if (!res) notFound();
  await requirePermission(res.editPermission);
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  await connectDb();
  const q: Record<string, unknown> = { ...(res.baseFilter ?? {}) };
  if (s("status")) q.status = s("status");
  if (s("q")) {
    const rx = new RegExp(s("q").replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 60), "i");
    q.$or = res.searchFields.map((f) => ({ [f]: rx }));
  }
  const page = Math.max(1, Number(s("page") || 1));
  const per = 40;
  const [rows, total] = await Promise.all([
    res.model.find(q).sort(res.defaultSort).skip((page - 1) * per).limit(per).lean<Record<string, unknown>[]>(),
    res.model.countDocuments(q),
  ]);
  const showStatus = res.publishable || res.key === "exhibitors";
  const fmt = (v: unknown) => (v instanceof Date ? formatDateTime(v) : typeof v === "boolean" ? (v ? "Yes" : "No") : v == null || v === "" ? "—" : String(v));

  return (
    <>
      <AdminHeader title={res.label} subtitle={`${total} items`} actions={<Link href={`/admin/content/${res.key}/new/`} className={aBtnPrimary}>New {res.singular.toLowerCase()}</Link>} />
      <Flash sp={sp} />
      <form className="mb-4 grid gap-2 rounded-xl border border-line bg-white p-3 sm:grid-cols-[1fr_12rem_auto]">
        <input name="q" defaultValue={s("q")} placeholder="Search" className={aInput} aria-label="Search" />
        {showStatus ? (
          <select name="status" defaultValue={s("status")} className={aInput} aria-label="Status">
            <option value="">Any status</option>
            {(res.key === "exhibitors" ? ["draft", "submitted", "approved", "published", "archived"] : ["draft", "review", "published", "archived"]).map((x) => <option key={x}>{x}</option>)}
          </select>
        ) : <span />}
        <button className={aBtnSecondary}>Filter</button>
      </form>
      <Table head={[...res.listColumns.map((c) => c.label), ...(showStatus ? ["Status"] : []), "Updated"]} empty={!rows.length}>
        {rows.map((r) => (
          <tr key={String(r._id)} className="hover:bg-mist/50">
            {res.listColumns.map((c, i) => (
              <td key={c.name} className="px-4 py-3">
                {i === 0 ? <Link href={`/admin/content/${res.key}/${r._id}/`} className="font-semibold text-ink hover:text-brand-green">{fmt(r[c.name])}</Link> : fmt(r[c.name])}
              </td>
            ))}
            {showStatus ? <td className="px-4 py-3"><StatusBadge value={String(r.status ?? "")} /></td> : null}
            <td className="px-4 py-3 text-xs text-ink-muted">{fmt(r.updatedAt)}</td>
          </tr>
        ))}
      </Table>
      <Pager page={page} pages={Math.ceil(total / per)} hrefFor={(p) => `/admin/content/${res.key}/${qsMerge(sp, { page: p })}`} />
    </>
  );
}
