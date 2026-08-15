-- MASOM Phase 5 (production data correction): re-anchor Safar events.
--
-- CONTEXT
--   The companion migration 20260813120500 moved the Safar 1448 month-start
--   boundary to 2026-07-16 (observed moon-sighting), which shifted every Safar
--   1448 day by +1 (e.g. 2026-07-16 = 1 Safar instead of 2026-07-15).
--
--   That boundary change was correct, but it silently moved the *displayed*
--   Hijri date under every Islamic event sitting on a Safar date. To keep each
--   event anchored to its ACTUAL Hijri date (1, 7, 9, 13, 17, 20, 24, 28 Safar),
--   those events must follow the corrected sequence by +1 Gregorian day.
--
--   Events on Muharram (before 2026-07-15) and from Rabi-ul-Awwal onward
--   (after 2026-08-14) are untouched — their month boundaries did not change.
--
-- SAFETY
--   * Updates exactly the nine events identified below, matched on the exact
--     (event_date, title) pair so unrelated rows are never touched.
--   * Does NOT touch calendar_days, hijri_months, hijri_overrides, RLS or auth.
--   * Idempotent — the `in (...)` match no longer fires after the first run.
update public.calendar_events
set event_date = event_date + 1,
    updated_at = now()
where (event_date, title) in (
  ('2026-07-15', 'Ahle-Haram (AS) entered Yazid''s (LA) darbar'),          -- 1 Safar
  ('2026-07-21', 'Wiladat: Imam Moosa Kazim (AS)'),                        -- 7 Safar
  ('2026-07-23', 'Battle of Naharwan was won'),                            -- 9 Safar
  ('2026-07-27', 'Martyrdom: Bibi Sakina binte Hussain (AS)'),             -- 13 Safar
  ('2026-07-31', 'Martyrdom: Imam Ali Raza (AS)'),                         -- 17 Safar
  ('2026-08-03', 'Arbaeen-e-Shuhada-e-Karbala'),                           -- 20 Safar
  ('2026-08-07', 'Martyrdom: BiBi Zainab (SA) (ref)'),                     -- 24 Safar
  ('2026-08-11', 'Wafat: Hazrat Mohammad Mustafa (SAWW)'),                 -- 28 Safar
  ('2026-08-11', 'Martyrdom: Imam Hasan (AS)')                             -- 28 Safar
);
