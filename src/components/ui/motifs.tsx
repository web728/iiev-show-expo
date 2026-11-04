// Geometric motifs derived from the EV Stylescape: diagonal chevron stripes,
// broad arcs and thin stroke rings. Decorative only.

export function ChevronStripes({ className = "", color = "#1d8043" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 160" aria-hidden="true" focusable="false">
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${i * 26} 160 L${i * 26 + 60} 80 L${i * 26} 0 L${i * 26 + 14} 0 L${i * 26 + 74} 80 L${i * 26 + 14} 160 Z`} fill={color} opacity={1 - i * 0.18} />
      ))}
    </svg>
  );
}

export function DiagonalStripes({ className = "", color = "#ffffff" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={i} d={`M${i * 18 - 30} 100 L${i * 18 + 10} 0 L${i * 18 + 18} 0 L${i * 18 - 22} 100 Z`} fill={color} />
      ))}
    </svg>
  );
}

export function Arc({ className = "", color = "#f9c900", width = 40 }: { className?: string; color?: string; width?: number }) {
  return (
    <svg className={className} viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <circle cx="200" cy="200" r={200 - width / 2} fill="none" stroke={color} strokeWidth={width} />
    </svg>
  );
}

export function BoltMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 96" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="bolt-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f9c900" />
          <stop offset="1" stopColor="#f9c900" stopOpacity=".75" />
        </linearGradient>
      </defs>
      <path d="M38 0 4 54h24L18 96 60 36H34z" fill="url(#bolt-g)" />
    </svg>
  );
}

/** Thin stroke line-art skyline used where photography is not yet licensed. */
export function LineCity({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 200" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false">
      <path d="M0 190h640" />
      <path d="M20 190V120h40v70M30 130h8M42 130h8M30 145h8M42 145h8M30 160h8M42 160h8" />
      <path d="M80 190V90h50v100M90 100h10M110 100h10M90 115h10M110 115h10M90 130h10M110 130h10M90 145h10M110 145h10" />
      <path d="M150 190v-60l30-20 30 20v60M170 190v-25h20v25" />
      <path d="M232 190V60h36v130M240 70h20M240 85h20M240 100h20M240 115h20M240 130h20" />
      <path d="M290 190v-40h70v40M300 150v-20h50v20" />
      <path d="M318 130v-14M332 130v-14M325 116l-8-10M325 116l8-10" />
      <rect x="380" y="140" width="34" height="50" rx="4" />
      <path d="M392 156h10l-4 8h6l-10 12 3-9h-6z" />
      <path d="M414 160h10a6 6 0 0 1 6 6v10" />
      <path d="M450 190V100h60v90M462 112h12M486 112h12M462 128h12M486 128h12M462 144h12M486 144h12" />
      <circle cx="560" cy="80" r="22" />
      <path d="M560 46v-10M560 124v-10M526 80h-10M604 80h-10M536 56l-7-7M591 111l-7-7M584 56l7-7M529 111l7-7" />
      <path d="M540 190v-50l40-20v70M600 190v-30h30v30" />
    </svg>
  );
}
