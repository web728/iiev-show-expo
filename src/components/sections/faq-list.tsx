import { Icon } from "@/components/ui/icons";

export function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-white">
      {items.map((f) => (
        <details key={f.question} className="group px-5 sm:px-6 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold text-ink hover:text-brand-green">
            <h3 className="text-base sm:text-[17px]">{f.question}</h3>
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-line transition-transform group-open:rotate-180">
              <Icon.ChevronDown className="size-4.5" />
            </span>
          </summary>
          <p className="-mt-1 pb-5 text-[15px] leading-relaxed text-ink-soft">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
