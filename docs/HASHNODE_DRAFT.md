# Draft: Regression-testing a realtime stranger-chat app with Passmark

> Publish on Hashnode with the `#BreakingAppsHackathon` tag before May 10, 2026 11:59 PM PT.

## Working title options

1. Breaking Lume: using Passmark to regression-test auth, matchmaking, chat, games, and safety
2. I tested my realtime social app with AI instead of selectors
3. Passmark vs. a realtime app: what broke, what worked, and what surprised me

## Article outline

### 1. Hook

Lume is not a simple landing page. It has email/password auth, onboarding, protected route guards, Supabase Realtime matchmaking, ephemeral chat, inline multiplayer games, and report/block safety flows. That makes it a perfect stress test for Passmark.

### 2. What I built

- Lume: safer, game-forward alternative to Omegle-style random chat.
- Stack: TanStack Start, React 19, Supabase Auth/Postgres/Realtime/Edge Functions, Tailwind v4, shadcn/ui.
- Key flows:
  - Signup → onboarding → dashboard
  - Dashboard → matchmaking → chat
  - Chat → game invite → realtime game board
  - Report/block → safety tables + matchmaking exclusions

### 3. Why this app is hard to test

- Auth and SSR hydration can race.
- Onboarding has validation rules: DOB, gender, interests, consent.
- Realtime matchmaking needs two users and a background matchmaker.
- Chat messages are intentionally not persisted.
- Games are synchronized over Broadcast events.
- Safety flows must be visible enough to use but private enough not to expose blocks.

### 4. Passmark setup

```bash
npm install -D @playwright/test passmark dotenv
```

`playwright.config.ts` loads `.env`, configures Passmark for OpenRouter, and targets a local or deployed base URL.

```ts
configure({
  ai: {
    gateway: "openrouter",
  },
});
```

### 5. The test suite

Show the committed files:

- `landing.spec.ts`
- `auth-guards.spec.ts`
- `auth-onboarding.spec.ts`
- `dashboard-settings.spec.ts`
- `games-catalog.spec.ts`
- `chat-safety.spec.ts`
- `realtime-matchmaking.spec.ts`

Explain that the tests use natural-language steps and assertions instead of selectors.

Example snippet:

```ts
await runSteps({
  page,
  userFlow: "Tune lobby matching preferences and cancel search",
  steps: [
    { description: "Confirm the lobby shows a greeting, live online count, interest chips, and Start matching" },
    { description: "Click Start matching", waitUntil: "The Searching view is visible" },
    { description: "Click Cancel", waitUntil: "The lobby and Start matching button are visible again" },
  ],
  assertions: [
    { assertion: "The user can start and cancel matchmaking without leaving the dashboard in a broken state." },
  ],
  test,
  expect,
});
```

### 6. What I changed because of testing

Fill this in after final runs. Good examples to mention if they happen:

- Improved ambiguous button labels.
- Clarified report dialog copy.
- Fixed docs that claimed routes/features existed when they did not.
- Added a dedicated Passmark test plan.
- Found flaky realtime assumptions and made the two-browser test opt-in.

### 7. What surprised me

Possible points:

- Natural-language tests are especially useful for flows where selectors hide the user intent.
- Accessibility labels matter more when AI is driving the browser.
- AI tests are not a replacement for deterministic unit tests, but they are excellent for regression walkthroughs.
- Realtime tests need careful environment control.

### 8. Final results

Latest local core-suite result:

```txt
11 passed, 2 skipped
```

The skipped tests are the optional realtime/report checks gated behind `RUN_REALTIME_PASSMARK=1`. The stable default suite covers public pages, auth guards, signup-to-onboarding, onboarding validation, lobby matchmaking cancel, settings, and games catalogue behavior.

Add screenshots from the Playwright HTML report:

```bash
npm run test:e2e:report
```

Include:

- Repo link
- Live demo link
- Coverage summary
- Known limitations

### 9. Closing

Passmark made it practical to describe Lume's critical behavior in plain English and turn those descriptions into runnable regression tests. For a realtime social app, that is a much better fit than only checking DOM selectors.

## Checklist before publishing

- [ ] Full suite or smoke suite run completed.
- [ ] Playwright report screenshots captured.
- [ ] Repo pushed publicly.
- [ ] Article includes `#BreakingAppsHackathon`.
- [ ] Social post tags Bug0.
- [ ] Deadline checked: May 10, 2026 11:59 PM PT.
