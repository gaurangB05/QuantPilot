-- Run this in Supabase Dashboard → SQL Editor

-- Per-user Kite Connect app credentials (BYOK automation)
alter table user_kite_tokens
  add column if not exists api_key text,
  add column if not exists api_secret text;

-- Tracks in-progress automated onboarding sessions (Steel.dev browser sessions)
create table if not exists kite_onboard_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  steel_session_id text not null,
  zerodha_client_id text not null,
  status text not null default 'pending', -- pending | in_progress | done | failed
  error_message text,
  created_at timestamptz not null default now()
);

alter table kite_onboard_sessions enable row level security;

create policy "Users can view their own onboarding sessions"
  on kite_onboard_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create their own onboarding sessions"
  on kite_onboard_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own onboarding sessions"
  on kite_onboard_sessions for update
  using (auth.uid() = user_id);
