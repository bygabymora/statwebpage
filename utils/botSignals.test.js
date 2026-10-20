import { describe, expect, test } from "vitest";
import { describeVisitor } from "./botSignals";

const NOW = Date.UTC(2026, 9, 20);
const SITE = "https://www.statsurgicalsupply.com";

const CHROME_NAVIGATION = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36",
  "accept-language": "en-US,en;q=0.9",
  "sec-fetch-site": "same-origin",
  "sec-fetch-mode": "navigate",
  "sec-fetch-dest": "document",
  "sec-fetch-user": "?1",
  "sec-ch-ua": '"Chromium";v="156", "Google Chrome";v="156"',
};

function visit(path, headers) {
  return describeVisitor(new Request(`${SITE}${path}`, { headers }), NOW);
}

describe("describeVisitor", () => {
  test("a current browser following a link is a browser", () => {
    const log = visit("/Login", CHROME_NAVIGATION);
    expect(log.visitor).toBe("browser");
    expect(log.reasons).toEqual([]);
    expect(log.secFetch).toBe("same-origin navigate document ?1");
  });

  test("crawlers that name themselves are bots", () => {
    const log = visit("/", {
      "user-agent":
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    });
    expect(log.visitor).toBe("bot");
    expect(visit("/", { "user-agent": "python-requests/2.32" }).visitor).toBe(
      "bot",
    );
    expect(
      visit("/.well-known/traffic-advice", {
        "user-agent": "Chrome Privacy Preserving Prefetch Proxy",
      }).visitor,
    ).toBe("bot");
  });

  test("a stale Firefox missing browser headers is likely a bot", () => {
    const log = visit("/login", {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0",
    });
    expect(log.visitor).toBe("likely-bot");
    expect(log.reasons).toEqual([
      "no Accept-Language",
      "no Sec-Fetch headers",
      "Firefox 131 is ~27 versions old",
    ]);
  });

  test("a Chrome user agent without client hints is likely a bot", () => {
    const headers = { ...CHROME_NAVIGATION };
    delete headers["sec-ch-ua"];
    expect(visit("/", headers).reasons).toEqual([
      "Chrome user agent without client hints",
    ]);
  });

  test("an outdated browser that is otherwise normal is only a suspect", () => {
    const log = visit("/", {
      ...CHROME_NAVIGATION,
      "user-agent": CHROME_NAVIGATION["user-agent"].replace("156", "109"),
    });
    expect(log.visitor).toBe("suspect");
  });

  test("no user agent at all is likely a bot", () => {
    expect(visit("/", {}).reasons).toEqual(["no user agent"]);
  });

  test("logs where the request came from without personal data", () => {
    const log = visit("/unsubscribe?email=a%40b.com&email=c", {
      ...CHROME_NAVIGATION,
      referer: `${SITE}/order/123?token=secret`,
      "x-forwarded-for": "203.0.113.7, 10.0.0.1",
      "x-vercel-ip-city": "Cleveland",
      "x-vercel-ip-country-region": "OH",
      "x-vercel-ip-country": "US",
      cookie: "theme=dark; __Secure-next-auth.session-token=abc",
    });
    expect(log.path).toBe("/unsubscribe");
    expect(log.queryKeys).toEqual(["email"]);
    expect(log.referer).toBe(`${SITE}/order/123`);
    expect(log.ip).toBe("203.0.113.7");
    expect(log.location).toBe("Cleveland, OH, US");
    expect(log.signedIn).toBe(true);
    expect(JSON.stringify(log)).not.toMatch(/a%40b|secret|abc/);
  });
});
