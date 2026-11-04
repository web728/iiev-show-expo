import type { SVGProps } from "react";

// Minimal stroke iconography per the EV Stylescape ("Minimal & Stroke fill").
// 24px grid, 1.75 stroke, round caps. Decorative by default (aria-hidden).

type P = SVGProps<SVGSVGElement> & { title?: string };

function Svg({ title, children, ...props }: P & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const Icon = {
  Bolt: (p: P) => <Svg {...p}><path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12z" /></Svg>,
  Plug: (p: P) => <Svg {...p}><path d="M9 2v5M15 2v5M6 7h12v3a6 6 0 0 1-12 0zM12 16v6" /></Svg>,
  Battery: (p: P) => <Svg {...p}><rect x="2.5" y="7" width="17" height="10" rx="2" /><path d="M21.5 10.5v3M10.5 9.5l-2 3h4l-2 3" /></Svg>,
  Motor: (p: P) => <Svg {...p}><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></Svg>,
  Car: (p: P) => <Svg {...p}><path d="M3 16v-3.5l2-5A2 2 0 0 1 6.9 6h10.2a2 2 0 0 1 1.9 1.5l2 5V16a1 1 0 0 1-1 1h-1M4 17H3" /><circle cx="7.5" cy="16.5" r="2" /><circle cx="16.5" cy="16.5" r="2" /><path d="M9.5 17h5M4 12h16" /></Svg>,
  Scooter: (p: P) => <Svg {...p}><circle cx="5.5" cy="17" r="2.5" /><circle cx="18.5" cy="17" r="2.5" /><path d="M8 17h7l2-8h3M15 4h2l1 5M8 17l-1-5h6" /></Svg>,
  Truck: (p: P) => <Svg {...p}><path d="M2 6h11v10H2zM13 9h4l4 4v3h-8" /><circle cx="6" cy="17.5" r="2" /><circle cx="17" cy="17.5" r="2" /></Svg>,
  Chip: (p: P) => <Svg {...p}><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4M10 10h4v4h-4z" /></Svg>,
  Recycle: (p: P) => <Svg {...p}><path d="m7 19-3.5-6L6 9M10 5h4l2.5 4M17 19h-7M14.5 9 17 9.5l1-2.5M4 15.5 3.5 13 6 12.5M12.5 21 10 19l2-2" /></Svg>,
  Sun: (p: P) => <Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Svg>,
  Factory: (p: P) => <Svg {...p}><path d="M2 21V10l6 4V10l6 4V6l8 4v11zM6 17h2M11 17h2M16 17h2" /></Svg>,
  Software: (p: P) => <Svg {...p}><rect x="2.5" y="4" width="19" height="13" rx="2" /><path d="M8 21h8M12 17v4M9 9l-2 2 2 2M15 9l2 2-2 2" /></Svg>,
  Gauge: (p: P) => <Svg {...p}><path d="M4.9 19A9 9 0 1 1 19.1 19" /><path d="m12 13 4-5" /><circle cx="12" cy="13" r="1.5" /></Svg>,
  Storage: (p: P) => <Svg {...p}><ellipse cx="12" cy="5.5" rx="7.5" ry="2.5" /><path d="M4.5 5.5v13c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-13M4.5 12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5" /></Svg>,
  Users: (p: P) => <Svg {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.5A6.5 6.5 0 0 1 21.5 20" /></Svg>,
  Handshake: (p: P) => <Svg {...p}><path d="m11 17 2 2a1.4 1.4 0 0 0 2-2M14 14l2.5 2.5a1.4 1.4 0 0 0 2-2L14.5 10.4M2 11l5-5 3 1 2-1 4 4M22 11l-5-5M2 11l5.5 5.5a1.4 1.4 0 0 0 2-2" /></Svg>,
  Calendar: (p: P) => <Svg {...p}><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></Svg>,
  MapPin: (p: P) => <Svg {...p}><path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></Svg>,
  Ticket: (p: P) => <Svg {...p}><path d="M3 8V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a2.5 2.5 0 0 0 0 5v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a2.5 2.5 0 0 0 0-5z" transform="translate(0 1.5)" /><path d="M14 6.5v11" strokeDasharray="2 2" /></Svg>,
  Mic: (p: P) => <Svg {...p}><rect x="9" y="2.5" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" /></Svg>,
  Download: (p: P) => <Svg {...p}><path d="M12 3v12M7 10l5 5 5-5M4 19h16" /></Svg>,
  Arrow: (p: P) => <Svg {...p}><path d="M4 12h15M13 6l6 6-6 6" /></Svg>,
  ArrowUpRight: (p: P) => <Svg {...p}><path d="M7 17 17 7M8 7h9v9" /></Svg>,
  Check: (p: P) => <Svg {...p}><path d="m4.5 12.5 5 5 10-11" /></Svg>,
  Menu: (p: P) => <Svg {...p}><path d="M3.5 7h17M3.5 12h17M3.5 17h17" /></Svg>,
  Close: (p: P) => <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>,
  Chevron: (p: P) => <Svg {...p}><path d="m9 6 6 6-6 6" /></Svg>,
  ChevronDown: (p: P) => <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>,
  Search: (p: P) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20.5 20.5-4.5-4.5" /></Svg>,
  Mail: (p: P) => <Svg {...p}><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="m3 6.5 9 6.5 9-6.5" /></Svg>,
  Phone: (p: P) => <Svg {...p}><path d="M5 3h3.5l1.5 5-2.2 1.3a11 11 0 0 0 6.9 6.9L16 14l5 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" /></Svg>,
  Globe: (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></Svg>,
  Shield: (p: P) => <Svg {...p}><path d="M12 2.5 4 5.5v6c0 5 3.5 8.7 8 10 4.5-1.3 8-5 8-10v-6z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></Svg>,
  Layers: (p: P) => <Svg {...p}><path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5" /></Svg>,
  Clock: (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></Svg>,
  Train: (p: P) => <Svg {...p}><rect x="5" y="3" width="14" height="14" rx="3" /><path d="M5 11h14M9 21l1.5-4M15 21l-1.5-4" /><circle cx="9" cy="14" r=".6" fill="currentColor" /><circle cx="15" cy="14" r=".6" fill="currentColor" /></Svg>,
  Plane: (p: P) => <Svg {...p}><path d="M10.5 13.5 3 11l1.5-1.5 8 .5 4-4.5a2 2 0 0 1 3 3l-4.5 4 .5 8L14 22l-2.5-7.5L8 18v3l-1.5 1L5 18l-4-1.5 1-1.5h3z" transform="scale(.92) translate(1 1)" /></Svg>,
  Hotel: (p: P) => <Svg {...p}><path d="M3 21V4h12v17M15 9h6v12M7 8h2M11 8h2M7 12h2M11 12h2M7 16h2M11 16h2M2 21h20" /></Svg>,
  Image: (p: P) => <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></Svg>,
  Play: (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m10 8.5 5.5 3.5-5.5 3.5z" /></Svg>,
  News: (p: P) => <Svg {...p}><path d="M4 5h13v14H5a1 1 0 0 1-1-1zM17 9h3v9a1 1 0 0 1-2 0M7 9h7M7 12.5h7M7 16h4" /></Svg>,
  Info: (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.5v.5" /></Svg>,
  Alert: (p: P) => <Svg {...p}><path d="M12 3 2 20h20zM12 10v4.5M12 17.5v.5" /></Svg>,
  Linkedin: (p: P) => <Svg {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10.5V16M8 7.5v.5M11.5 16v-5.5M11.5 13a2.5 2.5 0 0 1 5 0v3" /></Svg>,
  Instagram: (p: P) => <Svg {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5v.01" /></Svg>,
  Facebook: (p: P) => <Svg {...p}><path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9a.5.5 0 0 1 .5-.5z" /></Svg>,
  X: (p: P) => <Svg {...p}><path d="M4 4l16 16M20 4 4 20" /></Svg>,
  QR: (p: P) => <Svg {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M21 14v.01M14 21h3M21 18v3h-1" /></Svg>,
  Camera: (p: P) => <Svg {...p}><path d="M3 8a2 2 0 0 1 2-2h2l2-2.5h6L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><circle cx="12" cy="13" r="3.5" /></Svg>,
  Logout: (p: P) => <Svg {...p}><path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3" /></Svg>,
};

export type IconName = keyof typeof Icon;
