import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · IIEV Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-mist">{children}</div>;
}
