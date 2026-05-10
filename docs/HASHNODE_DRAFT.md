<!--
Hashnode submission metadata
- Title: How Passmark caught three real bugs in my vibe-coded realtime chat app
- Subtitle: A Passmark + Playwright regression suite for a TanStack Start + Supabase Realtime app, and the bugs it surfaced.
- Slug: passmark-caught-three-bugs-lume
- Cover image: ./images/ttt-win.png
- Tags: BreakingAppsHackathon, passmark, playwright, supabase, tanstack, testing, react, typescript, ai, hackathon
- Canonical URL: https://github.com/hempun10/lume/blob/main/docs/HASHNODE_DRAFT.md
- Hashtag: #BreakingAppsHackathon (must appear in body)
- Mentions: @bug0inc on social posts
-->

# How Passmark caught three real bugs in my vibe-coded realtime chat app

> Submission for the Bug0 **Breaking Apps Hackathon** — `#BreakingAppsHackathon` — deadline May 10, 2026 11:59 PM PT.

![Lume chat: stranger profile with shared-interests banner above an inline Tic Tac Toe board showing a winning line](./images/ttt-win.png)

## TL;DR

I built a small realtime stranger-chat app called **Lume** the way most of us build things now: with a model in the loop, shipping fast, skipping the boring tests. Then I pointed **Passmark** at it.

Passmark drives the app with natural-language steps and judges the result with screenshots and prose. I wrote a custom email provider so it could read OTP codes from local Mailpit, and I pinned everything to `google/gemini-2.5-flash` so my OpenRouter bill stayed predictable.

It found three bugs I had been staring past for weeks:

1. A Supabase RLS policy that silently broke chat prompts for every match.
2. A password-recovery flow that only worked when I tested it by hand.
3. A hydration race that sometimes posted login credentials into the URL.

Repo: https://github.com/hempun10/lume. Live demo: https://lume-roan.vercel.app.

---

## 1. What is Lume, and why I needed help testing it

Lume is a safer, game-forward take on Omegle-style random chat. The pieces:

- Email/password auth, 18+ consent, DOB validation
- Onboarding (display name, gender, region, 1–8 interests)
- Protected dashboard with TanStack Router route guards
- Matchmaking via Supabase Realtime, a Postgres `match_queue`, and a `pg_cron` Edge Function that scores candidates by interest overlap, region, and age
- Ephemeral 1:1 chat (no persistence)
- Inline games over Supabase Broadcast, with Tic Tac Toe as the canary
- Report and block flows that exclude pairs from future matches
- Forgot-password via 6-digit email OTP

That is a lot of state. A lot of it is invisible at rest. Most of the bugs I cared about lived between two browsers, two Supabase channels, and a redirect.

Selector-based E2E tests do not love that shape. I wanted something that could read the page like a person and tell me whether the *behaviour* was right.

## 2. The vibe-coded era needs different tests

Most of Lume came together during long sessions of "ask a model, paste, run, swear, ask again." That style ships a working surface fast, but the surface and the data flow lie to each other constantly. The login button works. The chat opens. The cards render. None of that proves the right rows came back from Postgres.

Three Passmark properties matched that risk:

- **Steps describe intent, not markup.** "Click 'Start matching'" is a contract with the user. `[data-testid="lobby-cta"]` is a contract with my last refactor.
- **Snapshot judging tolerates non-determinism.** Lume's matchmaker is non-deterministic when more than two people are in the queue. Asking the AI to confirm "Bob's timeline contains a message from the stranger that says 'hello from passmark'" is much kinder than chasing a `[data-message-id]`.
- **Accessibility falls out for free.** If Passmark cannot find the button by its label, neither can a screen reader. Every test I wrote made the app slightly more readable.

In short: when the code is half mine and half the model's, I want a checker that judges the experience, not the DOM I no longer fully remember.

## 3. The suite at a glance

