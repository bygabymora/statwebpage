// middleware.js
import { NextResponse } from "next/server";

// ------------ HELPERS FOR NEWS ------------

// Convert any title segment into an SEO slug
function slugifyTitleSegment(segment) {
  let decoded = segment || "";

  try {
    decoded = decodeURIComponent(decoded);
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    // If decode fails, fall back to the raw value
  }

  decoded = decoded.trim();
  if (!decoded) return "";

  const slug = decoded
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // anything not a–z or 0–9 -> "-"
    .replace(/-+/g, "-") // collapse multiple "-" -> one
    .replace(/^-+|-+$/g, ""); // trim "-" at start and end

  return slug;
}

function handleNews(url) {
  const { pathname } = url;

  // /news or /news/ => listing page, do nothing
  if (pathname === "/news" || pathname === "/news/") {
    return NextResponse.next();
  }

  if (!pathname.startsWith("/news/")) {
    return NextResponse.next();
  }

  // Everything after /news/
  const rest = pathname.slice("/news/".length);
  if (!rest) {
    return NextResponse.next();
  }

  let decoded = rest;
  try {
    decoded = decodeURIComponent(rest);
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    decoded = rest;
  }
  decoded = decoded.trim();

  const slug = slugifyTitleSegment(rest);

  // If we couldn't generate a slug, do nothing
  if (!slug) {
    return NextResponse.next();
  }

  // If it's already a clean slug, do nothing (avoid loops)
  if (decoded === slug) {
    return NextResponse.next();
  }

  // 301 redirect to the slugified version
  url.pathname = `/news/${slug}`;
  url.search = ""; // remove query parameters
  return NextResponse.redirect(url, 301);
}

// ------------ HELPERS FOR PRODUCTS ------------

// IMPORTANT: use the *slug* form of the manufacturer,
// exactly as it appears at the start of /products/<slug>
const manufacturerPrefixes = [
  "BARD",
  "HOLOGIC",
  "COVIDIEN",
  "MEDTRONIC",
  "ETHICON",
  "ARTHREX",
  "APPLIED-MEDICAL", // <- this matches /products/APPLIED-MEDICAL-C8XX2
  "SMITH-NEPHEW", // adjust to your real slug if needed
  "JOHNSON-JOHNSON", // adjust if your slug is different
  "BOSTON-SCIENTIFIC",
  "COOK",
];

function handleProducts(url) {
  const { pathname, searchParams } = url;

  if (!pathname.startsWith("/products/")) {
    return NextResponse.next();
  }

  // Example: /products/BARD-1200710?pId=...
  const slugRaw = pathname.slice("/products/".length); // "BARD-1200710"
  const slugPart = slugRaw.split("/")[0]; // "BARD-1200710"

  const hasPid = searchParams.has("pId");

  let targetSlug = slugPart;
  let manufacturerStripped = false;

  // If the slug starts with a known manufacturer, remove it
  for (const prefix of manufacturerPrefixes) {
    const withDash = `${prefix}-`;
    if (slugPart.startsWith(withDash)) {
      // BARD-1200710 -> 1200710, APPLIED-MEDICAL-C8XX2 -> C8XX2
      targetSlug = slugPart.slice(withDash.length);
      manufacturerStripped = true;
      break;
    }
  }

  // If there is NO pId and we did NOT remove manufacturer, URL is already "pretty":
  // /products/10-401FC, /products/AR-2922D-24-3, etc.
  if (!hasPid && !manufacturerStripped) {
    return NextResponse.next();
  }

  // From here on, we WILL redirect
  url.pathname = `/products/${targetSlug}`;

  // Always remove pId if present
  if (hasPid) {
    searchParams.delete("pId");
    url.search = searchParams.toString();
  } else {
    url.search = "";
  }

  return NextResponse.redirect(url, 301);
}

// ------------ MAIN MIDDLEWARE ------------

export function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Products routes
  if (pathname.startsWith("/products/")) {
    return handleProducts(url);
  }

  // News routes
  if (pathname === "/news" || pathname.startsWith("/news/")) {
    return handleNews(url);
  }

  // Everything else
  return NextResponse.next();
}

// Only run on /products/* and /news/*
export const config = {
  matcher: ["/products/:path*", "/news/:path*"],
};
