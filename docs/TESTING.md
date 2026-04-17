# Lume — Testing Strategy

> Companion to [`docs/PRD.md`](./PRD.md). This doc defines **what we test, how, with which tools, and which credentials**. It is optimized for feeding **TestSprite** so it can generate the maximum number of useful, passing test cases.

---

## 1. Goals

1. **Hackathon scoring** — hand TestSprite a codebase + PRD that cleanly unlocks its auto-generated UI and API test plans (target: 25+ generated cases, ≥ 70 % pass rate on first run).
2. **Regression safety** — every core user flow (signup → onboarding → match → chat → game → safety) has a reproducible test.
3. **Fast iteration** — unit-level confidence in pure engines (games, matchmaking scoring) so we can refactor without breaking rules.

---

## 2. Test layers

| Layer | Tool | Source of truth | Runs where |
| --- | --- | --- | --- |
| **E2E UI flows** | TestSprite (generates Playwright) | `docs/PRD.md` + running app | TestSprite cloud sandbox |
| **Backend API** | TestSprite | Supabase REST + Edge Functions | TestSprite cloud sandbox |
| **Engine logic** (games, scoring) | Vitest *(optional backlog)* | Pure TS modules in `src/features/games/engines/` + `supabase/functions/match-users/scoring.ts` | Locally / CI |
| **Manual smoke** | Two browsers, two test accounts | Checklist in §7 | Local dev |

> **Why TestSprite is our primary test driver**: the hackathon rewards coverage and automation. TestSprite consumes our PRD + codebase and produces a full Playwright suite without us hand-writing selectors.

---

## 3. Test accounts & environment

### 3.1 Local (default for TestSprite)

Seeded by `npm run db:reset`:

| Email | Password | Display name |
| --- | --- | --- |
| `user-a@example.com` | `password123` | Alice |
| `user-b@example.com` | `password123` | Bob |

Both completed onboarding; Alice and Bob have overlapping interests so they match quickly.

### 3.2 Local URLs

| Surface | URL |
| --- | --- |
| Frontend | `http://127.0.0.1:3000` |
| Supabase API | `http://127.0.0.1:54321` |
| Mailpit (email capture) | `http://127.0.0.1:54324` |
| Supabase Studio | `http://127.0.0.1:54323` |

### 3.3 Prereqs before invoking TestSprite

```bash
npm run db:start      # boots Supabase via Docker
npm run db:reset      # migrates, regenerates types, seeds Alice + Bob
npm run build         # production build (more test headroom than dev)
npm run preview       # preview server on 3000
```

> TestSprite caps frontend tests to ~15 in dev mode. **Run `preview` (production)** so we get the full generated suite.

---

## 4. TestSprite configuration

Invoke from the IDE:

```
Can you test this project with TestSprite?
```

Then in the TestSprite configuration portal:

| Field | Value |
| --- | --- |
| Testing Type | Frontend (run Backend as a second pass) |
| Scope | Codebase |
| Local URL | `http://127.0.0.1:3000` |
| Needs Login | Yes |
| Username | `user-a@example.com` |
| Password | `password123` |
| PRD upload | `docs/PRD.md` |

Second pass (Backend):

| Field | Value |
| --- | --- |
| Testing Type | Backend |
| Local URL | `http://127.0.0.1:54321` |
| Auth | Bearer (anon key from `npx supabase status`) |
| PRD | same `docs/PRD.md` |

Suggested `additionalInstruction` when generating:

> Focus on the critical user journeys in order: authentication → onboarding → lobby → matchmaking (two sessions) → realtime chat → each of the 7 available games → report/block safety flows → settings. For two-user flows (matchmaking, chat, games), use the seeded accounts `user-a@example.com` and `user-b@example.com`.

---

## 5. Feature → test-case matrix