| Spec | What it locks in | Flow type |
|---|---|---|
| `landing.spec.ts` | Marketing pages, Terms/Privacy/Community Guidelines render | Static |
| `landing-interactions.spec.ts` (10 tests) | Anchor scroll, theme toggle, FAQ accordion, session-aware CTA, theme-aware imagery | Interactive |
| `auth-flows.spec.ts` | Login, logout, duplicate-signup, authed redirect from /login & /signup | Auth |
| `auth-guards.spec.ts` | Signed-out access to dashboard/settings/games/chat is blocked | Auth |
| `auth-onboarding.spec.ts` | Signup → onboarding; required fields; DOB picker year-dropdown excludes current year | Auth |
| **`auth-recovery.spec.ts`** | **Forgot-password → 6-digit OTP from Mailpit → reset → login with new pw** | **Auth (Passmark + email)** |
| `dashboard-lobby.spec.ts` | 5-cap interest chips, Text↔Games toggle, Start/Cancel match, navigation | Lobby |
| `dashboard-prompts.spec.ts` | Break-the-ice shuffle + clipboard copy | Lobby |
| `settings.spec.ts` | Profile + preferences save, persistence, 8-cap, empty-blocks-save, lobby reflection | Settings |
| `games-catalog.spec.ts` | 7 available games + Word Chain/Chess "coming soon" + Play routing | Games |
| `chat-safety.spec.ts` *(opt-in)* | Report dialog reason validation, Also block | Safety |
| **`realtime-matchmaking.spec.ts`** *(opt-in)* | **Two browsers match into the same room AND see a "You both like Music · Cooking" banner** | **Realtime** |

The two opt-in specs sit behind `RUN_REALTIME_PASSMARK=1` because they need the local Supabase stack (realtime, pg_cron, Edge Functions) to be healthy.

## 4. How I actually use Passmark

The whole driver lives in `playwright.config.ts`. One `configure` call, one custom email provider:

```ts
// playwright.config.ts
import { configure } from "passmark";
import { mailpitProvider } from "./e2e/passmark/mailpit-provider";

configure({
  ai: {
    gateway: "openrouter",
    models: {
      stepExecution: "google/gemini-2.5-flash",
      assertionPrimary: "google/gemini-2.5-flash",
      assertionArbiter: "google/gemini-2.5-flash",
      // ...all roles pinned to the same model
    },
  },
  email: mailpitProvider(),
});
```

Inside a spec, I write tests in two layers. Boring setup is plain Playwright. The flow under test is Passmark steps:

```ts
// e2e/passmark/dashboard-lobby.spec.ts
import { test, expect } from "@playwright/test";
import { runLumeSteps, loginAsSeededUser } from "./helpers";

test("a user can start and cancel a match", async ({ page }) => {
  await loginAsSeededUser(page, "alice"); // plain Playwright

  await runLumeSteps({
    page, test, expect,
    userFlow: "Start matching, then cancel before pairing",
    steps: [
      { description: "Click the 'Start matching' button on the dashboard" },
      { description: "Wait until the lobby shows a 'Searching for someone…' state" },
      { description: "Click the 'Cancel' button" },
      { description: "Confirm the lobby is back to the idle state" },
    ],
  });
});
```

Four design choices made the suite worth keeping:

- **Pin the model.** Without `google/gemini-2.5-flash` locked across every Passmark role, OpenRouter occasionally routed to a model that returned 400s on tool calls. Pinning made every run reproducible.
- **Deterministic auth, AI behaviour.** Logging in is not the test target in 95% of specs. `loginAsSeededUser` uses Playwright. Passmark only kicks in for the actual flow under test. Saves credits, removes flake.
- **One concern per Passmark test.** Snapshot AI judging works much better with focused assertions. I split the original `dashboard-settings.spec.ts` into three smaller files.
- **Bumped Supabase's local sign-in/up rate limit.** Default is 30 / 5 min. Parallel runs eat through that. Bumped to 300 in `supabase/config.toml`, committed.

## 5. Three bugs Passmark caught

### Bug #1 — A silent RLS policy gap broke chat prompts for everyone

This is my favourite, because the app *looked* fine.

When two users matched, the chat opened with a "Break the ice!" panel showing prompt cards. I had wired `<PromptSuggestions />` to take `strangerProfile.interests` and generate themed conversation starters. A stranger with `Music` in their interests was supposed to see music prompts.

