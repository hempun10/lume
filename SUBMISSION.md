# Lume — Hackathon Submission

> Copy/paste this text into the submission form. Placeholders in `[...]` need your input before you post.

---

## Title

**Lume — Meet new people through ephemeral chat & 2-player games.**

## Description

Lume is a web-based social platform for meeting strangers through one-on-one text chat and lightweight 2-player games, built with **TanStack Start** (React 19 + Vite 7 + Nitro SSR), **Supabase** (Auth, Realtime, Edge Functions, pg_cron), **Tailwind v4**, and **shadcn/ui**. It's a safer, game-forward alternative to Omegle-style random chat — the age gate is strict (18+), every match is server-authoritative, blocks are silent and sticky, and chat is ephemeral (messages are never persisted).

## Key Features

- **Server-authoritative matchmaking** — a Supabase Edge Function invoked every 2 seconds by `pg_cron` drains the queue, scores interest overlap + region + age proximity, and respects blocks plus a 1-minute recent-pair cooldown.
- **Ephemeral realtime chat** — Supabase Broadcast carries every message, typing state, and presence update. Nothing is persisted. Includes replies, reactions, GIF picker (Giphy), emoji picker, and iMessage-style grouped bubbles.
- **7 inline 2-player games** — Tic Tac Toe, Trivia, Would You Rather, Rock Paper Scissors, Two Truths & a Lie, Emoji Charades, and Draw & Guess (with a per-round difficulty picker). Each has a pure-function engine and syncs over Broadcast.
- **Strict safety model** — 18+ age gate at onboarding, Terms/Privacy consent enforced, report modal with 7 reasons, silent blocks, Edge Function pre-filter for blocked/recent pairs, and RLS-protected safety tables.
- **Full auth lifecycle** — email/password signup, login, password reset (Mailpit locally), onboarding guard on every protected route, settings page to edit profile + interests.
- **Polished UX** — light/dark theme with no FOUC, landing site (hero + features + comparison + FAQ), live online counter via Supabase Presence, editorial lobby with greeting + hero match card + games rail.
- **Production-grade tooling** — Biome (lint + format), TypeScript strict, Husky pre-commit, Vercel Analytics, GitHub Actions CI/CD, Nitro SSR builds.

## Autonomous Testing / AI Integration

Lume's entire end-to-end test suite is **generated and executed by [TestSprite MCP](https://www.testsprite.com/)**. Instead of hand-writing Playwright selectors, we hand TestSprite a curated PRD (`docs/PRD.md`) and a running preview build; the agent explores the app, emits **30 test cases** (`TC001` → `TC030`), and runs them headless in its sandbox.

**Concrete wins:**

- TestSprite surfaced a silent regression in the onboarding **DOB year dropdown**. Its `TC003` kept failing at the calendar step, which pointed us at the deprecated `fromYear`/`toYear` props in `react-day-picker` v9. We migrated to the new `startMonth`/`endMonth` Date-object API in PR #48 before anyone could ship an 18+ age-gate that was silently unusable.
- The agent auto-generated **exhaustive auth-guard coverage** (`TC011`, `TC012`, `TC015`, `TC020`, `TC022`) that exercises every protected route for unauthenticated and un-onboarded users — the kind of flow that is easy to half-check manually and painful to regress.
- **Legally important assertions** (under-18 rejection in `TC024`, Terms/Privacy consent in `TC004` and `TC028`) are now automated, not spot-checked.

All generated tests live in [`testsprite_tests/`](testsprite_tests/), alongside the standardized PRD (`standard_prd.json`) and the generated test plan (`testsprite_frontend_test_plan.json`). See [`docs/TESTING.md`](docs/TESTING.md) for the TestSprite configuration we used (credentials, PRD upload, `additionalInstruction`).

## Links & Info

- **Live Demo**: [LIVE_DEMO_URL_HERE]
- **GitHub**: https://github.com/hempun10/lume
- **TestSprite Email**: [YOUR_TESTSPRITE_EMAIL_HERE]

---

## Submission Checklist

- [x] Public GitHub repository
- [x] README explaining what was built
- [x] `testsprite_tests/` subfolder with 30 generated cases
- [x] `config.json` gitignored (no secrets in repo)
- [x] MIT License
- [ ] API keys rotated after hackathon closes
- [ ] Discord DMs open for organizer contact
