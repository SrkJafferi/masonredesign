-- MASOM CMS media storage: public-read buckets for banner and program images.
-- Uploads/updates/deletes are restricted to authenticated admins.

-- ---------------------------------------------------------------------------
-- Buckets. public = true grants read via the public object URL only;
-- write access is still governed by the RLS policies below.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('banners', 'banners', true),
  ('programs', 'programs', true)
on conflict (id) do nothing;

-- storage.objects already has RLS enabled by Supabase; we only add policies.

-- Anyone may read objects in the CMS buckets (needed for <img> on the site).
drop policy if exists "cms_media_public_read" on storage.objects;
create policy "cms_media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('banners', 'programs'));

-- Only admins may upload.
drop policy if exists "cms_media_admin_insert" on storage.objects;
create policy "cms_media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('banners', 'programs') and public.is_admin());

-- Only admins may replace/move.
drop policy if exists "cms_media_admin_update" on storage.objects;
create policy "cms_media_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id in ('banners', 'programs') and public.is_admin())
  with check (bucket_id in ('banners', 'programs') and public.is_admin());

-- Only admins may delete (used when cleaning up orphaned media).
drop policy if exists "cms_media_admin_delete" on storage.objects;
create policy "cms_media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id in ('banners', 'programs') and public.is_admin());
