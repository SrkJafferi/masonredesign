import assert from "node:assert/strict";
import test from "node:test";

import {
  calendarSelectionUrl,
  chicagoMonth,
  filterCalendarPrograms,
  nextProgramBoundary,
  parseProgramView,
  prepareCalendarPrograms,
  programEndInstant,
} from "../src/features/programs/calendar-filter.ts";
import { generateWeeklyOccurrenceDates } from "../src/features/programs/recurrence.ts";

const now = Date.parse("2026-10-20T15:00:00-05:00");
const program = (id, startDate, extra = {}) => ({
  id,
  title: "Community program",
  description: null,
  startDate,
  endDate: null,
  startTime: "13:00:00",
  endTime: "16:00:00",
  timeLabel: null,
  posterSrc: null,
  location: null,
  linkUrl: null,
  ...extra,
});
const programs = [
  program("tomorrow", "2026-10-21"),
  program("yesterday", "2026-10-19"),
  program("ongoing", "2026-10-20"),
  program("finished", "2026-10-20", { startTime: "09:00", endTime: "14:00" }),
];
const select = (items, overrides = {}) =>
  filterCalendarPrograms(prepareCalendarPrograms(items), {
    year: 2026,
    month: 10,
    view: "upcoming",
    query: "",
    now,
    ...overrides,
  }).map(({ id }) => id);

test("Upcoming is the default; yesterday and today's finished program are hidden", () => {
  assert.equal(parseProgramView(), "upcoming");
  assert.equal(parseProgramView("invalid"), "upcoming");
  assert.deepEqual(select(programs), ["ongoing", "tomorrow"]);
});

test("Past is newest first; All includes every occurrence in chronological order", () => {
  assert.deepEqual(select(programs, { view: "past" }), ["finished", "yesterday"]);
  assert.deepEqual(select(programs, { view: "all" }), [
    "yesterday",
    "finished",
    "ongoing",
    "tomorrow",
  ]);
  assert.deepEqual(
    programs.map(({ id }) => id),
    ["tomorrow", "yesterday", "ongoing", "finished"],
  ); // Sorting never mutates the loaded array.
});

test("today without an end time stays Upcoming through the entire Chicago day", () => {
  const unknownEnd = program("unknown", "2026-10-20", { endTime: null });
  const end = Date.parse("2026-10-21T00:00:00-05:00");
  assert.equal(programEndInstant(unknownEnd), end);
  assert.deepEqual(select([unknownEnd], { now: end - 1 }), ["unknown"]);
  assert.deepEqual(select([unknownEnd], { now: end }), []);
  assert.deepEqual(select([unknownEnd], { now: end, view: "past" }), ["unknown"]);
});

test("multi-day programs remain Upcoming until their explicit final time", () => {
  const multi = program("multi", "2026-10-18", {
    endDate: "2026-10-22",
    endTime: "02:00",
  });
  const end = Date.parse("2026-10-22T02:00:00-05:00");
  assert.equal(programEndInstant(multi), end);
  assert.deepEqual(select([multi], { now: end - 1 }), ["multi"]);
  assert.deepEqual(select([multi], { now: end, view: "past" }), ["multi"]);
  assert.equal(
    programEndInstant({ ...multi, endTime: null }),
    Date.parse("2026-10-23T00:00:00-05:00"),
  );
});

test("overnight events roll into the next date, including month and year ends", () => {
  for (const endDate of [null, "2026-10-19"]) {
    const overnight = program("night", "2026-10-19", {
      startTime: "23:00",
      endTime: "02:00",
      endDate,
    });
    const end = Date.parse("2026-10-20T02:00:00-05:00");
    assert.equal(programEndInstant(overnight), end);
    assert.deepEqual(select([overnight], { now: end - 1 }), ["night"]);
    assert.deepEqual(select([overnight], { now: end, view: "past" }), ["night"]);
  }
  assert.equal(
    programEndInstant(
      program("newyear", "2026-12-31", {
        startTime: "23:00",
        endTime: "01:00",
      }),
    ),
    Date.parse("2027-01-01T01:00:00-06:00"),
  );
  assert.equal(
    programEndInstant(
      program("monthend", "2026-10-31", {
        startTime: "23:00",
        endTime: "01:00",
      }),
    ),
    Date.parse("2026-11-01T01:00:00-06:00"),
  );
});

