import { MoonStarIcon } from "lucide-react";

import { getNextPrayerCandidates } from "@/features/prayer-calendar/lib/next-prayer";

import { NextPrayerLive } from "./next-prayer-live";

/**
 * Live "Next Prayer" card. A Server Component: it fetches only the two
 * calendar rows needed for today's Fajr/Zohar/Maghrib plus tomorrow's Fajr,
 * then delegates the ticking countdown to a tiny client component. The
 * calendar page itself stays server-rendered.
 */
export async function NextPrayerCard() {
  const candidates = await getNextPrayerCandidates();
  const serverNow = Date.now();

  return (
    <section
      aria-labelledby="next-prayer-heading"
      className="rounded-2xl border border-border/60 bg-card p-5 shadow-card sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2
          id="next-prayer-heading"
          className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-brand-700 uppercase"
        >
          <MoonStarIcon aria-hidden="true" className="size-4" />
          Next Prayer
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[0.6875rem] font-semibold text-brand-700 ring-1 ring-inset ring-brand-500/30">
          <span aria-hidden="true" className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-brand-500" />
          </span>
          Chicago
        </span>
      </div>

      <div className="mt-4">
        <NextPrayerLive candidates={candidates} serverNow={serverNow} />
      </div>
    </section>
  );
}
