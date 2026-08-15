export type PrayerTimeKey =
  | "fajr"
  | "sunrise"
  | "zohar"
  | "sunset"
  | "maghrib"
  | "midnight";

export type PrayerTimeSlot = {
  key: PrayerTimeKey;
  label: string;
  time: string | null;
};

export type DailyPrayerTimings = {
  gregorianDate: string | null;
  hijriDate: string | null;
  slots: PrayerTimeSlot[];
};

/** A single upcoming prayer candidate for the live "Next Prayer" card. */
export type NextPrayerCandidate = {
  dateISO: string; // "YYYY-MM-DD"
  dateLabel: string; // e.g. "August 13, 2026"
  name: string; // "Fajr" | "Zohar" | "Maghrib"
  time: string; // display form, e.g. "12:55 PM"
  target: number; // epoch ms of the prayer in America/Chicago
};
