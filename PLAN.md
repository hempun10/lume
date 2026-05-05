# Breaking Apps Hackathon Preparation Plan

## Summary

Prepare Lume for the Breaking Apps Hackathon by replacing the previous TestSprite-centered submission artifacts with a Passmark + Playwright regression suite, tightening public documentation, and adding a few high-leverage product/testability improvements that make the app easier to validate and more compelling to write about.

## Context

- Lume is a TanStack Start + React 19 app with Supabase Auth, Postgres/RLS, Realtime Broadcast chat, pg_cron/Edge Function matchmaking, and 7 available inline games.
- Current public docs are still framed around TestSprite:
  - `README.md` says “Tested end-to-end with TestSprite MCP”, includes a full “Testing with TestSprite” section, and says 30 tests exist.
  - `docs/PRD.md` says the PRD is designed for TestSprite and has “Shipped (hackathon build)” language.
  - `testsprite_tests/` contains the previous generated suite and JSON plans.
  - `.gitignore` has TestSprite runtime cache rules.
  - `CLAUDE.md` also documents TestSprite, but that is agent-facing rather than user-facing.
- There are documentation inconsistencies worth fixing before submission:
  - README/PRD mention Release Notes routes that do not exist in `src/routes`.
  - PRD says “9 games, all shipped” while `src/features/games/data/games.ts` has 7 available and 2 coming soon.
  - README key files mention `src/features/matchmaking/` and `src/features/safety/`, but the actual code lives under `src/features/lobby/*`, `src/features/chat/*`, and Supabase functions/mutations.
- The app is a strong candidate for the hackathon because it has multiple flows that AI regression testing can validate in plain English: auth, onboarding, protected-route guards, dashboard preferences, matchmaking, realtime chat, reports/blocks, games, and responsive/public routes.

## System Impact

- The product source of truth stays the application and Supabase schema. We are not changing core data ownership.
- The testing source of truth moves from generated TestSprite artifacts to a committed Passmark Playwright suite.
- New test configuration introduces `OPENROUTER_API_KEY` for Passmark only; Supabase env vars remain unchanged.
- Seeded test data in `supabase/seed-data.ts` remains the deterministic baseline for local regression tests.
- For reliability, tests should prefer seeded local users for authenticated flows and only generate throwaway users when specifically testing signup/onboarding.
- Any UI/testability changes should preserve Passmark’s no-selector philosophy: improve accessible labels, button names, visible copy, and deterministic states rather than adding brittle test IDs.

## Approach

Use the current Lume app as the tested web app, not a random public app. The submission will be stronger because we can show real fixes, local reproducibility, and meaningful coverage over a complex realtime product.

Work in four phases:

1. **Clean previous hackathon/testing traces** — remove or reframe TestSprite-specific public artifacts, correct docs, and decide whether to delete or archive `testsprite_tests/`.
2. **Install and configure Passmark** — add Playwright + Passmark + dotenv config, `.env.example` support for `OPENROUTER_API_KEY`, and npm scripts for local/CI runs.
3. **Write a high-quality Passmark suite** — cover public, auth, onboarding, dashboard/settings, safety, games, and at least one two-user realtime scenario.
4. **Polish for prize potential** — make the UI and docs easier for AI tests and humans to understand, then create the Hashnode/social submission assets.

## Changes

### Documentation and cleanup

- `README.md`
  - Replace TestSprite positioning with Passmark/Breaking Apps positioning.
  - Add “Testing with Passmark” setup and run instructions.
  - Correct feature counts and key-file paths.
  - Remove nonexistent release-notes claims unless release-note routes are actually implemented.
- `docs/PRD.md`
  - Reframe as product/test source of truth for Passmark instead of TestSprite.
  - Change status from “hackathon build” to current product status.
  - Correct games section to “7 available, 2 coming soon”.
  - Remove or update acceptance criteria that depend on nonexistent release-note routes.
- `.env.example`
  - Add `OPENROUTER_API_KEY=` with a comment that it is used by Passmark tests.
- `.gitignore`
  - Replace TestSprite cache comments with Playwright/Passmark cache/report ignores.
- `testsprite_tests/`
  - Preferred: delete from the submission branch to avoid confusing judges.
  - Alternative: move to `docs/archive/testsprite/` only if we want to tell a migration story. For a clean hackathon entry, deletion is cleaner.
- `CLAUDE.md`
  - Update the testing section after the public docs are finalized so future agents follow Passmark, not TestSprite.

### Passmark test infrastructure

- `package.json` / `package-lock.json`
  - Add dev/test dependencies: `@playwright/test`, `passmark`, `dotenv`.
  - Add scripts:
    - `test:e2e`: run Passmark suite on Chromium.
    - `test:e2e:headed`: headed debug run.
    - `test:e2e:report`: open Playwright report.
    - Optional `test:e2e:smoke`: small low-credit subset for quick checks.
- `playwright.config.ts`
  - Load `.env` with `dotenv`.
  - Configure Passmark AI gateway as `openrouter`.
  - Set `baseURL` to local preview/dev URL, default `http://127.0.0.1:3000`.
  - Use Chromium first for judging reliability; optionally add mobile viewport project later.
  - Configure trace/video/screenshots on retry/failure.
- `e2e/passmark/helpers.ts`
  - Shared constants for seeded credentials and base URL.
  - Optional helper to create unique test email strings.
  - Optional wrapper around `runSteps` with a standard timeout and metadata.
