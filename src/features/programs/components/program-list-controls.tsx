"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminProgramsUrl, monthValue, shiftProgramMonth } from "../admin-list";
import type { AdminProgramFilters } from "../admin-list";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";
const monthFormat = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });
const months = Array.from({ length: 12 }, (_, i) =>
  monthFormat.format(new Date(Date.UTC(2000, i, 1))),
);

export function ProgramListControls({
  filters,
  currentMonth,
}: {
  filters: AdminProgramFilters;
  currentMonth: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.query);
  const [year, setYear] = useState(filters.month.slice(0, 4));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedYear, selectedMonth] = filters.month.split("-").map(Number);
  const previous = shiftProgramMonth(filters.month, -1);
  const next = shiftProgramMonth(filters.month, 1);

  useEffect(() => {
    if (timer.current === null) setSearch(filters.query);
  }, [filters.query]);
  useEffect(() => setYear(filters.month.slice(0, 4)), [filters.month]);
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  function navigate(patch: Partial<AdminProgramFilters>, replace = false) {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    const target = { ...filters, page: 1, query: search.trim(), ...patch };
    const href = adminProgramsUrl(target);
    if (href === adminProgramsUrl(filters)) return;
    startTransition(() => {
      if (replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    });
  }

  function submitYear() {
    const value = Number(year);
    if (/^\d{1,4}$/.test(year) && value >= 1 && value <= 9999) {
      setYear(String(value).padStart(4, "0"));
      navigate({ month: monthValue(value, selectedMonth) });
    } else {
      setYear(filters.month.slice(0, 4));
    }
  }

  return (
    <section
      aria-label="Program filters"
      className="space-y-4 rounded-xl border border-border/60 bg-card p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pending || !previous}
          onClick={() => previous && navigate({ month: previous })}
        >
          Previous month
        </Button>
        <p className="px-1 text-sm font-semibold" aria-live="polite">
          {months[selectedMonth - 1]} {selectedYear}
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={pending || !next}
          onClick={() => next && navigate({ month: next })}
        >
          Next month
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={pending || filters.month === currentMonth}
          onClick={() => navigate({ month: currentMonth })}
        >
          This Month
        </Button>
      </div>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="program-search">Search</Label>
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              navigate({ query: search.trim() });
            }}
            className="flex gap-2"
          >
            <Input
              id="program-search"
              type="search"
              value={search}
              maxLength={200}
              placeholder="Search programs..."
              onChange={(event) => {
                const value = event.target.value;
                setSearch(value);
                if (timer.current !== null) clearTimeout(timer.current);
                timer.current = setTimeout(
                  () => navigate({ query: value.trim() }, true),
                  400,
                );
              }}
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  setSearch("");
                  navigate({ query: "" });
                }}
              >
                Clear
              </Button>
            )}
          </form>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="program-month">Month</Label>
          <select
            id="program-month"
            className={selectClass}
            value={selectedMonth}
            disabled={pending}
            onChange={(event) =>
              navigate({ month: monthValue(selectedYear, Number(event.target.value)) })
            }
          >
            {months.map((label, index) => (
              <option key={label} value={index + 1}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="program-year">Year</Label>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              submitYear();
            }}
          >
            <Input
              id="program-year"
              inputMode="numeric"
              maxLength={4}
              value={year}
              disabled={pending}
              onChange={(event) => setYear(event.target.value)}
            />
            <Button variant="outline" size="sm" type="submit" disabled={pending}>
              Go
            </Button>
          </form>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="program-view">Program View</Label>
          <select
            id="program-view"
            className={selectClass}
            value={filters.view}
            disabled={pending}
            onChange={(event) =>
              navigate({ view: event.target.value as AdminProgramFilters["view"] })
            }
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="all">All Programs</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="program-status">Publication status</Label>
          <select
            id="program-status"
            className={selectClass}
            value={filters.status}
            disabled={pending}
            onChange={(event) =>
              navigate({ status: event.target.value as AdminProgramFilters["status"] })
            }
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="program-size">Rows per page</Label>
          <select
            id="program-size"
            className={selectClass}
            value={filters.size}
            disabled={pending}
            onChange={(event) =>
              navigate({
                size: Number(event.target.value) as AdminProgramFilters["size"],
              })
            }
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
      {pending && (
        <p role="status" className="text-xs text-muted-foreground">
          Updating programs…
        </p>
      )}
    </section>
  );
}
