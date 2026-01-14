// newsMiddleware.js
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

// IMPORTANT: use the *slug* form of the manufacturer,
// exactly as it appears at the start of /news/<slug>
const manufacturerPrefixes = [
  "BARD",
  "HOLOGIC",
  "COVIDIEN",
  "MEDTRONIC",
  "ETHICON",
  "ARTHREX",
  "APPLIED-MEDICAL",
  "SMITH-NEPHEW",
  "JOHNSON-JOHNSON",
  "SMITH-&-NEPHEW",
  "BOSTON-SCIENTIFIC",
  "COOK",
];

function normalizeNewsSlug(slug) {
  return (slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // anything not a–z or 0–9 -> "-"
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // remove hyphens at the beginning and end
}

function handleNews(url) {
  const { pathname, searchParams } = url;

  // /news or /news/ => listing page, do nothing
  if (pathname === "/news" || pathname === "/news/") {
    return NextResponse.next();
  }

  if (!pathname.startsWith("/news/")) {
    return NextResponse.next();
  }

  // Everything after /news/
  const slugRaw = pathname.slice("/news/".length);
  if (!slugRaw) {
    return NextResponse.next();
  }

  const slugPart = slugRaw.split("/")[0];

  const hasNid = searchParams.has("nId"); // news ID parameter

  let targetSlug = slugPart;
  let manufacturerStripped = false;

  // Check if the slug starts with a manufacturer prefix and remove it
  for (const prefix of manufacturerPrefixes) {
    const withDash = `${prefix}-`;
    if (slugPart.startsWith(withDash)) {
      targetSlug = slugPart.slice(withDash.length);
      manufacturerStripped = true;
      break;
    }
  }

  // Normalize the news slug by lowercasing and removing unwanted characters
  const cleanSlug = normalizeNewsSlug(targetSlug);

  // If we couldn't generate a slug, do nothing
  if (!cleanSlug) {
    return NextResponse.next();
  }

  // If there is no nId, no manufacturer was removed and the slug is already clean → no redirect
  if (!hasNid && !manufacturerStripped && slugPart === cleanSlug) {
    return NextResponse.next();
  }

  url.pathname = `/news/${cleanSlug}`;

  if (hasNid) {
    searchParams.delete("nId");
    url.search = searchParams.toString();
  } else {
    url.search = "";
  }

  return NextResponse.redirect(url, 301);
}

// ------------ MAIN NEWS MIDDLEWARE ------------

export function newsMiddleware(request) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // News routes only
  if (pathname === "/news" || pathname.startsWith("/news/")) {
    return handleNews(url);
  }

  // Everything else
  return NextResponse.next();
}

// Only run on /news/*
export const newsConfig = {
  matcher: ["/news/:path*"],
};
