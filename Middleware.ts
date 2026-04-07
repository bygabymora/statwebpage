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

export default function middleware(request: NextRequest) {
  const method = request.method.toUpperCase();

  // Allow only GET / HEAD
  if (method !== "GET" && method !== "HEAD") {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  const url = request.nextUrl.clone();
  let needsRedirect = false;

  // -----------------------------
  // 1. Fix encoded query in pathname (%3F)
  // -----------------------------
  if (url.pathname.includes("%3F") || url.pathname.includes("%3f")) {
    try {
      const decodedPathname = decodeURIComponent(url.pathname);

      if (decodedPathname.includes("?")) {
        const [cleanPath, queryString] = decodedPathname.split("?", 2);
        url.pathname = cleanPath;

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
    } catch {
      if (url.pathname.startsWith("/news/")) {
        const cleanPath = url.pathname.split("%3F")[0].split("%3f")[0];
        url.pathname = cleanPath;
        needsRedirect = true;
      }
    }
  }

  // -----------------------------
  // 2. Normalize /news trailing slash ONLY
  // -----------------------------
  if (
    url.pathname.startsWith("/news") &&
    url.pathname.length > 1 &&
    url.pathname.endsWith("/")
  ) {
    url.pathname = url.pathname.slice(0, -1);
    needsRedirect = true;
  }

  // -----------------------------
  // 3. Remove tracking params in /news
  // -----------------------------
  if (url.pathname.startsWith("/news")) {
    TRACKING_PARAMS.forEach((param) => {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        needsRedirect = true;
      }
    });
  }

  // -----------------------------
  // 4. Normalize /news slug (SEO clean)
  // -----------------------------
  if (url.pathname.startsWith("/news/")) {
    const slug = url.pathname.replace("/news/", "");

    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newPath = `/news/${cleanSlug}`;

    // ONLY redirect if you actually changed the slug
    if (slug !== cleanSlug) {
      url.pathname = newPath;
      needsRedirect = true;
    }
  }

  // -----------------------------
  // 5. Final redirect (anti-loop safe)
  // -----------------------------
  const original = request.url;
  const updated = url.toString();

  if (needsRedirect && original !== updated) {
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

// -----------------------------
// Matcher
// -----------------------------
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
