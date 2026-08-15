import type { PrayerTimeSlot } from "@/features/prayer-calendar/types";

// ---------------------------------------------------------------------------
// Database row mirrors (snake_case, matching the calendar migration exactly).
// ---------------------------------------------------------------------------

export type CalendarDayRow = {
  gregorian_date: string; // "YYYY-MM-DD"
  imsaak: string | null; // stored, never publicly displayed
  fajr: string | null;
  sunrise: string | null;
  zohar: string | null;
  sunset: string | null;
  maghrib: string | null;
  midnight: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};
export type CalendarDayAdminItem = CalendarDayRow;

export type HijriMonthRow = {
  id: string;
  hijri_year: number;
  hijri_month: number; // 1-12
  gregorian_start: string; // "YYYY-MM-DD"
  is_published: boolean;
  created_at: string;
  updated_at: string;
};
export type HijriMonthAdminItem = HijriMonthRow;

export type HijriOverrideRow = {
  gregorian_date: string; // "YYYY-MM-DD" (primary key)
  hijri_year: number;
  hijri_month: number; // 1-12
  hijri_day: number; // 1-30
  note: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};
export type HijriOverrideAdminItem = HijriOverrideRow;

export type CalendarEventRow = {
  id: string;
  event_date: string; // "YYYY-MM-DD" (derived cache, kept for compatibility)
  hijri_year: number | null; // authoritative Hijri anchor
  hijri_month: number | null; // 1-12
  hijri_day: number | null; // 1-30
  title: string;
  description: string | null;
  category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
export type CalendarEventAdminItem = CalendarEventRow & {
  /** The Gregorian date derived live from the Hijri anchor + current month
   * boundaries. Always present for display; falls back to event_date when the
   * Hijri anchor is missing. */
  derived_gregorian_date: string;
  /** Whether the schema has the Hijri anchor columns (migration applied). */
  hijri_anchored: boolean;
};

// ---------------------------------------------------------------------------
// Resolved / display models consumed by the public calendar UI.
// ---------------------------------------------------------------------------

export type HijriDate = {
  year: number;
  month: number; // 1-12
  day: number; // 1-30
  monthName: string;
  /** How this date was determined — an explicit override, or derived from the
   * month-start boundaries. Surfaced so an editor can see which is in effect. */
  source: "override" | "derived";
};

export type CalendarEventView = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
};

export type CalendarDayView = {
  date: string; // "YYYY-MM-DD"
  gregorianDay: number; // 1-31
  weekday: number; // 0 (Sun) - 6 (Sat)
  hijri: HijriDate | null;
  timings: PrayerTimeSlot[]; // exactly the six public slots
  events: CalendarEventView[];
};

export type CalendarMonthView = {
  year: number;
  month: number; // 1-12 (Gregorian)
  monthLabel: string; // e.g. "January 2026"
  days: CalendarDayView[];
};
