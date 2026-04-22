-- LMNTM core schema
-- All tables have Row Level Security enabled by default.

create extension if not exists "pgcrypto";

-- =============================================================================
-- entitlements: unlocks a user holds (chapter-N or full-book).
-- =============================================================================
create table if not exists public.entitlements (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  sku            text not null check (sku in ('chapter', 'full-book')),
  chapter_number int  check (sku <> 'chapter' or (chapter_number between 1 and 13)),
  source         text not null default 'stripe' check (source in ('stripe', 'gift', 'comp')),
  stripe_session_id text,
  created_at     timestamptz not null default now(),
  unique (user_id, sku, chapter_number)
);

create index if not exists entitlements_user_id_idx on public.entitlements(user_id);

alter table public.entitlements enable row level security;

create policy "entitlements_read_own"
  on public.entitlements for select
  using (auth.uid() = user_id);

-- Writes are only allowed via service-role (Stripe webhook handler). No INSERT
-- / UPDATE / DELETE policies = anon & authenticated users cannot mutate.

-- =============================================================================
-- stripe_events: idempotency log. Webhook handler inserts the event id; a
-- unique constraint prevents double-fulfillment on retried deliveries.
-- =============================================================================
create table if not exists public.stripe_events (
  id          text primary key,       -- Stripe event id (evt_...)
  type        text not null,
  created_at  timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.stripe_events enable row level security;
-- No policies: only service-role may read/write.

-- =============================================================================
-- age_verifications: 18+ self-attestation and parental-consent flow.
-- =============================================================================
create table if not exists public.age_verifications (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  birthdate           date not null,
  is_adult            boolean not null,
  parent_first_name   text,
  parent_last_name    text,
  parent_email        citext,
  parent_phone        text,
  consent_token       text,   -- opaque, emailed to the parent
  consent_sent_at     timestamptz,
  consent_granted_at  timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint minor_needs_parent_info check (
    is_adult or (parent_email is not null and parent_first_name is not null
                 and parent_last_name is not null and parent_phone is not null)
  )
);

create extension if not exists citext;

alter table public.age_verifications enable row level security;

create policy "age_verifications_read_own"
  on public.age_verifications for select
  using (auth.uid() = user_id);

create policy "age_verifications_insert_own"
  on public.age_verifications for insert
  with check (auth.uid() = user_id);

create policy "age_verifications_update_own"
  on public.age_verifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- purchase_audit: append-only audit trail for compliance + support.
-- =============================================================================
create table if not exists public.purchase_audit (
  id           bigint generated always as identity primary key,
  user_id      uuid references auth.users(id) on delete set null,
  event        text not null,    -- e.g. 'checkout.session.completed'
  stripe_id    text,
  amount_cents int,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);

alter table public.purchase_audit enable row level security;
-- Service role only.

-- =============================================================================
-- updated_at triggers
-- =============================================================================
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_age_verifications_updated on public.age_verifications;
create trigger trg_age_verifications_updated
  before update on public.age_verifications
  for each row execute function public.set_updated_at();
