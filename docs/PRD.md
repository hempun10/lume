# Lume — Product Requirements Document

> **Version**: 1.0.0 · **Last updated**: 2026-04-18
> **Owner**: Lume team · **Status**: Shipped (hackathon build)
>
> This PRD is the source of truth for Lume's product scope, feature behavior,
> user flows, and acceptance criteria. It is designed to be consumed by
> **TestSprite** during test generation — each feature has explicit
> validation criteria that map directly to test cases.

---

## 1. Product Overview

**Lume** is a social platform for meeting strangers through real-time text
chat and lightweight multiplayer games. It is a safer, game-forward
alternative to Omegle — ephemeral text chat (messages are never stored),
interest-based matchmaking, an 18+ age gate, and first-class reporting /
blocking.

A session flows like this:

1. User signs up, completes an onboarding profile (DOB, gender, region, interests, T&Cs).
2. From the lobby, they pick a mode (chat or games) and tap **Start matching**.
3. The matchmaker pairs them with another waiting user (interest overlap preferred).
4. Both users land in a shared chat room. They can talk, invite each other to a game, report, block, or end the chat.
5. Games play inline in a side panel of the chat and are synced via Supabase Broadcast.

---

## 2. Core Goals

1. **Meet strangers safely** — enforce an 18+ age gate, require explicit Terms & Privacy consent, and surface reporting + blocking at every chat surface.
2. **Match on shared interests** — prioritize pairs with overlapping interest tags; fall back to any-available after a short wait so no one is stuck.
3. **Keep conversations ephemeral** — messages exist only in the Supabase Realtime broadcast; nothing is persisted to the database.
4. **Make the first 60 seconds fun** — 9 built-in 2-player games play inline in the chat, each finishing in ~2–5 minutes.
5. **Ship a polished product on a hackathon timeline** — responsive mobile + desktop, light/dark theme, accessible interactions, production-deployable on Vercel + Supabase.

---

## 3. Key Features

### 3.1 Authentication
- Email + password signup and login (no OAuth).
- Email confirmation is **disabled** in this build — signup immediately signs the user in and sends them to `/onboarding`.
- Password reset via email (captured locally by Mailpit on `http://127.0.0.1:54324`).
- Logout clears the session and redirects to `/`.
- Auth pages use a split-screen layout (form left, brand panel right) and share the `AuthInput` component with icon prefixes.

### 3.2 Onboarding
After signup, the user must complete a profile before they can use the app:
- **Display name** (1–30 chars).
- **Date of birth** — must be ≥ 18 years old (enforced client-side and in `MAX_DOB`).
- **Gender** — one of `male | female | non-binary | prefer-not-to-say` (also enforced by a DB `CHECK` constraint).
- **Region** — optional free-text.
- **Interests** — 1–8 tags from a fixed list of `INTEREST_OPTIONS`.
- **Consent** — must tick the Terms & Privacy checkbox to submit.

On submit, `profiles.onboarding_completed` flips to `true`. The
`_authenticated` route guard redirects incomplete profiles to `/onboarding`
no matter where they try to navigate.

### 3.3 Lobby / Dashboard (`/dashboard`)
Primary authenticated view. Stacked editorial feed:
- **Greeting** — time-aware (morning / afternoon / evening / late-night).
- **Hero match card** — mode toggle (Chat · Games), one-tap interest chips (preselected from profile, editable), live online counter via Supabase Presence, **Start matching** CTA.
- **Games rail** — horizontal scroll on mobile / grid on desktop; each card opens a preview or launches a game invite.
- **Conversation starters** — 3 interest-seeded prompts with Copy + Shuffle.
- **Your vibe** — mini profile preview with a link to `/settings`.

