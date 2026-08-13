# MASOM CMS — Supabase setup

Phase 4 adds a lightweight, admin-managed CMS for three homepage areas: **Banners**
(hero slider), **Programs** (upcoming events) and **Announcements** (news ticker).

Everything is defined as reproducible SQL migrations here — nothing depends on
clicking around the Supabase dashboard.

## 1. Apply the migrations

The migrations create the tables, indexes, row-level security (RLS) policies and
storage buckets. They are idempotent (`create ... if not exists`,
`create or replace`, `drop policy if exists` / `create policy`,
`on conflict do nothing`), so re-running them is safe.

**Applying them needs DDL access to the database** — the Supabase CLI (which
prompts for your database password) or the dashboard SQL editor. The
`SUPABASE_SERVICE_ROLE_KEY` alone is **not** enough (it can move data, not run
`CREATE TABLE/FUNCTION/POLICY`).

### Option A — Supabase CLI (recommended)

The CLI is not required as a global install; `npx supabase` works. Run these in
the project root and enter secrets interactively when prompted (never commit
them):

```bash
# 1. Authenticate the CLI (opens a browser to create/confirm an access token)
npx supabase login

# 2. Link this repo to your project. <project-ref> is the subdomain of your
#    NEXT_PUBLIC_SUPABASE_URL (https://<project-ref>.supabase.co), also shown at
#    Dashboard → Project Settings → General → "Reference ID".
#    You will be prompted for the database password.
npx supabase link --project-ref <project-ref>

# 3. Push all Phase 4 migrations to the remote project.
npx supabase db push
```

### Option B — Dashboard SQL editor

Open **SQL Editor** and run each file in `supabase/migrations/` in order:

1. `20260813120000_profiles_and_roles.sql` — `profiles` table, `is_admin()`, triggers, RLS
2. `20260813120100_cms_tables.sql` — `banners`, `programs`, `announcements` + RLS
3. `20260813120200_storage.sql` — `banners` and `programs` storage buckets + policies

## 2. Create an admin user

Admin access uses **Supabase Auth** only — no passwords are stored in our tables.

1. In the dashboard: **Authentication → Users → Add user** (set an email + password),
   or have the person sign up.
2. A `profiles` row is created automatically (role `viewer`). Promote it to admin:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'you@masom.com');
```

Only users with `role = 'admin'` can sign in to `/admin` and change content. RLS
enforces this at the database level, so hiding routes is not the only protection.

> **Recommended:** In **Authentication → Providers/Settings**, disable public
> sign-ups. This is an admin-only panel, so new users should be created
> deliberately by you. (Even if a stray account is created, it defaults to the
> `viewer` role and RLS grants it no CMS access — but disabling sign-ups keeps
> the user list clean.)

## 3. Seed the existing homepage content (optional but recommended)

This uploads the real Phase 3 hero/program images and inserts matching rows so the
CMS starts with the current content instead of being empty.

```bash
npm run seed:cms
```

(Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
The script is idempotent: it skips a table that already has rows.)

Announcements are **not** seeded — add them from the admin when needed.

## How fallback works

- **Banners / Programs**: if the CMS is unreachable or has no active/published rows,
  the homepage renders the built-in local reference content (in
  `src/features/home/data/`). It is never broken or empty.
- **Announcements**: no local fallback. When there are none active, the ticker is
  hidden automatically.

## Environment variables

Set these in `.env.local` (never commit it):

| Variable                        | Where it's used                                                           |
| ------------------------------- | ------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | client + server                                                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server (RLS-scoped)                                              |
| `SUPABASE_SERVICE_ROLE_KEY`     | **server-only** — seed script / admin tasks. Never expose to the browser. |
