import { NextRequest, NextResponse } from "next/server";

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "srsltid",
  "msclkid",
  "_ga",
  "mc_cid",
  "mc_eid",
];

export default function proxy(request: NextRequest) {
  // Static/ISR pages only support GET and HEAD.
  // Reject other methods early to avoid Vercel 405 warnings.
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  const url = request.nextUrl.clone();
  let needsRedirect = false;

  // 1. Only handle specific encoded patterns that cause 404s
  // Focus on encoded query parameters in pathname (like %3F)
  if (url.pathname.includes("%3F") || url.pathname.includes("%3f")) {
    try {
      const decodedPathname = decodeURIComponent(url.pathname);

      if (decodedPathname.includes("?")) {
        const [cleanPath, queryString] = decodedPathname.split("?", 2);
        url.pathname = cleanPath;

        // Add query parameters from pathname to URL search params, but skip tracking params
        if (queryString) {
          const params = new URLSearchParams(queryString);
          params.forEach((value, key) => {
            if (!TRACKING_PARAMS.includes(key.toLowerCase())) {
              url.searchParams.set(key, value);
            }
          });
        }
        needsRedirect = true;
      }
    } catch (e) {
      // If decoding fails, try manual cleanup for news URLs
      if (
        url.pathname.startsWith("/news/") &&
        (url.pathname.includes("%3F") || url.pathname.includes("%3f"))
      ) {
        const cleanPath = url.pathname.split("%3F")[0].split("%3f")[0];
        url.pathname = cleanPath;
        needsRedirect = true;
      }
    }
  }

  // 2. Remove trailing slashes (except root)
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
    needsRedirect = true;
  }

  // 3. News section - remove tracking parameters (check after decoding)
  if (url.pathname.startsWith("/news")) {
    TRACKING_PARAMS.forEach((param) => {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        needsRedirect = true;
      }
    });
  }

  // 4. Redirect if changes were made
  if (needsRedirect) {
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
