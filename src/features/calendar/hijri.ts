import { hijriMonthName } from "./config";
import type { HijriDate, HijriMonthRow, HijriOverrideRow } from "./types";

/**
 * Converts a "YYYY-MM-DD" string into a whole day-number (days since the Unix
 * epoch, in UTC). Using UTC avoids the classic off-by-one that happens when a
 * local timezone is west of UTC and `new Date("2026-03-08")` rolls back a day.
 */
export function toDayNumber(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export type HijriResolver = (gregorianISO: string) => HijriDate | null;

type MonthBoundary = Pick<
  HijriMonthRow,
  "hijri_year" | "hijri_month" | "gregorian_start"
>;
type Override = Pick<
  HijriOverrideRow,
  "gregorian_date" | "hijri_year" | "hijri_month" | "hijri_day"
>;

/**
 * Builds the Hijri-date engine. Given the stored month-start boundaries and any
 * explicit per-day overrides, it returns a function that maps any Gregorian
 * "YYYY-MM-DD" to its Hijri date.
 *
 * Rules — deliberately explicit, nothing hidden:
 *   1. If an override row exists for the exact date, that Hijri date wins.
 *   2. Otherwise the date is derived from the latest month-start boundary at or
 *      before it: day-of-month = (date - boundaryStart) + 1.
 *
 * There is no baked-in +1/-1 anywhere. To shift a whole month, move its row in
 * `hijri_months`; to fix a single day (e.g. a month-end sighting adjustment),
 * add a row in `hijri_overrides`. Both are visible data, not code.
 */
export function createHijriResolver(
  months: MonthBoundary[],
  overrides: Override[] = [],
): HijriResolver {
  const sorted = months
    .map((m) => ({ ...m, start: toDayNumber(m.gregorian_start) }))
    .sort((a, b) => a.start - b.start);

  const overrideMap = new Map(overrides.map((o) => [o.gregorian_date, o] as const));

  return (gregorianISO) => {
    const override = overrideMap.get(gregorianISO);
    if (override) {
      return {
        year: override.hijri_year,
        month: override.hijri_month,
        day: override.hijri_day,
        monthName: hijriMonthName(override.hijri_month),
        source: "override",
      };
    }

    const target = toDayNumber(gregorianISO);
    let match: (typeof sorted)[number] | null = null;
    for (const boundary of sorted) {
      if (boundary.start <= target) match = boundary;
      else break;
    }
    if (!match) return null;

    return {
      year: match.hijri_year,
      month: match.hijri_month,
      day: target - match.start + 1,
      monthName: hijriMonthName(match.hijri_month),
      source: "derived",
    };
  };
}
