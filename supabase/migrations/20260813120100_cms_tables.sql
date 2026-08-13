-- MASOM CMS content tables: banners, programs, announcements.
-- Public (anon) may read only content that is active/published and in-window.
-- All writes require an authenticated admin (public.is_admin()).

-- ===========================================================================
-- BANNERS — homepage hero slider
-- ===========================================================================
create table if not exists public.banners (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  image_path text not null,
  image_alt  text not null default '',
  link_url   text,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fast path for the public homepage query (active banners, ordered).
create index if not exists banners_active_order_idx
  on public.banners (sort_order asc)
  where is_active;

drop trigger if exists banners_set_updated_at on public.banners;
create trigger banners_set_updated_at
  before update on public.banners
  for each row execute function public.set_updated_at();

alter table public.banners enable row level security;

drop policy if exists "banners_public_read_active" on public.banners;
create policy "banners_public_read_active"
  on public.banners for select
  to anon, authenticated
  using (is_active);

drop policy if exists "banners_admin_read_all" on public.banners;
create policy "banners_admin_read_all"
  on public.banners for select
  to authenticated
  using (public.is_admin());

drop policy if exists "banners_admin_insert" on public.banners;
create policy "banners_admin_insert"
  on public.banners for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "banners_admin_update" on public.banners;
create policy "banners_admin_update"
  on public.banners for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "banners_admin_delete" on public.banners;
create policy "banners_admin_delete"
  on public.banners for delete
  to authenticated
  using (public.is_admin());

-- ===========================================================================
-- PROGRAMS — upcoming events. Dates/times are stored as proper types,
-- never pre-formatted strings.
-- ===========================================================================
create table if not exists public.programs (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  poster_path  text,
  start_date   date not null,
  end_date     date,
  start_time   time,
  end_time     time,
  location     text,
  link_url     text,
  is_published boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint programs_end_after_start
    check (end_date is null or end_date >= start_date)
);

-- Fast path for the public homepage query (published events, by date).
create index if not exists programs_published_date_idx
  on public.programs (start_date asc, sort_order asc)
  where is_published;

drop trigger if exists programs_set_updated_at on public.programs;
create trigger programs_set_updated_at
  before update on public.programs
  for each row execute function public.set_updated_at();

alter table public.programs enable row level security;

drop policy if exists "programs_public_read_published" on public.programs;
create policy "programs_public_read_published"
  on public.programs for select
  to anon, authenticated
  using (is_published);

drop policy if exists "programs_admin_read_all" on public.programs;
create policy "programs_admin_read_all"
  on public.programs for select
  to authenticated
  using (public.is_admin());

drop policy if exists "programs_admin_insert" on public.programs;
create policy "programs_admin_insert"
  on public.programs for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "programs_admin_update" on public.programs;
create policy "programs_admin_update"
  on public.programs for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "programs_admin_delete" on public.programs;
create policy "programs_admin_delete"
  on public.programs for delete
  to authenticated
  using (public.is_admin());

-- ===========================================================================
-- ANNOUNCEMENTS — news ticker. Optional scheduling window.
-- ===========================================================================
create table if not exists public.announcements (
  id         uuid primary key default gen_random_uuid(),
  message    text not null,
  link_url   text,
  link_label text,
  is_active  boolean not null default true,
  starts_at  timestamptz,
  expires_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_valid_window
    check (starts_at is null or expires_at is null or expires_at >= starts_at)
);

create index if not exists announcements_active_order_idx
  on public.announcements (sort_order asc)
  where is_active;

drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

alter table public.announcements enable row level security;

-- Public sees only active announcements inside their schedule window.
drop policy if exists "announcements_public_read_live" on public.announcements;
create policy "announcements_public_read_live"
  on public.announcements for select
  to anon, authenticated
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (expires_at is null or expires_at > now())
  );

drop policy if exists "announcements_admin_read_all" on public.announcements;
create policy "announcements_admin_read_all"
  on public.announcements for select
  to authenticated
  using (public.is_admin());

drop policy if exists "announcements_admin_insert" on public.announcements;
create policy "announcements_admin_insert"
  on public.announcements for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "announcements_admin_update" on public.announcements;
create policy "announcements_admin_update"
  on public.announcements for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "announcements_admin_delete" on public.announcements;
create policy "announcements_admin_delete"
  on public.announcements for delete
  to authenticated
  using (public.is_admin());
