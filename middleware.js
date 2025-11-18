// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // We are only interested in everything that hangs in /news/...
  if (pathname.startsWith("/news/")) {
    const afterNews = pathname.slice("/news/".length); // what comes after /news/

    // 1) If that part is empty, we do nothing (let /news/ be handled by Next)
    if (!afterNews) {
      return NextResponse.next();
    }

    // 2) Detect "ugly" URLs: with spaces, %20 or uppercase letters
    const hasSpacesOrEncodedSpaces =
      afterNews.includes(" ") || afterNews.includes("%20");
    const hasUppercase = /[A-Z]/.test(afterNews);

    if (hasSpacesOrEncodedSpaces || hasUppercase) {
      // Redirect all "ugly" URLs to the news listing page
      url.pathname = "/news";
      url.search = ""; // clear query params, optional
      return NextResponse.redirect(url, 301);
    }
  }

  // For everything else, let it continue its normal flow
  return NextResponse.next();
}

// We make the middleware run only on /news/*
export const config = {
  matcher: ["/news/:path*"],
};
