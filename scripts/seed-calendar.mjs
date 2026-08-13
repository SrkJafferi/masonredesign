/**
 * Seeds the MASOM Prayer + Hijri Calendar for 2026 from the AUTHORITATIVE
 * source: refernece/MASOM-Calendar-2026.pdf.
 *
 * WHAT IT SEEDS
 *   • hijri_months    — the Islamic month-start boundaries that touch 2026.
 *   • calendar_days    — one row per Gregorian day with the six published
 *                        timings (+ imsaak, stored but never shown publicly).
 *   • calendar_events  — the Islamic events (wiladat, martyrdom, wafat, eid…).
 *
 * DATA FIDELITY (non-negotiable)
 *   Every value below MUST be transcribed EXACTLY from the PDF — no API, no
 *   estimates, no interpolation. Times are stored as printed (e.g. "5:55a").
 *   If a value on the PDF is unclear, leave it out and note the exact date
 *   rather than guessing. The three data arrays start EMPTY on purpose; the
 *   guard in main() refuses to run until they are populated, so this script
 *   can never silently seed fabricated or partial data.
 *
 * PREREQUISITES
 *   1. Migrations applied (calendar_days, hijri_months, hijri_overrides,
 *      calendar_events with RLS). See supabase/migrations.
 *   2. .env.local contains NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *
 * RUN
 *   npm run seed:calendar
 *   (i.e. node --env-file=.env.local scripts/seed-calendar.mjs)
 *
 * Idempotent: any table that already has rows is skipped, so re-running never
 * creates duplicates.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env. Run with: npm run seed:calendar " +
      "(needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local).",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ===========================================================================
// DATA — transcribed EXACTLY from refernece/MASOM-Calendar-2026.pdf.
// ===========================================================================

/**
 * Hijri month-start boundaries. One row per Islamic month whose days fall in
 * 2026 (include the boundary that began in Dec 2025 so early January resolves).
 *   { hijri_year, hijri_month (1-12), gregorian_start: "YYYY-MM-DD" }
 */
const hijriMonths = [
  { hijri_year: 1447, hijri_month: 7, gregorian_start: "2025-12-22" },  // Rajab 1447
  { hijri_year: 1447, hijri_month: 8, gregorian_start: "2026-01-20" },  // Shaabaan 1447
  { hijri_year: 1447, hijri_month: 9, gregorian_start: "2026-02-18" },  // Ramzan 1447
  { hijri_year: 1447, hijri_month: 10, gregorian_start: "2026-03-20" },  // Shawwal 1447
  { hijri_year: 1447, hijri_month: 11, gregorian_start: "2026-04-18" },  // Zeeqa'ad 1447
  { hijri_year: 1447, hijri_month: 12, gregorian_start: "2026-05-18" },  // Zilhajj 1447
  { hijri_year: 1448, hijri_month: 1, gregorian_start: "2026-06-16" },  // Muharram 1448
  { hijri_year: 1448, hijri_month: 2, gregorian_start: "2026-07-15" },  // Safar 1448
  { hijri_year: 1448, hijri_month: 3, gregorian_start: "2026-08-14" },  // Rabi-ul-Awwal 1448
  { hijri_year: 1448, hijri_month: 4, gregorian_start: "2026-09-12" },  // Rabi-us-Saani 1448
  { hijri_year: 1448, hijri_month: 5, gregorian_start: "2026-10-12" },  // Jamadi-ul-Awwal 1448
  { hijri_year: 1448, hijri_month: 6, gregorian_start: "2026-11-11" },  // Jamadi-us-Saani 1448
  { hijri_year: 1448, hijri_month: 7, gregorian_start: "2026-12-10" },  // Rajab 1448
];

/**
 * One row per Gregorian day. Times are stored EXACTLY as printed on the PDF.
 * imsaak is stored but never shown publicly. Use null for any timing the PDF
 * does not print for that day.
 *   { gregorian_date, imsaak, fajr, sunrise, zohar, sunset, maghrib, midnight }
 */
