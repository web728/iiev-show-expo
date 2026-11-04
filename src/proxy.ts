import { NextResponse, type NextRequest } from "next/server";
import { getRedirectMap, normalisePath } from "@/lib/data/redirect-map";
import { safeEqual } from "@/lib/security/crypto";

// Runs before routing (Node.js runtime in Next 16):
//  1. Staging protection: HTTP Basic auth + X-Robots-Tag noindex when SITE_ENV=staging.
//  2. Passes the request path to server components (used for login "next" redirects).
//  3. CMS-managed redirects (Admin → Redirects), read from MongoDB and cached briefly in memory.

const isStaging = process.env.SITE_ENV === "staging";

function unauthorised() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="IIEV staging", charset="UTF-8"', "X-Robots-Tag": "noindex, nofollow" },
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaging && process.env.STAGING_BASIC_AUTH) {
    const header = request.headers.get("authorization") || "";
    if (!safeEqual(header, `Basic ${btoa(process.env.STAGING_BASIC_AUTH)}`)) return unauthorised();
  }

  const isPublicPage = !pathname.startsWith("/api/") && !pathname.startsWith("/admin");
  if (isPublicPage && request.method === "GET") {
    const hit = (await getRedirectMap()).get(normalisePath(pathname));
    if (hit) {
      // Only same-site paths or absolute https URLs are stored (validated in the CMS).
      const dest = new URL(hit.to, request.url);
      return NextResponse.redirect(dest, hit.statusCode as 301 | 302 | 308);
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-iiev-path", pathname + request.nextUrl.search);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  if (isStaging) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|brand/|media/|uploads/|favicon.ico|icon|apple-icon).*)"],
};