Every chat fell back to the generic prompt set ("Pineapple on pizza — defend your stance"). I never noticed because:

- The fallback prompts are reasonable.
- I tested locally as a single user.
- No selector test ever asserted the *content* of the cards.

When I added a `<SharedInterestsBanner />` for the realtime test ("You both like Music · Cooking"), the banner refused to render. Same root cause.

The bug:

```sql
-- supabase/migrations/...add_profile_fields.sql (original)
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
```

That was the **only** SELECT policy on `profiles`. So `useStrangerProfile`'s `select("display_name, interests").eq("id", strangerId)` returned an empty payload for every other user. No error, no exception, just zero rows.

The fix is a narrow second policy:

```sql
-- supabase/migrations/20260502000000_allow_reading_room_counterpart_profile.sql
CREATE POLICY "Users can read room counterpart profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE (r.user_a = auth.uid() AND r.user_b = profiles.id)
         OR (r.user_b = auth.uid() AND r.user_a = profiles.id)
    )
  );
```

A user can read another profile only if they share an active row in `public.rooms`. Profiles stay locked otherwise.

![Lume chat: prompt cards with 'You both like Music · Cooking' shared-interests banner above interest-themed conversation starters](./images/shared-interests-banner.png)

The banner above and the four interest-themed cards underneath all read from the same Supabase query. Before the migration, every chat fell back to generics.

The point I want to land: Passmark made me write a *behavioural* assertion ("the banner says Music · Cooking"), and the assertion could not pass until the data flow was correct. A unit test on `useStrangerProfile` would have mocked Supabase and never seen this.

### Bug #2 — The magic-link recovery flow did not actually work end-to-end

The original `/forgot-password` sent a magic link via `supabase.auth.resetPasswordForEmail(email, { redirectTo })`. Click the link, land on `/reset-password` with a recovery session, set a new password, done. That was the theory.

Local Supabase routes auth emails through Mailpit, so I assumed Passmark could "click" the link the way a user would. It cannot, cleanly. The link lives in an email body, in a separate tool, behind redirects. Every attempt to script it broke the next time the redirect chain shifted.

So I rewrote the flow as a 6-digit email OTP:

- `/forgot-password` → enter email → "Send code" → redirect to `/reset-password?email=…`
- `/reset-password` → enter code + new password + confirm → `verifyOtp({ type: "recovery" })` → `updateUser({ password })` → `/dashboard`

That left the question: how does Passmark actually pull a code out of Mailpit? I built a custom `EmailProvider`:

```ts
// e2e/passmark/mailpit-provider.ts
import type { EmailProvider } from "passmark";

export function mailpitProvider(): EmailProvider {
  const baseUrl = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";
  return {
    domain: "@example.com",
    async extractContent({ email, prompt }) {
      // Poll Mailpit's /api/v1/messages for the latest message to `email`.
      // If `prompt` mentions "code" or "otp", regex out the 6-digit token.
      // Otherwise return the body verbatim.
    },
  };
}
```

Wired into Passmark with one line:

```ts
configure({ email: mailpitProvider() });
```

The test uses the placeholder syntax to inline the OTP into a step:

```ts
await runSteps({
  page, test,
  userFlow: "Reset password using the OTP from the recovery email",
  steps: [
    {
      description: "Fill the 'Verification code' field with the 6-digit code from the recovery email",
      data: { value: `{{email.otp:get the 6 digit verification code:${email}}}` },
    },
    { description: "Fill the 'New password' field", data: { value: newPassword } },
    { description: "Fill the 'Confirm new password' field", data: { value: newPassword } },
    { description: "Click the 'Update password' button" },
  ],
});
```

After `runSteps`, plain Playwright verifies the **old password no longer signs in** and the **new password reaches `/dashboard` or `/onboarding`**. Passmark proves the UI flow worked. Playwright proves the password actually changed in the database. Each layer does the part it is good at.

![Forgot-password form: email field with 'Send code' submit](./images/forgot-password.png)
![Reset-password form: 6-digit OTP input with new password and confirm fields](./images/reset-password.png)

### Bug #3 — Login form occasionally submitted as GET with credentials in the URL

