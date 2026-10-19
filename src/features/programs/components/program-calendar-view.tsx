"use client";

import { CalendarDaysIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ProgramDialog } from "@/features/home/components/program-card-grid";
import {
  calendarSelectionUrl,
  filterCalendarPrograms,
  nextProgramBoundary,
  parseProgramView,
  prepareCalendarPrograms,
  type CalendarProgram,
  type ProgramView,
} from "@/features/programs/calendar-filter";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type ProgramCalendarViewProps = {
  year: number;
  month: number;
  years: number[];
  programs: CalendarProgram[];
  initialNow: number;
  initialView: ProgramView;
  initialQuery: string;
};

const selectClassName =
  "h-11 appearance-none rounded-xl border border-border bg-card px-4 pr-10 text-sm font-semibold text-foreground shadow-card outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 hover:border-brand-500/40";

export function ProgramCalendarView({
  year,
  month,
  years,
  programs,
  initialNow,
  initialView,
  initialQuery,
}: ProgramCalendarViewProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [view, setView] = useState<ProgramView>(initialView);
  // Server and first client render use the same instant, avoiding hydration drift.
  const [now, setNow] = useState(initialNow);
  const timedPrograms = useMemo(() => prepareCalendarPrograms(programs), [programs]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      const instant = Date.now();
      setNow(instant);
      const next = nextProgramBoundary(timedPrograms, instant);
      if (Number.isFinite(next)) {
        // Browser timeouts cap at ~24 days. Re-arm long waits without a busy interval.
        timer = setTimeout(refresh, Math.min(next - instant + 25, 2_147_483_647));
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [timedPrograms]);

  const filtered = useMemo(
    () => filterCalendarPrograms(timedPrograms, { year, month, view, query, now }),
    [timedPrograms, year, month, view, query, now],
  );

  const monthName = MONTHS[month - 1];
  const searching = query.trim().length > 0;

  const changeSelection = (nextYear: number, nextMonth: number) => {
    router.push(calendarSelectionUrl(nextYear, nextMonth, view, query), {
      scroll: false,
    });
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <label htmlFor="calendar-year" className="sr-only">
              Year
            </label>
            <select
              id="calendar-year"
              value={year}
              onChange={(event) => changeSelection(Number(event.target.value), month)}
              className={selectClassName}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>

          <div className="relative">
            <label htmlFor="calendar-month" className="sr-only">
              Month
            </label>
            <select
              id="calendar-month"
              value={month}
              onChange={(event) => changeSelection(year, Number(event.target.value))}
              className={selectClassName}
            >
              {MONTHS.map((name, index) => (
                <option key={name} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <div className="relative">
            <label htmlFor="calendar-view" className="sr-only">
              Program view
            </label>
            <select
              id="calendar-view"
              value={view}
              onChange={(event) => setView(parseProgramView(event.target.value))}
              className={selectClassName}
            >
              <option value="upcoming">Upcoming Programs</option>
              <option value="past">Past Programs</option>
              <option value="all">All Programs</option>
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="relative w-full lg:w-72 lg:shrink-0">
          <label htmlFor="calendar-search" className="sr-only">
            Search events
          </label>
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="calendar-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events…"
            className="h-11 w-full rounded-xl border border-border bg-card pr-4 pl-10 text-sm text-foreground shadow-card transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          />
        </div>
      </div>

      {/* Count line */}
      <p className="mt-6 text-sm font-semibold text-muted-foreground" aria-live="polite">
        {searching
          ? `${filtered.length} program${filtered.length === 1 ? "" : "s"} matching “${query.trim()}” in ${monthName} ${year}`
          : `${filtered.length} program${filtered.length === 1 ? "" : "s"} in ${monthName} ${year}`}
        {` · ${view === "all" ? "All Programs" : view === "past" ? "Past Programs" : "Upcoming Programs"}`}
      </p>

      {/* Grid / empty states */}
      {filtered.length > 0 ? (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((program) => (
            <li key={program.id}>
              <ProgramDialog program={program} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <CalendarDaysIcon className="size-10 text-brand-500/60" aria-hidden="true" />
          <p className="font-heading text-lg font-bold text-foreground">
            {searching
              ? "No programs found for your search."
              : `No ${view === "all" ? "" : `${view} `}programs for ${monthName} ${year}.`}
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {searching
              ? "Try another search term or view all programs in this month."
              : view === "upcoming"
                ? "View all programs to see completed events in this month, or choose another month."
                : "Choose another view or month to find more programs."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {view !== "all" && (
              <button
                type="button"
                onClick={() => setView("all")}
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-brand-500/40 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Show all programs
              </button>
            )}
            {searching && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-brand-500/40 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
