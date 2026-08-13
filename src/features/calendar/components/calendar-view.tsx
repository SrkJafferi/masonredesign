import { MapPinIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { publicTimingOrder } from "@/features/calendar/config";
import { prayerTimeLabels } from "@/features/prayer-calendar/config";
import type { CalendarMonthView } from "@/features/calendar/types";
import { cn } from "@/lib/utils";

/** Tailwind classes for an event badge, chosen by its category. */
function categoryClass(category: string | null): string {
  const value = (category ?? "").toLowerCase();
  if (value.includes("wiladat") || value.includes("eid") || value.includes("bes")) {
    return "bg-success/12 text-success";
  }
  if (
    value.includes("martyr") ||
    value.includes("shahadat") ||
    value.includes("wafat") ||
    value.includes("shab")
  ) {
    return "bg-danger/10 text-danger";
  }
  return "bg-sand-100 text-ink-800";
}

function hijriRangeLabel(month: CalendarMonthView): string | null {
  const withHijri = month.days.filter((day) => day.hijri);
  if (withHijri.length === 0) return null;
  const first = withHijri[0].hijri!;
  const last = withHijri[withHijri.length - 1].hijri!;
  if (first.monthName === last.monthName && first.year === last.year) {
    return `${first.monthName} ${first.year} AH`;
  }
  return `${first.monthName} – ${last.monthName} ${last.year} AH`;
}

function MonthSection({
  month,
  todayISO,
}: {
  month: CalendarMonthView;
  todayISO: string;
}) {
  const hijriRange = hijriRangeLabel(month);

  return (
    <section id={`month-${month.month}`} className="scroll-mt-24">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
        <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border/60 bg-brand-50 px-5 py-4">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            {month.monthLabel}
          </h2>
          {hijriRange ? (
            <p className="text-sm font-semibold text-brand-700">{hijriRange}</p>
          ) : null}
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Hijri</th>
                {publicTimingOrder.map((key) => (
                  <th key={key} className="px-3 py-2.5 text-center whitespace-nowrap">
                    {prayerTimeLabels[key]}
                  </th>
                ))}
                <th className="px-3 py-2.5">Events</th>
              </tr>
            </thead>
            <tbody>
              {month.days.map((day) => {
                const isToday = day.date === todayISO;
                const isFriday = day.weekday === 5;
                const hasEvents = day.events.length > 0;
                return (
                  <tr
                    key={day.date}
                    className={cn(
                      "border-b border-border/40 transition-colors last:border-0 hover:bg-muted/40",
                      isFriday && "bg-brand-50/40",
                      hasEvents && "bg-sand-100/40",
                      isToday && "bg-brand-100/70 ring-1 ring-inset ring-brand-500/40",
                    )}
                  >
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="font-bold text-foreground tabular-nums">
                        {day.gregorianDay}
                      </span>
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {new Date(`${day.date}T00:00:00Z`).toLocaleDateString("en-US", {
                          weekday: "short",
                          timeZone: "UTC",
                        })}
                      </span>
                      {isToday ? (
                        <span className="ml-1.5 rounded-full bg-brand-500 px-1.5 py-0.5 text-[0.625rem] font-bold text-white">
                          Today
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-foreground">
                      {day.hijri ? (
                        <span className="tabular-nums">
                          {day.hijri.day}{" "}
                          <span className="text-muted-foreground">{day.hijri.monthName}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    {day.timings.map((slot) => (
                      <td
                        key={slot.key}
                        className="px-3 py-2.5 text-center tabular-nums whitespace-nowrap text-foreground"
                      >
                        {slot.time ?? <span className="text-muted-foreground">—</span>}
                      </td>
                    ))}
                    <td className="px-3 py-2.5">
                      {hasEvents ? (
                        <ul className="flex flex-col gap-1">
                          {day.events.map((event) => (
                            <li key={event.id} className="flex items-start gap-2">
                              <span
                                className={cn(
                                  "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold",
                                  categoryClass(event.category),
                                )}
                              >
                                {event.category ?? "Event"}
                              </span>
                              <span className="text-sm text-foreground">{event.title}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function CalendarView({
  year,
  months,
  todayISO,
}: {
  year: number;
  months: CalendarMonthView[];
  todayISO: string;
}) {
  const hasData = months.some((month) =>
    month.days.some((day) => day.hijri || day.events.length > 0 || day.timings.some((slot) => slot.time)),
  );

  return (
    <div className="bg-background pb-16">
      <div className="bg-gradient-to-b from-brand-50 to-background">
        <Container className="py-10 sm:py-14">
          <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">
            Chicagoland
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            Hijri Calendar {year}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Daily prayer timings, Hijri dates and Islamic events for the MASOM community.
            Timings are maintained by MASOM and shown exactly as published.
          </p>
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPinIcon className="size-4 text-brand-600" />
            4353 W Lawrence Ave, Chicago, IL 60630 · Qibla 48.42° East of North
          </p>
        </Container>
      </div>

      <Container className="space-y-8">
        {/* Month navigation — plain anchor links, no client JS required. */}
        <nav
          aria-label="Jump to month"
          className="sticky top-0 z-10 -mx-4 flex gap-1 overflow-x-auto bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        >
          {months.map((month) => (
            <a
              key={month.month}
              href={`#month-${month.month}`}
              className="rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              {month.monthLabel.split(" ")[0]}
            </a>
          ))}
        </nav>

        {hasData ? (
          <div className="space-y-8">
            {months.map((month) => (
              <MonthSection key={month.month} month={month} todayISO={todayISO} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">
              The {year} calendar has not been published yet. Please check back soon.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