### 3.4 Matchmaking
Server-authoritative pairing via a Supabase Edge Function:
- Client inserts a row into `match_queue` and subscribes to a `match:{userId}` broadcast channel.
- A pg_cron job invokes the `match-users` Edge Function every 2 seconds.
- The function scores pairs by **interest overlap (3 pts/tag) + region match (2 pts) + age proximity (0.1–1.0 pt)**, then calls the `match_pair(a, b)` RPC.
- `match_pair` refuses to pair **blocked** or **recent** pairs (anti-spam window = **1 minute** after the latest change; see `is_recent_pair()` in `supabase/migrations/20260418060000_shorten_recent_pair_window.sql`).
- Queue entries older than **2 minutes** are auto-expired (`QUEUE_EXPIRY_MS`).
- Waiters past **30 seconds** (`FALLBACK_MATCH_THRESHOLD_MS`) become fallback-eligible and can match anyone.
- On match, the Edge Function broadcasts `match_found` with `room_id` to both users, who then navigate to `/chat?roomId=...`.

### 3.5 Realtime chat (`/chat?roomId=...`)
- **Messages are ephemeral** — sent via Supabase Broadcast on the room's channel; never written to the DB.
- **Typing indicator** — broadcast every keystroke (throttled), auto-clears after 3s of silence.
- **Presence** — the stranger's connected/disconnected state updates a dot in the header.
- **Elapsed timer** — shows chat duration (mm:ss).
- **End chat** — either user can end; the room status flips to `ended`; both see the end screen with duration.
- **Disconnect** — if the stranger leaves without ending cleanly, status becomes `disconnected`.

### 3.6 Game Panel (inline, in chat)
- Chat header has a **Gamepad** button to show/hide the Game Panel and a **Ban** button to block game invites from the stranger for this session.
- Inside the panel: a game picker grid, then (once chosen) an invite handshake, then the live board.
- Either user can propose a game → the other receives a **Game Invite Modal** (Accept / Decline).
- Board updates sync through Supabase Broadcast on the same chat channel.
- Every game offers **Rematch** on completion.

### 3.7 Games catalogue (9 games, all shipped)
All games are 2-player, turn/round-based, and finish in ~2–5 minutes.

| Game | Duration | Core rule |
| --- | --- | --- |
| **Tic Tac Toe** | ~2 min | Classic 3×3. First to 3-in-a-row wins; else draw. |
| **Trivia** | ~3 min | 6 multiple-choice Qs. Blind answers, reveal together. |
| **Would You Rather** | ~3 min | 8 either/or prompts. Reveal after both pick. |
| **Rock Paper Scissors** | ~2 min | Best of 5; blind commit + simultaneous reveal. |
| **Two Truths & a Lie** | ~3 min | Each player authors 2 truths + 1 lie; other guesses. 4 rounds. |
| **Emoji Charades** | ~3 min | Decode emoji clues into movies/songs/places. 6 rounds, roles swap. |
| **Draw & Guess** | ~5 min | One draws on a canvas, other picks from 4 options. 4 rounds, roles swap. Per-round difficulty (Easy / Medium / Hard) chosen by the drawer. |
| **Word Chain** *(reserved id)* | ~3 min | Start a word with the previous word's last letter. (Not implemented in this build; stays `coming_soon` if not ready.) |
| **Chess** *(reserved id)* | ~15 min | Classic chess. (Not implemented in this build; stays `coming_soon` if not ready.) |

> **Implemented & `available`** in `src/features/games/data/games.ts`:
> Tic Tac Toe, Trivia, Would You Rather, Rock Paper Scissors, Two Truths & a Lie, Emoji Charades, Draw & Guess.
> **`coming_soon`**: Word Chain, Chess.

Each available game has:
- A pure-function **engine** in `src/features/games/engines/` (e.g. `tic-tac-toe.ts`, `draw-and-guess.ts`) that owns state transitions and scoring.
- A **board** component in `src/features/games/components/` that renders UI and dispatches moves.
- All moves + round-setup + word-reveal events broadcast through `useGameRoom` / `customEvents`.

