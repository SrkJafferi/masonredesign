-- MASOM Phase 5: Prayer + Hijri Calendar.
-- Four normalized tables that together drive the public calendar and the
-- /admin/calendar module. Everything reuses the Phase 4 foundations from
-- 20260813120000_profiles_and_roles.sql (public.is_admin(), public.set_updated_at()).
--
-- Design notes (kept deliberately explicit — no hidden +1/-1 anywhere):
--   * Prayer timings are stored EXACTLY as MASOM publishes them (text like
--     "5:55a"), never computed from an API. Imsaak is stored but NOT shown on
--     the public site (kept for future use).
--   * The Hijri date for any Gregorian day is derived from hijri_months (the
--     month-start boundaries) by simple date arithmetic. Individual days can be
--     corrected with an explicit row in hijri_overrides — the override always
--     wins and is visible as data, not buried in code.
-- This migration is idempotent so it can be re-applied safely.

-- ---------------------------------------------------------------------------
-- calendar_days: one row per Gregorian date holding the six published prayer
-- timings (+ imsaak, stored but not publicly displayed).
-- ---------------------------------------------------------------------------
create table if not exists public.calendar_days (
  gregorian_date date primary key,
  imsaak         text,
  fajr           text,
  sunrise        text,
  zohar          text,
  sunset         text,
  maghrib        text,
  midnight       text,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists calendar_days_published_idx
  on public.calendar_days (gregorian_date asc)
  where is_published;

drop trigger if exists calendar_days_set_updated_at on public.calendar_days;
create trigger calendar_days_set_updated_at
  before update on public.calendar_days
  for each row execute function public.set_updated_at();

alter table public.calendar_days enable row level security;

drop policy if exists "calendar_days_public_read_published" on public.calendar_days;
create policy "calendar_days_public_read_published"
  on public.calendar_days for select
  to anon, authenticated
  using (is_published);

drop policy if exists "calendar_days_admin_read_all" on public.calendar_days;
create policy "calendar_days_admin_read_all"
  on public.calendar_days for select
  to authenticated
  using (public.is_admin());

drop policy if exists "calendar_days_admin_insert" on public.calendar_days;
create policy "calendar_days_admin_insert"
  on public.calendar_days for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "calendar_days_admin_update" on public.calendar_days;
create policy "calendar_days_admin_update"
  on public.calendar_days for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "calendar_days_admin_delete" on public.calendar_days;
create policy "calendar_days_admin_delete"
  on public.calendar_days for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- hijri_months: the Islamic month-start boundaries (moon-sighting based).
-- Each row says "Hijri month <hijri_month> of <hijri_year> begins on this
-- Gregorian date." The engine finds the latest boundary <= a given date and
-- computes day-of-month by subtraction. Adjusting a boundary here shifts the
-- whole month — this is the single, visible place month boundaries live.
-- ---------------------------------------------------------------------------
create table if not exists public.hijri_months (
  id              uuid primary key default gen_random_uuid(),
  hijri_year      integer not null,
  hijri_month     integer not null check (hijri_month between 1 and 12),
  gregorian_start date not null unique,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint hijri_months_year_month_unique unique (hijri_year, hijri_month)
);

create index if not exists hijri_months_published_start_idx
  on public.hijri_months (gregorian_start asc)
  where is_published;

drop trigger if exists hijri_months_set_updated_at on public.hijri_months;
create trigger hijri_months_set_updated_at
  before update on public.hijri_months
  for each row execute function public.set_updated_at();

alter table public.hijri_months enable row level security;

drop policy if exists "hijri_months_public_read_published" on public.hijri_months;
create policy "hijri_months_public_read_published"
  on public.hijri_months for select
  to anon, authenticated
  using (is_published);

drop policy if exists "hijri_months_admin_read_all" on public.hijri_months;
create policy "hijri_months_admin_read_all"
  on public.hijri_months for select
  to authenticated
  using (public.is_admin());

drop policy if exists "hijri_months_admin_insert" on public.hijri_months;
create policy "hijri_months_admin_insert"
  on public.hijri_months for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "hijri_months_admin_update" on public.hijri_months;
create policy "hijri_months_admin_update"
  on public.hijri_months for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "hijri_months_admin_delete" on public.hijri_months;
create policy "hijri_months_admin_delete"
  on public.hijri_months for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- hijri_overrides: explicit per-day Hijri corrections. When a row exists for a
-- Gregorian date, the calendar uses THIS Hijri date instead of the derived one.
-- This is how month-end +1/-1 adjustments are handled — as visible data.
-- ---------------------------------------------------------------------------
create table if not exists public.hijri_overrides (
  gregorian_date date primary key,
  hijri_year     integer not null,
  hijri_month    integer not null check (hijri_month between 1 and 12),
  hijri_day      integer not null check (hijri_day between 1 and 30),
  note           text,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

drop trigger if exists hijri_overrides_set_updated_at on public.hijri_overrides;
create trigger hijri_overrides_set_updated_at
  before update on public.hijri_overrides
  for each row execute function public.set_updated_at();

alter table public.hijri_overrides enable row level security;

drop policy if exists "hijri_overrides_public_read_published" on public.hijri_overrides;
create policy "hijri_overrides_public_read_published"
  on public.hijri_overrides for select
  to anon, authenticated
  using (is_published);

drop policy if exists "hijri_overrides_admin_read_all" on public.hijri_overrides;
create policy "hijri_overrides_admin_read_all"
  on public.hijri_overrides for select
  to authenticated
  using (public.is_admin());

drop policy if exists "hijri_overrides_admin_insert" on public.hijri_overrides;
create policy "hijri_overrides_admin_insert"
  on public.hijri_overrides for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "hijri_overrides_admin_update" on public.hijri_overrides;
create policy "hijri_overrides_admin_update"
  on public.hijri_overrides for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "hijri_overrides_admin_delete" on public.hijri_overrides;
create policy "hijri_overrides_admin_delete"
  on public.hijri_overrides for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- calendar_events: Islamic events tied to a Gregorian date. Multiple rows may
-- share the same date (sort_order breaks ties). category is a free label
-- (e.g. Wiladat, Martyrdom, Wafat, Eid) used for grouping/badges.
-- ---------------------------------------------------------------------------
create table if not exists public.calendar_events (
  id          uuid primary key default gen_random_uuid(),
  event_date  date not null,
  title       text not null,
  description text,
  category    text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists calendar_events_active_date_idx
  on public.calendar_events (event_date asc, sort_order asc)
  where is_active;

drop trigger if exists calendar_events_set_updated_at on public.calendar_events;
create trigger calendar_events_set_updated_at
  before update on public.calendar_events
  for each row execute function public.set_updated_at();

alter table public.calendar_events enable row level security;

drop policy if exists "calendar_events_public_read_active" on public.calendar_events;
create policy "calendar_events_public_read_active"
  on public.calendar_events for select
  to anon, authenticated
  using (is_active);

drop policy if exists "calendar_events_admin_read_all" on public.calendar_events;
create policy "calendar_events_admin_read_all"
  on public.calendar_events for select
  to authenticated
  using (public.is_admin());

drop policy if exists "calendar_events_admin_insert" on public.calendar_events;
create policy "calendar_events_admin_insert"
  on public.calendar_events for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "calendar_events_admin_update" on public.calendar_events;
create policy "calendar_events_admin_update"
  on public.calendar_events for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "calendar_events_admin_delete" on public.calendar_events;
create policy "calendar_events_admin_delete"
  on public.calendar_events for delete
  to authenticated
  using (public.is_admin());
