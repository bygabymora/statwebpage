// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname, searchParams } = url;

  // We are only interested in /products/*
  if (!pathname.startsWith("/products/")) {
    return NextResponse.next();
  }

  // Example pathname: /products/BARD-0115311
  const slugRaw = pathname.slice("/products/".length); // "BARD-0115311"
  const slugPart = slugRaw.split("/")[0]; // "BARD-0115311"

  const hasPid = searchParams.has("pId"); // /products/xxx?pId=...
  const hasDash = slugPart.includes("-"); // BARD-0115311

  // If there is no pId and no dashes, the URL is already "pretty": /products/0115311
  if (!hasPid && !hasDash) {
    return NextResponse.next();
  }

  // We calculate the target slug:
  // - if it has dashes, we take the last part: BARD-0115311 -> 0115311
  let targetSlug = slugPart;
  if (hasDash) {
    const pieces = slugPart.split("-");
    targetSlug = pieces[pieces.length - 1];
  }

  const targetPath = `/products/${targetSlug}`;

  // If for some reason we are already on the target path without query, do not redirect
  if (targetPath === pathname && !hasPid) {
    return NextResponse.next();
  }

  // 301 redirect to the canonical URL without query
  url.pathname = targetPath;
  url.search = "";
  return NextResponse.redirect(url, 301);
}

// Only runs on /products/*
export const config = {
  matcher: ["/products/:path*"],
};
