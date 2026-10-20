import { describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config, proxy } from "../proxy";

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

describe("product redirects", () => {
  const SITE = "https://www.statsurgicalsupply.com";
  const locationFor = (path) => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    return proxy(new NextRequest(`${SITE}${path}`)).headers.get("location");
  };

  test("drops path segments after the product name", () => {
    expect(locationFor("/products/75100519/%22%22")).toBe(
      `${SITE}/products/75100519`,
    );
    expect(locationFor("/products/EGIA45AVM/a/b?pId=1")).toBe(
      `${SITE}/products/EGIA45AVM?pId=1`,
    );
  });

  test("leaves product names alone, including ones with an encoded slash", () => {
    for (const path of ["/products/EGIA45AVM", "/products/A%2FB", "/products"]) {
      expect(locationFor(path), path).toBeNull();
    }
  });
});
