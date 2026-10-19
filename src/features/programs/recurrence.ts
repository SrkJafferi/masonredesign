const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_ONLY_RE = /^(\d{4})-(\d{2})$/;

export const MAX_DAILY_OCCURRENCES = 366;

type DateParts = { year: number; month: number; day: number };

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function parseDateOnly(value: string): DateParts | null {
  const match = DATE_ONLY_RE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

function parseMonthOnly(value: string): { year: number; month: number } | null {
  const match = MONTH_ONLY_RE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (year < 1 || month < 1 || month > 12) return null;
  return { year, month };
}

function toUtcDate(parts: DateParts): Date {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function toDateOnly(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** True only for a real calendar month in YYYY-MM form. */
export function isValidRecurrenceMonth(value: string): boolean {
  return parseMonthOnly(value) !== null;
}

/** Weekday name for a date-only value, without local-timezone conversion. */
export function weekdayName(dateOnly: string): string | null {
  const parts = parseDateOnly(dateOnly);
  if (!parts) return null;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC",
  }).format(toUtcDate(parts));
}

/**
 * Every date in targetMonth that shares startDate's weekday.
 * All arithmetic is UTC over date-only inputs, so Chicago/browser offsets can
 * never move an occurrence onto the previous or next calendar day.
 */
export function generateWeeklyOccurrenceDates(
  startDate: string,
  targetMonth: string,
): string[] {
  const start = parseDateOnly(startDate);
  const target = parseMonthOnly(targetMonth);
  if (!start || !target) return [];

  const weekday = toUtcDate(start).getUTCDay();
  const firstOfMonth = new Date(Date.UTC(target.year, target.month - 1, 1));
  const firstOccurrenceDay = 1 + ((weekday - firstOfMonth.getUTCDay() + 7) % 7);
  const lastDay = new Date(Date.UTC(target.year, target.month, 0)).getUTCDate();
  const dates: string[] = [];

  for (let day = firstOccurrenceDay; day <= lastDay; day += 7) {
    dates.push(`${target.year}-${pad(target.month)}-${pad(day)}`);
  }
  return dates;
}

/** Every calendar date in an inclusive, bounded range, independent of timezone. */
export function generateDailyOccurrenceDates(
  startDate: string,
  lastDate: string,
): string[] {
  const duration = dateDurationDays(startDate, lastDate);
  if (duration === null || duration < 0 || duration >= MAX_DAILY_OCCURRENCES) {
    return [];
  }
  return Array.from({ length: duration + 1 }, (_, index) =>
    addCalendarDays(startDate, index)!,
  );
}

/** Whole calendar-day duration between valid date-only values. */
export function dateDurationDays(
  startDate: string,
  endDate: string | null,
): number | null {
  if (!endDate) return null;
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!start || !end) return null;
  return Math.round((toUtcDate(end).getTime() - toUtcDate(start).getTime()) / 86_400_000);
}

/** Shifts a date-only value by whole days without local timezone involvement. */
export function addCalendarDays(dateOnly: string, days: number): string | null {
  const parts = parseDateOnly(dateOnly);
  if (!parts || !Number.isInteger(days)) return null;
  const date = toUtcDate(parts);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateOnly(date);
}

/** End date for an occurrence, preserving the source program's duration. */
export function occurrenceEndDate(
  sourceStartDate: string,
  sourceEndDate: string | null,
  occurrenceStartDate: string,
): string | null {
  const duration = dateDurationDays(sourceStartDate, sourceEndDate);
  if (duration === null) return null;
  return addCalendarDays(occurrenceStartDate, duration);
}

export function normalizeProgramTitle(title: string): string {
  return title.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

export function normalizeProgramTime(time: string | null | undefined): string {
  return time?.trim().slice(0, 5) ?? "";
}

/** Conservative duplicate identity used by both preview and server save. */
export function programOccurrenceKey(
  title: string,
  startDate: string,
  startTime: string | null | undefined,
): string {
  return `${normalizeProgramTitle(title)}\u0000${startDate}\u0000${normalizeProgramTime(startTime)}`;
}
