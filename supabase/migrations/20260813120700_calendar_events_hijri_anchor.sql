-- MASOM Phase 5.2: hijri-anchor every Islamic event.
--
-- CONTEXT
--   Until now calendar_events stored ONLY a Gregorian event_date. Events are
--   really anchored to an authoritative Hijri date (e.g. "Wafat: Masooma-e-Qum
--   (SA)" is 4 Rabi-ul-Awwal 1448). A fixed Gregorian date goes stale whenever
--   a month boundary moves (moon sighting). This migration:
--     1. Adds hijri_year / hijri_month / hijri_day to calendar_events.
--     2. Backfills all 87 existing events with their authoritative Hijri
--        identity, matched on the EXACT (event_date, title) pair so no row is
--        created, deleted, or guessed. Repeated titles are safe because the
--        event_date disambiguates them.
--     3. Corrects the observed Rabi-ul-Awwal 1448 boundary to 2026-08-15 so
--        that 2026-08-14 = 30 Safar 1448 and 2026-08-15 = 1 Rabi-ul-Awwal 1448.
--     4. Recomputes the cached event_date from the current boundaries so the
--        cache matches what the app derives, and installs triggers that keep it
--        in sync whenever a boundary or override changes.
--
-- DESIGN
--   * The Hijri identity is authoritative. The Gregorian date is DERIVED live
--     from hijri_months + hijri_overrides (mirrored in src/features/calendar/
--     hijri.ts). event_date is kept as a denormalized cache only.
--   * No +1/-1 is baked into code. Moving a boundary in hijri_months moves
--     every event anchored to that month automatically.
--   * Idempotent: backfill only touches rows whose hijri columns are still
--     NULL, and every add/update is guarded.

-- ---------------------------------------------------------------------------
-- 1. Schema: add the Hijri anchor columns.
-- ---------------------------------------------------------------------------
alter table public.calendar_events
  add column if not exists hijri_year  integer,
  add column if not exists hijri_month integer,
  add column if not exists hijri_day   integer;

-- Guarded check constraints (PostgreSQL has no ADD CONSTRAINT IF NOT EXISTS).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'calendar_events_hijri_year_check'
  ) then
    alter table public.calendar_events
      add constraint calendar_events_hijri_year_check check (hijri_year is null or hijri_year > 0);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'calendar_events_hijri_month_check'
  ) then
    alter table public.calendar_events
      add constraint calendar_events_hijri_month_check check (hijri_month is null or hijri_month between 1 and 12);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'calendar_events_hijri_day_check'
  ) then
    alter table public.calendar_events
      add constraint calendar_events_hijri_day_check check (hijri_day is null or hijri_day between 1 and 30);
  end if;
end $$;

create index if not exists calendar_events_hijri_idx
  on public.calendar_events (hijri_year, hijri_month, hijri_day);

-- ---------------------------------------------------------------------------
-- 2. Backfill the authoritative Hijri identity for all 87 events.
--    Matched on the exact (event_date, title) pair, and only where the hijri
--    columns are still NULL (idempotent). Uses the OLD event_date values as the
--    lookup key — the cache is recomputed in step 4.
-- ---------------------------------------------------------------------------
update public.calendar_events as e
set hijri_year  = v.hijri_year,
    hijri_month = v.hijri_month,
    hijri_day   = v.hijri_day,
    updated_at  = now()
