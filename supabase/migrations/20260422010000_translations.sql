-- Cached section translations. Keyed by (section_id, locale) so each
-- language is computed once per section rather than per page view.

create table if not exists public.translations (
  section_id text not null,
  locale     text not null,
  body       text not null,
  provider   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (section_id, locale)
);

alter table public.translations enable row level security;

-- Reads are available to anyone signed in — paywall is enforced at the API
-- layer, which gates translation requests on entitlements.
create policy "translations_read_all_authenticated"
  on public.translations for select
  to authenticated
  using (true);

-- Writes only via service-role.
create trigger trg_translations_updated
  before update on public.translations
  for each row execute function public.set_updated_at();