const calendarDays = [
  { gregorian_date: "2026-01-01", imsaak: "5:41a", fajr: "5:55a", sunrise: "7:18a", zohar: "11:54a", sunset: "4:31p", maghrib: "4:48p", midnight: "11:09p" },
  { gregorian_date: "2026-01-02", imsaak: "5:41a", fajr: "5:55a", sunrise: "7:18a", zohar: "11:55a", sunset: "4:32p", maghrib: "4:49p", midnight: "11:10p" },
  { gregorian_date: "2026-01-03", imsaak: "5:41a", fajr: "5:55a", sunrise: "7:18a", zohar: "11:55a", sunset: "4:33p", maghrib: "4:50p", midnight: "11:10p" },
  { gregorian_date: "2026-01-04", imsaak: "5:41a", fajr: "5:55a", sunrise: "7:18a", zohar: "11:55a", sunset: "4:33p", maghrib: "4:50p", midnight: "11:10p" },
  { gregorian_date: "2026-01-05", imsaak: "5:41a", fajr: "5:55a", sunrise: "7:18a", zohar: "11:56a", sunset: "4:34p", maghrib: "4:51p", midnight: "11:11p" },
  { gregorian_date: "2026-01-06", imsaak: "5:41a", fajr: "5:55a", sunrise: "7:18a", zohar: "11:56a", sunset: "4:35p", maghrib: "4:52p", midnight: "11:11p" },
  { gregorian_date: "2026-01-07", imsaak: "5:41a", fajr: "5:55a", sunrise: "7:18a", zohar: "11:57a", sunset: "4:36p", maghrib: "4:53p", midnight: "11:12p" },
  { gregorian_date: "2026-01-08", imsaak: "5:41a", fajr: "5:55a", sunrise: "7:18a", zohar: "11:57a", sunset: "4:37p", maghrib: "4:54p", midnight: "11:12p" },
  { gregorian_date: "2026-01-09", imsaak: "5:41a", fajr: "5:55a", sunrise: "7:18a", zohar: "11:58a", sunset: "4:38p", maghrib: "4:55p", midnight: "11:13p" },
  { gregorian_date: "2026-01-10", imsaak: "5:41a", fajr: "5:55a", sunrise: "7:18a", zohar: "11:59a", sunset: "4:40p", maghrib: "4:57p", midnight: "11:13p" },
  { gregorian_date: "2026-01-11", imsaak: "5:40a", fajr: "5:54a", sunrise: "7:17a", zohar: "11:59a", sunset: "4:41p", maghrib: "4:58p", midnight: "11:14p" },
  { gregorian_date: "2026-01-12", imsaak: "5:41a", fajr: "5:55a", sunrise: "7:17a", zohar: "11:59a", sunset: "4:42p", maghrib: "4:59p", midnight: "11:15p" },
  { gregorian_date: "2026-01-13", imsaak: "5:41a", fajr: "5:55a", sunrise: "7:17a", zohar: "12:00p", sunset: "4:43p", maghrib: "5:00p", midnight: "11:15p" },
  { gregorian_date: "2026-01-14", imsaak: "5:40a", fajr: "5:54a", sunrise: "7:16a", zohar: "12:00p", sunset: "4:44p", maghrib: "5:01p", midnight: "11:15p" },
  { gregorian_date: "2026-01-15", imsaak: "5:40a", fajr: "5:54a", sunrise: "7:16a", zohar: "12:00p", sunset: "4:45p", maghrib: "5:02p", midnight: "11:15p" },
  { gregorian_date: "2026-01-16", imsaak: "5:39a", fajr: "5:53a", sunrise: "7:15a", zohar: "12:00p", sunset: "4:46p", maghrib: "5:03p", midnight: "11:16p" },
  { gregorian_date: "2026-01-17", imsaak: "5:40a", fajr: "5:54a", sunrise: "7:15a", zohar: "12:01p", sunset: "4:47p", maghrib: "5:04p", midnight: "11:16p" },
  { gregorian_date: "2026-01-18", imsaak: "5:38a", fajr: "5:52a", sunrise: "7:14a", zohar: "12:01p", sunset: "4:49p", maghrib: "5:06p", midnight: "11:17p" },
  { gregorian_date: "2026-01-19", imsaak: "5:39a", fajr: "5:53a", sunrise: "7:14a", zohar: "12:02p", sunset: "4:50p", maghrib: "5:07p", midnight: "11:17p" },
  { gregorian_date: "2026-01-20", imsaak: "5:37a", fajr: "5:51a", sunrise: "7:13a", zohar: "12:02p", sunset: "4:51p", maghrib: "5:08p", midnight: "11:17p" },
  { gregorian_date: "2026-01-21", imsaak: "5:37a", fajr: "5:51a", sunrise: "7:12a", zohar: "12:02p", sunset: "4:52p", maghrib: "5:09p", midnight: "11:18p" },
  { gregorian_date: "2026-01-22", imsaak: "5:37a", fajr: "5:51a", sunrise: "7:12a", zohar: "12:03p", sunset: "4:54p", maghrib: "5:11p", midnight: "11:18p" },
  { gregorian_date: "2026-01-23", imsaak: "5:36a", fajr: "5:50a", sunrise: "7:11a", zohar: "12:03p", sunset: "4:55p", maghrib: "5:12p", midnight: "11:18p" },
  { gregorian_date: "2026-01-24", imsaak: "5:35a", fajr: "5:49a", sunrise: "7:10a", zohar: "12:03p", sunset: "4:56p", maghrib: "5:13p", midnight: "11:19p" },
  { gregorian_date: "2026-01-25", imsaak: "5:35a", fajr: "5:49a", sunrise: "7:09a", zohar: "12:03p", sunset: "4:57p", maghrib: "5:14p", midnight: "11:19p" },
  { gregorian_date: "2026-01-26", imsaak: "5:35a", fajr: "5:49a", sunrise: "7:09a", zohar: "12:04p", sunset: "4:59p", maghrib: "5:16p", midnight: "11:19p" },
  { gregorian_date: "2026-01-27", imsaak: "5:33a", fajr: "5:47a", sunrise: "7:08a", zohar: "12:04p", sunset: "5:00p", maghrib: "5:17p", midnight: "11:20p" },
  { gregorian_date: "2026-01-28", imsaak: "5:33a", fajr: "5:47a", sunrise: "7:07a", zohar: "12:04p", sunset: "5:01p", maghrib: "5:18p", midnight: "11:20p" },
  { gregorian_date: "2026-01-29", imsaak: "5:32a", fajr: "5:46a", sunrise: "7:06a", zohar: "12:04p", sunset: "5:02p", maghrib: "5:19p", midnight: "11:20p" },
  { gregorian_date: "2026-01-30", imsaak: "5:31a", fajr: "5:45a", sunrise: "7:05a", zohar: "12:04p", sunset: "5:04p", maghrib: "5:21p", midnight: "11:20p" },
  { gregorian_date: "2026-01-31", imsaak: "5:30a", fajr: "5:44a", sunrise: "7:04a", zohar: "12:04p", sunset: "5:05p", maghrib: "5:22p", midnight: "11:20p" },
  { gregorian_date: "2026-02-01", imsaak: "5:29a", fajr: "5:43a", sunrise: "7:03a", zohar: "12:04p", sunset: "5:06p", maghrib: "5:23p", midnight: "11:21p" },
  { gregorian_date: "2026-02-02", imsaak: "5:29a", fajr: "5:43a", sunrise: "7:02a", zohar: "12:05p", sunset: "5:08p", maghrib: "5:25p", midnight: "11:21p" },
  { gregorian_date: "2026-02-03", imsaak: "5:28a", fajr: "5:42a", sunrise: "7:01a", zohar: "12:05p", sunset: "5:09p", maghrib: "5:26p", midnight: "11:21p" },
  { gregorian_date: "2026-02-04", imsaak: "5:27a", fajr: "5:41a", sunrise: "7:00a", zohar: "12:05p", sunset: "5:10p", maghrib: "5:27p", midnight: "11:21p" },
  { gregorian_date: "2026-02-05", imsaak: "5:26a", fajr: "5:40a", sunrise: "6:59a", zohar: "12:05p", sunset: "5:11p", maghrib: "5:28p", midnight: "11:21p" },
  { gregorian_date: "2026-02-06", imsaak: "5:25a", fajr: "5:39a", sunrise: "6:58a", zohar: "12:05p", sunset: "5:13p", maghrib: "5:30p", midnight: "11:22p" },
  { gregorian_date: "2026-02-07", imsaak: "5:24a", fajr: "5:38a", sunrise: "6:56a", zohar: "12:05p", sunset: "5:14p", maghrib: "5:31p", midnight: "11:22p" },
  { gregorian_date: "2026-02-08", imsaak: "5:24a", fajr: "5:38a", sunrise: "6:55a", zohar: "12:05p", sunset: "5:15p", maghrib: "5:32p", midnight: "11:22p" },
  { gregorian_date: "2026-02-09", imsaak: "5:23a", fajr: "5:37a", sunrise: "6:54a", zohar: "12:05p", sunset: "5:16p", maghrib: "5:33p", midnight: "11:22p" },
  { gregorian_date: "2026-02-10", imsaak: "5:22a", fajr: "5:36a", sunrise: "6:53a", zohar: "12:05p", sunset: "5:18p", maghrib: "5:35p", midnight: "11:22p" },
  { gregorian_date: "2026-02-11", imsaak: "5:20a", fajr: "5:34a", sunrise: "6:51a", zohar: "12:05p", sunset: "5:19p", maghrib: "5:36p", midnight: "11:22p" },
  { gregorian_date: "2026-02-12", imsaak: "5:19a", fajr: "5:33a", sunrise: "6:50a", zohar: "12:05p", sunset: "5:20p", maghrib: "5:37p", midnight: "11:22p" },
  { gregorian_date: "2026-02-13", imsaak: "5:18a", fajr: "5:32a", sunrise: "6:49a", zohar: "12:05p", sunset: "5:22p", maghrib: "5:39p", midnight: "11:23p" },
  { gregorian_date: "2026-02-14", imsaak: "5:17a", fajr: "5:31a", sunrise: "6:48a", zohar: "12:05p", sunset: "5:23p", maghrib: "5:40p", midnight: "11:23p" },
  { gregorian_date: "2026-02-15", imsaak: "5:16a", fajr: "5:30a", sunrise: "6:46a", zohar: "12:05p", sunset: "5:24p", maghrib: "5:41p", midnight: "11:23p" },
  { gregorian_date: "2026-02-16", imsaak: "5:15a", fajr: "5:29a", sunrise: "6:45a", zohar: "12:05p", sunset: "5:25p", maghrib: "5:42p", midnight: "11:22p" },
  { gregorian_date: "2026-02-17", imsaak: "5:12a", fajr: "5:26a", sunrise: "6:43a", zohar: "12:05p", sunset: "5:27p", maghrib: "5:44p", midnight: "11:23p" },
  { gregorian_date: "2026-02-18", imsaak: "5:12a", fajr: "5:26a", sunrise: "6:42a", zohar: "12:05p", sunset: "5:28p", maghrib: "5:45p", midnight: "11:23p" },
  { gregorian_date: "2026-02-19", imsaak: "5:11a", fajr: "5:25a", sunrise: "6:41a", zohar: "12:05p", sunset: "5:29p", maghrib: "5:46p", midnight: "11:22p" },
  { gregorian_date: "2026-02-20", imsaak: "5:09a", fajr: "5:23a", sunrise: "6:39a", zohar: "12:04p", sunset: "5:30p", maghrib: "5:47p", midnight: "11:22p" },
  { gregorian_date: "2026-02-21", imsaak: "5:08a", fajr: "5:22a", sunrise: "6:38a", zohar: "12:05p", sunset: "5:32p", maghrib: "5:49p", midnight: "11:22p" },
  { gregorian_date: "2026-02-22", imsaak: "5:06a", fajr: "5:20a", sunrise: "6:36a", zohar: "12:04p", sunset: "5:33p", maghrib: "5:50p", midnight: "11:22p" },
  { gregorian_date: "2026-02-23", imsaak: "5:05a", fajr: "5:19a", sunrise: "6:35a", zohar: "12:04p", sunset: "5:34p", maghrib: "5:51p", midnight: "11:22p" },
  { gregorian_date: "2026-02-24", imsaak: "5:04a", fajr: "5:18a", sunrise: "6:33a", zohar: "12:04p", sunset: "5:35p", maghrib: "5:52p", midnight: "11:22p" },
  { gregorian_date: "2026-02-25", imsaak: "5:02a", fajr: "5:16a", sunrise: "6:32a", zohar: "12:04p", sunset: "5:36p", maghrib: "5:53p", midnight: "11:22p" },
  { gregorian_date: "2026-02-26", imsaak: "5:01a", fajr: "5:15a", sunrise: "6:30a", zohar: "12:04p", sunset: "5:38p", maghrib: "5:55p", midnight: "11:22p" },
  { gregorian_date: "2026-02-27", imsaak: "4:59a", fajr: "5:13a", sunrise: "6:29a", zohar: "12:04p", sunset: "5:39p", maghrib: "5:56p", midnight: "11:21p" },
  { gregorian_date: "2026-02-28", imsaak: "4:57a", fajr: "5:11a", sunrise: "6:27a", zohar: "12:03p", sunset: "5:40p", maghrib: "5:57p", midnight: "11:21p" },
  { gregorian_date: "2026-03-01", imsaak: "4:56a", fajr: "5:10a", sunrise: "6:25a", zohar: "12:03p", sunset: "5:41p", maghrib: "5:58p", midnight: "11:21p" },
  { gregorian_date: "2026-03-02", imsaak: "4:55a", fajr: "5:09a", sunrise: "6:24a", zohar: "12:03p", sunset: "5:42p", maghrib: "5:59p", midnight: "11:20p" },
  { gregorian_date: "2026-03-03", imsaak: "4:52a", fajr: "5:06a", sunrise: "6:22a", zohar: "12:03p", sunset: "5:44p", maghrib: "6:01p", midnight: "11:21p" },
  { gregorian_date: "2026-03-04", imsaak: "4:52a", fajr: "5:06a", sunrise: "6:21a", zohar: "12:03p", sunset: "5:45p", maghrib: "6:02p", midnight: "11:21p" },
  { gregorian_date: "2026-03-05", imsaak: "4:50a", fajr: "5:04a", sunrise: "6:19a", zohar: "12:02p", sunset: "5:46p", maghrib: "6:03p", midnight: "11:20p" },
  { gregorian_date: "2026-03-06", imsaak: "4:47a", fajr: "5:01a", sunrise: "6:17a", zohar: "12:02p", sunset: "5:47p", maghrib: "6:04p", midnight: "11:20p" },
  { gregorian_date: "2026-03-07", imsaak: "4:47a", fajr: "5:01a", sunrise: "6:16a", zohar: "12:02p", sunset: "5:48p", maghrib: "6:05p", midnight: "11:20p" },
  { gregorian_date: "2026-03-08", imsaak: "5:45a", fajr: "5:59a", sunrise: "7:14a", zohar: "1:01p", sunset: "6:49p", maghrib: "7:06p", midnight: "12:19a" },
  { gregorian_date: "2026-03-09", imsaak: "5:43a", fajr: "5:57a", sunrise: "7:12a", zohar: "1:01p", sunset: "6:51p", maghrib: "7:08p", midnight: "12:20a" },
  { gregorian_date: "2026-03-10", imsaak: "5:43a", fajr: "5:57a", sunrise: "7:11a", zohar: "1:01p", sunset: "6:52p", maghrib: "7:09p", midnight: "12:19a" },
  { gregorian_date: "2026-03-11", imsaak: "5:40a", fajr: "5:54a", sunrise: "7:09a", zohar: "1:01p", sunset: "6:53p", maghrib: "7:10p", midnight: "12:19a" },
  { gregorian_date: "2026-03-12", imsaak: "5:38a", fajr: "5:52a", sunrise: "7:07a", zohar: "1:00p", sunset: "6:54p", maghrib: "7:11p", midnight: "12:19a" },
  { gregorian_date: "2026-03-13", imsaak: "5:38a", fajr: "5:52a", sunrise: "7:06a", zohar: "1:00p", sunset: "6:55p", maghrib: "7:12p", midnight: "12:18a" },
  { gregorian_date: "2026-03-14", imsaak: "5:35a", fajr: "5:49a", sunrise: "7:04a", zohar: "1:00p", sunset: "6:56p", maghrib: "7:13p", midnight: "12:18a" },
  { gregorian_date: "2026-03-15", imsaak: "5:33a", fajr: "5:47a", sunrise: "7:02a", zohar: "12:59p", sunset: "6:57p", maghrib: "7:14p", midnight: "12:18a" },
  { gregorian_date: "2026-03-16", imsaak: "5:32a", fajr: "5:46a", sunrise: "7:01a", zohar: "1:00p", sunset: "6:59p", maghrib: "7:16p", midnight: "12:18a" },
  { gregorian_date: "2026-03-17", imsaak: "5:30a", fajr: "5:44a", sunrise: "6:59a", zohar: "12:59p", sunset: "7:00p", maghrib: "7:17p", midnight: "12:17a" },
  { gregorian_date: "2026-03-18", imsaak: "5:28a", fajr: "5:42a", sunrise: "6:57a", zohar: "12:59p", sunset: "7:01p", maghrib: "7:18p", midnight: "12:17a" },
  { gregorian_date: "2026-03-19", imsaak: "5:27a", fajr: "5:41a", sunrise: "6:56a", zohar: "12:59p", sunset: "7:02p", maghrib: "7:19p", midnight: "12:17a" },
  { gregorian_date: "2026-03-20", imsaak: "5:25a", fajr: "5:39a", sunrise: "6:54a", zohar: "12:58p", sunset: "7:03p", maghrib: "7:20p", midnight: "12:16a" },
  { gregorian_date: "2026-03-21", imsaak: "5:23a", fajr: "5:37a", sunrise: "6:52a", zohar: "12:58p", sunset: "7:04p", maghrib: "7:21p", midnight: "12:15a" },
  { gregorian_date: "2026-03-22", imsaak: "5:20a", fajr: "5:34a", sunrise: "6:50a", zohar: "12:57p", sunset: "7:05p", maghrib: "7:22p", midnight: "12:16a" },
  { gregorian_date: "2026-03-23", imsaak: "5:20a", fajr: "5:34a", sunrise: "6:49a", zohar: "12:57p", sunset: "7:06p", maghrib: "7:23p", midnight: "12:15a" },
  { gregorian_date: "2026-03-24", imsaak: "5:17a", fajr: "5:31a", sunrise: "6:47a", zohar: "12:57p", sunset: "7:08p", maghrib: "7:25p", midnight: "12:15a" },
  { gregorian_date: "2026-03-25", imsaak: "5:15a", fajr: "5:29a", sunrise: "6:45a", zohar: "12:57p", sunset: "7:09p", maghrib: "7:26p", midnight: "12:15a" },
  { gregorian_date: "2026-03-26", imsaak: "5:14a", fajr: "5:28a", sunrise: "6:44a", zohar: "12:57p", sunset: "7:10p", maghrib: "7:27p", midnight: "12:14a" },
  { gregorian_date: "2026-03-27", imsaak: "5:12a", fajr: "5:26a", sunrise: "6:42a", zohar: "12:56p", sunset: "7:11p", maghrib: "7:28p", midnight: "12:13a" },
  { gregorian_date: "2026-03-28", imsaak: "5:09a", fajr: "5:23a", sunrise: "6:40a", zohar: "12:56p", sunset: "7:12p", maghrib: "7:29p", midnight: "12:13a" },
  { gregorian_date: "2026-03-29", imsaak: "5:07a", fajr: "5:21a", sunrise: "6:38a", zohar: "12:55p", sunset: "7:13p", maghrib: "7:30p", midnight: "12:13a" },
  { gregorian_date: "2026-03-30", imsaak: "5:06a", fajr: "5:20a", sunrise: "6:37a", zohar: "12:55p", sunset: "7:14p", maghrib: "7:31p", midnight: "12:12a" },
  { gregorian_date: "2026-03-31", imsaak: "5:04a", fajr: "5:18a", sunrise: "6:35a", zohar: "12:55p", sunset: "7:15p", maghrib: "7:32p", midnight: "12:12a" },
  { gregorian_date: "2026-04-01", imsaak: "5:02a", fajr: "5:16a", sunrise: "6:33a", zohar: "12:54p", sunset: "7:16p", maghrib: "7:33p", midnight: "12:12a" },
  { gregorian_date: "2026-04-02", imsaak: "5:01a", fajr: "5:15a", sunrise: "6:32a", zohar: "12:55p", sunset: "7:18p", maghrib: "7:35p", midnight: "12:11a" },
  { gregorian_date: "2026-04-03", imsaak: "4:58a", fajr: "5:12a", sunrise: "6:30a", zohar: "12:54p", sunset: "7:19p", maghrib: "7:36p", midnight: "12:11a" },
  { gregorian_date: "2026-04-04", imsaak: "4:56a", fajr: "5:10a", sunrise: "6:28a", zohar: "12:54p", sunset: "7:20p", maghrib: "7:37p", midnight: "12:11a" },
  { gregorian_date: "2026-04-05", imsaak: "4:55a", fajr: "5:09a", sunrise: "6:27a", zohar: "12:54p", sunset: "7:21p", maghrib: "7:38p", midnight: "12:10a" },
  { gregorian_date: "2026-04-06", imsaak: "4:53a", fajr: "5:07a", sunrise: "6:25a", zohar: "12:53p", sunset: "7:22p", maghrib: "7:39p", midnight: "12:09a" },
  { gregorian_date: "2026-04-07", imsaak: "4:50a", fajr: "5:04a", sunrise: "6:23a", zohar: "12:53p", sunset: "7:23p", maghrib: "7:40p", midnight: "12:09a" },
  { gregorian_date: "2026-04-08", imsaak: "4:49a", fajr: "5:03a", sunrise: "6:22a", zohar: "12:53p", sunset: "7:24p", maghrib: "7:41p", midnight: "12:08a" },
  { gregorian_date: "2026-04-09", imsaak: "4:46a", fajr: "5:00a", sunrise: "6:20a", zohar: "12:52p", sunset: "7:25p", maghrib: "7:42p", midnight: "12:08a" },
  { gregorian_date: "2026-04-10", imsaak: "4:44a", fajr: "4:58a", sunrise: "6:18a", zohar: "12:52p", sunset: "7:26p", maghrib: "7:43p", midnight: "12:08a" },
  { gregorian_date: "2026-04-11", imsaak: "4:43a", fajr: "4:57a", sunrise: "6:17a", zohar: "12:52p", sunset: "7:27p", maghrib: "7:44p", midnight: "12:07a" },
  { gregorian_date: "2026-04-12", imsaak: "4:41a", fajr: "4:55a", sunrise: "6:15a", zohar: "12:51p", sunset: "7:28p", maghrib: "7:45p", midnight: "12:07a" },
  { gregorian_date: "2026-04-13", imsaak: "4:39a", fajr: "4:53a", sunrise: "6:13a", zohar: "12:51p", sunset: "7:30p", maghrib: "7:47p", midnight: "12:07a" },
  { gregorian_date: "2026-04-14", imsaak: "4:38a", fajr: "4:52a", sunrise: "6:12a", zohar: "12:51p", sunset: "7:31p", maghrib: "7:48p", midnight: "12:06a" },
  { gregorian_date: "2026-04-15", imsaak: "4:35a", fajr: "4:49a", sunrise: "6:10a", zohar: "12:51p", sunset: "7:32p", maghrib: "7:49p", midnight: "12:06a" },
  { gregorian_date: "2026-04-16", imsaak: "4:34a", fajr: "4:48a", sunrise: "6:09a", zohar: "12:51p", sunset: "7:33p", maghrib: "7:50p", midnight: "12:05a" },
  { gregorian_date: "2026-04-17", imsaak: "4:31a", fajr: "4:45a", sunrise: "6:07a", zohar: "12:50p", sunset: "7:34p", maghrib: "7:51p", midnight: "12:05a" },
  { gregorian_date: "2026-04-18", imsaak: "4:30a", fajr: "4:44a", sunrise: "6:06a", zohar: "12:50p", sunset: "7:35p", maghrib: "7:52p", midnight: "12:04a" },
  { gregorian_date: "2026-04-19", imsaak: "4:27a", fajr: "4:41a", sunrise: "6:04a", zohar: "12:50p", sunset: "7:36p", maghrib: "7:53p", midnight: "12:04a" },
  { gregorian_date: "2026-04-20", imsaak: "4:26a", fajr: "4:40a", sunrise: "6:03a", zohar: "12:50p", sunset: "7:37p", maghrib: "7:54p", midnight: "12:04a" },
  { gregorian_date: "2026-04-21", imsaak: "4:24a", fajr: "4:38a", sunrise: "6:01a", zohar: "12:49p", sunset: "7:38p", maghrib: "7:55p", midnight: "12:04a" },
  { gregorian_date: "2026-04-22", imsaak: "4:23a", fajr: "4:37a", sunrise: "6:00a", zohar: "12:50p", sunset: "7:40p", maghrib: "7:57p", midnight: "12:03a" },
  { gregorian_date: "2026-04-23", imsaak: "4:20a", fajr: "4:34a", sunrise: "5:58a", zohar: "12:49p", sunset: "7:41p", maghrib: "7:58p", midnight: "12:03a" },
  { gregorian_date: "2026-04-24", imsaak: "4:19a", fajr: "4:33a", sunrise: "5:57a", zohar: "12:49p", sunset: "7:42p", maghrib: "7:59p", midnight: "12:02a" },
  { gregorian_date: "2026-04-25", imsaak: "4:16a", fajr: "4:30a", sunrise: "5:55a", zohar: "12:49p", sunset: "7:43p", maghrib: "8:00p", midnight: "12:02a" },
  { gregorian_date: "2026-04-26", imsaak: "4:15a", fajr: "4:29a", sunrise: "5:54a", zohar: "12:49p", sunset: "7:44p", maghrib: "8:01p", midnight: "12:01a" },
  { gregorian_date: "2026-04-27", imsaak: "4:12a", fajr: "4:26a", sunrise: "5:52a", zohar: "12:48p", sunset: "7:45p", maghrib: "8:02p", midnight: "12:01a" },
  { gregorian_date: "2026-04-28", imsaak: "4:11a", fajr: "4:25a", sunrise: "5:51a", zohar: "12:48p", sunset: "7:46p", maghrib: "8:03p", midnight: "12:01a" },
  { gregorian_date: "2026-04-29", imsaak: "4:10a", fajr: "4:24a", sunrise: "5:50a", zohar: "12:48p", sunset: "7:47p", maghrib: "8:04p", midnight: "12:00a" },
  { gregorian_date: "2026-04-30", imsaak: "4:07a", fajr: "4:21a", sunrise: "5:48a", zohar: "12:48p", sunset: "7:48p", maghrib: "8:05p", midnight: "12:00a" },
  { gregorian_date: "2026-05-01", imsaak: "4:05a", fajr: "4:19a", sunrise: "5:47a", zohar: "12:48p", sunset: "7:49p", maghrib: "8:06p", midnight: "12:00a" },
  { gregorian_date: "2026-05-02", imsaak: "4:04a", fajr: "4:18a", sunrise: "5:46a", zohar: "12:48p", sunset: "7:50p", maghrib: "8:07p", midnight: "11:59p" },
  { gregorian_date: "2026-05-03", imsaak: "4:02a", fajr: "4:16a", sunrise: "5:44a", zohar: "12:48p", sunset: "7:52p", maghrib: "8:09p", midnight: "11:59p" },
  { gregorian_date: "2026-05-04", imsaak: "4:00a", fajr: "4:14a", sunrise: "5:43a", zohar: "12:48p", sunset: "7:53p", maghrib: "8:10p", midnight: "11:59p" },
  { gregorian_date: "2026-05-05", imsaak: "3:59a", fajr: "4:13a", sunrise: "5:42a", zohar: "12:48p", sunset: "7:54p", maghrib: "8:11p", midnight: "11:59p" },
  { gregorian_date: "2026-05-06", imsaak: "3:57a", fajr: "4:11a", sunrise: "5:40a", zohar: "12:47p", sunset: "7:55p", maghrib: "8:12p", midnight: "11:58p" },
  { gregorian_date: "2026-05-07", imsaak: "3:55a", fajr: "4:09a", sunrise: "5:39a", zohar: "12:47p", sunset: "7:56p", maghrib: "8:13p", midnight: "11:58p" },
  { gregorian_date: "2026-05-08", imsaak: "3:53a", fajr: "4:07a", sunrise: "5:38a", zohar: "12:47p", sunset: "7:57p", maghrib: "8:14p", midnight: "11:58p" },
  { gregorian_date: "2026-05-09", imsaak: "3:52a", fajr: "4:06a", sunrise: "5:37a", zohar: "12:47p", sunset: "7:58p", maghrib: "8:15p", midnight: "11:57p" },
  { gregorian_date: "2026-05-10", imsaak: "3:50a", fajr: "4:04a", sunrise: "5:36a", zohar: "12:47p", sunset: "7:59p", maghrib: "8:16p", midnight: "11:58p" },
  { gregorian_date: "2026-05-11", imsaak: "3:50a", fajr: "4:04a", sunrise: "5:35a", zohar: "12:47p", sunset: "8:00p", maghrib: "8:17p", midnight: "11:57p" },
  { gregorian_date: "2026-05-12", imsaak: "3:48a", fajr: "4:02a", sunrise: "5:34a", zohar: "12:47p", sunset: "8:01p", maghrib: "8:18p", midnight: "11:57p" },
  { gregorian_date: "2026-05-13", imsaak: "3:46a", fajr: "4:00a", sunrise: "5:33a", zohar: "12:47p", sunset: "8:02p", maghrib: "8:19p", midnight: "11:57p" },
  { gregorian_date: "2026-05-14", imsaak: "3:45a", fajr: "3:59a", sunrise: "5:32a", zohar: "12:47p", sunset: "8:03p", maghrib: "8:20p", midnight: "11:57p" },
  { gregorian_date: "2026-05-15", imsaak: "3:44a", fajr: "3:58a", sunrise: "5:31a", zohar: "12:47p", sunset: "8:04p", maghrib: "8:21p", midnight: "11:56p" },
  { gregorian_date: "2026-05-16", imsaak: "3:42a", fajr: "3:56a", sunrise: "5:30a", zohar: "12:47p", sunset: "8:05p", maghrib: "8:22p", midnight: "11:56p" },
  { gregorian_date: "2026-05-17", imsaak: "3:41a", fajr: "3:55a", sunrise: "5:29a", zohar: "12:47p", sunset: "8:06p", maghrib: "8:23p", midnight: "11:56p" },
  { gregorian_date: "2026-05-18", imsaak: "3:39a", fajr: "3:53a", sunrise: "5:28a", zohar: "12:47p", sunset: "8:07p", maghrib: "8:24p", midnight: "11:55p" },
  { gregorian_date: "2026-05-19", imsaak: "3:37a", fajr: "3:51a", sunrise: "5:27a", zohar: "12:47p", sunset: "8:08p", maghrib: "8:25p", midnight: "11:55p" },
  { gregorian_date: "2026-05-20", imsaak: "3:36a", fajr: "3:50a", sunrise: "5:26a", zohar: "12:47p", sunset: "8:09p", maghrib: "8:26p", midnight: "11:55p" },
  { gregorian_date: "2026-05-21", imsaak: "3:34a", fajr: "3:48a", sunrise: "5:25a", zohar: "12:47p", sunset: "8:10p", maghrib: "8:27p", midnight: "11:55p" },
  { gregorian_date: "2026-05-22", imsaak: "3:33a", fajr: "3:47a", sunrise: "5:24a", zohar: "12:47p", sunset: "8:11p", maghrib: "8:28p", midnight: "11:55p" },
  { gregorian_date: "2026-05-23", imsaak: "3:33a", fajr: "3:47a", sunrise: "5:24a", zohar: "12:48p", sunset: "8:12p", maghrib: "8:29p", midnight: "11:55p" },
  { gregorian_date: "2026-05-24", imsaak: "3:31a", fajr: "3:45a", sunrise: "5:23a", zohar: "12:48p", sunset: "8:13p", maghrib: "8:30p", midnight: "11:55p" },
  { gregorian_date: "2026-05-25", imsaak: "3:30a", fajr: "3:44a", sunrise: "5:22a", zohar: "12:48p", sunset: "8:14p", maghrib: "8:31p", midnight: "11:55p" },
  { gregorian_date: "2026-05-26", imsaak: "3:29a", fajr: "3:43a", sunrise: "5:21a", zohar: "12:48p", sunset: "8:15p", maghrib: "8:32p", midnight: "11:55p" },
  { gregorian_date: "2026-05-27", imsaak: "3:28a", fajr: "3:42a", sunrise: "5:21a", zohar: "12:48p", sunset: "8:15p", maghrib: "8:32p", midnight: "11:54p" },
  { gregorian_date: "2026-05-28", imsaak: "3:27a", fajr: "3:41a", sunrise: "5:20a", zohar: "12:48p", sunset: "8:16p", maghrib: "8:33p", midnight: "11:55p" },
  { gregorian_date: "2026-05-29", imsaak: "3:27a", fajr: "3:41a", sunrise: "5:20a", zohar: "12:48p", sunset: "8:17p", maghrib: "8:34p", midnight: "11:54p" },
  { gregorian_date: "2026-05-30", imsaak: "3:25a", fajr: "3:39a", sunrise: "5:19a", zohar: "12:48p", sunset: "8:18p", maghrib: "8:35p", midnight: "11:55p" },
  { gregorian_date: "2026-05-31", imsaak: "3:25a", fajr: "3:39a", sunrise: "5:19a", zohar: "12:49p", sunset: "8:19p", maghrib: "8:36p", midnight: "11:54p" },
  { gregorian_date: "2026-06-01", imsaak: "3:23a", fajr: "3:37a", sunrise: "5:18a", zohar: "12:48p", sunset: "8:19p", maghrib: "8:36p", midnight: "11:54p" },
  { gregorian_date: "2026-06-02", imsaak: "3:22a", fajr: "3:36a", sunrise: "5:18a", zohar: "12:49p", sunset: "8:20p", maghrib: "8:37p", midnight: "11:54p" },
  { gregorian_date: "2026-06-03", imsaak: "3:21a", fajr: "3:35a", sunrise: "5:17a", zohar: "12:49p", sunset: "8:21p", maghrib: "8:38p", midnight: "11:54p" },
  { gregorian_date: "2026-06-04", imsaak: "3:20a", fajr: "3:34a", sunrise: "5:17a", zohar: "12:49p", sunset: "8:22p", maghrib: "8:39p", midnight: "11:55p" },
  { gregorian_date: "2026-06-05", imsaak: "3:21a", fajr: "3:35a", sunrise: "5:17a", zohar: "12:49p", sunset: "8:22p", maghrib: "8:39p", midnight: "11:54p" },
  { gregorian_date: "2026-06-06", imsaak: "3:19a", fajr: "3:33a", sunrise: "5:16a", zohar: "12:49p", sunset: "8:23p", maghrib: "8:40p", midnight: "11:54p" },
  { gregorian_date: "2026-06-07", imsaak: "3:19a", fajr: "3:33a", sunrise: "5:16a", zohar: "12:50p", sunset: "8:24p", maghrib: "8:41p", midnight: "11:54p" },
  { gregorian_date: "2026-06-08", imsaak: "3:18a", fajr: "3:32a", sunrise: "5:16a", zohar: "12:50p", sunset: "8:24p", maghrib: "8:41p", midnight: "11:55p" },
  { gregorian_date: "2026-06-09", imsaak: "3:19a", fajr: "3:33a", sunrise: "5:16a", zohar: "12:50p", sunset: "8:25p", maghrib: "8:42p", midnight: "11:54p" },
  { gregorian_date: "2026-06-10", imsaak: "3:17a", fajr: "3:31a", sunrise: "5:15a", zohar: "12:50p", sunset: "8:25p", maghrib: "8:42p", midnight: "11:54p" },
  { gregorian_date: "2026-06-11", imsaak: "3:17a", fajr: "3:31a", sunrise: "5:15a", zohar: "12:50p", sunset: "8:26p", maghrib: "8:43p", midnight: "11:54p" },
  { gregorian_date: "2026-06-12", imsaak: "3:16a", fajr: "3:30a", sunrise: "5:15a", zohar: "12:50p", sunset: "8:26p", maghrib: "8:43p", midnight: "11:54p" },
  { gregorian_date: "2026-06-13", imsaak: "3:16a", fajr: "3:30a", sunrise: "5:15a", zohar: "12:51p", sunset: "8:27p", maghrib: "8:44p", midnight: "11:55p" },
  { gregorian_date: "2026-06-14", imsaak: "3:16a", fajr: "3:30a", sunrise: "5:15a", zohar: "12:51p", sunset: "8:27p", maghrib: "8:44p", midnight: "11:55p" },
  { gregorian_date: "2026-06-15", imsaak: "3:16a", fajr: "3:30a", sunrise: "5:15a", zohar: "12:51p", sunset: "8:28p", maghrib: "8:45p", midnight: "11:55p" },
  { gregorian_date: "2026-06-16", imsaak: "3:16a", fajr: "3:30a", sunrise: "5:15a", zohar: "12:51p", sunset: "8:28p", maghrib: "8:45p", midnight: "11:55p" },
  { gregorian_date: "2026-06-17", imsaak: "3:16a", fajr: "3:30a", sunrise: "5:15a", zohar: "12:51p", sunset: "8:28p", maghrib: "8:45p", midnight: "11:55p" },
  { gregorian_date: "2026-06-18", imsaak: "3:16a", fajr: "3:30a", sunrise: "5:15a", zohar: "12:52p", sunset: "8:29p", maghrib: "8:46p", midnight: "11:56p" },
  { gregorian_date: "2026-06-19", imsaak: "3:16a", fajr: "3:30a", sunrise: "5:15a", zohar: "12:52p", sunset: "8:29p", maghrib: "8:46p", midnight: "11:56p" },
  { gregorian_date: "2026-06-20", imsaak: "3:17a", fajr: "3:31a", sunrise: "5:16a", zohar: "12:52p", sunset: "8:29p", maghrib: "8:46p", midnight: "11:56p" },
  { gregorian_date: "2026-06-21", imsaak: "3:17a", fajr: "3:31a", sunrise: "5:16a", zohar: "12:52p", sunset: "8:29p", maghrib: "8:46p", midnight: "11:57p" },
  { gregorian_date: "2026-06-22", imsaak: "3:18a", fajr: "3:32a", sunrise: "5:16a", zohar: "12:52p", sunset: "8:29p", maghrib: "8:46p", midnight: "11:57p" },
  { gregorian_date: "2026-06-23", imsaak: "3:18a", fajr: "3:32a", sunrise: "5:16a", zohar: "12:53p", sunset: "8:30p", maghrib: "8:47p", midnight: "11:57p" },
  { gregorian_date: "2026-06-24", imsaak: "3:18a", fajr: "3:32a", sunrise: "5:17a", zohar: "12:53p", sunset: "8:30p", maghrib: "8:47p", midnight: "11:57p" },
  { gregorian_date: "2026-06-25", imsaak: "3:18a", fajr: "3:32a", sunrise: "5:17a", zohar: "12:53p", sunset: "8:30p", maghrib: "8:47p", midnight: "11:58p" },
  { gregorian_date: "2026-06-26", imsaak: "3:19a", fajr: "3:33a", sunrise: "5:17a", zohar: "12:53p", sunset: "8:30p", maghrib: "8:47p", midnight: "11:58p" },
  { gregorian_date: "2026-06-27", imsaak: "3:20a", fajr: "3:34a", sunrise: "5:18a", zohar: "12:54p", sunset: "8:30p", maghrib: "8:47p", midnight: "11:58p" },
  { gregorian_date: "2026-06-28", imsaak: "3:20a", fajr: "3:34a", sunrise: "5:18a", zohar: "12:54p", sunset: "8:30p", maghrib: "8:47p", midnight: "11:58p" },
  { gregorian_date: "2026-06-29", imsaak: "3:20a", fajr: "3:34a", sunrise: "5:19a", zohar: "12:54p", sunset: "8:30p", maghrib: "8:47p", midnight: "11:59p" },
  { gregorian_date: "2026-06-30", imsaak: "3:21a", fajr: "3:35a", sunrise: "5:19a", zohar: "12:54p", sunset: "8:30p", maghrib: "8:47p", midnight: "11:59p" },
  { gregorian_date: "2026-07-01", imsaak: "3:21a", fajr: "3:35a", sunrise: "5:20a", zohar: "12:55p", sunset: "8:30p", maghrib: "8:47p", midnight: "11:59p" },
  { gregorian_date: "2026-07-02", imsaak: "3:22a", fajr: "3:36a", sunrise: "5:20a", zohar: "12:54p", sunset: "8:29p", maghrib: "8:46p", midnight: "11:59p" },
  { gregorian_date: "2026-07-03", imsaak: "3:23a", fajr: "3:37a", sunrise: "5:21a", zohar: "12:55p", sunset: "8:29p", maghrib: "8:46p", midnight: "12:00a" },
  { gregorian_date: "2026-07-04", imsaak: "3:24a", fajr: "3:38a", sunrise: "5:21a", zohar: "12:55p", sunset: "8:29p", maghrib: "8:46p", midnight: "12:00a" },
  { gregorian_date: "2026-07-05", imsaak: "3:25a", fajr: "3:39a", sunrise: "5:22a", zohar: "12:55p", sunset: "8:29p", maghrib: "8:46p", midnight: "12:00a" },
  { gregorian_date: "2026-07-06", imsaak: "3:25a", fajr: "3:39a", sunrise: "5:22a", zohar: "12:55p", sunset: "8:28p", maghrib: "8:45p", midnight: "12:01a" },
  { gregorian_date: "2026-07-07", imsaak: "3:27a", fajr: "3:41a", sunrise: "5:23a", zohar: "12:55p", sunset: "8:28p", maghrib: "8:45p", midnight: "12:01a" },
  { gregorian_date: "2026-07-08", imsaak: "3:28a", fajr: "3:42a", sunrise: "5:24a", zohar: "12:56p", sunset: "8:28p", maghrib: "8:45p", midnight: "12:01a" },
  { gregorian_date: "2026-07-09", imsaak: "3:28a", fajr: "3:42a", sunrise: "5:24a", zohar: "12:55p", sunset: "8:27p", maghrib: "8:44p", midnight: "12:02a" },
  { gregorian_date: "2026-07-10", imsaak: "3:30a", fajr: "3:44a", sunrise: "5:25a", zohar: "12:56p", sunset: "8:27p", maghrib: "8:44p", midnight: "12:02a" },
  { gregorian_date: "2026-07-11", imsaak: "3:31a", fajr: "3:45a", sunrise: "5:26a", zohar: "12:56p", sunset: "8:26p", maghrib: "8:43p", midnight: "12:02a" },
  { gregorian_date: "2026-07-12", imsaak: "3:32a", fajr: "3:46a", sunrise: "5:27a", zohar: "12:56p", sunset: "8:26p", maghrib: "8:43p", midnight: "12:02a" },
  { gregorian_date: "2026-07-13", imsaak: "3:32a", fajr: "3:46a", sunrise: "5:27a", zohar: "12:56p", sunset: "8:25p", maghrib: "8:42p", midnight: "12:03a" },
  { gregorian_date: "2026-07-14", imsaak: "3:34a", fajr: "3:48a", sunrise: "5:28a", zohar: "12:56p", sunset: "8:25p", maghrib: "8:42p", midnight: "12:04a" },
  { gregorian_date: "2026-07-15", imsaak: "3:36a", fajr: "3:50a", sunrise: "5:29a", zohar: "12:56p", sunset: "8:24p", maghrib: "8:41p", midnight: "12:04a" },
  { gregorian_date: "2026-07-16", imsaak: "3:37a", fajr: "3:51a", sunrise: "5:30a", zohar: "12:56p", sunset: "8:23p", maghrib: "8:40p", midnight: "12:04a" },
  { gregorian_date: "2026-07-17", imsaak: "3:38a", fajr: "3:52a", sunrise: "5:31a", zohar: "12:57p", sunset: "8:23p", maghrib: "8:40p", midnight: "12:04a" },
  { gregorian_date: "2026-07-18", imsaak: "3:39a", fajr: "3:53a", sunrise: "5:32a", zohar: "12:57p", sunset: "8:22p", maghrib: "8:39p", midnight: "12:04a" },
  { gregorian_date: "2026-07-19", imsaak: "3:40a", fajr: "3:54a", sunrise: "5:32a", zohar: "12:56p", sunset: "8:21p", maghrib: "8:38p", midnight: "12:04a" },
  { gregorian_date: "2026-07-20", imsaak: "3:41a", fajr: "3:55a", sunrise: "5:33a", zohar: "12:56p", sunset: "8:20p", maghrib: "8:37p", midnight: "12:05a" },
  { gregorian_date: "2026-07-21", imsaak: "3:43a", fajr: "3:57a", sunrise: "5:34a", zohar: "12:57p", sunset: "8:20p", maghrib: "8:37p", midnight: "12:06a" },
  { gregorian_date: "2026-07-22", imsaak: "3:45a", fajr: "3:59a", sunrise: "5:35a", zohar: "12:57p", sunset: "8:19p", maghrib: "8:36p", midnight: "12:06a" },
  { gregorian_date: "2026-07-23", imsaak: "3:46a", fajr: "4:00a", sunrise: "5:36a", zohar: "12:57p", sunset: "8:18p", maghrib: "8:35p", midnight: "12:06a" },
  { gregorian_date: "2026-07-24", imsaak: "3:48a", fajr: "4:02a", sunrise: "5:37a", zohar: "12:57p", sunset: "8:17p", maghrib: "8:34p", midnight: "12:06a" },
  { gregorian_date: "2026-07-25", imsaak: "3:49a", fajr: "4:03a", sunrise: "5:38a", zohar: "12:57p", sunset: "8:16p", maghrib: "8:33p", midnight: "12:07a" },
  { gregorian_date: "2026-07-26", imsaak: "3:51a", fajr: "4:05a", sunrise: "5:39a", zohar: "12:57p", sunset: "8:15p", maghrib: "8:32p", midnight: "12:07a" },
  { gregorian_date: "2026-07-27", imsaak: "3:52a", fajr: "4:06a", sunrise: "5:40a", zohar: "12:57p", sunset: "8:14p", maghrib: "8:31p", midnight: "12:07a" },
  { gregorian_date: "2026-07-28", imsaak: "3:53a", fajr: "4:07a", sunrise: "5:41a", zohar: "12:57p", sunset: "8:13p", maghrib: "8:30p", midnight: "12:07a" },
  { gregorian_date: "2026-07-29", imsaak: "3:54a", fajr: "4:08a", sunrise: "5:42a", zohar: "12:57p", sunset: "8:12p", maghrib: "8:29p", midnight: "12:07a" },
  { gregorian_date: "2026-07-30", imsaak: "3:55a", fajr: "4:09a", sunrise: "5:43a", zohar: "12:57p", sunset: "8:11p", maghrib: "8:28p", midnight: "12:07a" },
  { gregorian_date: "2026-07-31", imsaak: "3:57a", fajr: "4:11a", sunrise: "5:44a", zohar: "12:57p", sunset: "8:10p", maghrib: "8:27p", midnight: "12:08a" },
  { gregorian_date: "2026-08-01", imsaak: "3:59a", fajr: "4:13a", sunrise: "5:45a", zohar: "12:57p", sunset: "8:09p", maghrib: "8:26p", midnight: "12:08a" },
  { gregorian_date: "2026-08-02", imsaak: "4:01a", fajr: "4:15a", sunrise: "5:46a", zohar: "12:57p", sunset: "8:08p", maghrib: "8:25p", midnight: "12:08a" },
  { gregorian_date: "2026-08-03", imsaak: "4:02a", fajr: "4:16a", sunrise: "5:47a", zohar: "12:56p", sunset: "8:06p", maghrib: "8:23p", midnight: "12:08a" },
  { gregorian_date: "2026-08-04", imsaak: "4:04a", fajr: "4:18a", sunrise: "5:48a", zohar: "12:56p", sunset: "8:05p", maghrib: "8:22p", midnight: "12:08a" },
  { gregorian_date: "2026-08-05", imsaak: "4:05a", fajr: "4:19a", sunrise: "5:49a", zohar: "12:56p", sunset: "8:04p", maghrib: "8:21p", midnight: "12:09a" },
  { gregorian_date: "2026-08-06", imsaak: "4:07a", fajr: "4:21a", sunrise: "5:50a", zohar: "12:56p", sunset: "8:03p", maghrib: "8:20p", midnight: "12:09a" },
  { gregorian_date: "2026-08-07", imsaak: "4:08a", fajr: "4:22a", sunrise: "5:51a", zohar: "12:56p", sunset: "8:01p", maghrib: "8:18p", midnight: "12:09a" },
  { gregorian_date: "2026-08-08", imsaak: "4:10a", fajr: "4:24a", sunrise: "5:52a", zohar: "12:56p", sunset: "8:00p", maghrib: "8:17p", midnight: "12:09a" },
  { gregorian_date: "2026-08-09", imsaak: "4:11a", fajr: "4:25a", sunrise: "5:53a", zohar: "12:56p", sunset: "7:59p", maghrib: "8:16p", midnight: "12:09a" },
  { gregorian_date: "2026-08-10", imsaak: "4:13a", fajr: "4:27a", sunrise: "5:54a", zohar: "12:55p", sunset: "7:57p", maghrib: "8:14p", midnight: "12:09a" },
  { gregorian_date: "2026-08-11", imsaak: "4:14a", fajr: "4:28a", sunrise: "5:55a", zohar: "12:55p", sunset: "7:56p", maghrib: "8:13p", midnight: "12:09a" },
  { gregorian_date: "2026-08-12", imsaak: "4:16a", fajr: "4:30a", sunrise: "5:56a", zohar: "12:55p", sunset: "7:55p", maghrib: "8:12p", midnight: "12:09a" },
  { gregorian_date: "2026-08-13", imsaak: "4:17a", fajr: "4:31a", sunrise: "5:57a", zohar: "12:55p", sunset: "7:53p", maghrib: "8:10p", midnight: "12:09a" },
  { gregorian_date: "2026-08-14", imsaak: "4:19a", fajr: "4:33a", sunrise: "5:58a", zohar: "12:55p", sunset: "7:52p", maghrib: "8:09p", midnight: "12:09a" },
  { gregorian_date: "2026-08-15", imsaak: "4:20a", fajr: "4:34a", sunrise: "5:59a", zohar: "12:55p", sunset: "7:51p", maghrib: "8:08p", midnight: "12:10a" },
  { gregorian_date: "2026-08-16", imsaak: "4:22a", fajr: "4:36a", sunrise: "6:00a", zohar: "12:54p", sunset: "7:49p", maghrib: "8:06p", midnight: "12:09a" },
  { gregorian_date: "2026-08-17", imsaak: "4:23a", fajr: "4:37a", sunrise: "6:01a", zohar: "12:54p", sunset: "7:48p", maghrib: "8:05p", midnight: "12:09a" },
  { gregorian_date: "2026-08-18", imsaak: "4:24a", fajr: "4:38a", sunrise: "6:02a", zohar: "12:54p", sunset: "7:46p", maghrib: "8:03p", midnight: "12:09a" },
  { gregorian_date: "2026-08-19", imsaak: "4:26a", fajr: "4:40a", sunrise: "6:03a", zohar: "12:54p", sunset: "7:45p", maghrib: "8:02p", midnight: "12:09a" },
  { gregorian_date: "2026-08-20", imsaak: "4:27a", fajr: "4:41a", sunrise: "6:04a", zohar: "12:53p", sunset: "7:43p", maghrib: "8:00p", midnight: "12:09a" },
  { gregorian_date: "2026-08-21", imsaak: "4:29a", fajr: "4:43a", sunrise: "6:05a", zohar: "12:53p", sunset: "7:42p", maghrib: "7:59p", midnight: "12:09a" },
  { gregorian_date: "2026-08-22", imsaak: "4:29a", fajr: "4:43a", sunrise: "6:06a", zohar: "12:53p", sunset: "7:40p", maghrib: "7:57p", midnight: "12:08a" },
  { gregorian_date: "2026-08-23", imsaak: "4:30a", fajr: "4:44a", sunrise: "6:07a", zohar: "12:52p", sunset: "7:38p", maghrib: "7:55p", midnight: "12:08a" },
  { gregorian_date: "2026-08-24", imsaak: "4:32a", fajr: "4:46a", sunrise: "6:08a", zohar: "12:52p", sunset: "7:37p", maghrib: "7:54p", midnight: "12:08a" },
  { gregorian_date: "2026-08-25", imsaak: "4:33a", fajr: "4:47a", sunrise: "6:09a", zohar: "12:52p", sunset: "7:35p", maghrib: "7:52p", midnight: "12:08a" },
  { gregorian_date: "2026-08-26", imsaak: "4:35a", fajr: "4:49a", sunrise: "6:10a", zohar: "12:52p", sunset: "7:34p", maghrib: "7:51p", midnight: "12:08a" },
  { gregorian_date: "2026-08-27", imsaak: "4:36a", fajr: "4:50a", sunrise: "6:11a", zohar: "12:51p", sunset: "7:32p", maghrib: "7:49p", midnight: "12:08a" },
  { gregorian_date: "2026-08-28", imsaak: "4:38a", fajr: "4:52a", sunrise: "6:13a", zohar: "12:51p", sunset: "7:30p", maghrib: "7:47p", midnight: "12:08a" },
  { gregorian_date: "2026-08-29", imsaak: "4:40a", fajr: "4:54a", sunrise: "6:14a", zohar: "12:51p", sunset: "7:29p", maghrib: "7:46p", midnight: "12:08a" },
  { gregorian_date: "2026-08-30", imsaak: "4:41a", fajr: "4:55a", sunrise: "6:15a", zohar: "12:51p", sunset: "7:27p", maghrib: "7:44p", midnight: "12:08a" },
  { gregorian_date: "2026-08-31", imsaak: "4:42a", fajr: "4:56a", sunrise: "6:16a", zohar: "12:51p", sunset: "7:26p", maghrib: "7:43p", midnight: "12:08a" },
  { gregorian_date: "2026-09-01", imsaak: "4:44a", fajr: "4:58a", sunrise: "6:17a", zohar: "12:50p", sunset: "7:24p", maghrib: "7:41p", midnight: "12:08a" },
  { gregorian_date: "2026-09-02", imsaak: "4:45a", fajr: "4:59a", sunrise: "6:18a", zohar: "12:50p", sunset: "7:22p", maghrib: "7:39p", midnight: "12:07a" },
  { gregorian_date: "2026-09-03", imsaak: "4:46a", fajr: "5:00a", sunrise: "6:19a", zohar: "12:49p", sunset: "7:20p", maghrib: "7:37p", midnight: "12:07a" },
  { gregorian_date: "2026-09-04", imsaak: "4:47a", fajr: "5:01a", sunrise: "6:20a", zohar: "12:49p", sunset: "7:19p", maghrib: "7:36p", midnight: "12:07a" },
  { gregorian_date: "2026-09-05", imsaak: "4:49a", fajr: "5:03a", sunrise: "6:21a", zohar: "12:49p", sunset: "7:17p", maghrib: "7:34p", midnight: "12:07a" },
  { gregorian_date: "2026-09-06", imsaak: "4:50a", fajr: "5:04a", sunrise: "6:22a", zohar: "12:48p", sunset: "7:15p", maghrib: "7:32p", midnight: "12:06a" },
  { gregorian_date: "2026-09-07", imsaak: "4:51a", fajr: "5:05a", sunrise: "6:23a", zohar: "12:48p", sunset: "7:14p", maghrib: "7:31p", midnight: "12:06a" },
  { gregorian_date: "2026-09-08", imsaak: "4:52a", fajr: "5:06a", sunrise: "6:24a", zohar: "12:48p", sunset: "7:12p", maghrib: "7:29p", midnight: "12:06a" },
  { gregorian_date: "2026-09-09", imsaak: "4:54a", fajr: "5:08a", sunrise: "6:25a", zohar: "12:47p", sunset: "7:10p", maghrib: "7:27p", midnight: "12:06a" },
  { gregorian_date: "2026-09-10", imsaak: "4:55a", fajr: "5:09a", sunrise: "6:26a", zohar: "12:47p", sunset: "7:09p", maghrib: "7:26p", midnight: "12:06a" },
  { gregorian_date: "2026-09-11", imsaak: "4:56a", fajr: "5:10a", sunrise: "6:27a", zohar: "12:47p", sunset: "7:07p", maghrib: "7:24p", midnight: "12:05a" },
  { gregorian_date: "2026-09-12", imsaak: "4:57a", fajr: "5:11a", sunrise: "6:28a", zohar: "12:46p", sunset: "7:05p", maghrib: "7:22p", midnight: "12:05a" },
  { gregorian_date: "2026-09-13", imsaak: "4:59a", fajr: "5:13a", sunrise: "6:29a", zohar: "12:46p", sunset: "7:03p", maghrib: "7:20p", midnight: "12:05a" },
  { gregorian_date: "2026-09-14", imsaak: "5:00a", fajr: "5:14a", sunrise: "6:30a", zohar: "12:46p", sunset: "7:02p", maghrib: "7:19p", midnight: "12:05a" },
  { gregorian_date: "2026-09-15", imsaak: "5:01a", fajr: "5:15a", sunrise: "6:31a", zohar: "12:45p", sunset: "7:00p", maghrib: "7:17p", midnight: "12:04a" },
  { gregorian_date: "2026-09-16", imsaak: "5:02a", fajr: "5:16a", sunrise: "6:32a", zohar: "12:45p", sunset: "6:58p", maghrib: "7:15p", midnight: "12:04a" },
  { gregorian_date: "2026-09-17", imsaak: "5:03a", fajr: "5:17a", sunrise: "6:33a", zohar: "12:44p", sunset: "6:56p", maghrib: "7:13p", midnight: "12:04a" },
  { gregorian_date: "2026-09-18", imsaak: "5:05a", fajr: "5:19a", sunrise: "6:34a", zohar: "12:44p", sunset: "6:55p", maghrib: "7:12p", midnight: "12:04a" },
  { gregorian_date: "2026-09-19", imsaak: "5:06a", fajr: "5:20a", sunrise: "6:35a", zohar: "12:44p", sunset: "6:53p", maghrib: "7:10p", midnight: "12:03a" },
  { gregorian_date: "2026-09-20", imsaak: "5:07a", fajr: "5:21a", sunrise: "6:36a", zohar: "12:43p", sunset: "6:51p", maghrib: "7:08p", midnight: "12:03a" },
  { gregorian_date: "2026-09-21", imsaak: "5:08a", fajr: "5:22a", sunrise: "6:37a", zohar: "12:43p", sunset: "6:49p", maghrib: "7:06p", midnight: "12:02a" },
  { gregorian_date: "2026-09-22", imsaak: "5:08a", fajr: "5:22a", sunrise: "6:38a", zohar: "12:43p", sunset: "6:48p", maghrib: "7:05p", midnight: "12:02a" },
  { gregorian_date: "2026-09-23", imsaak: "5:09a", fajr: "5:23a", sunrise: "6:39a", zohar: "12:42p", sunset: "6:46p", maghrib: "7:03p", midnight: "12:02a" },
  { gregorian_date: "2026-09-24", imsaak: "5:11a", fajr: "5:25a", sunrise: "6:40a", zohar: "12:42p", sunset: "6:44p", maghrib: "7:01p", midnight: "12:01a" },
  { gregorian_date: "2026-09-25", imsaak: "5:12a", fajr: "5:26a", sunrise: "6:41a", zohar: "12:41p", sunset: "6:42p", maghrib: "6:59p", midnight: "12:01a" },
  { gregorian_date: "2026-09-26", imsaak: "5:14a", fajr: "5:28a", sunrise: "6:43a", zohar: "12:42p", sunset: "6:41p", maghrib: "6:58p", midnight: "12:01a" },
  { gregorian_date: "2026-09-27", imsaak: "5:15a", fajr: "5:29a", sunrise: "6:44a", zohar: "12:41p", sunset: "6:39p", maghrib: "6:56p", midnight: "12:01a" },
  { gregorian_date: "2026-09-28", imsaak: "5:16a", fajr: "5:30a", sunrise: "6:45a", zohar: "12:41p", sunset: "6:37p", maghrib: "6:54p", midnight: "12:00a" },
  { gregorian_date: "2026-09-29", imsaak: "5:17a", fajr: "5:31a", sunrise: "6:46a", zohar: "12:41p", sunset: "6:36p", maghrib: "6:53p", midnight: "12:00a" },
  { gregorian_date: "2026-09-30", imsaak: "5:18a", fajr: "5:32a", sunrise: "6:47a", zohar: "12:40p", sunset: "6:34p", maghrib: "6:51p", midnight: "12:00a" },
  { gregorian_date: "2026-10-01", imsaak: "5:19a", fajr: "5:33a", sunrise: "6:48a", zohar: "12:40p", sunset: "6:32p", maghrib: "6:49p", midnight: "12:00a" },
  { gregorian_date: "2026-10-02", imsaak: "5:21a", fajr: "5:35a", sunrise: "6:49a", zohar: "12:39p", sunset: "6:30p", maghrib: "6:47p", midnight: "11:59p" },
  { gregorian_date: "2026-10-03", imsaak: "5:22a", fajr: "5:36a", sunrise: "6:50a", zohar: "12:39p", sunset: "6:29p", maghrib: "6:46p", midnight: "11:59p" },
  { gregorian_date: "2026-10-04", imsaak: "5:23a", fajr: "5:37a", sunrise: "6:51a", zohar: "12:39p", sunset: "6:27p", maghrib: "6:44p", midnight: "11:59p" },
  { gregorian_date: "2026-10-05", imsaak: "5:24a", fajr: "5:38a", sunrise: "6:52a", zohar: "12:38p", sunset: "6:25p", maghrib: "6:42p", midnight: "11:58p" },
  { gregorian_date: "2026-10-06", imsaak: "5:25a", fajr: "5:39a", sunrise: "6:53a", zohar: "12:38p", sunset: "6:24p", maghrib: "6:41p", midnight: "11:58p" },
  { gregorian_date: "2026-10-07", imsaak: "5:25a", fajr: "5:39a", sunrise: "6:54a", zohar: "12:38p", sunset: "6:22p", maghrib: "6:39p", midnight: "11:57p" },
  { gregorian_date: "2026-10-08", imsaak: "5:26a", fajr: "5:40a", sunrise: "6:55a", zohar: "12:37p", sunset: "6:20p", maghrib: "6:37p", midnight: "11:57p" },
  { gregorian_date: "2026-10-09", imsaak: "5:28a", fajr: "5:42a", sunrise: "6:57a", zohar: "12:38p", sunset: "6:19p", maghrib: "6:36p", midnight: "11:57p" },
  { gregorian_date: "2026-10-10", imsaak: "5:29a", fajr: "5:43a", sunrise: "6:58a", zohar: "12:37p", sunset: "6:17p", maghrib: "6:34p", midnight: "11:57p" },
  { gregorian_date: "2026-10-11", imsaak: "5:30a", fajr: "5:44a", sunrise: "6:59a", zohar: "12:37p", sunset: "6:15p", maghrib: "6:32p", midnight: "11:56p" },
  { gregorian_date: "2026-10-12", imsaak: "5:31a", fajr: "5:45a", sunrise: "7:00a", zohar: "12:37p", sunset: "6:14p", maghrib: "6:31p", midnight: "11:57p" },
  { gregorian_date: "2026-10-13", imsaak: "5:33a", fajr: "5:47a", sunrise: "7:01a", zohar: "12:36p", sunset: "6:12p", maghrib: "6:29p", midnight: "11:56p" },
  { gregorian_date: "2026-10-14", imsaak: "5:34a", fajr: "5:48a", sunrise: "7:02a", zohar: "12:36p", sunset: "6:11p", maghrib: "6:28p", midnight: "11:56p" },
  { gregorian_date: "2026-10-15", imsaak: "5:35a", fajr: "5:49a", sunrise: "7:03a", zohar: "12:36p", sunset: "6:09p", maghrib: "6:26p", midnight: "11:55p" },
  { gregorian_date: "2026-10-16", imsaak: "5:35a", fajr: "5:49a", sunrise: "7:04a", zohar: "12:35p", sunset: "6:07p", maghrib: "6:24p", midnight: "11:55p" },
  { gregorian_date: "2026-10-17", imsaak: "5:37a", fajr: "5:51a", sunrise: "7:06a", zohar: "12:36p", sunset: "6:06p", maghrib: "6:23p", midnight: "11:55p" },
  { gregorian_date: "2026-10-18", imsaak: "5:38a", fajr: "5:52a", sunrise: "7:07a", zohar: "12:35p", sunset: "6:04p", maghrib: "6:21p", midnight: "11:55p" },
  { gregorian_date: "2026-10-19", imsaak: "5:39a", fajr: "5:53a", sunrise: "7:08a", zohar: "12:35p", sunset: "6:03p", maghrib: "6:20p", midnight: "11:55p" },
  { gregorian_date: "2026-10-20", imsaak: "5:40a", fajr: "5:54a", sunrise: "7:09a", zohar: "12:35p", sunset: "6:01p", maghrib: "6:18p", midnight: "11:54p" },
  { gregorian_date: "2026-10-21", imsaak: "5:41a", fajr: "5:55a", sunrise: "7:10a", zohar: "12:35p", sunset: "6:00p", maghrib: "6:17p", midnight: "11:54p" },
  { gregorian_date: "2026-10-22", imsaak: "5:41a", fajr: "5:55a", sunrise: "7:11a", zohar: "12:34p", sunset: "5:58p", maghrib: "6:15p", midnight: "11:54p" },
  { gregorian_date: "2026-10-23", imsaak: "5:43a", fajr: "5:57a", sunrise: "7:13a", zohar: "12:35p", sunset: "5:57p", maghrib: "6:14p", midnight: "11:54p" },
  { gregorian_date: "2026-10-24", imsaak: "5:45a", fajr: "5:59a", sunrise: "7:14a", zohar: "12:35p", sunset: "5:56p", maghrib: "6:13p", midnight: "11:54p" },
  { gregorian_date: "2026-10-25", imsaak: "5:46a", fajr: "6:00a", sunrise: "7:15a", zohar: "12:34p", sunset: "5:54p", maghrib: "6:11p", midnight: "11:54p" },
  { gregorian_date: "2026-10-26", imsaak: "5:47a", fajr: "6:01a", sunrise: "7:16a", zohar: "12:34p", sunset: "5:53p", maghrib: "6:10p", midnight: "11:53p" },
  { gregorian_date: "2026-10-27", imsaak: "5:47a", fajr: "6:01a", sunrise: "7:17a", zohar: "12:34p", sunset: "5:51p", maghrib: "6:08p", midnight: "11:53p" },
  { gregorian_date: "2026-10-28", imsaak: "5:48a", fajr: "6:02a", sunrise: "7:18a", zohar: "12:34p", sunset: "5:50p", maghrib: "6:07p", midnight: "11:53p" },
  { gregorian_date: "2026-10-29", imsaak: "5:50a", fajr: "6:04a", sunrise: "7:20a", zohar: "12:34p", sunset: "5:49p", maghrib: "6:06p", midnight: "11:53p" },
  { gregorian_date: "2026-10-30", imsaak: "5:51a", fajr: "6:05a", sunrise: "7:21a", zohar: "12:34p", sunset: "5:47p", maghrib: "6:04p", midnight: "11:53p" },
  { gregorian_date: "2026-10-31", imsaak: "5:52a", fajr: "6:06a", sunrise: "7:22a", zohar: "12:34p", sunset: "5:46p", maghrib: "6:03p", midnight: "11:52p" },
  { gregorian_date: "2026-11-01", imsaak: "4:52a", fajr: "5:06a", sunrise: "6:23a", zohar: "11:34a", sunset: "4:45p", maghrib: "5:02p", midnight: "10:53p" },
  { gregorian_date: "2026-11-02", imsaak: "4:54a", fajr: "5:08a", sunrise: "6:25a", zohar: "11:34a", sunset: "4:44p", maghrib: "5:01p", midnight: "10:53p" },
  { gregorian_date: "2026-11-03", imsaak: "4:55a", fajr: "5:09a", sunrise: "6:26a", zohar: "11:34a", sunset: "4:42p", maghrib: "4:59p", midnight: "10:52p" },
  { gregorian_date: "2026-11-04", imsaak: "4:56a", fajr: "5:10a", sunrise: "6:27a", zohar: "11:34a", sunset: "4:41p", maghrib: "4:58p", midnight: "10:52p" },
  { gregorian_date: "2026-11-05", imsaak: "4:56a", fajr: "5:10a", sunrise: "6:28a", zohar: "11:34a", sunset: "4:40p", maghrib: "4:57p", midnight: "10:52p" },
  { gregorian_date: "2026-11-06", imsaak: "4:57a", fajr: "5:11a", sunrise: "6:29a", zohar: "11:34a", sunset: "4:39p", maghrib: "4:56p", midnight: "10:52p" },
  { gregorian_date: "2026-11-07", imsaak: "4:59a", fajr: "5:13a", sunrise: "6:31a", zohar: "11:34a", sunset: "4:38p", maghrib: "4:55p", midnight: "10:52p" },
  { gregorian_date: "2026-11-08", imsaak: "5:00a", fajr: "5:14a", sunrise: "6:32a", zohar: "11:34a", sunset: "4:37p", maghrib: "4:54p", midnight: "10:52p" },
  { gregorian_date: "2026-11-09", imsaak: "5:01a", fajr: "5:15a", sunrise: "6:33a", zohar: "11:34a", sunset: "4:36p", maghrib: "4:53p", midnight: "10:52p" },
  { gregorian_date: "2026-11-10", imsaak: "5:01a", fajr: "5:15a", sunrise: "6:34a", zohar: "11:34a", sunset: "4:35p", maghrib: "4:52p", midnight: "10:52p" },
  { gregorian_date: "2026-11-11", imsaak: "5:03a", fajr: "5:17a", sunrise: "6:36a", zohar: "11:35a", sunset: "4:34p", maghrib: "4:51p", midnight: "10:52p" },
  { gregorian_date: "2026-11-12", imsaak: "5:04a", fajr: "5:18a", sunrise: "6:37a", zohar: "11:35a", sunset: "4:33p", maghrib: "4:50p", midnight: "10:53p" },
  { gregorian_date: "2026-11-13", imsaak: "5:06a", fajr: "5:20a", sunrise: "6:38a", zohar: "11:35a", sunset: "4:32p", maghrib: "4:49p", midnight: "10:52p" },
  { gregorian_date: "2026-11-14", imsaak: "5:06a", fajr: "5:20a", sunrise: "6:39a", zohar: "11:35a", sunset: "4:31p", maghrib: "4:48p", midnight: "10:53p" },
  { gregorian_date: "2026-11-15", imsaak: "5:08a", fajr: "5:22a", sunrise: "6:41a", zohar: "11:35a", sunset: "4:30p", maghrib: "4:47p", midnight: "10:53p" },
  { gregorian_date: "2026-11-16", imsaak: "5:09a", fajr: "5:23a", sunrise: "6:42a", zohar: "11:35a", sunset: "4:29p", maghrib: "4:46p", midnight: "10:53p" },
  { gregorian_date: "2026-11-17", imsaak: "5:10a", fajr: "5:24a", sunrise: "6:43a", zohar: "11:35a", sunset: "4:28p", maghrib: "4:45p", midnight: "10:53p" },
  { gregorian_date: "2026-11-18", imsaak: "5:11a", fajr: "5:25a", sunrise: "6:44a", zohar: "11:35a", sunset: "4:27p", maghrib: "4:44p", midnight: "10:52p" },
  { gregorian_date: "2026-11-19", imsaak: "5:11a", fajr: "5:25a", sunrise: "6:45a", zohar: "11:36a", sunset: "4:27p", maghrib: "4:44p", midnight: "10:53p" },
  { gregorian_date: "2026-11-20", imsaak: "5:13a", fajr: "5:27a", sunrise: "6:47a", zohar: "11:36a", sunset: "4:26p", maghrib: "4:43p", midnight: "10:53p" },
  { gregorian_date: "2026-11-21", imsaak: "5:14a", fajr: "5:28a", sunrise: "6:48a", zohar: "11:36a", sunset: "4:25p", maghrib: "4:42p", midnight: "10:53p" },
  { gregorian_date: "2026-11-22", imsaak: "5:15a", fajr: "5:29a", sunrise: "6:49a", zohar: "11:37a", sunset: "4:25p", maghrib: "4:42p", midnight: "10:54p" },
  { gregorian_date: "2026-11-23", imsaak: "5:16a", fajr: "5:30a", sunrise: "6:50a", zohar: "11:37a", sunset: "4:24p", maghrib: "4:41p", midnight: "10:54p" },
  { gregorian_date: "2026-11-24", imsaak: "5:17a", fajr: "5:31a", sunrise: "6:51a", zohar: "11:37a", sunset: "4:24p", maghrib: "4:41p", midnight: "10:54p" },
  { gregorian_date: "2026-11-25", imsaak: "5:17a", fajr: "5:31a", sunrise: "6:52a", zohar: "11:37a", sunset: "4:23p", maghrib: "4:40p", midnight: "10:54p" },
  { gregorian_date: "2026-11-26", imsaak: "5:18a", fajr: "5:32a", sunrise: "6:53a", zohar: "11:37a", sunset: "4:22p", maghrib: "4:39p", midnight: "10:54p" },
  { gregorian_date: "2026-11-27", imsaak: "5:20a", fajr: "5:34a", sunrise: "6:55a", zohar: "11:38a", sunset: "4:22p", maghrib: "4:39p", midnight: "10:55p" },
  { gregorian_date: "2026-11-28", imsaak: "5:21a", fajr: "5:35a", sunrise: "6:56a", zohar: "11:39a", sunset: "4:22p", maghrib: "4:39p", midnight: "10:55p" },
  { gregorian_date: "2026-11-29", imsaak: "5:22a", fajr: "5:36a", sunrise: "6:57a", zohar: "11:39a", sunset: "4:21p", maghrib: "4:38p", midnight: "10:55p" },
  { gregorian_date: "2026-11-30", imsaak: "5:23a", fajr: "5:37a", sunrise: "6:58a", zohar: "11:39a", sunset: "4:21p", maghrib: "4:38p", midnight: "10:56p" },
  { gregorian_date: "2026-12-01", imsaak: "5:24a", fajr: "5:38a", sunrise: "6:59a", zohar: "11:40a", sunset: "4:21p", maghrib: "4:38p", midnight: "10:56p" },
  { gregorian_date: "2026-12-02", imsaak: "5:25a", fajr: "5:39a", sunrise: "7:00a", zohar: "11:40a", sunset: "4:20p", maghrib: "4:37p", midnight: "10:56p" },
  { gregorian_date: "2026-12-03", imsaak: "5:25a", fajr: "5:39a", sunrise: "7:01a", zohar: "11:40a", sunset: "4:20p", maghrib: "4:37p", midnight: "10:56p" },
  { gregorian_date: "2026-12-04", imsaak: "5:26a", fajr: "5:40a", sunrise: "7:02a", zohar: "11:41a", sunset: "4:20p", maghrib: "4:37p", midnight: "10:57p" },
  { gregorian_date: "2026-12-05", imsaak: "5:27a", fajr: "5:41a", sunrise: "7:03a", zohar: "11:41a", sunset: "4:20p", maghrib: "4:37p", midnight: "10:57p" },
  { gregorian_date: "2026-12-06", imsaak: "5:28a", fajr: "5:42a", sunrise: "7:04a", zohar: "11:42a", sunset: "4:20p", maghrib: "4:37p", midnight: "10:58p" },
  { gregorian_date: "2026-12-07", imsaak: "5:29a", fajr: "5:43a", sunrise: "7:05a", zohar: "11:42a", sunset: "4:20p", maghrib: "4:37p", midnight: "10:58p" },
  { gregorian_date: "2026-12-08", imsaak: "5:30a", fajr: "5:44a", sunrise: "7:06a", zohar: "11:43a", sunset: "4:20p", maghrib: "4:37p", midnight: "10:59p" },
  { gregorian_date: "2026-12-09", imsaak: "5:31a", fajr: "5:45a", sunrise: "7:07a", zohar: "11:43a", sunset: "4:20p", maghrib: "4:37p", midnight: "10:58p" },
  { gregorian_date: "2026-12-10", imsaak: "5:30a", fajr: "5:44a", sunrise: "7:07a", zohar: "11:43a", sunset: "4:20p", maghrib: "4:37p", midnight: "10:59p" },
  { gregorian_date: "2026-12-11", imsaak: "5:32a", fajr: "5:46a", sunrise: "7:08a", zohar: "11:44a", sunset: "4:20p", maghrib: "4:37p", midnight: "11:00p" },
  { gregorian_date: "2026-12-12", imsaak: "5:33a", fajr: "5:47a", sunrise: "7:09a", zohar: "11:44a", sunset: "4:20p", maghrib: "4:37p", midnight: "11:00p" },
  { gregorian_date: "2026-12-13", imsaak: "5:33a", fajr: "5:47a", sunrise: "7:10a", zohar: "11:45a", sunset: "4:20p", maghrib: "4:37p", midnight: "11:00p" },
  { gregorian_date: "2026-12-14", imsaak: "5:34a", fajr: "5:48a", sunrise: "7:11a", zohar: "11:45a", sunset: "4:20p", maghrib: "4:37p", midnight: "11:00p" },
  { gregorian_date: "2026-12-15", imsaak: "5:34a", fajr: "5:48a", sunrise: "7:11a", zohar: "11:46a", sunset: "4:21p", maghrib: "4:38p", midnight: "11:01p" },
  { gregorian_date: "2026-12-16", imsaak: "5:35a", fajr: "5:49a", sunrise: "7:12a", zohar: "11:46a", sunset: "4:21p", maghrib: "4:38p", midnight: "11:02p" },
  { gregorian_date: "2026-12-17", imsaak: "5:36a", fajr: "5:50a", sunrise: "7:13a", zohar: "11:47a", sunset: "4:21p", maghrib: "4:38p", midnight: "11:02p" },
  { gregorian_date: "2026-12-18", imsaak: "5:37a", fajr: "5:51a", sunrise: "7:13a", zohar: "11:47a", sunset: "4:22p", maghrib: "4:39p", midnight: "11:03p" },
  { gregorian_date: "2026-12-19", imsaak: "5:37a", fajr: "5:51a", sunrise: "7:14a", zohar: "11:48a", sunset: "4:22p", maghrib: "4:39p", midnight: "11:03p" },
  { gregorian_date: "2026-12-20", imsaak: "5:37a", fajr: "5:51a", sunrise: "7:14a", zohar: "11:48a", sunset: "4:22p", maghrib: "4:39p", midnight: "11:03p" },
  { gregorian_date: "2026-12-21", imsaak: "5:38a", fajr: "5:52a", sunrise: "7:15a", zohar: "11:49a", sunset: "4:23p", maghrib: "4:40p", midnight: "11:04p" },
  { gregorian_date: "2026-12-22", imsaak: "5:38a", fajr: "5:52a", sunrise: "7:15a", zohar: "11:49a", sunset: "4:23p", maghrib: "4:40p", midnight: "11:04p" },
  { gregorian_date: "2026-12-23", imsaak: "5:39a", fajr: "5:53a", sunrise: "7:16a", zohar: "11:50a", sunset: "4:24p", maghrib: "4:41p", midnight: "11:05p" },
  { gregorian_date: "2026-12-24", imsaak: "5:40a", fajr: "5:54a", sunrise: "7:16a", zohar: "11:50a", sunset: "4:25p", maghrib: "4:42p", midnight: "11:06p" },
  { gregorian_date: "2026-12-25", imsaak: "5:40a", fajr: "5:54a", sunrise: "7:17a", zohar: "11:51a", sunset: "4:25p", maghrib: "4:42p", midnight: "11:06p" },
  { gregorian_date: "2026-12-26", imsaak: "5:40a", fajr: "5:54a", sunrise: "7:17a", zohar: "11:51a", sunset: "4:26p", maghrib: "4:43p", midnight: "11:06p" },
  { gregorian_date: "2026-12-27", imsaak: "5:40a", fajr: "5:54a", sunrise: "7:17a", zohar: "11:52a", sunset: "4:27p", maghrib: "4:44p", midnight: "11:07p" },
  { gregorian_date: "2026-12-28", imsaak: "5:41a", fajr: "5:55a", sunrise: "7:18a", zohar: "11:52a", sunset: "4:27p", maghrib: "4:44p", midnight: "11:08p" },
  { gregorian_date: "2026-12-29", imsaak: "5:42a", fajr: "5:56a", sunrise: "7:18a", zohar: "11:53a", sunset: "4:28p", maghrib: "4:45p", midnight: "11:08p" },
  { gregorian_date: "2026-12-30", imsaak: "5:42a", fajr: "5:56a", sunrise: "7:18a", zohar: "11:53a", sunset: "4:29p", maghrib: "4:46p", midnight: "11:09p" },
  { gregorian_date: "2026-12-31", imsaak: "5:42a", fajr: "5:56a", sunrise: "7:18a", zohar: "11:54a", sunset: "4:30p", maghrib: "4:47p", midnight: "11:09p" },
];

