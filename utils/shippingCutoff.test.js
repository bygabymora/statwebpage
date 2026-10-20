import { describe, expect, test } from "vitest";
import { deliveryPromise, newYorkClock } from "./shippingCutoff";

const at = (weekday, hours, minutes = 0, seconds = 0) =>
  deliveryPromise({ weekday, hours, minutes, seconds });

describe("deliveryPromise", () => {
  test("counts down to 2 PM for next-day delivery Monday to Thursday", () => {
    expect(at("Mon", 10)).toEqual({
      kind: "nextDay",
      remaining: { hours: 4, minutes: 0, seconds: 0 },
    });
    expect(at("Thu", 13, 59, 59)).toEqual({
      kind: "nextDay",
      remaining: { hours: 0, minutes: 0, seconds: 1 },
    });
  });

  test("promises 48 hours from 2 PM Monday to Wednesday", () => {
    expect(at("Mon", 14)).toEqual({ kind: "twoDay" });
    expect(at("Wed", 23, 59, 59)).toEqual({ kind: "twoDay" });
  });

  test("promises nothing when delivery would land on or after a weekend", () => {
    expect(at("Thu", 14)).toBeNull(); // ships Friday, arrives Monday
    expect(at("Fri", 9)).toBeNull(); // ships Friday, arrives Monday
    expect(at("Fri", 14)).toBeNull();
    expect(at("Sat", 10)).toBeNull();
    expect(at("Sun", 13)).toBeNull();
  });
});

describe("newYorkClock", () => {
  test("reads New York time, with midnight as hour 0", () => {
    // 00:00:30 EDT on Wednesday, Oct 21 2026
    expect(newYorkClock(new Date("2026-10-21T04:00:30Z"))).toEqual({
      weekday: "Wed",
      hours: 0,
      minutes: 0,
      seconds: 30,
    });
    // 2 PM EST on Monday, Nov 2 2026 (after the clocks change)
    expect(newYorkClock(new Date("2026-11-02T19:00:00Z"))).toMatchObject({
      weekday: "Mon",
      hours: 14,
    });
  });
});