- `e2e/passmark/*.spec.ts`
  - Plain-English Passmark specs with strong assertions.

### Recommended Passmark suite

Prioritize a suite that demonstrates breadth, depth, and real regression value while staying credit-conscious.

1. `landing.spec.ts`
   - Load `/`.
   - Assert hero, value proposition, features, FAQ, CTA, sign-in navigation, theme toggle.
   - Check legal routes render: `/terms`, `/privacy`, `/community-guidelines`.
2. `auth-onboarding.spec.ts`
   - Signup with a unique email.
   - Complete onboarding with valid 18+ DOB, gender, region, interests, consent.
   - Assert redirect to lobby/dashboard and visible personalized greeting.
   - Negative subtest: missing consent or DOB blocks submission.
3. `auth-guards.spec.ts`
   - Visiting `/dashboard`, `/chat`, `/settings`, `/games` while signed out redirects to login.
   - Invalid login shows an inline error and stays on auth page.
4. `dashboard-settings.spec.ts`
   - Login as seeded user.
   - Verify lobby greeting, online counter, mode toggle, interest chips, Start matching, Cancel search.
   - Open settings, update profile/interests, save, return to lobby, assert updated info appears.
5. `games-catalog.spec.ts`
   - Login as seeded user.
   - Browse `/games`.
   - Assert 7 available games and 2 coming soon are understandable.
   - Click an available game and verify it starts the matchmaking/searching flow with the chosen game intent.
6. `chat-safety.spec.ts`
   - Use a deterministic chat route/room where possible or pair two seeded users in two browser contexts.
   - Send a message, verify it appears, open report dialog, assert reason is required, submit with “Also block”, assert end-chat or return-to-lobby behavior.
7. `realtime-matchmaking.spec.ts` (stretch / flagship)
   - Two browser contexts: Alice and Bob log in, both start matching, assert both reach `/chat?roomId=...` with the same room.
   - Exchange messages.
   - Invite/accept a simple game like Tic Tac Toe, make a few moves, assert synced board state.

### Product/testability polish for a stronger submission

- Improve accessible names where Passmark may struggle:
  - `src/features/lobby/components/lobby-hero-card.tsx` — make mode toggle/chips/Start matching labels explicit.
  - `src/features/chat/components/chat-header.tsx` — ensure Game, End chat, Report, Ban invites have visible or aria labels.
  - `src/features/chat/components/report-dialog.tsx` — clear labels for reasons and “Also block”.
  - `src/features/games/components/game-card.tsx` — clear available vs coming-soon state.
- Add deterministic copy/state for tests without brittle selectors:
  - Ensure searching screen shows “Searching”, elapsed time, selected interests, cancel action.
  - Ensure settings save success text is visible and specific.
- Consider one product enhancement that is article-worthy but bounded:
  - “Regression-friendly realtime demo”: a documented two-seeded-user local script/runbook, not a hidden test mode.
  - Or improve chat safety UX with clearer post-report confirmation.
  - Or add a lightweight “Test coverage map” doc that maps Passmark specs to product risks.

### Submission assets

- `docs/PASSMARK_TEST_PLAN.md`
  - Matrix of Passmark tests → product risk → assertions → known limitations.
- `docs/HASHNODE_DRAFT.md`
  - Draft article outline:
    1. What Lume is.
    2. Why it is hard to test: auth, realtime, matching, games, safety.
    3. How Passmark setup works with OpenRouter.
    4. Walkthrough of the suite.
    5. Regressions/edge cases found and fixed.
    6. What surprised us about plain-English AI testing.
    7. Repo/demo links and #BreakingAppsHackathon tag.
- `docs/SOCIAL_POSTS.md`
  - X/LinkedIn drafts tagging Bug0 and mentioning #BreakingAppsHackathon.

## Verification

### Local verification

1. Install dependencies:
   - `npm install`
2. Start/reset local backend:
   - `npm run db:start`
   - `npm run db:reset`
3. Run app in production-like mode:
   - `npm run build`
   - `npm run preview`
4. Run checks:
   - `npm run check`
   - `npm run typecheck`
5. Run Passmark suite:
   - `OPENROUTER_API_KEY=... npm run test:e2e -- --project chromium`
   - `npm run test:e2e:report`

### Edge cases to verify manually

- New user signup/onboarding still works after docs/test changes.
- Seeded users can still log in after `npm run db:reset`.
- Protected route redirects do not loop during SSR hydration.
- Two-user matchmaking does not fail because of stale queue rows; cancel works.
- Report + block remains idempotent and does not expose the block to the blocked user.
- Passmark tests do not rely on selectors or hidden implementation details.
- The final repo no longer looks like a TestSprite submission.

## Execution Order

1. Confirm scope with the user:
   - Delete `testsprite_tests/` or archive it?
   - Keep the current app name/branding “Lume”?
   - Use local Supabase only, or also run tests against the deployed `https://lume.chat`?
   - How many OpenRouter credits are available for test runs?
2. Cleanup docs and old artifacts.
3. Add Passmark infra and a smoke test.
4. Add the full core suite.
5. Run and stabilize locally.
6. Do product/testability polish based on Passmark failures.
7. Prepare Hashnode/social assets.
8. Final full run, commit, push, publish article before May 10 11:59 PM PT.