### 3.8 Safety & trust
Backed by migration `20260417121137_add_safety_tables.sql`:
- **Report** — Flag icon in chat header opens a modal with reason (one of `harassment | nudity | spam | underage | hate_speech | self_harm | other`), notes (≤ 1000 chars), and a default-on **Also block** checkbox.
- **Block** — creates a row in `blocks`; the blocked user is **never told** they were blocked. Blocked pairs cannot be re-matched.
- **Recent-pair cooldown** — after a chat ends, the two users cannot re-match for **1 minute** (demo-friendly; previously 30 minutes). Enforced by `is_recent_pair()` in SQL.
- **Match filtering** — the Edge Function calls `fetchExclusions()` to skip blocked or recent pairs before invoking `match_pair`.
- **Legal routes** — stub pages at `/terms`, `/privacy`, `/community-guidelines`.
- **T&C consent** — required checkbox in onboarding (persisted in profile).

### 3.9 Settings (`/settings`)
- **Profile card** — edit display name, DOB (18+ still enforced), gender, region.
- **Preferences card** — edit interest tags (same chip selector as onboarding).
- Saves via `updateProfile` / `updatePreferences` mutations; shows inline success/error; invalidates the profile query.

### 3.10 Theme & layout
- **Light/Dark only** (no "system"); persists to `localStorage['lume-theme']`.
- Inline `<script>` in `__root.tsx` prevents FOUC.
- **Landing layout** — header w/ logo + centered nav + theme toggle + Sign In; footer.
- **Dashboard layout** — 48px topbar, 56px desktop sidebar (Lobby · Settings), 56px mobile bottom tab bar.
- **Onboarding** renders **without** the dashboard shell (full-screen).

### 3.11 Landing site (`/`, `/about`, `/features`, `/release-notes`, `/release-notes/*`)
Public marketing site with Hero, Stats, Features, Comparison, How It Works, FAQ, and CTA sections. Links to release notes.

---

## 4. User Flow Summary

### 4.1 First-time user
`/` → **Sign In** → `/login` (switch to Sign up) → submit → auto-logged in → `/onboarding` → fills profile + ticks T&C → submit → `/dashboard`.

### 4.2 Returning user
`/` or deep-link → `/login` → submit → `/dashboard` (onboarding complete) OR `/onboarding` (incomplete).

### 4.3 Meet a stranger
`/dashboard` → pick mode Chat → tap **Start matching** → **Searching** view → matched → `/chat?roomId=...` → exchange messages → End chat → end-screen with duration + Report option.

### 4.4 Play a game with a stranger
Inside chat → click **Gamepad** → pick a game → stranger sees invite modal → accept → play → on finish, **Rematch** or pick another game. Drawer flow for Draw & Guess adds an extra **Difficulty** picker before each round.

### 4.5 Report & block
Inside chat → **Flag** → choose reason → (optional notes) → keep **Also block** ticked → Submit → report stored, block recorded, stranger stays unaware. Returning to lobby → same user cannot be re-matched.

### 4.6 Edit profile
`/dashboard` → **Your vibe** → `/settings` → edit fields → Save → success toast → back to lobby.

---

## 5. Validation Criteria (feature → acceptance checks)

> Each entry maps 1:1 to a TestSprite test case.

### 5.1 Authentication
- **AUTH-01** Signup with a valid new email + password ≥ 8 chars → redirects to `/onboarding`.
- **AUTH-02** Signup with an existing email → shows an inline error; stays on `/login`.
- **AUTH-03** Login with correct credentials → redirects to `/dashboard` (if onboarding complete).
- **AUTH-04** Login with wrong password → shows an inline error; stays on `/login`.
- **AUTH-05** Forgot password → entering a known email sends a reset link (visible in Mailpit locally).
- **AUTH-06** Reset password via link → can set a new password; can log in with it.
- **AUTH-07** Logout from the dashboard → redirects to `/` and clears session (subsequent `/dashboard` visit redirects to `/login`).
- **AUTH-08** Visiting `/dashboard` unauthenticated → redirects to `/login`.