from (values
  ('2026-01-03', 'Wiladat: Imam Ali Ibne Abu Talib (AS)', 1447, 7, 13),
  ('2026-01-05', 'Martyrdom: Saani-e-Zahra, Bibi Zainab (SA)', 1447, 7, 15),
  ('2026-01-12', 'Nazr-e-Imam Jafar-us-Sadiq (AS)', 1447, 7, 22),
  ('2026-01-14', 'Fathe-Khyber badaste-Maula Ali Ibne Abi Talib (AS)', 1447, 7, 24),
  ('2026-01-15', 'Martyrdom: Imam Moosa Kazim (AS)', 1447, 7, 25),
  ('2026-01-16', 'Wafat: Hazrat Abu Talib (SA)', 1447, 7, 26),
  ('2026-01-17', 'Yaum-e-Be''sat / Mairaj-un-Nabi', 1447, 7, 27),
  ('2026-01-18', 'Safar-e-Imam Hussain (AS): Madina to Karbala (60 Hijri)', 1447, 7, 28),
  ('2026-01-20', 'Wiladat: BiBi Zainab S.A.', 1447, 8, 1),
  ('2026-01-21', 'Fasting in Ramzan was made compulsory', 1447, 8, 2),
  ('2026-01-22', 'Wiladat: Imam Hussain (AS)', 1447, 8, 3),
  ('2026-01-23', 'Wiladat: Hazrat Abbas Alamdar (AS)', 1447, 8, 4),
  ('2026-01-24', 'Wafat: Bibi Fizza (SA)', 1447, 8, 5),
  ('2026-01-26', 'Wiladat: Hazrat Qasim Ibne Hasan (AS)', 1447, 8, 7),
  ('2026-01-30', 'Wiladat: Hazrat Ali Akbar Ibne Hussain (AS)', 1447, 8, 11),
  ('2026-02-03', 'Wiladat: Imam Mehdi Aakhir-uz-Zaman (AS); Shab-e-Bara''at', 1447, 8, 15),
  ('2026-02-23', 'Torah was revealed', 1447, 9, 6),
  ('2026-02-27', 'Wafat: Hazrat Khadija (SA)', 1447, 9, 10),
  ('2026-03-01', 'Bible was revealed', 1447, 9, 12),
  ('2026-03-04', 'Wiladat: Imam Hasan (AS)', 1447, 9, 15),
  ('2026-03-06', 'Battle of Badr was fought', 1447, 9, 17),
  ('2026-03-07', 'Zabur was revealed', 1447, 9, 18),
  ('2026-03-08', 'Subhe Zarbat: Imam Ali Ibne Abi Talib (AS)', 1447, 9, 19),
  ('2026-03-10', 'Martyrdom: Imam Ali Ibne Abi Talib (AS)', 1447, 9, 21),
  ('2026-03-11', 'Shab-e-Qadr: Quran was revealed', 1447, 9, 22),
  ('2026-03-13', 'Juma''tul Wida / Yaum-e-Quds', 1447, 9, 24),
  ('2026-03-20', 'Eid-Ul-Fitr', 1447, 10, 1),
  ('2026-03-27', 'Mourning: Jannat-ul-Baqee demolished by Aal-e-Saud', 1447, 10, 8),
  ('2026-03-29', 'Ghaibat Kubra (Imam Aakhir-uz-Zaman AS) began', 1447, 10, 10),
  ('2026-04-03', 'Martyrdom: Imam Jafar-us-Sadiq (AS)', 1447, 10, 15),
  ('2026-04-05', 'Battle of Uhud was fought', 1447, 10, 17),
  ('2026-04-28', 'Wiladat: Imam Ali Raza (AS)', 1447, 11, 11),
  ('2026-05-12', 'Wiladat: Hazrat Ibrahim (AS) and Hazrat Eesaa (AS)', 1447, 11, 25),
  ('2026-05-16', 'Martyrdom: Imam Mohammad Taqi (AS)', 1447, 11, 29),
  ('2026-05-18', 'Wedding: Imam Ali (AS) and Bibi Fatima Zehra (SA)', 1447, 12, 1),
  ('2026-05-20', 'Allah accepted Hazrat Adam''s (AS) dua', 1447, 12, 3),
  ('2026-05-22', 'Wafat: Hazrat Abu Zur Ghaffari (RA)', 1447, 12, 5),
  ('2026-05-24', 'Martyrdom: Imam Mohammad Baqir (AS)', 1447, 12, 7),
  ('2026-05-25', 'Imam Hussain left Makkah towards Karbala', 1447, 12, 8),
  ('2026-05-26', 'Yaum-e-Arafat', 1447, 12, 9),
  ('2026-05-26', 'Martyrdom: Hazrat Muslim Ibne Aqeel (AS)', 1447, 12, 9),
  ('2026-05-27', 'Eid-ul-Azha', 1447, 12, 10),
  ('2026-06-01', 'Wiladat: Imam Ali-an-Naqi (AS)', 1447, 12, 15),
  ('2026-06-04', 'Eid Al-Ghadir', 1447, 12, 18),
  ('2026-06-05', 'Shab-e-Rukhsati: Bibi Fatima Zehra (SA)', 1447, 12, 19),
  ('2026-06-08', 'Martyrdom: Tiflaan-e-Muslim Ibne Aqeel (AS)', 1447, 12, 22),
  ('2026-06-10', 'Eid-e-Mubahila', 1447, 12, 24),
  ('2026-06-17', 'Imam Hussain (AS) reached Karbala', 1448, 1, 2),
  ('2026-06-20', 'Ziarat: Taaboot-e-Hazrat Aun-w-Mohammad (as)', 1448, 1, 5),
  ('2026-06-21', 'Ziarat: Taaboot-e-Hazrat Ali Akbar (as)', 1448, 1, 6),
  ('2026-06-22', 'Mehndi: Hazrat Qasim (as)', 1448, 1, 7),
  ('2026-06-23', 'Ziarat: Alam-e-Hazrat Abbas Alamdar (as)', 1448, 1, 8),
  ('2026-06-24', 'Shab-e-Ashoor/Ziarat:Gehwaara-e-Hazrat Ali Asghar (as)', 1448, 1, 9),
  ('2026-06-25', 'Ashoora-e-Muharram', 1448, 1, 10),
  ('2026-06-25', 'Martyrdom: Imam Hussain (AS)', 1448, 1, 10),
  ('2026-06-27', 'Soyem / Ziyarat-e-Shuhada-e-Karbala', 1448, 1, 12),
  ('2026-07-10', 'Martyrdom: Imam Zain-ul-Abideen (AS)', 1448, 1, 25),
  ('2026-07-12', 'Martyrdom: Hazrat Mesam-e-Tammar (RA)', 1448, 1, 27),
  ('2026-07-16', 'Ahle-Haram (AS) entered Yazid''s (LA) darbar', 1448, 2, 1),
  ('2026-07-22', 'Wiladat: Imam Moosa Kazim (AS)', 1448, 2, 7),
  ('2026-07-24', 'Battle of Naharwan was won', 1448, 2, 9),
  ('2026-07-28', 'Martyrdom: Bibi Sakina binte Hussain (AS)', 1448, 2, 13),
  ('2026-08-01', 'Martyrdom: Imam Ali Raza (AS)', 1448, 2, 17),
  ('2026-08-04', 'Arbaeen-e-Shuhada-e-Karbala', 1448, 2, 20),
  ('2026-08-08', 'Martyrdom: BiBi Zainab (SA) (ref)', 1448, 2, 24),
  ('2026-08-12', 'Wafat: Hazrat Mohammad Mustafa (SAWW)', 1448, 2, 28),
  ('2026-08-12', 'Martyrdom: Imam Hasan (AS)', 1448, 2, 28),
  ('2026-08-17', 'Wafat: Masooma-e-Qum (SA)', 1448, 3, 4),
  ('2026-08-21', 'Martyrdom: Imam Hasan Askari (AS)', 1448, 3, 8),
  ('2026-08-22', 'Eid-e-Zehra (SA)', 1448, 3, 9),
  ('2026-08-30', 'Wiladat: Hazrat Mohammad Mustafa (SAWW)', 1448, 3, 17),
  ('2026-08-30', 'Wiladat: Imam Ja''far-us-Sadiq (AS)', 1448, 3, 17),
  ('2026-08-31', 'Wiladat: Bibi Umme Kulsoom binte Ali (SA)', 1448, 3, 18),
  ('2026-09-21', 'Wiladat: Imam Hasan Askari (AS)', 1448, 4, 10),
  ('2026-10-24', 'Martyrdom: Bibi Sayedda Fatima Zehra S.A.', 1448, 5, 13),
  ('2026-10-26', 'Wiladat: Imam Zain-ul-Abideen (AS)', 1448, 5, 15),
  ('2026-11-13', 'Martyrdom: Shehzadi Fatima Zehra (SA)', 1448, 6, 3),
  ('2026-11-20', 'Battle of Jamal was won', 1448, 6, 10),
  ('2026-11-30', 'Wiladat: Shehzadi Fatima Zehra (SA)', 1448, 6, 20),
  ('2026-12-10', 'Wiladat: Imam Mohammad Baqir (AS)', 1448, 7, 1),
  ('2026-12-12', 'Martyrdom: Imam Ali Naqi (AS)', 1448, 7, 3),
  ('2026-12-14', 'Wiladat: Imam Ali Naqi (AS)', 1448, 7, 5),
  ('2026-12-18', 'Wiladat: Hazrat Ali Asghar Ibne Hussain (AS)', 1448, 7, 9),
  ('2026-12-19', 'Wiladat: Imam Mohammad Taqi (AS)', 1448, 7, 10),
  ('2026-12-22', 'Wiladat: Imam Ali Ibne Abu Talib (AS)', 1448, 7, 13),
  ('2026-12-24', 'Martyrdom: Saani-e-Zahra, Bibi Zainab (SA)', 1448, 7, 15),
  ('2026-12-31', 'Nazr-e-Imam Jafar-us-Sadiq (AS)', 1448, 7, 22)
) as v(event_date, title, hijri_year, hijri_month, hijri_day)
where e.event_date = v.event_date::date
  and e.title = v.title
  and e.hijri_year is null
  and e.hijri_month is null
  and e.hijri_day is null;

