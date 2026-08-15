import { CalendarDaysIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getTodayTimings } from "@/features/calendar/queries";
import { getNextPrayerCandidates } from "@/features/prayer-calendar/lib/next-prayer";

import { AdminNextPrayerLive } from "./admin-next-prayer-live";

/**
 * \"Today's Prayer & Hijri\" preview for the admin dashboard. A Server
 * Component: it reuses the existing calendar helpers — one fetches today's
 * single calendar_days row (timings + resolved Hijri date), the other fetches
 * only today's/tomorrow's rows for the next-prayer candidates. No 365-day
 * payload, no browser-side Supabase reads, no hardcoded data. Only the ticking
 * countdown is a Client Component.
 */
export async function TodayPrayerCard() {
  const [timings, candidates] = await Promise.all([
    getTodayTimings(),
    getNextPrayerCandidates(),
  ]);

  const unavailable = timings.gregorianDate === null && timings.hijriDate === null;
  const serverNow = Date.now();

  return (
    <Card className="overflow-hidden">
      <div className="px-(--card-spacing) pt-(--card-spacing)">
        <h2 className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-brand-700 uppercase">
          <CalendarDaysIcon aria-hidden="true" className="size-4" />
          Today&apos;s Prayer &amp; Hijri
        </h2>
      </div>

      <CardContent>
        {unavailable ? (
          <p className="text-sm text-muted-foreground">
            Today&apos;s calendar data is temporarily unavailable.
          </p>
        ) : (
          <>
            <p className="text-lg font-bold text-foreground">{timings.gregorianDate}</p>
            {timings.hijriDate ? (
              <p className="mt-0.5 text-sm font-semibold text-brand-700">
                {timings.hijriDate}
              </p>
            ) : null}

            <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
              {timings.slots.map((slot) => (
                <li
                  key={slot.key}
                  className="flex items-baseline justify-between gap-4 border-b border-border/40 py-1.5 last:border-0 sm:border-b-0 sm:py-1"
                >
                  <span className="text-sm font-semibold text-muted-foreground">
                    {slot.label}
                  </span>
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    {slot.time ?? <span className="font-normal text-muted-foreground">&mdash;</span>}
                  </span>
                </li>
              ))}
            </ul>

            {candidates.length > 0 ? (
              <div className="mt-4 border-t border-border/60 pt-4">
                <h3 className="text-[0.6875rem] font-bold tracking-[0.16em] text-brand-700 uppercase">
                  Next Prayer
                </h3>
                <AdminNextPrayerLive candidates={candidates} serverNow={serverNow} />
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
