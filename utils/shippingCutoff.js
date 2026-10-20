// The delivery promise shown to visitors, in New York time. Nothing ships or
// arrives on weekends: orders placed before the 2 PM cutoff ship that day,
// later ones on the next business day, and they arrive the business day
// after shipping. So next-day delivery holds Monday to Thursday before the
// cutoff, 48-hour delivery Monday to Wednesday after it, and at other times
// the site promises neither.

export const CUTOFF_SECONDS = 14 * 3600; // 2 PM ET, same as the FAQ

const NEXT_DAY_DAYS = new Set(["Mon", "Tue", "Wed", "Thu"]);
const TWO_DAY_DAYS = new Set(["Mon", "Tue", "Wed"]);

// One shared object, so the banner's once-a-second update doesn't re-render
const TWO_DAY = { kind: "twoDay" };

/**
 * The time in New York as { weekday ("Mon"…"Sun"), hours, minutes, seconds }.
 * Uses native Intl API — replaces moment-timezone (~300 KB parsed). "h23"
 * keeps midnight as hour 0; some browsers report "24" with `hour12: false`.
 */
export function newYorkClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (type) => parts.find((p) => p.type === type)?.value;
  const number = (type) => parseInt(get(type) || "0", 10);

  return {
    weekday: get("weekday"),
    hours: number("hour"),
    minutes: number("minute"),
    seconds: number("second"),
  };
}

export function deliveryPromise({ weekday, hours, minutes, seconds }) {
  const nowSec = hours * 3600 + minutes * 60 + seconds;

  if (nowSec < CUTOFF_SECONDS) {
    if (!NEXT_DAY_DAYS.has(weekday)) return null;
    const diff = CUTOFF_SECONDS - nowSec;
    return {
      kind: "nextDay",
      remaining: {
        hours: Math.floor(diff / 3600),
        minutes: Math.floor((diff % 3600) / 60),
        seconds: diff % 60,
      },
    };
  }

  return TWO_DAY_DAYS.has(weekday) ? TWO_DAY : null;
}
