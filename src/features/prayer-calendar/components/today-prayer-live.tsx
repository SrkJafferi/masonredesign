"use client";

import { MoonStarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import type { NextPrayerCandidate } from "@/features/prayer-calendar/types";
import { cn } from "@/lib/utils";

/** Formats remaining ms as "02h 14m 32s" (days added only beyond 24h). */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (days > 0) return `${days}d ${hh}h ${mm}m ${ss}s`;
  return `${hh}h ${mm}m ${ss}s`;
}

/** Countdowns inside this window are considered "NOW" (prayer imminent). */
const IMMINENT_MS = 90_000;

type TodayPrayerLiveProps = {
  /** Upcoming prayer candidates, chronologically ordered (today's Fajr → Maghrib, tomorrow's Fajr). */
  candidates: NextPrayerCandidate[];
  /** Server-computed "now" so the first painted frame matches the server HTML. */
  serverNow: number;
};

/**
 * Live "Next Prayer" countdown for the homepage section. Runs on a 1-second
 * interval with no library. The initial render is seeded with `serverNow` (so
 * hydration matches the server HTML exactly); after mount it ticks on the real
 * client clock, which keeps the countdown accurate even when the page is
 * served from a cached (ISR) build.
 *
 * The active prayer is derived purely from the pre-fetched candidate
 * timestamps (epoch ms, already computed in America/Chicago), so it keeps
 * working across midnight, next-day Fajr and DST transitions without a page
 * refresh.
 */
export function TodayPrayerLive({ candidates, serverNow }: TodayPrayerLiveProps) {
  const [now, setNow] = useState<number>(serverNow);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (candidates.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground">
        Prayer timings will be published soon. Please check back later.
      </p>
    );
  }

  const nextIndex = candidates.findIndex((candidate) => candidate.target > now);
  const next =
    nextIndex >= 0 ? candidates[nextIndex] : candidates[candidates.length - 1];
  const prev = nextIndex > 0 ? candidates[nextIndex - 1] : null;
  const remaining = Math.max(0, next.target - now);
  const progress = prev
    ? Math.min(1, Math.max(0, (now - prev.target) / (next.target - prev.target)))
    : 0;
  const imminent = remaining <= IMMINENT_MS;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-brand-700 uppercase">
          <MoonStarIcon aria-hidden="true" className="size-4" />
          Next Prayer
        </h3>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold ring-1 ring-inset",
            imminent
              ? "bg-brand-500/10 text-brand-700 ring-brand-500/30"
              : "bg-sand-100/60 text-ink-600 ring-sand-400/40",
          )}
        >
          {imminent ? (
            <>
              <span aria-hidden="true" className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-brand-500" />
              </span>
              Now
            </>
          ) : (
            "Upcoming"
          )}
        </span>
      </div>

      <p className="mt-1.5 text-xs font-semibold text-muted-foreground tabular-nums sm:text-sm">
        {next.dateLabel}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex items-center gap-3.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-700 ring-1 ring-inset ring-brand-500/25">
            <MoonStarIcon aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="text-2xl font-bold text-foreground sm:text-3xl">{next.name}</p>
            <p className="text-lg font-bold text-brand-700 tabular-nums sm:text-xl">
              {next.time}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Time remaining
          </p>
          <p
            role="timer"
            className="mt-1 text-2xl font-bold text-foreground tabular-nums sm:text-3xl"
          >
            {formatCountdown(remaining)}
          </p>
        </div>
      </div>

      {/* Progress between the previous and the upcoming prayer. */}
      {prev ? (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-3 text-[0.6875rem] font-medium text-muted-foreground">
            <span>After {prev.name}</span>
            <span className="truncate">Next {next.name}</span>
          </div>
          <div
            aria-hidden="true"
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-brand-500/15"
          >
            <div
              className="h-full rounded-full bg-brand-500 transition-[width] duration-700 ease-out"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
