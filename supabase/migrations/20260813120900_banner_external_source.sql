-- BANNERS — external image source support (CDN-hosted images).
-- Backward compatible: existing rows keep image_source = 'storage' and their
-- image_path untouched; no migration of existing records is needed.
--
--   image_source: 'storage' (Supabase Storage, existing behavior) or
--                 'external' (approved external CDN URL, e.g. cdn.masom.com)
--   external_url: the https URL for external-source banners (null otherwise)
--   image_path :  now nullable — storage object path (storage source only)

alter table public.banners
  add column if not exists image_source text not null default 'storage';

alter table public.banners
  add column if not exists external_url text;

-- image_path is no longer required for external-source banners. The
-- image_source column KEEPS its 'storage' default so legacy/seed inserts that
-- do not mention it stay valid and default to storage (backward compatible).
alter table public.banners
  alter column image_path drop not null;

-- Guard rails: valid source values; external rows must carry a URL.
alter table public.banners
  drop constraint if exists banners_image_source_check;
alter table public.banners
  add constraint banners_image_source_check
    check (image_source in ('storage', 'external'));

alter table public.banners
  drop constraint if exists banners_external_url_required;
alter table public.banners
  add constraint banners_external_url_required
    check (image_source <> 'external' or (external_url is not null and external_url <> ''));

-- Small helper so admin list queries can cheaply find external rows.
create index if not exists banners_external_source_idx
  on public.banners (id)
  where image_source = 'external';
