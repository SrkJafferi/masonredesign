import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/website/reveal";
import { getTodayTimings } from "@/features/calendar/queries";
import { prayerCalendarHref } from "@/features/prayer-calendar/config";
import {
  formatStoredTime,
  getNextPrayerCandidates,
} from "@/features/prayer-calendar/lib/next-prayer";
import { cn } from "@/lib/utils";

import { TodayPrayerLive } from "./today-prayer-live";

/**
 * Homepage "Today's Prayer" section: today's six published timings, the
 * Gregorian + Hijri date, and a live next-prayer countdown. Everything comes
 * from the existing calendar data layer (getTodayTimings / getNextPrayerCandidates)
 * — no duplicate prayer/date logic and no hard-coded times.
 */
export async function TodayPrayerSection() {
  const [timings, candidates] = await Promise.all([
    getTodayTimings(),
    getNextPrayerCandidates(),
  ]);
  const serverNow = Date.now();

  const { gregorianDate, hijriDate, slots } = timings;
  const hasDate = Boolean(gregorianDate ?? hijriDate);

  return (
    <Container
      as="section"
      aria-labelledby="todays-prayer-heading"
      className="scroll-mt-24 py-14 sm:py-16 lg:py-20"
    >
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <h2
              id="todays-prayer-heading"
              className="text-2xl font-bold text-foreground sm:text-3xl"
            >
              Today&rsquo;s Prayer
            </h2>
            {hasDate ? (
              <p className="mt-2 text-sm font-semibold text-foreground tabular-nums sm:text-base">
                {gregorianDate}
                {hijriDate ? (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    &middot; {hijriDate}
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
          <Link
            href={prayerCalendarHref}
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 transition-colors duration-200 hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Full prayer calendar
            <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-start">
          {/* Today's six timings — mobile: 3-col wrap; sm+: single row. */}
          <div className="order-2 rounded-2xl border border-border/60 bg-card p-5 shadow-card sm:p-7 lg:order-1">
            <ul className="grid grid-cols-3 gap-y-6 sm:grid-cols-6">
              {slots.map((slot, index) => (
                <li
                  key={slot.key}
                  className={cn(
                    "px-2.5 text-center sm:px-3",
                    index % 3 !== 0 && "border-l border-sand-400/70",
                    index !== 0 && "sm:border-l sm:border-sand-400/70",
                  )}
                >
                  <p className="text-[0.7rem] font-bold tracking-[0.14em] text-brand-700 uppercase sm:text-xs">
                    {slot.label}
                  </p>
                  <p className="mt-1 text-lg font-bold text-foreground tabular-nums sm:text-xl">
                    {slot.time ? (
                      formatStoredTime(slot.time)
                    ) : (
                      <span className="text-muted-foreground">&mdash;</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Live next-prayer card. */}
          <div className="order-1 relative overflow-hidden rounded-2xl border border-brand-500/25 bg-gradient-to-br from-brand-50 via-brand-50/50 to-card p-6 shadow-card sm:p-7 lg:order-2">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-400 via-sand-400 to-transparent"
            />
            <TodayPrayerLive candidates={candidates} serverNow={serverNow} />
          </div>
        </div>
      </Reveal>
    </Container>
  );
}
