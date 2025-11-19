// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname, searchParams } = url;

  // We are only interested in routes /products/*
  if (!pathname.startsWith("/products/")) {
    return NextResponse.next();
  }

  // Ej: /products/BARD-1200710?pId=...
  const slugRaw = pathname.slice("/products/".length); // "BARD-1200710"
  const slugPart = slugRaw.split("/")[0]; // "BARD-1200710"

  const hasPid = searchParams.has("pId");

  // List of manufacturers you historically used in the BARD-1200710 type slugs
  // You can add more if you see others in Search Console.
  const manufacturerPrefixes = [
    "BARD",
    "HOLOGIC",
    "COVIDIEN",
    "MEDTRONIC",
    "ETHICON",
    "ARTHREX",
  ];

  let targetSlug = slugPart;
  let manufacturerStripped = false;

  // If the slug starts with a known manufacturer, we remove it:
  for (const prefix of manufacturerPrefixes) {
    const withDash = `${prefix}-`;
    if (slugPart.startsWith(withDash)) {
      targetSlug = slugPart.slice(withDash.length); // BARD-1200710 -> 1200710
      manufacturerStripped = true;
      break;
    }
  }

  // If there is NO pId and we did NOT remove manufacturer, the URL is already "pretty":
  // /products/10-401FC, /products/AR-2922D-24-3, /products/0115311, etc.
  if (!hasPid && !manufacturerStripped) {
    return NextResponse.next();
  }

  // From here on, we WILL redirect:
  url.pathname = `/products/${targetSlug}`;

  // We always remove pId from the query if it exists
  if (hasPid) {
    searchParams.delete("pId");
    url.search = searchParams.toString();
  } else {
    url.search = "";
  }

  return NextResponse.redirect(url, 301);
}

// Only runs on /products/*
export const config = {
  matcher: ["/products/:path*"],
};
