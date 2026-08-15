-- MASOM admin audit: activity log + login/IP history.
--
-- Two immutable audit tables:
--   * admin_activity — every tracked CMS/calendar mutation (created/updated/
--     deleted/published/activated...), written ONLY through the server-side
--     log_admin_activity() RPC (SECURITY DEFINER, gated on is_admin()).
--   * admin_logins   — each successful admin sign-in with request IP + geo,
--     written ONLY through the record_admin_login() RPC (same gating).
--
-- Neither table has direct INSERT/UPDATE/DELETE policies: records are
-- append-only through the intended application flow, admins can only SELECT,
-- and anonymous users can never read them. No secrets, tokens or passwords are
-- ever stored — only identity, a short description, and request metadata.
-- This migration is idempotent (create ... if not exists, create or replace,
-- drop policy if exists) so it can be re-applied safely.

-- ---------------------------------------------------------------------------
-- admin_activity
-- ---------------------------------------------------------------------------
create table if not exists public.admin_activity (
  id            uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users (id) on delete cascade,
  module        text not null check (module in ('banner', 'program', 'announcement', 'calendar')),
  action        text not null,
  entity_id     text,
  description   text,
  created_at    timestamptz not null default now()
);

create index if not exists admin_activity_recent_idx
  on public.admin_activity (created_at desc);

alter table public.admin_activity enable row level security;

drop policy if exists "admin_activity_admin_select" on public.admin_activity;
create policy "admin_activity_admin_select"
  on public.admin_activity for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- admin_logins
-- ---------------------------------------------------------------------------
create table if not exists public.admin_logins (
  id                 uuid primary key default gen_random_uuid(),
  admin_user_id      uuid not null references auth.users (id) on delete cascade,
  ip_address         text,
  country_code       text,
  country_name       text,
  city               text,
  region             text,
  user_agent_summary text,
  created_at         timestamptz not null default now()
);

create index if not exists admin_logins_user_recent_idx
  on public.admin_logins (admin_user_id, created_at desc);

alter table public.admin_logins enable row level security;

drop policy if exists "admin_logins_admin_select" on public.admin_logins;
create policy "admin_logins_admin_select"
  on public.admin_logins for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- RPC: log_admin_activity — the ONLY write path for activity records.
-- SECURITY DEFINER so it can insert despite the lack of INSERT policies;
-- the is_admin() guard means only authorized admins can call it.
-- ---------------------------------------------------------------------------
create or replace function public.log_admin_activity(
  p_module    text,
  p_action    text,
  p_entity_id text default null,
  p_description text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  insert into public.admin_activity (admin_user_id, module, action, entity_id, description)
  values (auth.uid(), p_module, p_action, p_entity_id, p_description);
end;
$$;

revoke all on function public.log_admin_activity(text, text, text, text) from public;
grant execute on function public.log_admin_activity(text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: get_recent_admin_activity — the dashboard's "Recent Activity" read.
-- SECURITY DEFINER so it can join auth.users (emails are not exposed through
-- PostgREST otherwise); the is_admin() guard keeps it admin-only.
-- ---------------------------------------------------------------------------
create or replace function public.get_recent_admin_activity(p_limit integer default 5)
returns table (
  id            uuid,
  module        text,
  action        text,
  entity_id     text,
  description   text,
  created_at    timestamptz,
  admin_email   text
)
language sql
stable
security definer
set search_path = ''
as $$
  select a.id, a.module, a.action, a.entity_id, a.description, a.created_at, u.email
  from public.admin_activity a
  join auth.users u on u.id = a.admin_user_id
  where public.is_admin()
  order by a.created_at desc
  limit greatest(0, p_limit);
$$;

revoke all on function public.get_recent_admin_activity(integer) from public;
grant execute on function public.get_recent_admin_activity(integer) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: record_admin_login — the ONLY write path for login records. Called by
-- the server action immediately after a successful sign-in (never before).
-- ---------------------------------------------------------------------------
create or replace function public.record_admin_login(
  p_ip_address         text default null,
  p_country_code       text default null,
  p_country_name       text default null,
  p_city               text default null,
  p_region             text default null,
  p_user_agent_summary text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  insert into public.admin_logins (
    admin_user_id, ip_address, country_code, country_name, city, region, user_agent_summary
  )
  values (
    auth.uid(), p_ip_address, p_country_code, p_country_name, p_city, p_region, p_user_agent_summary
  );
end;
$$;

revoke all on function public.record_admin_login(text, text, text, text, text, text) from public;
grant execute on function public.record_admin_login(text, text, text, text, text, text) to authenticated;
