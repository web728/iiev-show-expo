import Link from "next/link";
import type { ReactNode } from "react";

// Minimal, safe Markdown for CMS content: ##/### headings, paragraphs,
// "- " and "1. " lists, **bold**, *italic* and [links](url). Produces React
// elements directly — no HTML injection is possible.

function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${keyPrefix}-${i++}`;
    if (m[2]) out.push(<strong key={k}>{m[2]}</strong>);
    else if (m[3]) out.push(<em key={k}>{m[3]}</em>);
    else if (m[4] && m[5]) {
      const href = m[5];
      if (href.startsWith("/")) out.push(<Link key={k} href={href}>{m[4]}</Link>);
      else if (/^https?:\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:"))
        out.push(<a key={k} href={href} rel="noopener noreferrer" target={href.startsWith("http") ? "_blank" : undefined}>{m[4]}</a>);
      else out.push(m[4]);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source, className = "prose-iiev" }: { source: string; className?: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let k = 0;

  const flushPara = () => {
    if (para.length) {
      blocks.push(<p key={k++}>{inline(para.join(" "), `p${k}`)}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      const items = list.items.map((it, i) => <li key={i}>{inline(it, `l${k}-${i}`)}</li>);
      blocks.push(list.ordered ? <ol key={k++}>{items}</ol> : <ul key={k++}>{items}</ul>);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    const h = /^(#{2,3})\s+(.*)$/.exec(line);
    const ul = /^\s*[-*]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      flushList();
      blocks.push(h[1] === "##" ? <h2 key={k++}>{inline(h[2], `h${k}`)}</h2> : <h3 key={k++}>{inline(h[2], `h${k}`)}</h3>);
    } else if (ul || ol) {
      flushPara();
      const ordered = Boolean(ol);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((ul ?? ol)![1]);
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();
  return <div className={className}>{blocks}</div>;
}
