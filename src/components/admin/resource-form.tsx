import type { AdminField, AdminResource } from "@/lib/admin/resources";
import { dateToIstLocal } from "@/lib/admin/form-parse";
import { aInput, aBtnPrimary, aBtnSecondary } from "./ui";
import { ImageField } from "./image-field";

function valueFor(f: AdminField, doc: Record<string, unknown>): string {
  const v = doc[f.name];
  if (v === undefined || v === null) return "";
  if (f.type === "tags") return (v as string[]).join("\n");
  if (f.type === "lines") return (v as Record<string, unknown>[]).map((o) => (f.lineKeys ?? []).map((k) => o[k] ?? "").join(" | ").replace(/( \| )+$/, "")).join("\n");
  if (f.type === "datetime") return dateToIstLocal(v as Date);
  if (f.type === "date") return dateToIstLocal(v as Date).slice(0, 10);
  return String(v);
}

function Field({ f, doc }: { f: AdminField; doc: Record<string, unknown> }) {
  const id = f.name;
  const label = (
    <span className="text-sm font-semibold text-ink">
      {f.label}
      {f.required ? <span className="text-danger"> *</span> : null}
    </span>
  );
  const help = f.help ? <span className="text-xs text-ink-muted">{f.help}</span> : null;
  const v = valueFor(f, doc);
  switch (f.type) {
    case "boolean":
      return (
        <label className="flex items-start gap-2 sm:col-span-2">
          <input type="checkbox" name={id} defaultChecked={Boolean(doc[f.name])} className="mt-1 size-4 accent-brand-green" />
          <span>{label}{help ? <span className="block">{help}</span> : null}</span>
        </label>
      );
    case "textarea":
    case "markdown":
    case "tags":
    case "lines":
      return (
        <label className="grid gap-1 sm:col-span-2">
          {label}
          <textarea name={id} defaultValue={v} rows={f.type === "markdown" ? 14 : f.type === "textarea" ? 4 : 6} required={f.required} className={`${aInput} ${f.type === "markdown" || f.type === "lines" ? "font-mono text-[13px]" : ""}`} />
          {help ?? (f.type === "markdown" ? <span className="text-xs text-ink-muted">Supports ## headings, ### subheadings, - lists, **bold**, *italic* and [links](/path).</span> : null)}
        </label>
      );
    case "select":
      return (
        <label className="grid gap-1">
          {label}
          <select name={id} defaultValue={v} required={f.required} className={aInput}>
            <option value="">—</option>
            {(f.options ?? []).map((o) => {
              const opt = typeof o === "string" ? { value: o, label: o } : o;
              return <option key={opt.value} value={opt.value}>{opt.label}</option>;
            })}
          </select>
          {help}
        </label>
      );
    case "multiselect": {
      const selected = new Set((doc[f.name] as string[]) ?? []);
      return (
        <fieldset className="sm:col-span-2">
          <legend className="mb-1">{label}</legend>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {(f.options ?? []).map((o) => {
              const opt = typeof o === "string" ? { value: o, label: o } : o;
              return (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name={id} value={opt.value} defaultChecked={selected.has(opt.value)} className="accent-brand-green" /> {opt.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      );
    }
    case "image":
      return (
        <div className="grid gap-1 sm:col-span-2">
          <label htmlFor={id}>{label}</label>
          <ImageField name={id} defaultValue={v} required={f.required} />
          {help}
        </div>
      );
    default:
      return (
        <label className="grid gap-1">
          {label}
          <input
            name={id}
            defaultValue={v}
            required={f.required}
            type={f.type === "number" ? "number" : f.type === "datetime" ? "datetime-local" : f.type === "date" ? "date" : f.type === "url" ? "url" : "text"}
            placeholder={f.placeholder}
            className={aInput}
          />
          {help}
        </label>
      );
  }
}

export function ResourceForm({
  res,
  doc,
  action,
  canPublish,
}: {
  res: AdminResource;
  doc: Record<string, unknown>;
  action: (fd: FormData) => Promise<void>;
  canPublish: boolean;
}) {
  const status = String(doc.status ?? "draft");
  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      {res.fields.map((f) => <Field key={f.name} f={f} doc={doc} />)}
      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-5 sm:col-span-2">
        {res.publishable ? (
          <>
            <button name="_status" value={status === "published" ? "published" : "draft"} className={aBtnSecondary}>{status === "published" ? "Save (stays published)" : "Save draft"}</button>
            {status !== "review" && status !== "published" ? <button name="_status" value="review" className={aBtnSecondary}>Submit for review</button> : null}
            {canPublish ? (
              status === "published" ? (
                <button name="_status" value="draft" className={aBtnSecondary}>Unpublish</button>
              ) : (
                <button name="_status" value="published" className={aBtnPrimary}>Publish</button>
              )
            ) : null}
            {status !== "archived" ? <button name="_status" value="archived" className={aBtnSecondary}>Archive</button> : null}
          </>
        ) : (
          <button className={aBtnPrimary}>Save</button>
        )}
      </div>
    </form>
  );
}
