"use client";

import { CalendarDaysIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ProgramDialog } from "@/features/home/components/program-card-grid";
import type { ProgramCard } from "@/features/programs/types";

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
  programs: ProgramCard[];
};

const selectClassName =
  "h-11 appearance-none rounded-xl border border-border bg-card px-4 pr-10 text-sm font-semibold text-foreground shadow-card outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 hover:border-brand-500/40";

export function ProgramCalendarView({ year, month, years, programs }: ProgramCalendarViewProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return programs;
    return programs.filter((program) => {
      if (program.title?.toLowerCase().includes(q)) return true;
      return program.description?.toLowerCase().includes(q) ?? false;
    });
  }, [programs, query]);

  const monthName = MONTHS[month - 1];
  const searching = query.trim().length > 0;

  const changeSelection = (nextYear: number, nextMonth: number) => {
    router.push(`/events-schedule?year=${nextYear}&month=${nextMonth}`);
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        </div>

        <div className="relative w-full sm:w-72">
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
            className="h-11 w-full rounded-xl border border-border bg-card pr-4 pl-10 text-sm text-foreground shadow-card outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          />
        </div>
      </div>

      {/* Count line */}
      <p className="mt-6 text-sm font-semibold text-muted-foreground" aria-live="polite">
        {searching
          ? `${filtered.length} program${filtered.length === 1 ? "" : "s"} matching “${query.trim()}” in ${monthName} ${year}`
          : `${filtered.length} program${filtered.length === 1 ? "" : "s"} in ${monthName} ${year}`}
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
            {searching ? "No programs found for your search." : `No programs scheduled for ${monthName} ${year}.`}
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {searching
              ? "Try a different search term or browse another month."
              : "Check back soon — new programs are added regularly."}
          </p>
        </div>
      )}
    </div>
  );
}
