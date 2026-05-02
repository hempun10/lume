# Passmark Test Plan

> Breaking Apps Hackathon regression suite for Lume.

Lume is a good Passmark target because the product combines flows that are often brittle in traditional E2E suites: auth redirects, onboarding validation, realtime matching, ephemeral chat, games, and safety controls. The suite intentionally describes user intent in plain English and relies on visible UI semantics instead of selectors or page objects.

## Test setup

```bash
npm install
npm run db:start
npm run db:reset
npm run build
npm run preview
```

Then run Passmark from another terminal:

```bash
OPENROUTER_API_KEY=sk-or-... npm run test:e2e
```

Optional variants:

```bash
npm run test:e2e:smoke
npm run test:e2e:headed
PLAYWRIGHT_BASE_URL=https://lume.chat npm run test:e2e
PLAYWRIGHT_HEADLESS=0 npm run test:e2e:smoke
RUN_REALTIME_PASSMARK=1 npm run test:e2e -- realtime-matchmaking.spec.ts
```

## Environment

| Variable | Purpose |
| --- | --- |
| `OPENROUTER_API_KEY` | Required by Passmark when using the OpenRouter gateway. |
| `PLAYWRIGHT_BASE_URL` | Optional target URL. Defaults to `http://127.0.0.1:3000`. |
| `RUN_REALTIME_PASSMARK` | Enables the optional two-browser realtime matchmaking test. |

Seeded accounts after `npm run db:reset`:

| Persona | Email | Password | Use |
| --- | --- | --- | --- |
| Alice | `user-a@example.com` | `password123` | Primary authenticated regression user. |
| Bob | `user-b@example.com` | `password123` | Second browser for optional realtime checks. |

## Coverage matrix

| Spec | Flow | Product risk | Main assertions |
| --- | --- | --- | --- |
| `landing.spec.ts` | Landing page and trust pages | Marketing or legal routes regress, CTA breaks, theme toggle breaks | Hero, features, FAQ, CTA, sign-in navigation, `/terms`, `/privacy`, `/community-guidelines` render. |
| `auth-flows.spec.ts` | Login, logout, duplicate signup, authenticated redirects from /login and /signup | Login silently fails, logout leaves stale session, duplicate signup is allowed, authed users see auth pages instead of dashboard | Valid credentials reach the lobby; logout returns to a public page and re-blocks the dashboard; signing up with `user-a@example.com` shows "User already registered"; authenticated `/login` and `/signup` both redirect to `/dashboard`. |
| `auth-guards.spec.ts` | Signed-out route protection and invalid login | Protected routes leak or redirect incorrectly; auth errors become unclear | Dashboard/settings/games/chat require login; invalid credentials show an error and stay on login. |
| `landing-interactions.spec.ts` | Landing polish: anchor nav, theme toggle, FAQ accordion, session-aware CTA, footer links, theme-aware imagery | Header anchors break, theme toggle stops swapping classes/images, FAQ stays collapsed, header CTA fails to reflect session, footer dead-ends to 404 | Header links scroll to Features / How it works / FAQ; theme toggle flips `<html class="dark">` and re-renders the page in dark mode; FAQ expands the answer when a question is clicked; header shows `Sign In` for anonymous and `Open App` once logged in; footer Privacy/Terms links route correctly; hero preview swaps from `dashboard-light.png` to `dashboard-dark.png` on theme change. |
| `auth-onboarding.spec.ts` | Signup, onboarding, DOB picker | New users cannot reach onboarding; required-field validation breaks; under-18 rule can be bypassed | Unique user reaches onboarding after signup; incomplete onboarding submission stays on the form with validation feedback; DOB calendar's year dropdown excludes the current year and tops out at the 18-years-ago year. |
| `dashboard-lobby.spec.ts` | Lobby render, vibe-chip 5-cap, mode toggle, start/cancel match, games-rail nav, Your-vibe edit nav | Lobby misses greeting/online count/profile interests; chip cap regresses; mode toggle CTA copy desyncs; matchmaking Start/Cancel breaks; navigation links break | Greeting + online count + auto-loaded interest chips + Your vibe card + 'Start matching' all visible; chips cap at 5 (6th disabled, counter 5/5); Text Chat ↔ Games flips CTA copy; Start → Searching with MM:SS timer → Cancel → idle; 'View all' routes to `/games` with Word Chain/Chess disabled; 'Edit' routes to `/settings`. |
| `dashboard-prompts.spec.ts` | Break the ice card: shuffle + copy-to-clipboard | Shuffle stops regenerating; copy stops writing | Shuffle changes the rendered prompt set within 5 attempts; clicking a Copy button writes that prompt's text to the system clipboard and the button briefly reads 'Copied'. |
| `settings.spec.ts` | Profile + preferences save, persistence, 8-cap, empty-blocks-save, lobby reflection | Form saves silently fail; toasts disappear; updates don't persist; 8-cap regresses; empty-interests save lets users break their profile | Profile and preferences save with success toasts; profile values rehydrate after a hard reload; an exact set of saved interests appears as badges on the lobby Your-vibe card with the new name + region; selecting 8 interests disables the 9th chip; deselecting all interests disables Save preferences. |
| `games-catalog.spec.ts` | Games catalogue | Available/coming-soon status becomes confusing; play action breaks | 7 available games are discoverable; Word Chain/Chess are coming soon; play routes into matching. |
| `chat-safety.spec.ts` | Optional report/block dialog check | Users cannot report or form allows incomplete reports | Report dialog includes reason choices, notes, Also block; reason is required. Requires a real matched room, so it is enabled with realtime runs. |
| `realtime-matchmaking.spec.ts` | Optional two-browser realtime match | Match queue, broadcast notification, or chat delivery regresses | Alice and Bob match into chat and Bob receives Alice's message. |

## Known limitations

- Latest local run: chromium full pass produces ~31 passing tests in ~6–7 minutes after a fresh `npm run db:reset`. Two specs (`chat-safety` and `realtime-matchmaking`) are skipped by default and gated behind `RUN_REALTIME_PASSMARK=1`.
- Local Supabase auth limits sign-in/up requests to 30 / 5 min by default. The committed `supabase/config.toml` sets `sign_in_sign_ups = 300` so the suite—which logs in many times—doesn't trip the limit. If you reduce it, expect intermittent login failures during long runs.
- Passmark uses AI calls, so full-suite runs consume OpenRouter credits. Use `npm run test:e2e:smoke` while iterating.
- The optional realtime test should be run when Supabase local services, pg_cron, and Edge Function invocation are healthy. It is skipped by default to keep the regular suite deterministic.
- Signup/onboarding tests create unique users. Reset the database between full local runs when you want a pristine state.
- Password reset is intentionally not in the default suite because local email verification requires Mailpit interaction.
- The app intentionally does not persist chat messages, so assertions verify live UI delivery rather than database state.

## Why these tests are high value

1. **They exercise user-visible behavior.** Passmark interacts with labels and visible copy, the same way a user or judge evaluates the app.
2. **They cover critical trust boundaries.** Auth guards, consent, reporting, and blocking are more important than cosmetic snapshots.
3. **They validate complex lifecycle transitions.** Lobby → searching → cancel, signup → onboarding → dashboard, and optional two-user matching are flows where regressions are easy to miss.
4. **They double as documentation.** Each test reads like a product walkthrough that can be explained in the Hashnode article.
