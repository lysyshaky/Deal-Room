# Deal Room

**Interactive proposal pages for freelancers & agencies — send a deal room, not a PDF.**

Your client gets a beautiful mobile-friendly page where they can watch your intro video, toggle add-ons to build their own package (price and timeline update live), explore an interactive project roadmap, and accept with a real signature — confetti included. You get a dashboard that shows exactly what they looked at and which options they kept flipping on and off.

No AI, no third-party proposal tools — just React, Express and a free Supabase database.

---

## Quick start (≈5 minutes)

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), sign in, and click **New project** (the free tier is plenty). Any name and region work.

### 2. Create the tables

In your Supabase project, open **SQL Editor** (left sidebar) → **New query**, paste the entire contents of [`schema.sql`](schema.sql) from this repo, and click **Run**.

That's the whole database setup — it creates 4 tables and seeds them with two example deals so the app isn't empty on first run.

### 3. Copy your two keys

In Supabase go to **Project Settings → API** and copy:

- **Project URL** → `SUPABASE_URL`
- **service_role key** (under "Project API keys") → `SUPABASE_SERVICE_KEY`

> ⚠️ Use the `service_role` key, not `anon`. It never leaves the server — the browser only ever talks to the Express API.

**On Replit:** open the **Secrets** tool (padlock icon) and add both keys there.
**Locally:** copy `.env.example` to `.env` and fill them in:

```bash
cp .env.example .env
```

Optionally set `ADMIN_PASSCODE` to any string to lock the dashboard behind a passcode. Leave it empty and the dashboard is open (fine while trying things out).

### 4. Run it

```bash
npm install
npm run dev
```

Open the app (port 5000 locally, or just hit Run on Replit):

- **`/`** — the landing page with a tour of the template.
- **`/dashboard`** — your deal list. You'll see the seeded "Mobile App for GreenCafe" deal.
- **`/deal/greencafe-mobile-app`** — the public proposal page your client would receive. Try toggling the add-ons and accepting it.
- **`/design`** — the bundled design system: color tokens, type scale, and every reusable component.

If you skipped a step, the app shows a friendly setup screen instead of crashing — it tells you exactly what's missing.

---

## How it works

```
client/   React 18 + Vite + Tailwind + framer-motion (the UI)
server/   Express + TypeScript (all API + serves the client)
shared/   zod schemas + TypeScript types used by both sides
```

- **One port.** In dev, Express runs Vite in middleware mode; in production it serves the built client from `dist/public`. API lives under `/api`. Binds `0.0.0.0`, port `PORT` or `5000` — exactly what Replit expects.
- **Supabase is server-side only.** The browser never holds a Supabase key and RLS isn't needed; every read/write goes through the Express API, which validates input with zod.

### The database (`schema.sql`)

| Table        | What it stores                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| `deals`      | One row per proposal: title, client, intro, status (`draft → sent → viewed → accepted`), signature, timestamps      |
| `options`    | Line items. `kind='base'` are always included; `kind='addon'` are the toggles clients flip on the proposal page     |
| `milestones` | Roadmap phases (`week_start`, `week_length`, deliverables) shown on the interactive timeline                        |
| `events`     | Client activity from the public page: `view`, `section_view`, `option_toggle`, `accept` — powers the analytics tab |

Statuses move automatically: a deal marked `sent` flips to `viewed` the first time the client opens it, and to `accepted` when they sign.

### API overview

| Method & path                       | Purpose                                    |
| ----------------------------------- | ------------------------------------------ |
| `GET  /api/config`                  | Is Supabase configured? Is a passcode set? |
| `GET  /api/deals`                   | Deal list with view counts (owner)         |
| `POST /api/deals` / `PUT /:id`      | Create / update a deal with options & milestones (owner) |
| `GET  /api/deals/:id/analytics`     | Views, event feed, most-toggled options (owner) |
| `GET  /api/public/deals/:slug`      | Full proposal for the public page          |
| `POST /api/public/deals/:slug/events` | Record a client activity event           |
| `POST /api/public/deals/:slug/accept` | Accept: saves signature + timestamp      |

Owner routes require the `x-admin-passcode` header when `ADMIN_PASSCODE` is set.

---

## Production build

```bash
npm run build   # builds the client into dist/public
npm start       # Express serves API + built client on one port
```

On Replit, publishing/deploying uses these automatically (see `.replit`).

## Make it yours

- **Design system** — open `/design` in the running app to see every token and component. The whole look is driven by a few tokens in [`tailwind.config.ts`](tailwind.config.ts) (`ember`, `ink`, `cream`) and the Google Fonts link in [`client/index.html`](client/index.html) — change three hex values to rebrand.
- **"What happens next" steps** — edit `NEXT_STEPS` in [`client/src/components/deal/AcceptModal.tsx`](client/src/components/deal/AcceptModal.tsx).
- **Currencies** — every deal has a 3-letter currency code; add more choices in the editor's `CURRENCIES` list.

## Troubleshooting

- **"Supabase is not configured" screen** — the two env vars aren't visible to the server. On Replit re-check Secrets; locally re-check `.env`. Restart after changing them.
- **`relation "deals" does not exist`** — `schema.sql` hasn't been run in this Supabase project yet (step 2).
- **Dashboard asks for a passcode you don't know** — it's whatever you set as `ADMIN_PASSCODE`; clear the secret to remove the gate.
