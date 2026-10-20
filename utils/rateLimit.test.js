import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import RateLimit from "../models/RateLimit";
import { getClientIp, hitRateLimit, normalizeIp } from "./rateLimit";

vi.mock("./db", () => ({ default: { connect: vi.fn() } }));
vi.mock("../models/RateLimit", () => {
  const counters = new Map();
  return {
    default: {
      counters,
      findOneAndUpdate: vi.fn(({ key }) => ({
        lean: async () => {
          counters.set(key, (counters.get(key) || 0) + 1);
          return { key, count: counters.get(key) };
        },
      })),
    },
  };
});

const HOUR = 60 * 60 * 1000;
const config = { limit: 3, windowMs: HOUR };

describe("hitRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    RateLimit.counters.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-20T10:15:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  test("allows `limit` attempts per window, then refuses until it ends", async () => {
    for (let i = 0; i < 3; i++) {
      expect((await hitRateLimit("form", "1.2.3.4", config)).allowed).toBe(
        true,
      );
    }
    const refused = await hitRateLimit("form", "1.2.3.4", config);
    expect(refused).toEqual({ allowed: false, retryAfterSeconds: 45 * 60 });

    vi.setSystemTime(new Date("2026-10-20T11:00:00Z")); // next window
    expect((await hitRateLimit("form", "1.2.3.4", config)).allowed).toBe(true);
  });

  test("counts each client and each limit separately", async () => {
    for (let i = 0; i < 4; i++) await hitRateLimit("form", "1.2.3.4", config);

    expect((await hitRateLimit("form", "5.6.7.8", config)).allowed).toBe(true);
    expect((await hitRateLimit("other", "1.2.3.4", config)).allowed).toBe(true);
  });

  test("stores a hash, never the IP itself", async () => {
    await hitRateLimit("form", "203.0.113.7", config);

    const [{ key }, update] = RateLimit.findOneAndUpdate.mock.calls[0];
    expect(key).not.toContain("203.0.113.7");
    expect(key).toMatch(/^form:[0-9a-f]{32}:\d+$/);
    expect(update.$setOnInsert.expiresAt).toEqual(
      new Date("2026-10-20T11:00:00Z"),
    );
  });

  test("retries once when two first attempts race to create the counter", async () => {
    RateLimit.findOneAndUpdate.mockImplementationOnce(() => ({
      lean: async () => {
        throw Object.assign(new Error("E11000 duplicate key"), { code: 11000 });
      },
    }));

    expect((await hitRateLimit("form", "1.2.3.4", config)).allowed).toBe(true);
    expect(RateLimit.findOneAndUpdate).toHaveBeenCalledTimes(2);
  });

  test("lets the attempt through when the database is unreachable", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    RateLimit.findOneAndUpdate.mockImplementationOnce(() => ({
      lean: async () => {
        throw new Error("connection refused");
      },
    }));

    expect((await hitRateLimit("form", "1.2.3.4", config)).allowed).toBe(true);
    consoleError.mockRestore();
  });
});

describe("client IP", () => {
  test("uses the platform headers, first x-forwarded-for entry", () => {
    expect(getClientIp({ headers: { "x-real-ip": "198.51.100.9" } })).toBe(
      "198.51.100.9",
    );
    expect(
      getClientIp({ headers: { "x-forwarded-for": "198.51.100.4, 10.0.0.1" } }),
    ).toBe("198.51.100.4");
    expect(getClientIp({ headers: {} })).toBe("unknown");
  });

  test("groups an IPv6 /64 together, however it's written", () => {
    expect(normalizeIp("2001:db8::1")).toBe("2001:db8:0:0::/64");
    expect(normalizeIp("2001:0db8:0000:0000:abcd::1")).toBe(
      "2001:db8:0:0::/64",
    );
    expect(normalizeIp("::ffff:203.0.113.7")).toBe("203.0.113.7");
  });
});
