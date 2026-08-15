import { getNextPrayerCandidates } from "@/features/prayer-calendar/lib/next-prayer";

import { TodayPrayerLive } from "./today-prayer-live";

/**
 * Homepage "Next Prayer" module card for the feature grid. A Server Component:
 * it fetches the two calendar rows needed for the live candidates, then
 * delegates the ticking countdown to the small client component. The card keeps
 * the same gradient look as the original below-hero module.
 */
export async function NextPrayerBanner() {
  const candidates = await getNextPrayerCandidates();
  const serverNow = Date.now();

  return (
    <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-2xl border border-brand-500/25 bg-gradient-to-br from-brand-50 via-brand-50/50 to-card p-5 shadow-card sm:p-6">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-400 via-sand-400 to-transparent"
      />
      <TodayPrayerLive candidates={candidates} serverNow={serverNow} />
    </div>
  );
}
