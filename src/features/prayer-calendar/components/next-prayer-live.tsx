"use client";

import { useEffect, useState } from "react";
import { MoonStarIcon } from "lucide-react";

import type { NextPrayerCandidate } from "@/features/prayer-calendar/types";

/** Formats a remaining duration as "6h 26m" / "26m 12s" / "12s". */
export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

type NextPrayerLiveProps = {
  /** Upcoming prayer candidates, chronologically ordered (today's Fajr→Maghrib, tomorrow's Fajr). */
  candidates: NextPrayerCandidate[];
  /** Server-computed "now" (epoch ms) so the initial render matches the server. */
  serverNow: number;
};

/**
 * Lightweight live "Next Prayer" countdown. Runs on a 1-second interval with
 * no library. It derives the active prayer purely from the pre-fetched
 * candidate timestamps, so it keeps working across midnight and across the
 * DST transitions without a page refresh.
 */
export function NextPrayerLive({ candidates, serverNow }: NextPrayerLiveProps) {
  const [now, setNow] = useState<number>(serverNow);

  useEffect(() => {
    // Keep the ticking clock aligned with server time despite client skew.
    const skew = Date.now() - serverNow;
    const tick = () => setNow(Date.now() - skew);
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [serverNow]);

  if (candidates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Prayer timings will be published soon. Please check back later.
      </p>
    );
  }

  const active = candidates.find((candidate) => candidate.target > now) ?? candidates[candidates.length - 1];
  const remaining = Math.max(0, active.target - now);

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-muted-foreground tabular-nums">
          {active.dateLabel}
        </p>
        <div className="mt-1.5 flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-500/20">
            <MoonStarIcon aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="text-2xl font-bold text-foreground sm:text-3xl">{active.name}</p>
            <p className="text-lg font-bold text-brand-700 tabular-nums sm:text-xl">
              {active.time}
            </p>
          </div>
        </div>
      </div>

      <div className="shrink-0 sm:text-right">
        <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Time remaining
        </p>
        <p role="timer" className="mt-1 text-2xl font-bold text-foreground tabular-nums sm:text-3xl">
          in {formatRemaining(remaining)}
        </p>
      </div>
    </div>
  );
}
