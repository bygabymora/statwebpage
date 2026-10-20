import { NextResponse } from "next/server";
import { describeVisitor } from "./utils/botSignals";

// A JSON warning line, with the evidence, for each page request that doesn't
// look like a person's browser; requests that pass every check aren't logged.
// Filter Vercel's logs by the Warning level, "likely-bot" or an IP.
export function proxy(request) {
  const log = describeVisitor(request);
  if (log.visitor !== "browser") console.warn(JSON.stringify(log));
  return NextResponse.next();
}

export const config = {
  matcher: [
    {
      // Pages and crawler files (robots.txt, sitemap, .well-known, scanner
      // probes like /wp-login.php); skips Next's assets, API calls and media
      source:
        "/((?!_next/|api/|.*\\.(?:png|jpe?g|gif|svg|webp|avif|ico|css|js|map|woff2?|ttf|mp4|webm)$).*)",
      // In-app navigations fetch page data from a browser already running
      // the site's JavaScript; they say nothing about bots.
      missing: [{ type: "header", key: "x-nextjs-data" }],
    },
  ],
};
