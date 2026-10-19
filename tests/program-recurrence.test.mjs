import assert from "node:assert/strict";
import test from "node:test";

import {
  generateDailyOccurrenceDates,
  generateWeeklyOccurrenceDates,
  occurrenceEndDate,
  programOccurrenceKey,
  weekdayName,
} from "../src/features/programs/recurrence.ts";

test("daily repeats include October 22, 23 and 24 exactly once", () => {
  assert.deepEqual(generateDailyOccurrenceDates("2026-10-22", "2026-10-24"), [
    "2026-10-22",
    "2026-10-23",
    "2026-10-24",
  ]);
});

test("daily repeats handle month/year boundaries and leap days", () => {
  assert.deepEqual(generateDailyOccurrenceDates("2026-10-31", "2026-11-02"), [
    "2026-10-31",
    "2026-11-01",
    "2026-11-02",
  ]);
  assert.deepEqual(generateDailyOccurrenceDates("2026-12-31", "2027-01-01"), [
    "2026-12-31",
    "2027-01-01",
  ]);
  assert.deepEqual(generateDailyOccurrenceDates("2024-02-28", "2024-03-01"), [
    "2024-02-28",
    "2024-02-29",
    "2024-03-01",
  ]);
});

test("daily repeats allow a single date and reject invalid or excessive ranges", () => {
  assert.deepEqual(generateDailyOccurrenceDates("2026-10-22", "2026-10-22"), [
    "2026-10-22",
  ]);
  for (const [start, end] of [
    ["2026-10-24", "2026-10-22"],
    ["2026-10-22", ""],
    ["2026-02-30", "2026-03-02"],
    ["2026-10-22", "2026-13-01"],
    ["2026-01-01", "9999-12-31"],
  ])
    assert.deepEqual(generateDailyOccurrenceDates(start, end), []);
  assert.equal(generateDailyOccurrenceDates("2026-01-01", "2027-01-01").length, 366);
  assert.deepEqual(generateDailyOccurrenceDates("2026-01-01", "2027-01-02"), []);
});

test("daily occurrences keep their individual duration and skip existing dates", () => {
  const dates = generateDailyOccurrenceDates("2026-10-22", "2026-10-24");
  const existing = new Set([programOccurrenceKey("Majlis", "2026-10-22", "19:00:00")]);
  assert.deepEqual(
    dates.filter((date) => !existing.has(programOccurrenceKey("Majlis", date, "19:00"))),
    ["2026-10-23", "2026-10-24"],
  );
  assert.deepEqual(
    dates.map((date) => occurrenceEndDate("2026-10-22", "2026-10-23", date)),
    ["2026-10-23", "2026-10-24", "2026-10-25"],
  );
});

test("Thursday October 2026 has five weekly occurrences", () => {
  assert.deepEqual(generateWeeklyOccurrenceDates("2026-10-01", "2026-10"), [
    "2026-10-01",
    "2026-10-08",
    "2026-10-15",
    "2026-10-22",
    "2026-10-29",
  ]);
  assert.equal(weekdayName("2026-10-01"), "Thursday");
});

test("Friday October 2026 has five weekly occurrences", () => {
  assert.deepEqual(generateWeeklyOccurrenceDates("2026-10-02", "2026-10"), [
    "2026-10-02",
    "2026-10-09",
    "2026-10-16",
    "2026-10-23",
    "2026-10-30",
  ]);
});

test("four-occurrence month and year boundary stay date-only", () => {
  assert.deepEqual(generateWeeklyOccurrenceDates("2026-10-01", "2026-11"), [
    "2026-11-05",
    "2026-11-12",
    "2026-11-19",
    "2026-11-26",
  ]);
  assert.deepEqual(generateWeeklyOccurrenceDates("2026-12-31", "2027-01"), [
    "2027-01-07",
    "2027-01-14",
    "2027-01-21",
    "2027-01-28",
  ]);
});

test("leap-year February is calculated correctly", () => {
  assert.deepEqual(generateWeeklyOccurrenceDates("2024-02-01", "2024-02"), [
    "2024-02-01",
    "2024-02-08",
    "2024-02-15",
    "2024-02-22",
    "2024-02-29",
  ]);
});

test("multi-day duration follows every generated occurrence", () => {
  assert.equal(occurrenceEndDate("2026-10-01", "2026-10-03", "2026-10-29"), "2026-10-31");
  assert.equal(occurrenceEndDate("2026-10-01", "2026-10-01", "2026-10-29"), "2026-10-29");
  assert.equal(occurrenceEndDate("2026-10-01", null, "2026-10-29"), null);
});

test("duplicate key normalizes title whitespace/case and stored seconds", () => {
  assert.equal(
    programOccurrenceKey("  Friday   Prayers ", "2026-10-02", "13:00"),
    programOccurrenceKey("friday prayers", "2026-10-02", "13:00:00"),
  );
});