### 5.2 Onboarding
- **ONB-01** New signup is redirected to `/onboarding` immediately after sign-up.
- **ONB-02** Submitting onboarding with DOB < 18 years → blocks submission with an inline error.
- **ONB-03** Submitting with 0 interests → shows "select at least 1" error.
- **ONB-04** Submitting with > 8 interests → disables extra chips or shows error.
- **ONB-05** Submitting without ticking T&C → blocks submission.
- **ONB-06** Valid submission → redirects to `/dashboard` and `profiles.onboarding_completed = true`.
- **ONB-07** Skipping onboarding by visiting `/dashboard` → guard redirects back to `/onboarding`.

### 5.3 Lobby
- **LOBBY-01** Lobby greeting reflects current local time bucket.
- **LOBBY-02** Online count renders a number ≥ 1 (self-presence).
- **LOBBY-03** Mode toggle switches between Chat and Games.
- **LOBBY-04** Selecting/deselecting interest chips updates the live counter.
- **LOBBY-05** Pressing **Start matching** opens the Searching view.
- **LOBBY-06** Pressing Cancel on Searching returns to the idle lobby.

### 5.4 Matchmaking
- **MATCH-01** Two users pressing **Start matching** within the same minute are paired and both navigate to `/chat?roomId=...` with the same `roomId`.
- **MATCH-02** A user waiting past `QUEUE_EXPIRY_MS` (2 min) gets their queue row marked `expired`.
- **MATCH-03** Users waiting past 30s become fallback-eligible and match anyone available.
- **MATCH-04** A blocked pair cannot be matched, even if both are waiting.
- **MATCH-05** Two users who just finished a chat cannot be matched again within 1 minute (`is_recent_pair` = true).

### 5.5 Chat
- **CHAT-01** Sending a message makes it appear for the sender immediately and for the stranger within < 1 s.
- **CHAT-02** Typing indicator appears for the stranger while the other types; clears within 3 s of silence.
- **CHAT-03** Stranger presence dot reflects their connected state.
- **CHAT-04** Ending the chat from either side transitions both clients to the **ended** view with duration.
- **CHAT-05** Stranger closing their tab transitions the other to **disconnected**.
- **CHAT-06** Messages are not retrievable after page refresh (ephemeral).

### 5.6 Games — generic
- **GAME-01** Inviting a stranger shows them the Game Invite Modal; accepting loads the board for both.
- **GAME-02** Declining the invite dismisses the modal and leaves chat untouched.
- **GAME-03** On game completion, both users see a **Rematch** button; tapping it on both sides resets the board.
- **GAME-04** Banning game requests in the chat header hides the Gamepad button and blocks incoming invites.

### 5.7 Games — per-game rules
- **TTT-01** Three in a row (row/col/diag) triggers the win state and highlights the line.
- **TTT-02** Full board with no winner triggers Draw.
- **TRIVIA-01** Both players' answers are hidden until both submit; reveal shows each player's pick and the correct answer.
- **TRIVIA-02** Score increments correctly at the end.
- **WYR-01** Each of the 8 prompts locks in after both pick; reveal shows alignment.
- **RPS-01** Winner is decided after 5 rounds (first to 3 wins).
- **TT-01** Each player authors 2 truths + 1 lie across 4 rounds; the guesser scores only on correct lie-ID.
- **EC-01** 6 rounds, roles swap; correct guess = +1 to both; timeout = 0.
- **DG-01** Drawer picks Easy/Medium/Hard → the guesser's 4 options come from the matching tier.
- **DG-02** Live strokes rendered on the guesser's canvas in < 1 s.
- **DG-03** Correct pick → both players +1; wrong pick or timeout → 0.
- **DG-04** FinishedView shows per-round outcome (`+1 each` / `Missed`) plus `You drew` / `Stranger drew` label.

