# Lume

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-19-blue)
![TanStack Start](https://img.shields.io/badge/TanStack_Start-latest-orange)
![Supabase](https://img.shields.io/badge/Supabase-Auth-green)

A social platform for meeting strangers through ephemeral text chat and lightweight multiplayer games. A safer, game-forward alternative to **Omegle** and **rumi.social**.

Built with **TanStack Start** (React 19 + Vite 7 + Nitro SSR), **Supabase** (Auth, Realtime, Edge Functions, pg_cron), **Tailwind v4**, and **shadcn/ui**.

[![Live Demo](public/og-image.svg)](https://lume.chat)

**[Live Demo](https://lume.chat)** · **[PRD](docs/PRD.md)** · **[Testing strategy](docs/TESTING.md)**

## What's Included

- **Auth** — Email/password signup, login, password reset (no OAuth). Signup → onboarding → dashboard.
- **Onboarding** — 18+ age gate, display name, DOB, gender, region, interest tags, Terms & Privacy consent.
- **Lobby** — Editorial feed with greeting, hero match card, games rail, conversation starters, and vibe preview. Live online counter via Supabase Presence.
- **Matchmaking** — Server-authoritative pairing via an Edge Function invoked by pg_cron every 2 s. Scores interest overlap + region match + age proximity; respects blocks and a recent-pair cooldown.
- **Realtime chat** — Supabase Broadcast, messages never persisted, typing indicator, presence, end/disconnect states, elapsed timer.
- **Games** — 7 inline 2-player games: Tic Tac Toe, Trivia, Would You Rather, Rock Paper Scissors, Two Truths & a Lie, Emoji Charades, and **Draw & Guess** (with per-round difficulty picker). Each has a pure-function engine and syncs over Broadcast.
- **Safety** — Report modal (7 reasons + notes), block (silent), recent-pair cooldown (1 min), Edge Function pre-filter for blocked/recent pairs, stub legal routes at `/terms` `/privacy` `/community-guidelines`.
- **Settings** — Edit profile (name, DOB, gender, region) and interests.
- **Theme** — Light/dark toggle (persists to localStorage, no FOUC).
- **Landing site** — Hero, Features, Comparison, How It Works, FAQ, CTA, Release Notes.
- **Tooling** — Biome (lint/format), TypeScript strict, Husky pre-commit, Vercel Analytics.
- **CI/CD** — GitHub Actions for checks + Vercel deployment.

## Prerequisites

- Node.js 18+
- Docker (for local Supabase)

## Setup

```bash
npm install
```

### Start Local Supabase

```bash
npm run db:start
```

### Environment Variables

Copy the templates:

```bash
cp .env.example .env && cp .env.local.example .env.local
```

Fill in your Supabase keys (`.env` for hosted, `.env.local` for local dev).

Get the values from Supabase:

```bash
npx supabase status
```

| Variable                 | Required | Description                             |
| ------------------------ | -------- | --------------------------------------- |
| `VITE_SUPABASE_URL`      | Yes      | Supabase API URL                        |
| `VITE_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous key                  |
| `SUPABASE_SECRET_KEY`    | Yes      | Supabase service role key (for seeding) |
| `VERCEL_TOKEN`           | No       | Vercel deployment token                 |
| `VERCEL_ORG_ID`          | No       | Vercel organization ID                  |
| `VERCEL_PROJECT_ID`      | No       | Vercel project ID                       |

### Reset Database & Seed

```bash
npm run db:reset
```

This runs migrations, generates types, and seeds two test users:

| Email                | Password      | Display Name |
| -------------------- | ------------- | ------------ |
| `user-a@example.com` | `password123` | Alice        |
| `user-b@example.com` | `password123` | Bob          |

### Run Dev Server

```bash
npm run dev
```

The app runs at [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Routes

| Route                     | Description                                                              |
| ------------------------- | ------------------------------------------------------------------------ |
| `/`                       | Landing page (hero, features, comparison, how-it-works, FAQ, CTA)        |
| `/terms`                  | Terms of Service                                                         |
| `/privacy`                | Privacy Policy                                                           |
| `/community-guidelines`   | Community Guidelines                                                     |
| `/login`                  | Sign in / sign up                                                        |
| `/logout`                 | Signs out and redirects to `/`                                           |
| `/forgot-password`        | Request a password reset email                                           |
| `/reset-password`         | Set a new password (via email link)                                      |
| `/onboarding`             | Protected — 18+ age gate, profile setup, interests, consent              |
| `/dashboard`              | Protected — lobby (greeting, hero match card, games rail, starters)      |
| `/chat`                   | Protected — realtime chat with inline game panel and safety controls     |
| `/games`                  | Protected — games catalogue (browse before matching)                     |
| `/settings`               | Protected — edit profile and interests                                   |

Protected routes redirect to `/login` when signed out, and to `/onboarding` when the profile is incomplete.

### Local Email Testing

Password reset and confirmation emails are captured by Mailpit:
[http://127.0.0.1:54324](http://127.0.0.1:54324)

## Database

Core tables (see `supabase/migrations/`):

- `profiles` — auto-populated via trigger on signup; holds display name, DOB, gender, region, interests, onboarding status
- `matchmaking_queue` — pending match requests (TTL via pg_cron)
- `matches` — active pairings (server-authoritative; ephemeral)
- `reports` / `blocks` — safety tables for report + block flows

### Scripts

```bash
npm run db:start    # Start local Supabase (Docker)
npm run db:stop     # Stop local Supabase
npm run db:reset    # Reset DB, generate types, and seed
npm run db:seed     # Seed test users
npm run db:types    # Regenerate TypeScript types
npm run db:migrate  # Run pending migrations
```

Migrations are in `supabase/migrations/`. Seed data lives in `supabase/seed-data.ts` (single source of truth) and is applied by `supabase/seed.ts`.

### Edge Functions

```bash
npm run functions:serve   # Run edge functions locally
npm run functions:deploy  # Deploy to hosted Supabase
npm run functions:invoke  # Invoke a function for debugging
```

The `match-users` function is invoked every 2 seconds by a `pg_cron` job to drain the queue.

## shadcn/ui

Components are in `src/components/ui/`. To add more:

```bash
npx shadcn@latest add <component-name>
```

## Building & Checks

```bash
npm run build      # Production build (Nitro SSR + client bundle)
npm run preview    # Serve the production build locally
npm run typecheck  # TypeScript check (tsc --noEmit)
npm run check      # Biome lint + format
npm run lint       # Biome lint only
npm run format     # Biome format only
```

> There is no `npm test` script — automated testing is driven by **TestSprite** against a running preview build. See [`docs/TESTING.md`](docs/TESTING.md).

## Deployment

Configured for Vercel deployment. Set the `VERCEL_*` environment variables and push to trigger the deploy workflow. The `main` branch auto-deploys to production; every PR gets a preview URL.

## Key Files

| File                                                   | Purpose                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| `src/routes/__root.tsx`                                | Root layout with providers, header, footer, analytics                |
| `src/routes/_authenticated.tsx`                        | Auth + onboarding guard for protected routes                         |
| `src/routes/_landing.tsx`                              | Landing-site shell                                                   |
| `src/features/auth/context/auth-context.tsx`           | React context for auth state + profile                               |
| `src/features/matchmaking/`                            | Queue hooks, match UI, presence counter                              |
| `src/features/chat/`                                   | Realtime chat, typing indicator, end states, game panel host        |
| `src/features/games/`                                  | Game engines, boards, catalogue (`data/games.ts`)                    |
| `src/features/safety/`                                 | Report modal, block flow                                             |
| `src/lib/supabase/client.ts`                           | Supabase browser client singleton                                    |
| `supabase/functions/match-users/`                      | Server-authoritative matching edge function + tunable constants      |
| `supabase/migrations/`                                 | SQL schema, RLS policies, `is_recent_pair()` cooldown                |
| `docs/PRD.md`                                          | Product requirements (input for TestSprite)                          |
| `docs/TESTING.md`                                      | Test strategy, credentials, TestSprite config, gotchas               |

## Learn More

- [TanStack Start](https://tanstack.com/start)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
