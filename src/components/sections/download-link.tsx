"use client";

import { buttonClass } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";

export function DownloadLink({ href, title }: { href: string; title: string }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={buttonClass("outline", "sm", "shrink-0")} onClick={() => track("download", { file_title: title })}>
      Download<span className="sr-only">: {title}</span>
    </a>
  );
}