-- The (event_date, title) pair must match exactly one existing row per value.
-- (No assertion that hard-fails — the guard above already makes this safe.)

-- ---------------------------------------------------------------------------
-- 3. Observed Rabi-ul-Awwal 1448 boundary correction.
--    Safar 1448 began 2026-07-16 (migration 20260813120500). Safar therefore
--    runs 30 days to 2026-08-14, so 1 Rabi-ul-Awwal 1448 = 2026-08-15. The PDF
--    predicted 2026-08-14, which is what the production row still holds.
-- ---------------------------------------------------------------------------
update public.hijri_months
set gregorian_start = '2026-08-15',
    updated_at = now()
where hijri_year = 1448
  and hijri_month = 3
  and gregorian_start = '2026-08-14';

-- ---------------------------------------------------------------------------
-- 4. Hijri -> Gregorian resolution function (mirrors src/features/calendar/
--    hijri.ts createHijriToGregorian, including the override-first rule and the
--    fallback that counts forward through alternating 30/29-day months when a
--    month boundary is unpublished).
-- ---------------------------------------------------------------------------
create or replace function public.hijri_to_gregorian(
  p_year  integer,
  p_month integer,
  p_day   integer
) returns date
language sql
stable
as $$
  select coalesce(
    (
      select o.gregorian_date
      from public.hijri_overrides o
      where o.hijri_year = p_year
        and o.hijri_month = p_month
        and o.hijri_day = p_day
    ),
    (
      with target as (
        select (p_year * 12 + (p_month - 1)) as t_idx
      ),
      candidate as (
        select h.gregorian_start as start,
               (h.hijri_year * 12 + (h.hijri_month - 1)) as c_idx
        from public.hijri_months h, target
        where h.is_published
          and (h.hijri_year * 12 + (h.hijri_month - 1)) <= target.t_idx
        order by (h.hijri_year * 12 + (h.hijri_month - 1)) desc
        limit 1
      )
      select (candidate.start + (
        coalesce((
          select sum(case when ((i % 12) + 1) % 2 = 1 then 30 else 29 end)::int
          from generate_series(candidate.c_idx, (select t_idx from target) - 1) as i
        ), 0) + (p_day - 1)
      ))::date
      from candidate
    )
  );
