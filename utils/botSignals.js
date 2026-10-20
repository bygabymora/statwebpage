// Evidence for telling crawlers and scripts apart from people's browsers.
// proxy.js logs it for page requests that look automated, because Vercel's
// request view shows only the user agent, and anyone can fake that.

// Crawlers, link previewers, monitors and HTTP libraries that name themselves
const SELF_DECLARED_BOT =
  /bot|crawl|spider|slurp|scrap|preview|fetch|monitor|uptime|lighthouse|pagespeed|headless|phantom|puppeteer|playwright|selenium|python|curl|wget|httpclient|okhttp|axios|go-http|java\/|libwww|facebookexternalhit|whatsapp|prefetch proxy/i;

// Chrome and Firefox ship a new version every four weeks. These anchors give
// an estimate of today's stable version, so the check never needs updating.
const RELEASE_ANCHORS = {
  Chrome: { version: 120, date: Date.UTC(2023, 11, 5) },
  Firefox: { version: 121, date: Date.UTC(2023, 11, 19) },
};
const FOUR_WEEKS = 28 * 24 * 60 * 60 * 1000;
// About a year of updates: managed office PCs lag behind, scripts far more
const MAX_VERSIONS_BEHIND = 13;

const SESSION_COOKIE = /(?:^|;\s*)(?:__Secure-)?next-auth\.session-token/;

function versionsBehind(ua, now) {
  const match = /(Firefox|Chrome)\/(\d+)/.exec(ua);
  if (!match) return null;
  const [, name, version] = match;
  const anchor = RELEASE_ANCHORS[name];
  const current =
    anchor.version + Math.floor((now - anchor.date) / FOUR_WEEKS);
  return { name, major: Number(version), behind: current - Number(version) };
}

// The other site's page, without a query that could carry personal data
function refererPage(referer) {
  if (!referer) return null;
  try {
    const url = new URL(referer);
    return `${url.origin}${url.pathname}`;
  } catch {
    return "(malformed)";
  }
}

function decodeHeader(value) {
  try {
    return value && decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function describeVisitor(request, now = Date.now()) {
  const headers = request.headers;
  const ua = headers.get("user-agent") || "";
  const declared = SELF_DECLARED_BOT.test(ua);
  // Strong: every current browser sends these, so a "browser" without them
  // is a script borrowing its user agent. Weak: odd, but people do it too.
  const strong = [];
  const weak = [];

  if (!ua) strong.push("no user agent");
  if (ua && !declared) {
    if (!headers.get("accept-language")) strong.push("no Accept-Language");
    if (!headers.get("sec-fetch-mode")) strong.push("no Sec-Fetch headers");
    if (/Chrome\//.test(ua) && !headers.get("sec-ch-ua")) {
      strong.push("Chrome user agent without client hints");
    }
    const version = versionsBehind(ua, now);
    if (version && version.behind > MAX_VERSIONS_BEHIND) {
      weak.push(
        `${version.name} ${version.major} is ~${version.behind} versions old`,
      );
    }
  }

  const url = new URL(request.url);
  const secFetch = ["site", "mode", "dest", "user"]
    .map((key) => headers.get(`sec-fetch-${key}`))
    .filter(Boolean)
    .join(" ");

  return {
    visitor:
      declared ? "bot"
      : strong.length ? "likely-bot"
      : weak.length ? "suspect"
      : "browser",
    reasons: [...strong, ...weak],
    method: request.method,
    path: url.pathname,
    // Names only: values can hold emails or tokens (/unsubscribe, /Login)
    queryKeys: [...new Set(url.searchParams.keys())],
    ip:
      headers.get("x-real-ip") ||
      headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      null,
    location:
      [
        decodeHeader(headers.get("x-vercel-ip-city")),
        headers.get("x-vercel-ip-country-region"),
        headers.get("x-vercel-ip-country"),
      ]
        .filter(Boolean)
        .join(", ") || null,
    ua: ua || null,
    referer: refererPage(headers.get("referer")),
    accept: headers.get("accept"),
    acceptLanguage: headers.get("accept-language"),
    secFetch: secFetch || null,
    clientHints: headers.get("sec-ch-ua"),
    platform: headers.get("sec-ch-ua-platform"),
    purpose: headers.get("sec-purpose") || headers.get("purpose"),
    tlsFingerprint: headers.get("x-vercel-ja4-digest"),
    signedIn: SESSION_COOKIE.test(headers.get("cookie") || ""),
  };
}
