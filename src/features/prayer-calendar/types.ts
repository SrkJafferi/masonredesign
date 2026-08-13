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