### 5.8 Safety
- **SAFE-01** Report modal requires a reason; Submit is disabled until one is chosen.
- **SAFE-02** Submitting a report writes a row in `reports` with correct `reporter_id`, `reported_id`, `room_id`, and `reason`.
- **SAFE-03** Reporter can read their own reports; another user cannot (RLS).
- **SAFE-04** Ticking **Also block** writes to `blocks`; unticking does not.
- **SAFE-05** Blocking is idempotent (re-block = no duplicate row).
- **SAFE-06** Blocked pairs are filtered out of matchmaking.
- **SAFE-07** `/terms`, `/privacy`, `/community-guidelines` return 200 and render content.

### 5.9 Settings
- **SET-01** Loading `/settings` fetches the current profile and prefills the form.
- **SET-02** Saving a new display name updates the DB and refreshes the profile query.
- **SET-03** Attempting to save a DOB < 18 years shows an error.
- **SET-04** Updating interests writes the new array to `profiles.interests`.

### 5.10 Theme & layout
- **UI-01** Toggling theme flips `html[class="dark"]` and persists to localStorage.
- **UI-02** Landing, dashboard, onboarding, auth, and chat all render correctly at 375 px (mobile) and 1440 px (desktop).
- **UI-03** Mobile dashboard shows the bottom tab bar; desktop shows the left sidebar.

### 5.11 Landing
- **LAND-01** `/` loads with Hero, Features, Comparison, FAQ, and CTA visible.
- **LAND-02** Nav links scroll to in-page anchors.
- **LAND-03** `/release-notes` lists all releases; each release link opens a detail page.

---

## 6. Non-functional requirements

- **Performance**: Landing TTI < 3 s on 3G-ish; chat message round-trip < 1 s on broadband.
- **Accessibility**: All interactive controls are keyboard-reachable; dialogs trap focus; form fields have labels.
- **Responsive**: Works from 320 px to 1920 px without horizontal scroll.
- **Security**:
  - RLS on `profiles`, `reports`, `blocks`, `match_queue`, `match_history`.
  - `match_pair` and `is_*` helpers run as `SECURITY DEFINER` with pinned `search_path`.
  - Service role key never ships to the client (`SUPABASE_SECRET_KEY` is server-only).
- **Privacy**: No chat messages are ever written to the database.

---

## 7. Out of scope (v1)

- Voice / video chat.
- Image / file uploads in chat.
- OAuth (Google / GitHub) login.
- Persistent friend lists, DMs, or history.
- Matching filters beyond interests / region / age proximity.
- Moderator review UI for reports (currently reports land in the DB only).

---

## 8. Tech stack summary

| Layer | Tech |
| --- | --- |
| Framework | TanStack Start v1 (React 19, Vite 7, Nitro SSR) |
| Routing & data | TanStack Router + TanStack Query (`@tanstack/react-router-ssr-query`) |
| Auth + DB | Supabase (email/password, PostgreSQL, RLS, Realtime Broadcast + Presence, Edge Functions, pg_cron) |
| Styling | Tailwind CSS v4 + shadcn/ui + Radix + Lucide |
| Forms | React Hook Form + Zod |
| Tooling | Biome (lint/format), TypeScript strict, Husky pre-commit |
| Deployment | Vercel (frontend) · Supabase cloud (DB + Edge Functions) |

---

## 9. Glossary

- **Ephemeral chat** — messages broadcast in real time, never persisted.
- **Recent pair** — two users who matched within the last 1 minute; excluded from re-matching.
- **Room** — a chat session identified by `roomId`, scoped to a Realtime channel.
- **Broadcast** — Supabase Realtime transport used for messages, presence, and game events.
- **customEvents** — per-game side-channel events (e.g. stroke updates, round setup, word reveal) ride on the same Realtime channel.
