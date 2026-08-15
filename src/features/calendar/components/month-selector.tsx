"use client";

import { ChevronDown } from "lucide-react";

import { calendarBasePath, calendarYear } from "@/features/calendar/config";
import { cn } from "@/lib/utils";

const monthLabels = [
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

type MonthSelectorProps = {
  /** Currently displayed Gregorian month (1-12). */
  selectedMonth: number;
  className?: string;
};

/**
 * Accessible month selector for the calendar. A plain HTML form/select that
 * navigates to `${calendarBasePath}?month=N` (GET) — no heavy calendar library,
 * works without JavaScript (the hidden submit button), and is fully keyboard
 * operable. On change the form submits itself for a fluid single-click UX.
 */
export function MonthSelector({ selectedMonth, className }: MonthSelectorProps) {
  return (
    <form
      method="get"
      action={calendarBasePath}
      className={cn("flex items-center gap-3", className)}
    >
      <label htmlFor="calendar-month" className="text-sm font-semibold text-foreground">
        Month
      </label>
      <div className="relative">
        <select
          id="calendar-month"
          name="month"
          defaultValue={selectedMonth}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="cursor-pointer appearance-none rounded-xl border border-border bg-card py-2 pr-10 pl-3.5 text-sm font-semibold text-foreground shadow-card transition-colors hover:border-brand-400 focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          {monthLabels.map((label, index) => (
            <option key={label} value={index + 1}>
              {label} {calendarYear}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
      {/* No-JS / keyboard fallback so the form still submits without scripting. */}
      <button type="submit" className="sr-only">
        View month
      </button>
    </form>
  );
}