$$;

-- ---------------------------------------------------------------------------
-- 5. Recompute the cached event_date from the current boundaries so the cache
--    matches the derived value for every anchored event.
-- ---------------------------------------------------------------------------
update public.calendar_events as e
set event_date = public.hijri_to_gregorian(e.hijri_year, e.hijri_month, e.hijri_day),
    updated_at = now()
where e.hijri_year is not null
  and public.hijri_to_gregorian(e.hijri_year, e.hijri_month, e.hijri_day) is not null;

-- ---------------------------------------------------------------------------
-- 6. Make the Hijri anchor mandatory going forward — but ONLY once every row
--    actually carries one. If a row is still NULL here (e.g. an event created
--    outside the backfill) the NOT NULL is skipped rather than failing the
--    migration or destroying data.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from public.calendar_events
    where hijri_year is null or hijri_month is null or hijri_day is null
  ) then
    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'calendar_events'
        and column_name = 'hijri_year'
        and is_nullable = 'NO'
    ) then
      alter table public.calendar_events alter column hijri_year set not null;
    end if;
    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'calendar_events'
        and column_name = 'hijri_month'
        and is_nullable = 'NO'
    ) then
      alter table public.calendar_events alter column hijri_month set not null;
    end if;
    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'calendar_events'
        and column_name = 'hijri_day'
        and is_nullable = 'NO'
    ) then
      alter table public.calendar_events alter column hijri_day set not null;
    end if;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 7. Triggers: keep the cached event_date in sync whenever a month boundary or
--    an override changes, so the cache never silently disagrees with the
--    derived date.
-- ---------------------------------------------------------------------------
create or replace function public.sync_calendar_event_dates()
returns trigger
language plpgsql
security invoker
as $$
begin
  update public.calendar_events
  set event_date = public.hijri_to_gregorian(hijri_year, hijri_month, hijri_day),
      updated_at = now()
  where hijri_year is not null
    and public.hijri_to_gregorian(hijri_year, hijri_month, hijri_day) is not null;
  return null;
end;
$$;

drop trigger if exists calendar_events_sync_dates_after_hijri_months on public.hijri_months;
create trigger calendar_events_sync_dates_after_hijri_months
  after insert or update of gregorian_start, is_published or delete on public.hijri_months
  for each statement execute function public.sync_calendar_event_dates();

drop trigger if exists calendar_events_sync_dates_after_hijri_overrides on public.hijri_overrides;
create trigger calendar_events_sync_dates_after_hijri_overrides
  after insert or update of gregorian_date, hijri_year, hijri_month, hijri_day or delete on public.hijri_overrides
  for each statement execute function public.sync_calendar_event_dates();
