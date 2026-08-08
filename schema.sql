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

-- Deal 4: the fun one — Yurii from LYQX already signed it (shows the accepted state)
insert into public.deals (id, slug, title, client_name, client_company, intro, outcomes, project_type, currency, status, signature_data_url, accepted_at) values (
  '44444444-4444-4444-4444-444444444444',
  'lyqx-brand-website',
  'Brand & Website for LYQX',
  'Yurii',
  'LYQX',
  'Hey Yurii — here''s the plan to give LYQX a brand and website as sharp as the work it ships: a proper identity system and a motion-first site, live in five focused weeks.',
  array[
    'A brand that looks expensive before the first call',
    'A motion-first site that sells LYQX while you sleep',
    'Launch-ready in five weeks — assets, guidelines, everything'
  ],
  'branding',
  'USD',
  'accepted',
  'data:image/png;base64,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',
  now() - interval '1 day'
);

insert into public.options (deal_id, name, description, price_cents, weeks, kind, default_selected, sort_order) values
  ('44444444-4444-4444-4444-444444444444', 'Brand Identity System',
   'Logo, palette, type and guidelines — a system, not just a mark.',
   240000, 2, 'base', false, 0),
  ('44444444-4444-4444-4444-444444444444', 'Website Design & Build',
   'A motion-first marketing site: design, build, CMS and launch.',
   360000, 3, 'base', false, 1),
  ('44444444-4444-4444-4444-444444444444', 'Motion Pack',
   'Logo animation, page transitions and scroll moments across the whole site.',
   120000, 1, 'addon', true, 2),
  ('44444444-4444-4444-4444-444444444444', '3-Month Care',
   'Tweaks, updates and a monthly check-in after launch. No extra time added.',
   60000, 0, 'addon', false, 3);

insert into public.milestones (deal_id, title, deliverables, week_start, week_length, sort_order) values
  ('44444444-4444-4444-4444-444444444444', 'Identity',
   array['Discovery & moodboards', 'Logo & system design', 'Brand guidelines'],
   0, 2, 0),
  ('44444444-4444-4444-4444-444444444444', 'Design & Build',
   array['Site design', 'Build & motion pass', 'Launch'],
   2, 3, 1);

insert into public.comments (deal_id, author_name, author_role, body, created_at) values
  ('44444444-4444-4444-4444-444444444444', 'Yurii', 'client',
   'Can we launch before the Replit challenge deadline? 😄',
   now() - interval '2 days'),
  ('44444444-4444-4444-4444-444444444444', 'Alex', 'owner',
   'You signed today, so yes — LYQX ships fast.',
   now() - interval '1 day' + interval '2 hours');

insert into public.events (deal_id, type, meta, created_at) values
  ('44444444-4444-4444-4444-444444444444', 'view', '{}', now() - interval '4 days'),
  ('44444444-4444-4444-4444-444444444444', 'section_view', '{"section": "pricing"}', now() - interval '4 days' + interval '2 minutes'),
  ('44444444-4444-4444-4444-444444444444', 'option_toggle', '{"option_name": "Motion Pack", "selected": true}', now() - interval '4 days' + interval '3 minutes'),
  ('44444444-4444-4444-4444-444444444444', 'view', '{}', now() - interval '2 days'),
  ('44444444-4444-4444-4444-444444444444', 'comment', '{"author_name": "Yurii"}', now() - interval '2 days'),
  ('44444444-4444-4444-4444-444444444444', 'view', '{}', now() - interval '1 day'),
  ('44444444-4444-4444-4444-444444444444', 'accept', '{"selected_options": ["Motion Pack"]}', now() - interval '1 day');
