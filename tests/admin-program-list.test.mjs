import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

function load(name, dependencies = {}) {
  const filename = new URL(`../src/features/programs/${name}.ts`, import.meta.url);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInThisContext(`(function(exports, require) {${outputText}\n})`)(
    exports,
    (path) => {
      assert.ok(path in dependencies, `Unexpected import: ${path}`);
      return dependencies[path];
    },
  );
  return exports;
}

const {
  chicagoMonthValue,
  shiftProgramMonth,
  programMonthBounds,
  parseAdminProgramFilters,
  adminProgramsUrl,
  selectAdminProgramPage,
} = load("admin-list", { "./calendar-filter": load("calendar-filter") });
const now = Date.parse("2026-11-06T15:00:00-06:00");
const defaults = parseAdminProgramFilters({}, "2026-11");
const row = (id, start_date, extra = {}) => ({
  id,
  start_date,
  title: "Weekly prayer",
  description: null,
  location: null,
  end_date: null,
  start_time: "13:00:00",
  end_time: "16:00:00",
  is_published: true,
  sort_order: 0,
  ...extra,
});
const list = (rows, filters = {}, time = now) =>
  selectAdminProgramPage(rows, { ...defaults, ...filters }, time);
const ids = (result) => result.entries.map(({ row }) => row.id);

test("Chicago determines the default month, even across a UTC year boundary", () => {
  assert.equal(chicagoMonthValue(Date.parse("2027-01-01T05:59:59Z")), "2026-12");
  assert.equal(chicagoMonthValue(Date.parse("2027-01-01T06:00:00Z")), "2027-01");
  assert.equal(defaults.view, "upcoming");
  assert.equal(defaults.size, 10);
  assert.equal(defaults.status, "all");
});

test("month navigation rolls through years and accepts direct historical dates", () => {
  assert.equal(shiftProgramMonth("2026-12", 1), "2027-01");
  assert.equal(shiftProgramMonth("2027-01", -1), "2026-12");
  assert.equal(shiftProgramMonth("0001-01", -1), null);
  assert.equal(programMonthBounds("2024-02").end, "2024-02-29");
  assert.equal(
    parseAdminProgramFilters({ month: "1901-03" }, "2026-11").month,
    "1901-03",
  );
});

test("upcoming includes ongoing and missing end times, excluding past months", () => {
  const rows = [
    row("future", "2026-11-07"),
    row("today", "2026-11-06"),
    row("unknown-end", "2026-11-06", { start_time: "08:00", end_time: null }),
    row("ongoing", "2026-11-04", { end_date: "2026-11-06" }),
    row("finished", "2026-11-06", { start_time: "08:00", end_time: "10:00" }),
    row("prior-month", "2026-10-31", { end_date: "2026-11-08" }),
  ];
  assert.deepEqual(ids(list(rows)), ["ongoing", "unknown-end", "today", "future"]);
  assert.deepEqual(ids(list(rows, { view: "past" })), ["finished"]);
  assert.deepEqual(ids(list(rows, { view: "all" })), [
    "ongoing",
    "unknown-end",
    "today",
    "future",
    "finished",
  ]);
  assert.deepEqual(list(rows).summary, { total: 5, upcoming: 4, past: 1 });
});

test("past order is by completion; DST repeated-hour and overnight events stay visible until their end", () => {
  const rows = [
    row("long", "2026-11-02", { end_date: "2026-11-05" }),
    row("short", "2026-11-04"),
  ];
  assert.deepEqual(ids(list(rows, { view: "past" })), ["long", "short"]);
  const overnight = row("overnight", "2026-11-05", {
    start_time: "23:00",
    end_time: "02:00",
  });
  assert.deepEqual(ids(list([overnight], {}, Date.parse("2026-11-06T07:59:59Z"))), [
    "overnight",
  ]);
  assert.deepEqual(ids(list([overnight], {}, Date.parse("2026-11-06T08:00:00Z"))), []);
  const repeated = row("dst", "2026-11-01", { start_time: "00:30", end_time: "01:30" });
  assert.deepEqual(ids(list([repeated], {}, Date.parse("2026-11-01T07:29:59Z"))), [
    "dst",
  ]);
  assert.deepEqual(
    ids(list([repeated], { view: "past" }, Date.parse("2026-11-01T07:30:00Z"))),
    ["dst"],
  );
});

test("combines search, status and month before paging, with stable ties and last-page clamping", () => {
  const rows = Array.from({ length: 21 }, (_, index) =>
    row(String(index + 10), "2026-11-20", {
      is_published: false,
      location: "Main Hall",
      recurrence_group_id: "weekly",
    }),
  ).reverse();
  rows.push(
    row("published", "2026-11-20", { location: "Main Hall" }),
    row("other-month", "2026-12-20", { location: "Main Hall" }),
  );
  const filters = { page: 3, query: "main hall", status: "draft" };
  const result = list(rows, filters);
  assert.equal(result.count, 21);
  assert.equal(result.offset, 20);
  assert.deepEqual(ids(result), ["30"]);
  const afterDeletion = list(
    rows.filter((item) => item.id !== "30"),
    filters,
  );
  assert.equal(afterDeletion.page, 2);
  assert.equal(afterDeletion.count, 20);
  assert.equal(afterDeletion.entries.length, 10);
  assert.deepEqual(ids(list(rows, { status: "published", query: "hall" })), [
    "published",
  ]);
});

test("invalid URL state falls back safely and valid filters round-trip", () => {
  assert.deepEqual(
    parseAdminProgramFilters(
      {
        month: "2026-13",
        view: "draft",
        status: "past",
        q: ["a", "b"],
        page: "-2",
        size: "1000",
      },
      "2026-11",
    ),
    defaults,
  );
  const expected = {
    ...defaults,
    month: "2027-01",
    view: "all",
    status: "draft",
    query: "Friday, hall & café",
    page: 2,
    size: 20,
  };
  const url = new URL(adminProgramsUrl(expected), "https://example.test");
  assert.deepEqual(
    parseAdminProgramFilters(Object.fromEntries(url.searchParams), "2026-11"),
    expected,
  );
});
