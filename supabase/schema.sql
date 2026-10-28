-- ASTERA-X schema for Supabase (PostgreSQL).
-- Run in Supabase SQL Editor before seed.sql. Safe to re-run (drops first).
-- gen_random_uuid() is built into PostgreSQL 13+.


drop table if exists insight_reports, social_posts, social_metrics, content_plans, events,
  chat_messages, chat_sessions, product_faqs, products cascade;

-- Public catalogue ---------------------------------------------------------

create table products (
  code              text primary key,
  name              text not null,
  category          text not null check (category in ('kompor', 'kompor-cap', 'canting')),
  price             integer not null check (price >= 0),
  specs             jsonb not null default '[]'::jsonb,   -- [{label, value}], only known values
  tkdn              text,
  sni               boolean not null default false,
  image             text not null,
  gallery           jsonb not null default '[]'::jsonb,
  marketplace_links jsonb not null default '{}'::jsonb,   -- {shopee?, tokopedia?}
  note              text
);

create table product_faqs (
  id           text primary key,
  product_code text not null references products (code) on delete cascade,
  question     text not null,
  answer       text not null,
  source       text not null check (source in ('manual', 'generated'))
);
create index product_faqs_product_idx on product_faqs (product_code);

-- Chatbot & tracking (written only by route handlers with the service role) --

create table chat_sessions (
  id           uuid primary key,
  product_code text not null references products (code) on delete cascade,
  started_at   timestamptz not null default now()
);

create table chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions (id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null check (char_length(content) <= 4000),
  created_at timestamptz not null default now(),
  topic      text
);
create index chat_messages_role_created_idx on chat_messages (role, created_at desc);

create table events (
  id           uuid primary key default gen_random_uuid(),
  product_code text not null references products (code) on delete cascade,
  type         text not null check (type in ('qr_scan', 'page_view', 'chat_open', 'marketplace_click')),
  meta         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index events_created_idx on events (created_at desc);

-- Dashboard ----------------------------------------------------------------

create table content_plans (
  id            uuid primary key default gen_random_uuid(),
  platform      text not null check (platform in ('instagram', 'tiktok')),
  title         text not null,
  caption       text not null default '',
  format        text not null,
  scheduled_at  timestamptz not null,
  status        text not null check (status in ('idea', 'draft', 'scheduled', 'posted')),
  product_code  text references products (code) on delete set null,
  created_by_ai boolean not null default false,
  created_at    timestamptz not null default now()
);
create index content_plans_scheduled_idx on content_plans (scheduled_at);

create table social_metrics (
  id                 bigint generated always as identity primary key,
  platform           text not null check (platform in ('tiktok', 'instagram', 'shopee', 'youtube')),
  date               date not null,
  impressions        integer not null default 0,
  engagement         integer not null default 0,
  profile_visits     integer not null default 0,
  marketplace_clicks integer not null default 0,
  purchases          integer not null default 0,
  followers          integer not null default 0,
  unique (platform, date)
);

create table social_posts (
  id          text primary key,
  platform    text not null check (platform in ('tiktok', 'instagram', 'shopee', 'youtube')),
  title       text not null,
  posted_at   timestamptz not null,
  format      text not null check (format in ('reel', 'carousel', 'video', 'live')),
  impressions integer not null default 0,
  likes       integer not null default 0,
  comments    integer not null default 0,
  shares      integer not null default 0,
  saves       integer not null default 0,
  clicks      integer not null default 0,
  purchases   integer not null default 0
);

-- Extra (not in the original brief): latest AI summary of customer questions.
create table insight_reports (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  total_messages integer not null,
  topics         jsonb not null,
  demo           boolean not null default false
);

-- Row Level Security -------------------------------------------------------
-- The app's server uses the service role key (bypasses RLS). These policies
-- protect direct access with the anon key / Supabase Auth users.

alter table products        enable row level security;
alter table product_faqs    enable row level security;
alter table chat_sessions   enable row level security;
alter table chat_messages   enable row level security;
alter table events          enable row level security;
alter table content_plans   enable row level security;
alter table social_metrics  enable row level security;
alter table social_posts    enable row level security;
alter table insight_reports enable row level security;

-- Public content: readable by everyone.
create policy "public read products" on products for select to anon, authenticated using (true);
create policy "public read faqs" on product_faqs for select to anon, authenticated using (true);

-- chat_* and events: no anon policies, so anon can neither read nor write.
-- Writes happen only through /api/chat and /api/track (service role).
create policy "admin read chat sessions" on chat_sessions for select to authenticated using (true);
create policy "admin read chat messages" on chat_messages for select to authenticated using (true);
create policy "admin update chat topics" on chat_messages for update to authenticated using (true) with check (true);
create policy "admin read events" on events for select to authenticated using (true);

-- Dashboard tables: authenticated (admin) users only.
create policy "admin all content plans" on content_plans for all to authenticated using (true) with check (true);
create policy "admin read metrics" on social_metrics for select to authenticated using (true);
create policy "admin read posts" on social_posts for select to authenticated using (true);
create policy "admin all insight reports" on insight_reports for all to authenticated using (true) with check (true);
