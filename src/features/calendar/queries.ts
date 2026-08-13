import "server-only";

import { prayerTimeLabels } from "@/features/prayer-calendar/config";
import type { DailyPrayerTimings, PrayerTimeSlot } from "@/features/prayer-calendar/types";
import { logCmsError } from "@/lib/cms/logging";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { publicTimingOrder } from "./config";
import { createHijriResolver, type HijriResolver } from "./hijri";
import type {
  CalendarDayAdminItem,
  CalendarDayRow,
  CalendarEventAdminItem,
  CalendarEventRow,
  CalendarMonthView,
  HijriMonthAdminItem,
  HijriMonthRow,
  HijriOverrideAdminItem,
  HijriOverrideRow,
} from "./types";

// ---------------------------------------------------------------------------
// Small date helpers (UTC-based to stay timezone-safe).
// ---------------------------------------------------------------------------
function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function daysInMonth(year: number, month: number): number {
  // month is 1-12; day 0 of the next month index === last day of this month.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function weekdayOf(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Today's date in MASOM's local timezone (Chicago), as "YYYY-MM-DD". */
function chicagoTodayISO(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatGregorianLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function buildSlots(row: CalendarDayRow | undefined): PrayerTimeSlot[] {
  return publicTimingOrder.map((key) => ({
    key,
    label: prayerTimeLabels[key],
    time: row ? (row[key] ?? null) : null,
  }));
}

// ---------------------------------------------------------------------------
// Public reads (anon client — keeps pages statically renderable).
// ---------------------------------------------------------------------------

/**
 * The whole published calendar for a year, assembled into 12 month views with a
 * row for every day (timings, resolved Hijri date, and any events merged in).
 * Returns [] on any failure so the page can render an empty-but-valid state.
 */
export async function getCalendarMonths(year: number): Promise<CalendarMonthView[]> {
  try {
    const supabase = createSupabasePublicClient();
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;

    const [daysRes, monthsRes, overridesRes, eventsRes] = await Promise.all([
      supabase
        .from("calendar_days")
        .select("*")
        .eq("is_published", true)
        .gte("gregorian_date", start)
        .lte("gregorian_date", end),
      // Fetch ALL month boundaries (unfiltered by year): resolving early-January
      // needs the boundary that started in the previous December.
      supabase.from("hijri_months").select("*").eq("is_published", true),
      supabase
        .from("hijri_overrides")
        .select("*")
        .eq("is_published", true)
        .gte("gregorian_date", start)
        .lte("gregorian_date", end),
      supabase
        .from("calendar_events")
        .select("*")
        .eq("is_active", true)
        .gte("event_date", start)
        .lte("event_date", end)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    for (const res of [daysRes, monthsRes, overridesRes, eventsRes]) {
      if (res.error) throw res.error;
    }

    const days = (daysRes.data as CalendarDayRow[] | null) ?? [];
    const months = (monthsRes.data as HijriMonthRow[] | null) ?? [];
    const overrides = (overridesRes.data as HijriOverrideRow[] | null) ?? [];
    const events = (eventsRes.data as CalendarEventRow[] | null) ?? [];

    const dayMap = new Map(days.map((row) => [row.gregorian_date, row] as const));
    const eventMap = new Map<string, CalendarEventRow[]>();
    for (const event of events) {
      const list = eventMap.get(event.event_date) ?? [];
      list.push(event);
      eventMap.set(event.event_date, list);
    }

    const resolve: HijriResolver = createHijriResolver(months, overrides);

    const monthViews: CalendarMonthView[] = [];
    for (let month = 1; month <= 12; month += 1) {
      const total = daysInMonth(year, month);
      const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });

      const dayViews = [];
      for (let day = 1; day <= total; day += 1) {
        const date = isoDate(year, month, day);
        dayViews.push({
          date,
          gregorianDay: day,
          weekday: weekdayOf(date),
          hijri: resolve(date),
          timings: buildSlots(dayMap.get(date)),
          events: (eventMap.get(date) ?? []).map((event) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            category: event.category,
          })),
        });
      }

      monthViews.push({ year, month, monthLabel, days: dayViews });
    }

    return monthViews;
  } catch (error) {
    logCmsError("calendar:getMonths", error);
    return [];
  }
}

