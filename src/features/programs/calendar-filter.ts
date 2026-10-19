import type { ProgramCard } from "./types";

// Matches the timezone used by the existing public program and prayer queries.
export const PROGRAM_TIME_ZONE = "America/Chicago";
export type ProgramView = "upcoming" | "past" | "all";
export type CalendarProgram = ProgramCard & {
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
};
export type TimedCalendarProgram = { program: CalendarProgram; endsAt: number };

const chicagoClock = new Intl.DateTimeFormat("en-US", {
  timeZone: PROGRAM_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function chicagoParts(instant: number) {
  const parts = chicagoClock.formatToParts(instant);
  const value = (name: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === name)?.value);
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

export function chicagoMonth(instant: number): { year: number; month: number } {
  const { year, month } = chicagoParts(instant);
  return { year, month };
}

export function parseProgramView(value?: string): ProgramView {
  return value === "past" || value === "all" ? value : "upcoming";
}

function wallClockEpoch(instant: number): number {
  const p = chicagoParts(instant);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

/** Convert a Chicago wall time to an instant, including DST transitions. */
function chicagoInstant(wallTime: number): number {
  // Sampling either side finds both offsets on a DST transition day.
  const offsets = new Set(
    [-36, 0, 36].map((hours) => {
      const sample = wallTime + hours * 3_600_000;
      return wallClockEpoch(sample) - sample;
    }),
  );
  const candidates = [...offsets].map((offset) => wallTime - offset);
  const exact = candidates.filter((candidate) => wallClockEpoch(candidate) === wallTime);
  // In the repeated autumn hour, use the later end so an event isn't hidden early.
  if (exact.length) return Math.max(...exact);
  // A nonexistent spring time moves forward by the DST gap (e.g. 02:30 -> 03:30).
  return Math.min(
    ...candidates.filter((candidate) => wallClockEpoch(candidate) > wallTime),
  );
}

function timeSeconds(time: string | null): number | null {
  if (!time) return null;
  const match = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/.exec(time);
  if (!match) return null;
  const [, h, m, s = "0"] = match;
  if (Number(h) > 23 || Number(m) > 59 || Number(s) > 59) return null;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

export function programEndInstant(program: CalendarProgram): number {
  const endDate = program.endDate ?? program.startDate;
  const [year, month, day] = endDate.split("-").map(Number);
  const end = timeSeconds(program.endTime);
  const start = timeSeconds(program.startTime);
  // Unknown end time: keep the whole final day visible, including today's events.
  const overnight =
    end !== null && start !== null && endDate === program.startDate && end < start;
  const wallTime =
    Date.UTC(year, month - 1, day + (end === null || overnight ? 1 : 0)) +
    (end ?? 0) * 1000;
  return chicagoInstant(wallTime);
}

export function prepareCalendarPrograms(
  programs: CalendarProgram[],
): TimedCalendarProgram[] {
  return programs.map((program) => ({ program, endsAt: programEndInstant(program) }));
}

export function filterCalendarPrograms(
  programs: TimedCalendarProgram[],
  {
    year,
    month,
    view,
    query,
    now,
  }: {
    year: number;
    month: number;
    view: ProgramView;
    query: string;
    now: number;
  },
): CalendarProgram[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}-`;
  const search = query.trim().toLowerCase();
  return programs
    .filter(({ program, endsAt }) => {
      // Preserve the existing calendar's start-month buckets, including recurrences.
      if (!program.startDate.startsWith(prefix)) return false;
      if (view === "upcoming" && endsAt <= now) return false;
      if (view === "past" && endsAt > now) return false;
      return (
        !search ||
        Boolean(program.title?.toLowerCase().includes(search)) ||
        Boolean(program.description?.toLowerCase().includes(search))
      );
    })
    .map(({ program }) => program)
    .sort((a, b) => {
      const order =
        a.startDate.localeCompare(b.startDate) ||
        (timeSeconds(a.startTime) ?? 0) - (timeSeconds(b.startTime) ?? 0);
      return view === "past" ? -order : order;
    });
}

/** One timeout at the next completion; no polling or network requests. */
export function nextProgramBoundary(
  programs: TimedCalendarProgram[],
  now: number,
): number {
  return Math.min(
    ...programs.filter(({ endsAt }) => endsAt > now).map(({ endsAt }) => endsAt),
  );
}

export function calendarSelectionUrl(
  year: number,
  month: number,
  view: ProgramView,
  query: string,
): string {
  const params = new URLSearchParams({ year: String(year), month: String(month), view });
  if (query) params.set("q", query);
  return `/events-schedule?${params}`;
}