test("past/future months and year boundaries compare complete dates", () => {
  const items = [
    ...programs,
    program("september", "2026-09-20"),
    program("november", "2026-11-20"),
    program("previous-year", "2025-10-20"),
    program("next-year", "2027-01-01"),
  ];
  assert.deepEqual(select(items, { month: 9 }), []);
  assert.deepEqual(select(items, { month: 9, view: "past" }), ["september"]);
  assert.deepEqual(select(items, { month: 9, view: "all" }), ["september"]);
  assert.deepEqual(select(items, { month: 11 }), ["november"]);
  assert.deepEqual(select(items, { year: 2025, view: "past" }), ["previous-year"]);
  assert.deepEqual(select(items, { year: 2027, month: 1 }), ["next-year"]);
});

test("initial month/year and event boundaries use Chicago rather than UTC", () => {
  assert.deepEqual(chicagoMonth(Date.parse("2027-01-01T05:59:59Z")), {
    year: 2026,
    month: 12,
  });
  assert.deepEqual(chicagoMonth(Date.parse("2027-01-01T06:00:00Z")), {
    year: 2027,
    month: 1,
  });
  assert.deepEqual(chicagoMonth(Date.parse("2026-11-01T04:59:59Z")), {
    year: 2026,
    month: 10,
  });
  const evening = program("evening", "2026-10-20", { endTime: "23:00" });
  assert.deepEqual(select([evening], { now: Date.parse("2026-10-21T03:00:00Z") }), [
    "evening",
  ]);
});

test("DST uses the later repeated end time and advances a nonexistent end time", () => {
  assert.equal(
    programEndInstant(
      program("fall", "2026-11-01", {
        startTime: "00:30",
        endTime: "01:30",
      }),
    ),
    Date.parse("2026-11-01T01:30:00-06:00"),
  );
  assert.equal(
    programEndInstant(
      program("spring", "2026-03-08", {
        startTime: "01:00",
        endTime: "02:30",
      }),
    ),
    Date.parse("2026-03-08T03:30:00-05:00"),
  );
  assert.equal(
    programEndInstant(
      program("spring-all-day", "2026-03-08", {
        endTime: null,
      }),
    ),
    Date.parse("2026-03-09T00:00:00-05:00"),
  );
});

test("weekly recurrences retain individual occurrences; search combines with month/year/view", () => {
  const weekly = generateWeeklyOccurrenceDates("2026-10-01", "2026-10").map((date) =>
    program(date, date, { title: "Weekly Majlis", description: "Community gathering" }),
  );
  assert.deepEqual(select(weekly), ["2026-10-22", "2026-10-29"]);
  assert.deepEqual(select(weekly, { view: "past", query: " MAJLIS " }), [
    "2026-10-15",
    "2026-10-08",
    "2026-10-01",
  ]);
  assert.equal(select(weekly, { view: "all", query: "gathering" }).length, 5);
  assert.deepEqual(select(weekly, { query: "not found" }), []);
  assert.deepEqual(select(weekly, { month: 11, view: "all", query: "majlis" }), []);
  assert.deepEqual(select(weekly, { year: 2025, view: "all", query: "majlis" }), []);
  const url = new URL(
    calendarSelectionUrl(2025, 9, "past", "Majlis & prayer"),
    "https://masom.com",
  );
  assert.equal(url.searchParams.get("view"), "past");
  assert.equal(url.searchParams.get("q"), "Majlis & prayer");
  assert.equal(url.searchParams.get("year"), "2025");
  assert.equal(url.searchParams.get("month"), "9");
});

test("boundary scheduling advances to the next completion and stops when none remain", () => {
  const items = prepareCalendarPrograms(programs);
  const first = Date.parse("2026-10-20T16:00:00-05:00");
  const second = Date.parse("2026-10-21T16:00:00-05:00");
  assert.equal(nextProgramBoundary(items, now), first);
  assert.deepEqual(select(programs, { now: first }), ["tomorrow"]);
  assert.equal(nextProgramBoundary(items, first), second);
  assert.equal(nextProgramBoundary(items, second), Infinity);
  assert.equal(nextProgramBoundary([], now), Infinity);
});
