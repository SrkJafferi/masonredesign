import { permanentRedirect } from "next/navigation";

import { calendarBasePath } from "@/features/calendar/config";

/**
 * Legacy URL compatibility: the WordPress site exposed the calendar at /2026/.
 * We keep a single canonical page at {calendarBasePath} and permanently redirect
 * this path to it (avoids duplicate content while keeping the old link working).
 */
export default function LegacyCalendarYearPage() {
  permanentRedirect(calendarBasePath);
}
