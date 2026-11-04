import { ViewTransition } from "react";

// Templates remount on navigation, so each route change animates: the old page
// fades out and the new one rises in. The header stays anchored (named in CSS).
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
