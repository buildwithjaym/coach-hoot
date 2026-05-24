create extension if not exists "pgcrypto";

create table if not exists public.coachhoot_waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  full_name text not null,
  email text not null unique,
  phone text,

  exam_type text not null,
  target_exam text not null,
  review_stage text not null,
  review_struggle text not null,
  top_need text not null,
  offline_need text not null,
  price_interest text not null,

  biggest_value text,
  message text,

  source text,
  landing_variant text,
  user_agent text
);

alter table public.coachhoot_waitlist enable row level security;

drop policy if exists "Allow public validation form inserts" on public.coachhoot_waitlist;

create policy "Allow public validation form inserts"
on public.coachhoot_waitlist
for insert
to anon
with check (true);