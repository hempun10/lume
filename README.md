# Lume

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-19-blue)
![TanStack Start](https://img.shields.io/badge/TanStack_Start-latest-orange)
![Supabase](https://img.shields.io/badge/Supabase-Auth-green)
![Passmark](https://img.shields.io/badge/Tested_with-Passmark-black)

A social platform for meeting strangers through ephemeral text chat and lightweight multiplayer games. Lume is a safer, game-forward alternative to **Omegle**-style random chat.

Built with **TanStack Start** (React 19 + Vite 7 + Nitro SSR), **Supabase** (Auth, Realtime, Edge Functions, pg_cron), **Tailwind v4**, and **shadcn/ui**. Regression-tested with **[Passmark](https://github.com/bug0inc/passmark)** and Playwright for the Breaking Apps Hackathon.

**[Live Demo](https://lume-roan.vercel.app)** · **[PRD](docs/PRD.md)** · **[Passmark Test Plan](docs/PASSMARK_TEST_PLAN.md)**

## What's Included

- **Auth** — Email/password signup, login, password reset. Signup → onboarding → dashboard.
- **Onboarding** — 18+ age gate, display name, DOB, gender, region, interest tags, Terms & Privacy consent.
- **Lobby** — Editorial feed with greeting, hero match card, games rail, conversation starters, and profile preview. Live online counter via Supabase Presence.
- **Matchmaking** — Server-authoritative pairing via an Edge Function invoked by pg_cron every 2 seconds. Scores interest overlap + region match + age proximity; respects blocks and a recent-pair cooldown.
- **Realtime chat** — Supabase Broadcast, messages never persisted, typing indicator, presence, end/disconnect states, elapsed timer.
- **Games** — 7 playable inline 2-player games: Tic Tac Toe, Trivia, Would You Rather, Rock Paper Scissors, Two Truths & a Lie, Emoji Charades, and Draw & Guess. Word Chain and Chess are reserved as coming soon.
- **Safety** — Report modal, silent block, recent-pair cooldown, Edge Function pre-filter for blocked/recent pairs, and legal routes at `/terms`, `/privacy`, `/community-guidelines`.
- **Settings** — Edit profile and matching interests.
- **Theme** — Light/dark toggle with localStorage persistence and no FOUC.
- **Testing** — Passmark natural-language regression tests powered by Playwright and OpenRouter.

## Prerequisites

- Node.js 18+
- Docker for local Supabase
- An `OPENROUTER_API_KEY` for Passmark AI execution

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

Fill in your Supabase keys and Passmark/OpenRouter key.

Get local Supabase values with:

```bash
npx supabase status
```

| Variable                 | Required | Description                                      |
| ------------------------ | -------- | ------------------------------------------------ |
| `VITE_SUPABASE_URL`      | Yes      | Supabase API URL                                 |
| `VITE_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous key                           |
| `SUPABASE_SECRET_KEY`    | Yes      | Supabase service role key for seeding            |
| `OPENROUTER_API_KEY`     | For tests | OpenRouter key used by Passmark                  |
| `PLAYWRIGHT_BASE_URL`    | No       | Override test target, defaults to local `:3000`  |
| `VITE_GIPHY_API_KEY`     | No       | Enables GIF picker search in chat                |
| `VERCEL_TOKEN`           | No       | Vercel deployment token                          |
| `VERCEL_ORG_ID`          | No       | Vercel organization ID                           |
| `VERCEL_PROJECT_ID`      | No       | Vercel project ID                                |

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

| Route                   | Description                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| `/`                     | Landing page                                                         |
| `/terms`                | Terms of Service                                                     |
| `/privacy`              | Privacy Policy                                                       |
| `/community-guidelines` | Community Guidelines                                                 |
| `/login`                | Sign in / sign up                                                    |
| `/signup`               | Friendly alias for sign-up mode                                      |
| `/logout`               | Signs out and redirects to `/`                                       |
| `/forgot-password`      | Request a password reset email                                       |
| `/reset-password`       | Set a new password via email link                                    |
| `/onboarding`           | Protected profile setup                                              |
| `/dashboard`            | Protected lobby and matchmaking                                      |
| `/chat`                 | Protected realtime chat with inline game panel and safety controls   |
| `/games`                | Protected games catalogue                                            |
| `/settings`             | Protected profile and interests editor                               |

Protected routes redirect to `/login` when signed out and to `/onboarding` when the profile is incomplete.

## Database

Core tables and functions live in `supabase/migrations/`:

- `profiles` — auto-created on signup; stores profile fields and onboarding status.
- `match_queue` — pending match requests.
- `matches` — active pairings.
- `reports` / `blocks` — safety reports and silent blocks.
- `match_pair()` — security-definer RPC that rejects blocked/recent pairs.

### Scripts

```bash
npm run db:start    # Start local Supabase
npm run db:stop     # Stop local Supabase
npm run db:reset    # Reset DB, generate types, and seed
npm run db:seed     # Seed test users
npm run db:types    # Regenerate TypeScript DB types
npm run db:migrate  # Run pending migrations
```

### Edge Functions

```bash
npm run functions:serve   # Run edge functions locally
npm run functions:deploy  # Deploy edge functions
npm run functions:invoke  # Invoke a function for debugging
```

The `match-users` function drains the queue and broadcasts matches.

## Building & Checks

```bash
npm run build      # Production build
npm run preview    # Serve the production build locally
npm run typecheck  # TypeScript check
npm run check      # Biome lint + format check
npm run lint       # Biome lint only
npm run format     # Biome format only
```

## Testing with Passmark

Lume's regression suite uses **Passmark**, an AI testing library that drives Playwright from plain-English steps. This keeps the suite focused on user intent instead of brittle selectors.

### Install browsers if needed

```bash
npx playwright install chromium
```

### Run locally

```bash
npm run db:start
npm run db:reset
npm run build
npm run preview
```

In another terminal:

```bash
OPENROUTER_API_KEY=sk-or-... npm run test:e2e
npm run test:e2e:report
```

Useful variants:

```bash
npm run test:e2e:smoke      # landing/trust smoke test
npm run test:e2e:headed     # debug in a visible browser
PLAYWRIGHT_BASE_URL=https://lume-roan.vercel.app npm run test:e2e
RUN_REALTIME_PASSMARK=1 npm run test:e2e -- realtime-matchmaking.spec.ts
```

### Current Passmark coverage

The committed suite in `e2e/passmark/` covers:

- Public landing and legal pages
- Signup and onboarding validation
- Protected-route guards and invalid login
- Dashboard matching controls and cancellation
- Settings profile/preference updates
- Games catalogue availability and game-to-match flow
- Optional two-browser realtime matchmaking/chat flow

See [`docs/PASSMARK_TEST_PLAN.md`](docs/PASSMARK_TEST_PLAN.md) for the coverage matrix and known limitations.

## Deployment

Configured for Vercel deployment. Set the `VERCEL_*` environment variables and push to trigger the deployment workflow. The `main` branch deploys to production after CI and database migration checks pass.

## Key Files

| File                                                   | Purpose                                                          |
| ------------------------------------------------------ | ---------------------------------------------------------------- |
| `playwright.config.ts`                                 | Passmark + Playwright configuration                              |
| `e2e/passmark/`                                        | Natural-language Passmark regression suite                       |
| `src/routes/__root.tsx`                                | Root layout and providers                                        |
| `src/routes/_authenticated.tsx`                        | Auth + onboarding guard for protected routes                     |
| `src/features/auth/context/auth-context.tsx`           | Auth state and profile context                                   |
| `src/features/lobby/hooks/use-matchmaking.ts`          | Match queue + realtime match subscription                        |
| `src/features/chat/`                                   | Realtime chat, safety dialog, and game invite host               |
| `src/features/games/`                                  | Game engines, boards, catalogue, and game room sync              |
| `src/features/settings/`                               | Profile and preferences editor                                   |
| `src/lib/supabase/client.ts`                           | Supabase browser client singleton                                |
| `supabase/functions/match-users/`                      | Server-authoritative matching Edge Function                      |
| `supabase/migrations/`                                 | SQL schema, RLS policies, functions, and cron setup              |
| `docs/PRD.md`                                          | Product requirements and acceptance criteria                     |
| `docs/PASSMARK_TEST_PLAN.md`                           | Passmark coverage map                                            |

## Learn More

- [Passmark](https://github.com/bug0inc/passmark)
- [TanStack Start](https://tanstack.com/start)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## License

Released under the [MIT License](./LICENSE).
