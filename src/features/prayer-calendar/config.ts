import type { PrayerTimeKey, PrayerTimeSlot } from "@/features/prayer-calendar/types";

export const prayerTimeLabels: Record<PrayerTimeKey, string> = {
  fajr: "Fajr",
  sunrise: "Sunrise",
  zohar: "Zohar",
  sunset: "Sunset",
  maghrib: "Maghrib",
  midnight: "Midnight",
};

export const prayerTimeOrder: PrayerTimeKey[] = [
  "fajr",
  "sunrise",
  "zohar",
  "sunset",
  "maghrib",
  "midnight",
];

export const prayerTimingsHeading = "Chicagoland prayer timings";

export const prayerCalendarHref = "/hijricalendar2026";

export const emptyPrayerTimeSlots: PrayerTimeSlot[] = prayerTimeOrder.map((key) => ({
  key,
  label: prayerTimeLabels[key],
  time: null,
}));
