-- Lightweight grouping for weekly and daily Program batch generation.
-- Every occurrence remains a normal, independently editable programs row.

alter table public.programs
  add column if not exists recurrence_group_id uuid null;

-- Supports future series-level lookup without changing today's public queries.
create index if not exists programs_recurrence_group_idx
  on public.programs (recurrence_group_id)
  where recurrence_group_id is not null;

comment on column public.programs.recurrence_group_id is
  'Shared UUID for occurrences created by one recurrence batch; null for ordinary programs.';