While running the realtime test (two browser contexts in parallel), one context kept landing on `/login?email=...&password=...` instead of `/dashboard`. The form submitted *before* React hydration replaced it with the controlled SPA version, so the browser used the default GET action.

Symptom:

```
Received string: "http://127.0.0.1:3000/login?email=...&password=new-h6fj9zie"
```

I had never seen this in single-context runs. Two contexts hammering the preview server slowed hydration past my 2000 ms blanket sleep, and the failure surfaced.

Fix in `e2e/passmark/helpers.ts`:

```ts
await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
const emailField = page.getByLabel("Email");
await emailField.waitFor({ state: "visible", timeout: 15_000 });
await page.waitForTimeout(1500); // give the controlled inputs a beat to mount
await emailField.fill(user.email);
```

Lesson: a blanket `waitForTimeout` is not enough for SSR'd SPA forms. Wait for the *element* state, not for the clock.

## 6. Things I changed in the product because of the suite

Not bugs in the strict sense. Gaps Passmark exposed while it tried to read the page like a user.

- `<InterestTagSelector />` was missing `aria-pressed` on its chips. Only the lobby had it. Added it everywhere; Passmark and screen readers now agree on which chips are selected.
- Chat header, game card, and dashboard avatar got explicit `aria-label`s after Passmark complained that "Stranger" by itself was ambiguous.
- The onboarding DOB picker now uses shadcn's `captionLayout="dropdown"` and only offers years where the user would be 18+. Previously the test could land on a current-year date and skip the rule.
- Settings → Save preferences must update the lobby's "Your vibe" card. Passmark caught two cases where a stale React Query cache made the save look successful but the card did not update.

## 7. Surprises along the way

- **Snapshot AI assertions race against fast redirects.** My OTP reset originally redirected after 1500 ms. Passmark's first AI check takes around 22 s, so the success alert was already gone by the time it looked. I bumped the redirect to 3500 ms and dropped `waitUntil` so a Playwright assertion runs immediately after `runSteps`. Either Passmark or `setTimeout` owns the wait. Not both.
- **Two-browser tests were easier than I expected.** `runSteps` is per-page, so two contexts means two parallel Passmark drivers via `Promise.all`. The hard part is making sure both browsers reach a stable state before assertions run, not anything AI-specific.
- **The pinned model rule again.** Without `google/gemini-2.5-flash` set across every role, one OpenRouter route would occasionally pick a model that produced 400s on the same prompt. Pinning made the suite reproducible across days, which is what you want from a regression suite.

## 8. How to run this yourself

You can take Lume for a spin in three ways: a **live demo**, a **local run with seeded users** (the fastest path), or **the full Passmark suite** to reproduce the regressions.

### Option A — Try the live demo (90 seconds)

1. Open https://lume-roan.vercel.app in two browser windows (regular + incognito works fine).
2. Sign up two accounts with different emails. Confirmation is off on the demo; you go straight into onboarding.
3. Complete onboarding for both. Pick at least one overlapping interest (for example, both pick `Music`).
4. Click **Start matching** in both lobbies. You will be paired into a chat within a few seconds.
5. Walk through the flows: send messages, open the **Games** drawer and start Tic Tac Toe, try **Report**, try **Block**.

### Option B — Run locally with the seeded users (recommended for review)

