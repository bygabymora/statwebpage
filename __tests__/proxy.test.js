import { describe, expect, test } from "vitest";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config } from "../proxy";

const runsOn = (url, headers) =>
  unstable_doesMiddlewareMatch({ config, url, headers });

describe("proxy matcher", () => {
  test("logs pages, crawler files and scanner probes", () => {
    for (const url of [
      "/",
      "/login",
      "/products/EGIA45AVM",
      "/robots.txt",
      "/sitemap.xml",
      "/.well-known/traffic-advice",
      "/wp-login.php",
    ]) {
      expect(runsOn(url), url).toBe(true);
    }
  });

  test("skips assets, API calls and in-app data fetches", () => {
    for (const url of [
      "/_next/static/chunks/main.js",
      "/_next/image?url=x",
      "/api/products",
      "/images/assets/logo.png",
      "/favicon.ico",
    ]) {
      expect(runsOn(url), url).toBe(false);
    }
    expect(runsOn("/products", { "x-nextjs-data": "1" })).toBe(false);
  });
});