/**
 * Today's six prayer timings for the site-header bar, with formatted Gregorian
 * and Hijri date labels. Falls back to an all-empty set (dashes) on failure.
 */
export async function getTodayTimings(): Promise<DailyPrayerTimings> {
  const today = chicagoTodayISO();
  try {
    const supabase = createSupabasePublicClient();
    const [dayRes, monthsRes, overrideRes] = await Promise.all([
      supabase
        .from("calendar_days")
        .select("*")
        .eq("gregorian_date", today)
        .eq("is_published", true)
        .maybeSingle(),
      supabase.from("hijri_months").select("*").eq("is_published", true),
      supabase
        .from("hijri_overrides")
        .select("*")
        .eq("is_published", true)
        .eq("gregorian_date", today)
        .maybeSingle(),
    ]);

    if (dayRes.error) throw dayRes.error;
    if (monthsRes.error) throw monthsRes.error;
    if (overrideRes.error) throw overrideRes.error;

    const row = (dayRes.data as CalendarDayRow | null) ?? undefined;
    const months = (monthsRes.data as HijriMonthRow[] | null) ?? [];
    const override = (overrideRes.data as HijriOverrideRow | null) ?? null;

    const resolve = createHijriResolver(months, override ? [override] : []);
    const hijri = resolve(today);

    return {
      gregorianDate: formatGregorianLong(today),
      hijriDate: hijri
        ? `${hijri.day} ${hijri.monthName} ${hijri.year} AH`
        : null,
      slots: buildSlots(row),
    };
  } catch (error) {
    logCmsError("calendar:getToday", error);
    return { gregorianDate: null, hijriDate: null, slots: buildSlots(undefined) };
  }
}

// ---------------------------------------------------------------------------
// Admin reads (session client — RLS enforces admin via is_admin()).
// ---------------------------------------------------------------------------

export async function getAllCalendarDays(year: number): Promise<CalendarDayAdminItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("calendar_days")
    .select("*")
    .gte("gregorian_date", `${year}-01-01`)
    .lte("gregorian_date", `${year}-12-31`)
    .order("gregorian_date", { ascending: true });

  if (error) {
    logCmsError("calendar:getAllDays", error);
    return [];
  }
  return (data as CalendarDayRow[] | null) ?? [];
}

export async function getCalendarDayByDate(date: string): Promise<CalendarDayRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("calendar_days")
    .select("*")
    .eq("gregorian_date", date)
    .maybeSingle();

  if (error) {
    logCmsError("calendar:getDayByDate", error);
    return null;
  }
  return (data as CalendarDayRow | null) ?? null;
}

export async function getAllHijriMonths(): Promise<HijriMonthAdminItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("hijri_months")
    .select("*")
    .order("gregorian_start", { ascending: true });

  if (error) {
    logCmsError("calendar:getAllHijriMonths", error);
    return [];
  }
  return (data as HijriMonthRow[] | null) ?? [];
}

export async function getAllHijriOverrides(): Promise<HijriOverrideAdminItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("hijri_overrides")
    .select("*")
    .order("gregorian_date", { ascending: true });

  if (error) {
    logCmsError("calendar:getAllHijriOverrides", error);
    return [];
  }
  return (data as HijriOverrideRow[] | null) ?? [];
}

export async function getAllCalendarEvents(): Promise<CalendarEventAdminItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .order("event_date", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    logCmsError("calendar:getAllEvents", error);
    return [];
  }
  return (data as CalendarEventRow[] | null) ?? [];
}
