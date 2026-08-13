import { CalendarView } from "@/features/calendar/components/calendar-view";
import { calendarBasePath, calendarYear } from "@/features/calendar/config";
import { getCalendarMonths } from "@/features/calendar/queries";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: `Hijri Prayer Calendar ${calendarYear} — MASOM`,
  description: `MASOM's ${calendarYear} Hijri calendar for Chicago: daily Fajr, Sunrise, Zohar, Sunset, Maghrib and Midnight prayer timings, Hijri dates and Islamic events.`,
  path: calendarBasePath,
});

/**
 * "Today" in MASOM's local timezone (Chicago) as YYYY-MM-DD, so the matching
 * row is highlighted. Kept here (not in the server-only query module) because
 * it is presentation state passed to a component.
 */
function chicagoTodayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async function HijriCalendarPage() {
  const months = await getCalendarMonths(calendarYear);

  return (
    <CalendarView year={calendarYear} months={months} todayISO={chicagoTodayISO()} />
  );
}