/**
 * Islamic events. Multiple events may share a date (sort_order breaks ties).
 * category is a free label used for the public badges (Wiladat, Martyrdom,
 * Wafat, Eid, Shab, Ziarat, Historical, Other).
 *   { event_date, title, description?, category?, sort_order? }
 */
const calendarEvents = [
  { event_date: "2026-01-03", title: "Wiladat: Imam Ali Ibne Abu Talib (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-01-05", title: "Martyrdom: Saani-e-Zahra, Bibi Zainab (SA)", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-01-12", title: "Nazr-e-Imam Jafar-us-Sadiq (AS)", category: "Historical", sort_order: 0 },
  { event_date: "2026-01-14", title: "Fathe-Khyber badaste-Maula Ali Ibne Abi Talib (AS)", category: "Historical", sort_order: 0 },
  { event_date: "2026-01-15", title: "Martyrdom: Imam Moosa Kazim (AS)", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-01-16", title: "Wafat: Hazrat Abu Talib (SA)", category: "Wafat", sort_order: 0 },
  { event_date: "2026-01-17", title: "Yaum-e-Be'sat / Mairaj-un-Nabi", category: "Historical", sort_order: 0 },
  { event_date: "2026-01-18", title: "Safar-e-Imam Hussain (AS): Madina to Karbala (60 Hijri)", category: "Historical", sort_order: 0 },
  { event_date: "2026-01-20", title: "Wiladat: BiBi Zainab S.A.", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-01-21", title: "Fasting in Ramzan was made compulsory", category: "Historical", sort_order: 0 },
  { event_date: "2026-01-22", title: "Wiladat: Imam Hussain (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-01-23", title: "Wiladat: Hazrat Abbas Alamdar (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-01-24", title: "Wafat: Bibi Fizza (SA)", category: "Wafat", sort_order: 0 },
  { event_date: "2026-01-26", title: "Wiladat: Hazrat Qasim Ibne Hasan (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-01-30", title: "Wiladat: Hazrat Ali Akbar Ibne Hussain (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-02-03", title: "Wiladat: Imam Mehdi Aakhir-uz-Zaman (AS); Shab-e-Bara'at", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-02-23", title: "Torah was revealed", category: "Historical", sort_order: 0 },
  { event_date: "2026-02-27", title: "Wafat: Hazrat Khadija (SA)", category: "Wafat", sort_order: 0 },
  { event_date: "2026-03-01", title: "Bible was revealed", category: "Historical", sort_order: 0 },
  { event_date: "2026-03-04", title: "Wiladat: Imam Hasan (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-03-06", title: "Battle of Badr was fought", category: "Historical", sort_order: 0 },
  { event_date: "2026-03-07", title: "Zabur was revealed", category: "Historical", sort_order: 0 },
  { event_date: "2026-03-08", title: "Subhe Zarbat: Imam Ali Ibne Abi Talib (AS)", category: "Historical", sort_order: 0 },
  { event_date: "2026-03-10", title: "Martyrdom: Imam Ali Ibne Abi Talib (AS)", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-03-11", title: "Shab-e-Qadr: Quran was revealed", category: "Shab", sort_order: 0 },
  { event_date: "2026-03-13", title: "Juma'tul Wida / Yaum-e-Quds", category: "Historical", sort_order: 0 },
  { event_date: "2026-03-20", title: "Eid-Ul-Fitr", category: "Eid", sort_order: 0 },
  { event_date: "2026-03-27", title: "Mourning: Jannat-ul-Baqee demolished by Aal-e-Saud", category: "Historical", sort_order: 0 },
  { event_date: "2026-03-29", title: "Ghaibat Kubra (Imam Aakhir-uz-Zaman AS) began", category: "Historical", sort_order: 0 },
  { event_date: "2026-04-03", title: "Martyrdom: Imam Jafar-us-Sadiq (AS)", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-04-05", title: "Battle of Uhud was fought", category: "Historical", sort_order: 0 },
  { event_date: "2026-04-28", title: "Wiladat: Imam Ali Raza (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-05-12", title: "Wiladat: Hazrat Ibrahim (AS) and Hazrat Eesaa (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-05-16", title: "Martyrdom: Imam Mohammad Taqi (AS)", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-05-18", title: "Wedding: Imam Ali (AS) and Bibi Fatima Zehra (SA)", category: "Historical", sort_order: 0 },
  { event_date: "2026-05-20", title: "Allah accepted Hazrat Adam's (AS) dua", category: "Historical", sort_order: 0 },
  { event_date: "2026-05-22", title: "Wafat: Hazrat Abu Zur Ghaffari (RA)", category: "Wafat", sort_order: 0 },
  { event_date: "2026-05-24", title: "Martyrdom: Imam Mohammad Baqir (AS)", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-05-25", title: "Imam Hussain left Makkah towards Karbala", category: "Historical", sort_order: 0 },
  { event_date: "2026-05-26", title: "Yaum-e-Arafat", category: "Historical", sort_order: 0 },
  { event_date: "2026-05-26", title: "Martyrdom: Hazrat Muslim Ibne Aqeel (AS)", category: "Martyrdom", sort_order: 1 },
  { event_date: "2026-05-27", title: "Eid-ul-Azha", category: "Eid", sort_order: 0 },
  { event_date: "2026-06-01", title: "Wiladat: Imam Ali-an-Naqi (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-06-04", title: "Eid Al-Ghadir", category: "Eid", sort_order: 0 },
  { event_date: "2026-06-05", title: "Shab-e-Rukhsati: Bibi Fatima Zehra (SA)", category: "Shab", sort_order: 0 },
  { event_date: "2026-06-08", title: "Martyrdom: Tiflaan-e-Muslim Ibne Aqeel (AS)", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-06-10", title: "Eid-e-Mubahila", category: "Eid", sort_order: 0 },
  { event_date: "2026-06-17", title: "Imam Hussain (AS) reached Karbala", category: "Historical", sort_order: 0 },
  { event_date: "2026-06-20", title: "Ziarat: Taaboot-e-Hazrat Aun-w-Mohammad (as)", category: "Ziarat", sort_order: 0 },
  { event_date: "2026-06-21", title: "Ziarat: Taaboot-e-Hazrat Ali Akbar (as)", category: "Ziarat", sort_order: 0 },
  { event_date: "2026-06-22", title: "Mehndi: Hazrat Qasim (as)", category: "Historical", sort_order: 0 },
  { event_date: "2026-06-23", title: "Ziarat: Alam-e-Hazrat Abbas Alamdar (as)", category: "Ziarat", sort_order: 0 },
  { event_date: "2026-06-24", title: "Shab-e-Ashoor/Ziarat:Gehwaara-e-Hazrat Ali Asghar (as)", category: "Shab", sort_order: 0 },
  { event_date: "2026-06-25", title: "Ashoora-e-Muharram", category: "Historical", sort_order: 0 },
  { event_date: "2026-06-25", title: "Martyrdom: Imam Hussain (AS)", category: "Martyrdom", sort_order: 1 },
  { event_date: "2026-06-27", title: "Soyem / Ziyarat-e-Shuhada-e-Karbala", category: "Ziarat", sort_order: 0 },
  { event_date: "2026-07-10", title: "Martyrdom: Imam Zain-ul-Abideen (AS)", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-07-12", title: "Martyrdom: Hazrat Mesam-e-Tammar (RA)", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-07-15", title: "Ahle-Haram (AS) entered Yazid's (LA) darbar", category: "Historical", sort_order: 0 },
  { event_date: "2026-07-21", title: "Wiladat: Imam Moosa Kazim (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-07-23", title: "Battle of Naharwan was won", category: "Historical", sort_order: 0 },
  { event_date: "2026-07-27", title: "Martyrdom: Bibi Sakina binte Hussain (AS)", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-07-31", title: "Martyrdom: Imam Ali Raza (AS)", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-08-03", title: "Arbaeen-e-Shuhada-e-Karbala", category: "Historical", sort_order: 0 },
  { event_date: "2026-08-07", title: "Martyrdom: BiBi Zainab (SA) (ref)", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-08-11", title: "Wafat: Hazrat Mohammad Mustafa (SAWW)", category: "Wafat", sort_order: 0 },
  { event_date: "2026-08-11", title: "Martyrdom: Imam Hasan (AS)", category: "Martyrdom", sort_order: 1 },
  { event_date: "2026-08-17", title: "Wafat: Masooma-e-Qum (SA)", category: "Wafat", sort_order: 0 },
  { event_date: "2026-08-21", title: "Martyrdom: Imam Hasan Askari (AS)", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-08-22", title: "Eid-e-Zehra (SA)", category: "Eid", sort_order: 0 },
  { event_date: "2026-08-30", title: "Wiladat: Hazrat Mohammad Mustafa (SAWW)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-08-30", title: "Wiladat: Imam Ja'far-us-Sadiq (AS)", category: "Wiladat", sort_order: 1 },
  { event_date: "2026-08-31", title: "Wiladat: Bibi Umme Kulsoom binte Ali (SA)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-09-21", title: "Wiladat: Imam Hasan Askari (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-10-24", title: "Martyrdom: Bibi Sayedda Fatima Zehra S.A.", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-10-26", title: "Wiladat: Imam Zain-ul-Abideen (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-11-13", title: "Martyrdom: Shehzadi Fatima Zehra (SA)", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-11-20", title: "Battle of Jamal was won", category: "Historical", sort_order: 0 },
  { event_date: "2026-11-30", title: "Wiladat: Shehzadi Fatima Zehra (SA)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-12-10", title: "Wiladat: Imam Mohammad Baqir (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-12-12", title: "Martyrdom: Imam Ali Naqi (AS)", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-12-14", title: "Wiladat: Imam Ali Naqi (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-12-18", title: "Wiladat: Hazrat Ali Asghar Ibne Hussain (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-12-19", title: "Wiladat: Imam Mohammad Taqi (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-12-22", title: "Wiladat: Imam Ali Ibne Abu Talib (AS)", category: "Wiladat", sort_order: 0 },
  { event_date: "2026-12-24", title: "Martyrdom: Saani-e-Zahra, Bibi Zainab (SA)", category: "Martyrdom", sort_order: 0 },
  { event_date: "2026-12-31", title: "Nazr-e-Imam Jafar-us-Sadiq (AS)", category: "Historical", sort_order: 0 },
];

// ===========================================================================
// Helpers
// ===========================================================================

/** True when a table has zero rows (works for tables with no `id` column). */
async function tableIsEmpty(table) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(`count ${table}: ${error.message}`);
  return (count ?? 0) === 0;
}

async function seedTable(table, rows, label) {
  if (rows.length === 0) return; // guarded in main(); nothing to do
  if (!(await tableIsEmpty(table))) {
    console.log(`• ${label}: table already has rows — skipped.`);
    return;
  }
  const { error } = await supabase.from(table).insert(rows);
  if (error) throw new Error(`insert ${table}: ${error.message}`);
  console.log(`• ${label}: inserted ${rows.length}.`);
}

// ===========================================================================
// Seed
// ===========================================================================

async function main() {
  // Guard: never seed fabricated or partial data. If the PDF has not been
  // transcribed yet, report exactly what is missing and stop.
  const missing = [];
  if (hijriMonths.length === 0) missing.push("hijriMonths (Hijri month boundaries)");
  if (calendarDays.length === 0) missing.push("calendarDays (daily prayer timings)");
  if (calendarEvents.length === 0) missing.push("calendarEvents (Islamic events)");

  if (missing.length > 0) {
    console.error(
      "Refusing to seed: the following data has not been transcribed from " +
        "refernece/MASOM-Calendar-2026.pdf yet:\n  - " +
        missing.join("\n  - ") +
        "\nPopulate the arrays in this file with the EXACT PDF values, then re-run.",
    );
    process.exit(1);
  }

  console.log("Seeding MASOM calendar (2026)…");
  await seedTable("hijri_months", hijriMonths, "hijri_months");
  await seedTable(
    "calendar_days",
    calendarDays.map((d) => ({ ...d, is_published: true })),
    "calendar_days",
  );
  await seedTable(
    "calendar_events",
    calendarEvents.map((e, i) => ({
      is_active: true,
      sort_order: e.sort_order ?? i,
      ...e,
    })),
    "calendar_events",
  );
  console.log("Done. (Hijri overrides are added in the admin as needed.)");
}

main().catch((error) => {
  console.error(`Seed failed: ${error.message}`);
  process.exit(1);
});
