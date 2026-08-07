-- ============================================================
-- Deal Room — database schema + seed data
-- Paste this whole file into the Supabase SQL Editor and Run.
-- Safe to re-run: it drops and recreates the Deal Room tables.
-- ============================================================

create extension if not exists pgcrypto;

drop table if exists public.events cascade;
drop table if exists public.milestones cascade;
drop table if exists public.options cascade;
drop table if exists public.deals cascade;

-- One row per proposal you send.
create table public.deals (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  title              text not null,
  client_name        text not null,
  client_company     text not null default '',
  intro              text not null default '',
  video_url          text,
  currency           text not null default 'USD',
  status             text not null default 'draft'
                     check (status in ('draft', 'sent', 'viewed', 'accepted')),
  signature_data_url text,
  accepted_at        timestamptz,
  created_at         timestamptz not null default now()
);

-- Line items: kind='base' is always included, kind='addon' is toggleable.
create table public.options (
  id               uuid primary key default gen_random_uuid(),
  deal_id          uuid not null references public.deals(id) on delete cascade,
  name             text not null,
  description      text not null default '',
  price_cents      integer not null default 0,
  weeks            integer not null default 0,
  kind             text not null default 'base' check (kind in ('base', 'addon')),
  default_selected boolean not null default false,
  sort_order       integer not null default 0
);

-- Timeline phases shown on the public roadmap.
create table public.milestones (
  id           uuid primary key default gen_random_uuid(),
  deal_id      uuid not null references public.deals(id) on delete cascade,
  title        text not null,
  deliverables text[] not null default '{}',
  week_start   integer not null default 0,
  week_length  integer not null default 1,
  sort_order   integer not null default 0
);

-- Client activity captured from the public proposal page.
create table public.events (
  id         uuid primary key default gen_random_uuid(),
  deal_id    uuid not null references public.deals(id) on delete cascade,
  type       text not null check (type in ('view', 'section_view', 'option_toggle', 'accept')),
  meta       jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index options_deal_id_idx on public.options (deal_id);
create index milestones_deal_id_idx on public.milestones (deal_id);
create index events_deal_id_idx on public.events (deal_id);

-- ============================================================
-- Seed data
-- ============================================================

-- Deal 1: a realistic proposal that has already been sent & viewed
insert into public.deals (id, slug, title, client_name, client_company, intro, currency, status) values (
  '11111111-1111-1111-1111-111111111111',
  'greencafe-mobile-app',
  'Mobile App for GreenCafe',
  'Sarah Mitchell',
  'GreenCafe',
  'Hi Sarah — thanks for walking me through GreenCafe''s plans last week. Below is exactly how I''d get your ordering app into your customers'' hands in about seven weeks: what''s included, what it costs, and what happens at every step. Toggle the add-ons to shape the package, and when it feels right, accept directly on this page.',
  'USD',
  'sent'
);

insert into public.options (deal_id, name, description, price_cents, weeks, kind, default_selected, sort_order) values
  ('11111111-1111-1111-1111-111111111111', 'Discovery & UX',
   'Stakeholder interviews, user flows and clickable wireframes for the full ordering journey.',
   180000, 1, 'base', false, 0),
  ('11111111-1111-1111-1111-111111111111', 'UI Design',
   'A lightweight design system plus high-fidelity screens for every core flow, ready for development.',
   260000, 2, 'base', false, 1),
  ('11111111-1111-1111-1111-111111111111', 'Flutter App Development',
   'One codebase, native iOS & Android builds. Menu, ordering and payments wired end-to-end.',
   640000, 4, 'base', false, 2),
  ('11111111-1111-1111-1111-111111111111', 'Admin Dashboard',
   'A web dashboard for your team to manage menu items, prices, orders and opening hours.',
   220000, 2, 'addon', true, 3),
  ('11111111-1111-1111-1111-111111111111', 'Loyalty Program Module',
   'Digital punch-cards, points and rewards to keep regulars coming back.',
   140000, 1, 'addon', false, 4),
  ('11111111-1111-1111-1111-111111111111', '3-Month Support',
   'Bug fixes, app store updates and a monthly check-in call after launch. No extra time added.',
   90000, 0, 'addon', false, 5);

insert into public.milestones (deal_id, title, deliverables, week_start, week_length, sort_order) values
  ('11111111-1111-1111-1111-111111111111', 'Discovery & UX',
   array['Kickoff workshop', 'User flows for ordering & pickup', 'Clickable wireframes'],
   0, 1, 0),
  ('11111111-1111-1111-1111-111111111111', 'UI Design',
   array['Design system & brand application', 'High-fidelity screens', 'Interactive prototype for sign-off'],
   1, 2, 1),
  ('11111111-1111-1111-1111-111111111111', 'Build & Launch',
   array['iOS & Android builds', 'Ordering + payment integration', 'App Store & Play Store submission'],
   3, 4, 2);

-- A few sample events so the dashboard analytics have something to show
insert into public.events (deal_id, type, meta, created_at) values
  ('11111111-1111-1111-1111-111111111111', 'view', '{}', now() - interval '3 days'),
  ('11111111-1111-1111-1111-111111111111', 'section_view', '{"section": "scope"}', now() - interval '3 days' + interval '1 minute'),
  ('11111111-1111-1111-1111-111111111111', 'section_view', '{"section": "pricing"}', now() - interval '3 days' + interval '3 minutes'),
  ('11111111-1111-1111-1111-111111111111', 'option_toggle', '{"option_name": "Loyalty Program Module", "selected": true}', now() - interval '3 days' + interval '4 minutes'),
  ('11111111-1111-1111-1111-111111111111', 'view', '{}', now() - interval '2 days'),
  ('11111111-1111-1111-1111-111111111111', 'option_toggle', '{"option_name": "Loyalty Program Module", "selected": false}', now() - interval '2 days' + interval '2 minutes'),
  ('11111111-1111-1111-1111-111111111111', 'option_toggle', '{"option_name": "3-Month Support", "selected": true}', now() - interval '2 days' + interval '5 minutes'),
  ('11111111-1111-1111-1111-111111111111', 'view', '{}', now() - interval '1 day'),
  ('11111111-1111-1111-1111-111111111111', 'section_view', '{"section": "timeline"}', now() - interval '1 day' + interval '2 minutes'),
  ('11111111-1111-1111-1111-111111111111', 'view', '{}', now() - interval '6 hours'),
  ('11111111-1111-1111-1111-111111111111', 'view', '{}', now() - interval '1 hour');

-- Deal 2: a minimal draft
insert into public.deals (id, slug, title, client_name, client_company, intro, currency, status) values (
  '22222222-2222-2222-2222-222222222222',
  'nordic-yoga-landing',
  'Landing Page for Nordic Yoga Studio',
  'Elin Berg',
  'Nordic Yoga Studio',
  'Hi Elin — here''s the plan for a calm, fast landing page that turns visitors into class bookings.',
  'USD',
  'draft'
);

insert into public.options (deal_id, name, description, price_cents, weeks, kind, default_selected, sort_order) values
  ('22222222-2222-2222-2222-222222222222', 'Landing Page Design & Build',
   'A single-page site: hero, class schedule, pricing and contact. Fast, responsive, easy to update.',
   120000, 1, 'base', false, 0);

insert into public.milestones (deal_id, title, deliverables, week_start, week_length, sort_order) values
  ('22222222-2222-2222-2222-222222222222', 'Design & Launch',
   array['Copy & layout', 'Responsive build', 'Domain setup & launch'],
   0, 1, 0);
