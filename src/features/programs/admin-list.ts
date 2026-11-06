import { chicagoMonth, parseProgramView, programEndInstant } from "./calendar-filter";
import type { ProgramView } from "./calendar-filter";
import type { ProgramRow } from "./types";

export type AdminProgramFilters = {
  month: string;
  view: ProgramView;
  status: "all" | "published" | "draft";
  query: string;
  page: number;
  size: 10 | 20 | 50;
};

type SearchParams = Record<string, string | string[] | undefined>;
export type AdminProgramIndexRow = Pick<
  ProgramRow,
  | "id"
  | "title"
  | "description"
  | "location"
  | "start_date"
  | "end_date"
  | "start_time"
  | "end_time"
  | "is_published"
  | "sort_order"
>;

export function monthValue(year: number, month: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
}

export function chicagoMonthValue(now: number): string {
  const { year, month } = chicagoMonth(now);
  return monthValue(year, month);
}

export function isProgramMonth(value: string): boolean {
  return /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function shiftProgramMonth(value: string, delta: number): string | null {
  const [year, month] = value.split("-").map(Number);
  const index = year * 12 + month - 1 + delta;
  const result = monthValue(Math.floor(index / 12), (index % 12) + 1);
  return isProgramMonth(result) ? result : null;
}

export function programMonthBounds(value: string) {
  const [year, month] = value.split("-").map(Number);
  const end = new Date(0);
  end.setUTCFullYear(year, month, 0);
  return { start: `${value}-01`, end: `${value}-${end.getUTCDate()}` };
}

export function parseAdminProgramFilters(
  params: SearchParams,
  currentMonth: string,
): AdminProgramFilters {
  const string = (key: string) =>
    typeof params[key] === "string" ? params[key] : undefined;
  const month = string("month");
  const page = Number(string("page"));
  const size = string("size");
  const status = string("status");
  return {
    month: month && isProgramMonth(month) ? month : currentMonth,
    view: parseProgramView(string("view")),
    status: status === "published" || status === "draft" ? status : "all",
    query: string("q")?.trim().slice(0, 200) ?? "",
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    size: size === "20" ? 20 : size === "50" ? 50 : 10,
  };
}

export function adminProgramsUrl(filters: AdminProgramFilters): string {
  const params = new URLSearchParams({ month: filters.month, view: filters.view });
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.query) params.set("q", filters.query);
  if (filters.page !== 1) params.set("page", String(filters.page));
  if (filters.size !== 10) params.set("size", String(filters.size));
  return `/admin/programs?${params}`;
}

export function selectAdminProgramPage(
  rows: AdminProgramIndexRow[],
  filters: AdminProgramFilters,
  now: number,
) {
  const search = filters.query.toLowerCase();
  const matches = rows.flatMap((row) => {
    // A multi-day program and each individual recurrence belong to their start month.
    if (!row.start_date.startsWith(`${filters.month}-`)) return [];
    if (filters.status !== "all" && row.is_published !== (filters.status === "published"))
      return [];
    if (
      search &&
      ![row.title, row.description, row.location].some((value) =>
        value?.toLowerCase().includes(search),
      )
    )
      return [];
    const end = programEndInstant({
      startDate: row.start_date,
      endDate: row.end_date,
      startTime: row.start_time,
      endTime: row.end_time,
    });
    return [{ row, end, past: end <= now }];
  });

  const past = matches.filter((item) => item.past).length;
  const summary = { total: matches.length, upcoming: matches.length - past, past };
  const ordered = matches
    .filter((item) => filters.view === "all" || item.past === (filters.view === "past"))
    .sort(
      (a, b) =>
        Number(a.past) - Number(b.past) ||
        (a.past ? b.end - a.end : 0) ||
        a.row.start_date.localeCompare(b.row.start_date) ||
        (a.row.start_time ?? "").localeCompare(b.row.start_time ?? "") ||
        a.row.sort_order - b.row.sort_order ||
        a.row.id.localeCompare(b.row.id),
    );
  const count = ordered.length;
  const pages = Math.max(1, Math.ceil(count / filters.size));
  const page = Math.min(filters.page, pages);
  const offset = (page - 1) * filters.size;
  return {
    entries: ordered.slice(offset, offset + filters.size),
    summary,
    count,
    pages,
    page,
    offset,
  };
}
