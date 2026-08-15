-- MASOM Phase 5 (production data correction): observed Hijri calendar, 2026.
--
-- CONTEXT
--   The 2026 PDF predicted 2026-07-15 = 1 Safar 1448. The moon-sighting that
--   MASOM/Chicago actually observed moved the month: 1 Safar 1448 fell on
--   2026-07-16, making 2026-07-15 = 30 Muharram 1448. This was impossible to
--   know when the PDF was prepared.
--
-- WHAT THIS DOES (and why it is the smallest safe change)
--   It shifts ONLY the Safar 1448 month-start boundary by one day, from
--   2026-07-15 to 2026-07-16, using the existing hijri_months architecture.
--   The resolver derives every later day from the nearest boundary, so:
--     2026-07-14 -> 29 Muharram 1448   (unchanged)
--     2026-07-15 -> 30 Muharram 1448   (corrected)
--     2026-07-16 ->  1 Safar 1448      (corrected)
--     2026-07-31 -> 16 Safar 1448
--     2026-08-01 -> 17 Safar 1448
--     2026-08-13 -> 29 Safar 1448
--     2026-08-14 ->  1 Rabi-ul-Awwal 1448   (unchanged — later boundaries intact)
--   Nothing earlier than 2026-07-15 changes; nothing after 2026-08-14 changes.
--
-- SAFETY
--   * Touches exactly one record: the (hijri_year=1448, hijri_month=2) row.
--   * Guarded by the expected current value so it is a no-op if already fixed
--     or if the row is not what we think it is.
--   * Does NOT touch calendar_days (prayer timings), calendar_events, RLS,
--     authentication, or the service-role path.
--   * Idempotent — safe to re-run.
update public.hijri_months
set gregorian_start = '2026-07-16',
    updated_at = now()
where hijri_year = 1448
  and hijri_month = 2
  and gregorian_start = '2026-07-15';