The full list of acceptance criteria lives in **[`docs/PRD.md` §5](./PRD.md#5-validation-criteria-feature--acceptance-checks)**. This table mirrors it with priorities to guide TestSprite.

| Feature | Test IDs | Priority | Two-user? | Notes |
| --- | --- | --- | --- | --- |
| Authentication | AUTH-01…08 | High | No | Covers signup, login, logout, reset, guard |
| Onboarding | ONB-01…07 | High | No | Age gate, T&C, interests limits |
| Lobby | LOBBY-01…06 | Medium | No | UI state + presence counter |
| Matchmaking | MATCH-01…05 | High | **Yes** | Blocked / recent-pair / fallback |
| Realtime chat | CHAT-01…06 | High | **Yes** | Messages, typing, presence, end |
| Games — generic | GAME-01…04 | High | **Yes** | Invite, decline, rematch, ban |
| Tic Tac Toe | TTT-01…02 | Medium | Yes | Win + draw |
| Trivia | TRIVIA-01…02 | Medium | Yes | Blind reveal + score |
| Would You Rather | WYR-01 | Low | Yes | Reveal alignment |
| Rock Paper Scissors | RPS-01 | Low | Yes | Best of 5 |
| Two Truths | TT-01 | Medium | Yes | Authored prompts + lie-ID |
| Emoji Charades | EC-01 | Medium | Yes | 6 rounds, role swap |
| Draw & Guess | DG-01…04 | High | Yes | Difficulty picker + stroke sync + stats |
| Safety (report/block) | SAFE-01…07 | **High** | Yes | Reasons, RLS, blocking idempotency |
| Settings | SET-01…04 | Medium | No | Profile + preferences mutations |
| Theme & layout | UI-01…03 | Low | No | Responsive + dark mode |
| Landing | LAND-01…03 | Low | No | Smoke test public site |

---

## 6. Known TestSprite gotchas in this repo

1. **Two-user flows** need two sessions. If TestSprite runs one browser, MATCH/CHAT/GAME tests will hit "waiting for stranger" forever. Two options:
   - Let TestSprite run the single-user side only (validates UI state transitions), and verify the two-user flow manually with Alice + Bob in two browsers.
   - Re-run TestSprite with Bob's credentials in parallel and observe both sides.
2. **Draw & Guess** canvas strokes are broadcast events. TestSprite can assert DOM changes but not the pixel canvas; we validate via the round result + UI labels.
3. **Onboarding guard** redirects to `/onboarding` — TestSprite's login fixture must use a seeded account **that has completed onboarding** (both seeded accounts do).
4. **Recent-pair cooldown** is 1 minute. Back-to-back MATCH-01 runs with the same two users must wait 60 s or the match will be skipped.
5. **Ephemeral chat**: CHAT-06 asserts messages don't survive refresh. TestSprite's default "reload and assert state" patterns align with this.

---

## 7. Manual smoke test (before demo)

Two browsers, two test users. 5 minutes end-to-end.

1. **Signup path** — new browser, go to `/login`, switch to Sign up, create `qa-demo@example.com`, see `/onboarding`, fill profile, land on `/dashboard`.
2. **Match** — in browser A (Alice) and browser B (Bob), tap Start matching. Both land in the same chat room within ~2 s.
3. **Chat** — send 3 messages each direction; see typing indicator; see presence dot; see elapsed timer tick.
4. **Game: Draw & Guess** — invite Bob, accept, drawer picks Medium, draws, guesser picks. Verify +1 each on correct pick. Play 4 rounds. Verify FinishedView shows all 4 rounds with `You drew` / `Stranger drew` + outcome.
5. **Report & block** — from Bob's side, click Flag → reason "spam" → keep "Also block" → Submit. Verify row in `reports` and `blocks` via Supabase Studio.
6. **Cooldown** — both users return to lobby and press Start matching → should **not** re-match within 1 minute.
7. **Settings** — Alice opens `/settings`, changes display name, saves, sees success, reload confirms persistence.
8. **Logout** — top-bar avatar → Logout → redirected to `/`. Visiting `/dashboard` bounces to `/login`.

---

## 8. Scoring & reports

After TestSprite finishes:
- Report: `testsprite_tests/TestSprite_MCP_Test_Report.md` + `.html`.
- Structured result: `testsprite_tests/tmp/test_results.json`.

When there are failures, ask the IDE assistant:

> Please fix the codebase based on TestSprite testing results.

The assistant reads `report_prompt.json`, identifies root causes, and applies fixes. Re-run TestSprite to validate.

---

## 9. Checklist for the hackathon submission

- [ ] Local Supabase seeded with Alice + Bob
- [ ] `npm run build && npm run preview` is running
- [ ] `docs/PRD.md` is up to date with the shipped feature set
- [ ] TestSprite frontend sweep completed with ≥ 70 % pass
- [ ] TestSprite backend sweep completed
- [ ] Manual smoke test (§7) passes
- [ ] Reports linked in submission writeup
