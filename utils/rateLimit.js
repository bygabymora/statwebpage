import crypto from "crypto";
import db from "./db";
import RateLimit from "../models/RateLimit";

// Per-IP limits for what anyone can submit without signing in. The forms
// stay open; each visitor (IP) just gets a limited number of attempts per
// window. Every attempt counts, valid or not.
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export const RATE_LIMITS = {
  contactUs: { limit: 5, windowMs: HOUR },
  newsletter: { limit: 5, windowMs: HOUR },
  productWaitList: { limit: 20, windowMs: HOUR },
  productRequest: { limit: 10, windowMs: HOUR },
  productManufacturer: { limit: 5, windowMs: HOUR },
  // Header searches are logged here too, so this one is generous.
  searchLog: { limit: 120, windowMs: HOUR },
  signup: { limit: 5, windowMs: HOUR },
  passwordResetPerIp: { limit: 10, windowMs: HOUR },
  // Also per email address, so one inbox can't be flooded from many IPs.
  passwordResetPerEmail: { limit: 5, windowMs: HOUR },
  unsubscribeSearch: { limit: 30, windowMs: HOUR },
  unsubscribe: { limit: 10, windowMs: HOUR },
};

// The public emails of /api/emails/send-email. The signed-in ones (order,
// exemption, approval) are limited by sign-in and ownership instead.
export const EMAIL_RATE_LIMITS = {
  "Contact Us": RATE_LIMITS.contactUs,
  "Newsletter Subscription": RATE_LIMITS.newsletter,
  "Product Wait List": RATE_LIMITS.productWaitList,
  "Product Request": RATE_LIMITS.productRequest,
  "Product Manufacturer": RATE_LIMITS.productManufacturer,
};

const firstHeader = (req, name) => {
  const value = req.headers?.[name];
  return (Array.isArray(value) ? value[0] : value) || "";
};

// IPv6 visitors usually control a whole /64, so they're counted per /64;
// IPv4 per address.
export function normalizeIp(rawIp) {
  let ip = String(rawIp || "")
    .trim()
    .toLowerCase()
    .replace(/%.*$/, ""); // zone id (fe80::1%eth0)
  if (ip.startsWith("::ffff:") && ip.includes(".")) ip = ip.slice(7);
  if (!ip.includes(":")) return ip;

  const [head, tail] = ip.split("::");
  const headGroups = head ? head.split(":") : [];
  const tailGroups = tail ? tail.split(":") : [];
  const zeros = Array(
    Math.max(0, 8 - headGroups.length - tailGroups.length),
  ).fill("0");
  const groups =
    ip.includes("::") ? [...headGroups, ...zeros, ...tailGroups] : headGroups;
  return `${groups
    .slice(0, 4)
    .map((group) => group.replace(/^0+(?=.)/, ""))
    .join(":")}::/64`;
}

// On Vercel, x-real-ip and x-forwarded-for are set by the platform to the
// visitor's address (a client can't spoof them there).
export function getClientIp(req) {
  const forwardedFor = firstHeader(req, "x-forwarded-for").split(",")[0];
  return (
    normalizeIp(
      firstHeader(req, "x-real-ip") ||
        forwardedFor ||
        req.socket?.remoteAddress,
    ) || "unknown"
  );
}

// Counters store a keyed hash of the IP (or email), never the value itself.
const hashIdentifier = (identifier) =>
  crypto
    .createHmac("sha256", process.env.NEXTAUTH_SECRET || "rate-limit")
    .update(String(identifier))
    .digest("hex")
    .slice(0, 32);

const countAttempt = (key, expiresAt) =>
  RateLimit.findOneAndUpdate(
    { key },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { upsert: true, returnDocument: "after" },
  ).lean();

// Counts one attempt in the current window. Resolves to
// { allowed, retryAfterSeconds }. If the counter can't be reached the
// attempt is allowed: a database hiccup must not take the forms down.
export async function hitRateLimit(name, identifier, { limit, windowMs }) {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const expiresAt = new Date(windowStart + windowMs);
  const key = `${name}:${hashIdentifier(identifier)}:${windowStart}`;
  const retryAfterSeconds = Math.max(1, Math.ceil((expiresAt - now) / 1000));

  try {
    await db.connect(true);
    let counter;
    try {
      counter = await countAttempt(key, expiresAt);
    } catch (error) {
      // Two first attempts at once can both try to create the counter; the
      // loser retries and increments the one that won.
      if (error?.code !== 11000) throw error;
      counter = await countAttempt(key, expiresAt);
    }
    return { allowed: (counter?.count ?? 0) <= limit, retryAfterSeconds };
  } catch (error) {
    console.error(`[RATE_LIMIT] check failed for ${name}, allowing:`, error);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

// Counts the attempt and, when it's over the limit, answers 429 and returns
// false (the caller should stop). `identifier` defaults to the client IP.
export async function enforceRateLimit(
  req,
  res,
  name,
  config,
  identifier = getClientIp(req),
) {
  const { allowed, retryAfterSeconds } = await hitRateLimit(
    name,
    identifier,
    config,
  );
  if (allowed) return true;

  const minutes = Math.ceil(retryAfterSeconds / 60);
  const message = `Too many attempts. Please try again in ${minutes} minute${
    minutes === 1 ? "" : "s"
  }.`;
  res.setHeader("Retry-After", String(retryAfterSeconds));
  res.status(429).json({ success: false, message, error: message });
  return false;
}
