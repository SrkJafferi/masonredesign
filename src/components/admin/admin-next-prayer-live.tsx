"use client";

import { MoonStarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { formatRemaining } from "@/features/prayer-calendar/components/next-prayer-live";
import type { NextPrayerCandidate } from "@/features/prayer-calendar/types";

type AdminNextPrayerLiveProps = {
  /** Upcoming prayer candidates (same data the public card uses). */
  candidates: NextPrayerCandidate[];
  /** Server-computed \"now\" (epoch ms) so the initial render matches the server. */
  serverNow: number;
};

/**
 * Compact \"Next Prayer\" countdown for the admin dashboard. It consumes the
 * exact same candidates + ticking logic as the public card — only the layout
 * is compressed. Reuses the shared formatRemaining helper; no second prayer
 * calculation system.
 */
export function AdminNextPrayerLive({ candidates, serverNow }: AdminNextPrayerLiveProps) {
  const [now, setNow] = useState<number>(serverNow);

  useEffect(() => {
    // Keep the ticking clock aligned with server time despite client skew.
    const skew = Date.now() - serverNow;
    const tick = () => setNow(Date.now() - skew);
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [serverNow]);

  if (candidates.length === 0) return null;

  const active =
    candidates.find((candidate) => candidate.target > now) ??
    candidates[candidates.length - 1];
  const remaining = Math.max(0, active.target - now);

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-500/20">
          <MoonStarIcon aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-base font-bold text-foreground">{active.name}</p>
          <p className="text-sm font-bold text-brand-700 tabular-nums">
            {active.time}
            <span className="ml-2 font-normal text-muted-foreground">
              {active.dateLabel}
            </span>
          </p>
        </div>
      </div>
      <p role="timer" className="text-lg font-bold text-foreground tabular-nums">
        in {formatRemaining(remaining)}
      </p>
    </div>
  );
}
