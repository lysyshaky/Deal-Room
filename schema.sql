-- ============================================================
-- Deal Room — database schema + seed data
-- Paste this whole file into the Supabase SQL Editor and Run.
-- Safe to re-run: it drops and recreates the Deal Room tables.
-- ============================================================

create extension if not exists pgcrypto;

drop table if exists public.comments cascade;
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
  outcomes           text[] not null default '{}',
  project_type       text not null default 'other'
                     check (project_type in ('mobile', 'web', 'motion', 'branding', 'uxui', 'other')),
  valid_until        timestamptz,
  accent_color       text,
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

-- Questions & replies on a proposal (client asks, owner answers).
create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references public.deals(id) on delete cascade,
  author_name text not null,
  author_role text not null default 'client' check (author_role in ('client', 'owner')),
  body        text not null,
  created_at  timestamptz not null default now()
);

-- Client activity captured from the public proposal page.
create table public.events (
  id         uuid primary key default gen_random_uuid(),
  deal_id    uuid not null references public.deals(id) on delete cascade,
  type       text not null check (type in ('view', 'section_view', 'option_toggle', 'accept', 'comment')),
  meta       jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index comments_deal_id_idx on public.comments (deal_id);
create index options_deal_id_idx on public.options (deal_id);
create index milestones_deal_id_idx on public.milestones (deal_id);
create index events_deal_id_idx on public.events (deal_id);

-- ============================================================
-- Seed data
-- ============================================================

-- Deal 1: a realistic proposal that has already been sent & viewed
-- (video_url points at the demo video bundled with the template in client/public)
insert into public.deals (id, slug, title, client_name, client_company, intro, video_url, outcomes, project_type, valid_until, currency, status) values (
  '11111111-1111-1111-1111-111111111111',
  'greencafe-mobile-app',
  'Mobile App for GreenCafe',
  'Sarah Mitchell',
  'GreenCafe',
  'Hi Sarah — thanks for walking me through GreenCafe''s plans last week. Below is exactly how I''d get your ordering app into your customers'' hands in about seven weeks: what''s included, what it costs, and what happens at every step. Toggle the add-ons to shape the package, and when it feels right, accept directly on this page.',
  '/demo.mp4',
  array[
    'Customers order ahead and skip the line — more covers at peak hours',
    'Your team updates the menu and prices without touching a developer',
    'GreenCafe live on the App Store and Google Play in nine weeks'
  ],
  'mobile',
  now() + interval '14 days',
  'USD',
  'sent'
);

insert into public.comments (deal_id, author_name, author_role, body, created_at) values
  ('11111111-1111-1111-1111-111111111111', 'Sarah Mitchell', 'client',
   'Quick one — does the Admin Dashboard include staff accounts with different permission levels?',
   now() - interval '2 days' + interval '6 minutes'),
  ('11111111-1111-1111-1111-111111111111', 'Alex', 'owner',
   'Yes — owner and staff roles are included out of the box. More granular permissions are an easy later add.',
   now() - interval '1 day' + interval '3 hours');

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
  ('11111111-1111-1111-1111-111111111111', 'comment', '{"author_name": "Sarah Mitchell"}', now() - interval '2 days' + interval '6 minutes'),
  ('11111111-1111-1111-1111-111111111111', 'view', '{}', now() - interval '6 hours'),
  ('11111111-1111-1111-1111-111111111111', 'view', '{}', now() - interval '1 hour');

-- Deal 2: a website project (still a draft in the dashboard)
insert into public.deals (id, slug, title, client_name, client_company, intro, outcomes, project_type, currency, status) values (
  '22222222-2222-2222-2222-222222222222',
  'nordic-yoga-landing',
  'Landing Page for Nordic Yoga Studio',
  'Elin Berg',
  'Nordic Yoga Studio',
  'Hi Elin — here''s the plan for a calm, fast landing page that turns visitors into booked mats. Two focused weeks, and the booking add-on means people can reserve a class without ever leaving the page.',
  array[
    'Visitors book a mat in two taps, straight from the page',
    'Loads in under a second on any phone',
    'You update the schedule and pricing yourself — no retainer needed'
  ],
  'web',
  'USD',
  'draft'
);

insert into public.options (deal_id, name, description, price_cents, weeks, kind, default_selected, sort_order) values
  ('22222222-2222-2222-2222-222222222222', 'Copy & Art Direction',
   'Voice, structure and a moodboard that fits the studio''s calm, minimal brand.',
   90000, 1, 'base', false, 0),
  ('22222222-2222-2222-2222-222222222222', 'Design & Build',
   'A fast one-pager: hero, class schedule, pricing, testimonials and contact. Responsive and easy to update.',
   160000, 1, 'base', false, 1),
  ('22222222-2222-2222-2222-222222222222', 'Class Booking Integration',
   'Your booking system embedded on the page — visitors reserve a mat in two taps.',
   60000, 1, 'addon', true, 2),
  ('22222222-2222-2222-2222-222222222222', 'SEO & Analytics Setup',
   'Technical SEO, meta tags and privacy-friendly analytics from day one.',
   40000, 0, 'addon', false, 3);

insert into public.milestones (deal_id, title, deliverables, week_start, week_length, sort_order) values
  ('22222222-2222-2222-2222-222222222222', 'Copy & Direction',
   array['Content workshop', 'Sitemap & copy draft', 'Moodboard sign-off'],
   0, 1, 0),
  ('22222222-2222-2222-2222-222222222222', 'Design & Launch',
   array['Responsive build', 'Booking embed', 'Launch checklist & handover'],
   1, 1, 1);

-- Deal 3: a motion / animation project, sent & getting attention
insert into public.deals (id, slug, title, client_name, client_company, intro, outcomes, project_type, valid_until, accent_color, currency, status) values (
  '33333333-3333-3333-3333-333333333333',
  'pulse-brand-motion',
  'Brand Motion Package for Pulse Fitness',
  'Marcus Reed',
  'Pulse Fitness',
  'Hey Marcus — here''s how we''ll bring the new Pulse brand to life in motion: a reusable motion system, a hero spot for the launch, and cutdowns for every channel. Toggle the add-ons to match the launch plan, and accept right here when you''re ready.',
  array[
    'A motion identity people recognize mid-scroll',
    'A launch spot ready for paid and organic from day one',
    'A reusable kit — every future video starts at 80% done'
  ],
  'motion',
  now() + interval '10 days',
  '#6D28D9',
  'USD',
  'sent'
);

insert into public.options (deal_id, name, description, price_cents, weeks, kind, default_selected, sort_order) values
  ('33333333-3333-3333-3333-333333333333', 'Motion Discovery & Storyboards',
   'Creative direction, references and frame-by-frame storyboards for the launch spot.',
   120000, 1, 'base', false, 0),
  ('33333333-3333-3333-3333-333333333333', 'Brand Motion System',
   'Logo animation, kinetic type and a transition kit — a reusable motion language for everything you ship.',
   280000, 2, 'base', false, 1),
  ('33333333-3333-3333-3333-333333333333', 'Hero Launch Animation',
   'A 30-second hero spot delivered in 16:9 and 1:1, fully graded and mixed.',
   320000, 2, 'base', false, 2),
  ('33333333-3333-3333-3333-333333333333', 'Social Cuts Pack',
   'Six 9:16 cutdowns sized and subtitled for Reels, TikTok and Shorts.',
   110000, 1, 'addon', true, 3),
  ('33333333-3333-3333-3333-333333333333', 'Lottie Web Animations',
   'Key brand animations exported as Lottie files for your site and app.',
   160000, 1, 'addon', false, 4),
  ('33333333-3333-3333-3333-333333333333', 'Sound Design',
   'A custom sound identity and final mix across every deliverable. No extra time added.',
   80000, 0, 'addon', false, 5);

insert into public.milestones (deal_id, title, deliverables, week_start, week_length, sort_order) values
  ('33333333-3333-3333-3333-333333333333', 'Discovery & Boards',
   array['Creative direction deck', 'Storyboards', 'Animatic for sign-off'],
   0, 1, 0),
  ('33333333-3333-3333-3333-333333333333', 'Motion System',
   array['Logo & type animation', 'Transition kit', 'Usage guidelines'],
   1, 2, 1),
  ('33333333-3333-3333-3333-333333333333', 'Hero Spot & Delivery',
   array['Animation & grade', 'Sound mix', 'Final files in every format'],
   3, 2, 2);

insert into public.events (deal_id, type, meta, created_at) values
  ('33333333-3333-3333-3333-333333333333', 'view', '{}', now() - interval '2 days'),
  ('33333333-3333-3333-3333-333333333333', 'section_view', '{"section": "pricing"}', now() - interval '2 days' + interval '2 minutes'),
  ('33333333-3333-3333-3333-333333333333', 'option_toggle', '{"option_name": "Lottie Web Animations", "selected": true}', now() - interval '2 days' + interval '3 minutes'),
  ('33333333-3333-3333-3333-333333333333', 'view', '{}', now() - interval '1 day'),
  ('33333333-3333-3333-3333-333333333333', 'option_toggle', '{"option_name": "Lottie Web Animations", "selected": false}', now() - interval '1 day' + interval '1 minute'),
  ('33333333-3333-3333-3333-333333333333', 'option_toggle', '{"option_name": "Sound Design", "selected": true}', now() - interval '1 day' + interval '2 minutes'),
  ('33333333-3333-3333-3333-333333333333', 'view', '{}', now() - interval '8 hours'),
  ('33333333-3333-3333-3333-333333333333', 'view', '{}', now() - interval '2 hours'),
  ('33333333-3333-3333-3333-333333333333', 'section_view', '{"section": "timeline"}', now() - interval '2 hours' + interval '1 minute');