Prereqs: Node 20+, [Supabase CLI](https://supabase.com/docs/guides/cli), Docker (for the local Supabase stack).

```bash
# Clone and install
git clone https://github.com/hempun10/lume.git
cd lume
npm install

# Start the local Supabase stack (Postgres + Auth + Realtime + Mailpit at :54324)
npm run db:start

# Reset the schema, regenerate types, and seed Alice + Bob
npm run db:reset

# Start the dev server on http://localhost:3000
npm run dev
```

The seed creates two accounts you can log in as immediately, no signup needed:

| Display name | Email | Password | Interests |
|---|---|---|---|
| **Alice** | `user-a@example.com` | `password123` | Music, Travel, Photography, Cooking |
| **Bob** | `user-b@example.com` | `password123` | Music, Cooking, Anime, Fitness |

The two overlapping interests (`Music`, `Cooking`) are what the shared-interests banner from Bug #1 picks up.

**Manual flow to exercise everything:**

1. Open `http://localhost:3000` in two browsers (Chrome regular + Chrome incognito, or Chrome + Firefox).
2. Log in as **Alice** in window 1 and **Bob** in window 2 via `/login`.
3. In both windows, click **Start matching**. They should match within a few seconds.
4. In Alice's chat, confirm the **"You both like Music · Cooking"** banner is rendered. This is the Bug #1 regression check.
5. Send a few messages back and forth.
6. Open the **Games** drawer in either window, pick **Tic Tac Toe**, play a round. Both windows should sync moves over Supabase Broadcast.
7. From either side, hit **Report**, choose a reason, tick **Also block**, confirm. The pair is now excluded from future matching.
8. Sign out Alice, click **Forgot password** on `/login`, send the OTP, then open Mailpit at `http://127.0.0.1:54324` and copy the 6-digit code. Reset her password and log in with the new one. This is the Bug #2 regression check.

### Option C — Run the Passmark regression suite

Set `OPENROUTER_API_KEY` in `.env.local` (see `.env.example`), then use the package.json scripts:

```bash
# Smoke test (landing only — fastest sanity check on the AI driver)
npm run test:e2e:smoke

# Full chromium suite (~31 tests, ~6–7 min after a fresh db:reset)
npm run test:e2e

# Same suite, headed (watch the AI clicks happen)
npm run test:e2e:headed

# Show the last HTML report
npm run test:e2e:report

# Realtime two-browser test (opt-in)
RUN_REALTIME_PASSMARK=1 npx playwright test e2e/passmark/realtime-matchmaking.spec.ts
```

The recovery and matchmaking specs need the local Supabase stack running (`npm run db:start`). Everything else can target the Vercel demo with `PLAYWRIGHT_BASE_URL=https://lume-roan.vercel.app npm run test:e2e`.

## 9. Final results

```txt
# Default chromium suite (no realtime gating)
npm run test:e2e
→ ~31 tests, ~6–7 minutes after `npm run db:reset`

# Realtime opt-in
RUN_REALTIME_PASSMARK=1 npx playwright test e2e/passmark/realtime-matchmaking.spec.ts
→ 1 passed (1.5 min)

# Recovery
npx playwright test e2e/passmark/auth-recovery.spec.ts
→ 1 passed (44 s)
```

Three real bugs caught and fixed during the hackathon:

- A missing RLS policy that silently degraded every chat's prompt cards (Bug #1).
- A magic-link recovery flow that only worked on the manual happy path (Bug #2).
- A hydration race that occasionally leaked credentials into the URL (Bug #3).

Plus a handful of accessibility and state-sync gaps the suite picked up along the way (section 6).

## 10. Closing thought

Selectors describe HTML. Passmark steps describe what the user is *trying to do*. For a vibe-coded realtime app where most of the surface area is state machines and ephemeral data, the second framing maps onto the actual product risk.

The bugs I found were not "this button is missing." They were "this feature looks fine but is silently degraded." That is the class of bug a screenshot-and-prose AI judge is shaped to find, and it is also the class of bug you ship the most of when you let a model write half the code with you.

If you are building anything with auth, realtime, and ephemeral state, give Passmark a weekend. The catch rate is real.

---

## Links

- Live demo: https://lume-roan.vercel.app
- Repo: https://github.com/hempun10/lume
- Branch: `main`
- Test plan: [`docs/PASSMARK_TEST_PLAN.md`](https://github.com/hempun10/lume/blob/main/docs/PASSMARK_TEST_PLAN.md)
- Bug0 hackathon: https://passmark.bug0.com

## Checklist before publishing

- [x] Default suite + realtime + recovery all green locally
- [ ] Playwright report screenshots captured (`npm run test:e2e:report`)
- [x] Repo made public or judge-accessible
- [x] Article includes `#BreakingAppsHackathon`
- [ ] X / LinkedIn post drafted (see `docs/SOCIAL_POSTS.md`) and tagged `@bug0inc`
- [ ] Submitted before May 10, 2026 11:59 PM PT
