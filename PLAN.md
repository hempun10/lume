# Lume Realtime Core — Architecture Plan

## Summary

Implement the three core realtime systems: **matchmaking**, **chat**, and **multiplayer games**. Uses Supabase Edge Functions for server-authoritative matching, Supabase Realtime Broadcast for ephemeral chat, and Broadcast + client-side logic for game sync.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Matching | DB queue + Edge Function | Server-authoritative, no race conditions |
| Chat messages | Ephemeral (Broadcast only) | Omegle-like privacy, zero message storage |
| Game state | Client-side + Broadcast | Simple for v1 turn-based games, low latency |
| Match algorithm | Interest overlap priority | Match by shared interests, fall back to any after timeout |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                            │
│                                                         │
│  useMatchmaking()     useRealtimeChat()    useGameRoom() │
│       │                     │                   │        │
│       ▼                     ▼                   ▼        │
│  match_queue INSERT    channel.on()         channel.on() │
│  + subscribe to        'broadcast'          'broadcast'  │
│  match:{userId}        chat:{roomId}        game:{roomId}│
└────┬───────────────────────┬───────────────────┬─────────┘
     │                       │                   │
     ▼                       ▼                   ▼
┌─────────────┐     ┌──────────────┐    ┌──────────────┐
│ Edge Fn:    │     │  Supabase    │    │  Supabase    │
│ match-users │     │  Realtime    │    │  Realtime    │
│             │     │  Broadcast   │    │  Broadcast   │
│ Polls queue │     │  (ephemeral) │    │  + DB state  │
│ Pairs users │     └──────────────┘    └──────────────┘
│ Creates room│
│ Notifies    │
└─────────────┘
```

---

## 1. Matchmaking

### Flow

```
1. User clicks "Start Matching"
2. Frontend: INSERT into match_queue { user_id, mode, interests, status: 'waiting' }
3. Frontend: Subscribe to Realtime channel `match:{user_id}` for match notification
4. Edge Function (runs on cron or invoked): 
   a. SELECT all 'waiting' rows, ordered by created_at
   b. For each waiting user, find best match:
      - Same mode (text/games)
      - Score by shared interest count (most overlap first)
      - If no interest match after 30s, match with any same-mode user
   c. UPDATE both rows: status → 'matched', set matched_with, room_id
   d. INSERT into rooms { user_a, user_b, type, status: 'active' }
   e. Broadcast to both users' channels: { room_id, partner_display_name }
5. Frontend: Receives match → navigate to /chat or /games
```

### Edge Function: `match-users`

```
supabase/functions/match-users/index.ts

- Called via pg_cron every 2 seconds
- Acquires pg_advisory_xact_lock to prevent concurrent execution
- Reads all 'waiting' queue entries
- Groups by mode
- For each group, pairs users by interest overlap score
- Falls back to FIFO after 30s wait time
- Creates room, updates queue rows, broadcasts match
- Retries failed broadcast notifications (notified = false)
- Cleans up expired entries (> 2 min waiting)
- Logs structured metrics: { queue_depth, pairs_made, expired_count, duration_ms }
```

**Why Edge Function over Postgres function?**
- Matching logic is complex (interest scoring, timeout fallback)
- Easier to test and iterate on TypeScript vs plpgsql
- Can call Supabase Broadcast API directly via REST

### Concurrency & Reliability

**Advisory lock** — prevents overlapping cron invocations from double-matching:
```sql
SELECT pg_advisory_xact_lock(hashtext('match-users'));
```
Lock is released automatically on transaction commit/rollback.

**Atomic pairing with broadcast retry** — the DB transaction (update queue + create room) is atomic. Broadcast notification is a separate step that can fail. To handle this:
1. `match_queue` has a `notified` boolean column (default false)
2. Transaction: update queue rows + create room (notified = false)
3. After commit: broadcast to both users via REST
4. If broadcast succeeds: update `notified = true`
5. On each cron run: retry broadcast for `status = 'matched' AND notified = false AND updated_at > now() - interval '30s'`

Worst case: delayed notification (next cron cycle), never a lost match.

**Secrets** — Edge Functions have automatic access to `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars. No Vault or manual config needed.

### Observability

- **Structured logging** in Edge Function: each run logs `{ queue_depth, pairs_made, expired_count, retry_count, duration_ms }`
- **Warning threshold**: log warning if `queue_depth > 20` or any entry waiting > 60s
- **Supabase Dashboard**: Edge Function logs visible in Logs → Edge Functions with filtering
- **Post-v1**: admin query for queue depth and avg wait time

### Database

```sql
-- Match queue
CREATE TABLE match_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('text', 'games')),
  interests text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'cancelled', 'expired')),
  matched_with uuid REFERENCES auth.users(id),
  room_id uuid,
  notified boolean NOT NULL DEFAULT false, -- broadcast delivery tracking
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, status) -- prevent duplicate waiting entries
);

-- Rooms (shared by chat and games)
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('chat', 'game')),
  game_type text, -- null for chat rooms, 'tic-tac-toe' etc for games
  user_a uuid NOT NULL REFERENCES auth.users(id),
  user_b uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  game_state jsonb, -- current game state for game rooms
  current_turn uuid, -- whose turn it is (game rooms)
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- RLS policies
ALTER TABLE match_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Users can only see/manage their own queue entries
CREATE POLICY "users_own_queue" ON match_queue
  FOR ALL USING (auth.uid() = user_id);

-- Users can only see rooms they're in
CREATE POLICY "users_own_rooms" ON rooms
  FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Users can update rooms they're in (to end them)
CREATE POLICY "users_update_rooms" ON rooms
  FOR UPDATE USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Edge Function uses service_role key, bypasses RLS
```

### Realtime Authorization

```sql
-- Allow authenticated users to receive broadcasts on their match channel
CREATE POLICY "authenticated_receive_broadcasts" ON realtime.messages
  FOR SELECT TO authenticated USING (true);
```

### Frontend Hook: `useMatchmaking`

```
src/features/lobby/hooks/use-matchmaking.ts

Replaces: use-match-state.ts

State: idle → queuing → searching → matched → navigating
  
- startMatching(mode, interests):
  1. INSERT into match_queue
  2. Subscribe to channel `match:{userId}`
  3. Listen for 'matched' broadcast event
  4. On match: set state to matched, store room_id + partner info
  5. Navigate to /chat?room={roomId} or /games?room={roomId}

- cancelMatching():
  1. UPDATE match_queue SET status = 'cancelled'
  2. Unsubscribe from channel
  3. Reset to idle

- Cleanup: unsubscribe on unmount, cancel if navigating away
```

---

## 2. Chat (Ephemeral Broadcast)

### Channel: `chat:{roomId}`

All messages are Broadcast events — **no database writes for messages**.

### Events

| Event | Payload | Direction |
|-------|---------|-----------|
| `message` | `{ sender_id, text, timestamp }` | Both → Both |
| `typing` | `{ sender_id, is_typing }` | Both → Both |
| `end_chat` | `{ sender_id }` | One → Both |

### Presence

Both users track presence on the channel:
```js
channel.track({ user_id, joined_at })
```

Presence `leave` event = partner disconnected → show "Stranger disconnected" UI.

### Frontend Hook: `useRealtimeChat`

```
src/features/chat/hooks/use-realtime-chat.ts

Replaces: use-chat.ts

Props: roomId, userId

Returns:
  - messages: ChatMessage[]
  - sendMessage(text): void
  - endChat(): void
  - isStrangerTyping: boolean
  - isStrangerConnected: boolean
  - chatStatus: 'connecting' | 'active' | 'ended' | 'disconnected'

Implementation:
  1. Subscribe to channel `chat:{roomId}` with Presence
  2. Track own presence
  3. Listen for broadcast events (message, typing, end_chat)
  4. Listen for presence leave (stranger disconnected)
  5. Messages stored in local React state only (ephemeral)
  6. Typing indicator: debounced broadcast on keystroke
  7. Cleanup: untrack + unsubscribe on unmount or chat end
```

### Room Lifecycle

```
1. Both users navigate to /chat?room={roomId}
2. Both subscribe to chat:{roomId} channel
3. Both track presence
4. Exchange messages via broadcast
5. Either user clicks "End Chat" → broadcasts end_chat
6. Or stranger disconnects → presence leave detected
7. UPDATE rooms SET status = 'ended', ended_at = now()
8. Show ChatEndedView with duration + message count
```

---

## 3. Games (Client-side + Broadcast)

### Architecture

Games run **entirely client-side**. Both clients maintain the same game state. Moves are broadcast and applied locally.

For v1, only implementing: **Tic Tac Toe** (simplest proof of concept).

### Channel: `game:{roomId}`

### Events

| Event | Payload | Direction |
|-------|---------|-----------|
| `move` | `{ sender_id, position, timestamp }` | One → Both |
| `game_start` | `{ first_player_id, game_type }` | Broadcast |
| `game_end` | `{ winner_id, reason }` | Broadcast |
| `rematch` | `{ sender_id }` | One → Both |

### Game State (rooms.game_state JSONB)

```json
// Tic Tac Toe example
{
  "board": [null, "X", null, "O", null, null, null, null, null],
  "players": { "X": "user-a-id", "O": "user-b-id" },
  "current_turn": "X",
  "winner": null,
  "status": "playing" // "playing" | "won" | "draw"
}
```

### Frontend Hook: `useGameRoom`

```
src/features/games/hooks/use-game-room.ts

Props: roomId, userId, gameType

Returns:
  - gameState: GameState
  - makeMove(move): void
  - isMyTurn: boolean
  - winner: string | null
  - requestRematch(): void

Implementation:
  1. Subscribe to game:{roomId} channel
  2. Determine player assignment (user_a = X, user_b = O)
  3. Listen for 'move' events → validate + apply to local state
  4. On own move: validate locally, broadcast, apply
  5. Win detection runs after each move
  6. On game end: UPDATE rooms.game_state + rooms.status
```

### Game Engine Pattern

```
src/features/games/engines/tic-tac-toe.ts

Pure functions (no React):
  - createInitialState(playerA, playerB): GameState
  - applyMove(state, move): GameState | Error
  - checkWinner(state): { winner, line } | null
  - getValidMoves(state): Position[]
  - isMyTurn(state, userId): boolean

Each game type gets its own engine file.
Future games follow the same pattern.
```

---

## PR Breakdown

### PR 1: `feat/realtime-schema` — Database + Edge Function

- Migration: `match_queue` and `rooms` tables with RLS
- Edge Function: `match-users` (matching logic)
- Realtime authorization policy
- Type regeneration

### PR 2: `feat/matchmaking` — Real Matchmaking Flow

- `useMatchmaking` hook replacing `useMatchState`
- Update LobbyView + SearchingView to use real matchmaking
- Queue entry management (insert/cancel/cleanup)
- Match notification via Broadcast
- Navigation to /chat on match

### PR 3: `feat/realtime-chat` — Ephemeral Chat

- `useRealtimeChat` hook replacing `useChat`
- Update ChatView to accept roomId from URL params
- Real message exchange via Broadcast
- Typing indicator via Broadcast
- Presence tracking (stranger connected/disconnected)
- Room status update on chat end

### PR 4: `feat/tic-tac-toe` — First Playable Game

- Tic Tac Toe engine (pure functions)
- `useGameRoom` hook
- Game board UI component
- Game route with room param
- Integration with matchmaking (mode: 'games')

---

## Verification

Each PR:
1. `npm run check` — Biome passes
2. `npm run typecheck` — TypeScript passes
3. `npm run build` — Builds successfully
4. Manual test with two browser tabs logged in as different users (user-a, user-b)
5. Match flow: User A starts matching → User B starts matching → both see match → chat opens
6. Test against hosted Supabase project (not just local) before merging Realtime PRs

## Edge Cases

- User closes tab while searching → match_queue entry stays 'waiting', Edge Function expires it after 2 min
- User closes tab during chat → Presence leave fires, partner sees "disconnected"
- Both users end chat simultaneously → idempotent room update
- User navigates to /chat without roomId → redirect to /dashboard
- User navigates to /chat with invalid roomId → show error
- Network disconnect during chat → Realtime reconnects automatically, Presence re-syncs
- Match queue has odd number of users → one stays waiting
- User tries to match while already in queue → unique constraint prevents duplicate
- Concurrent cron invocations → advisory lock serializes execution
- Broadcast fails after DB commit → notified flag enables retry on next cycle
- Edge Function crashes mid-execution → transaction rolls back, users stay in queue

## Post-v1 Considerations

- **Game move validation**: Move validation is client-side only in v1. The game engine files are pure functions that can run unchanged in an Edge Function for server-side validation in v2.
- **Alerting**: Add queue depth alerts and avg wait time monitoring when user volume warrants it.
- **Staging environment**: Dedicated Supabase staging project (free tier) for pre-production testing.
- **Rate limiting**: Prevent queue spam (rapid insert/cancel cycles) via RLS or Edge Function throttling.

---

# UX Redesign Plan (PR 5: `feat/ux-redesign`)

## Summary

Restructure the matching/chat/game flow: remove mode-based matching, use profile-based soft-preference matching (interests, gender, age, region), integrate games as a side-by-side panel within chat, remove standalone game routes, and add conversation prompt cards.

## User Decisions

| Question | Answer |
|----------|--------|
| Interest source for matching | Both: default to profile interests, allow editing before match |
| Game + chat layout | Side-by-side: chat left, game right (desktop); stacked on mobile |
| Games catalog page | Remove it — game selection happens inline within chat |
| Matching filters (gender/age/region) | Soft preferences: prefer similar, fall back to any after timeout |
| Prompt cards | Auto-generated from stranger's interests |

## System Impact

### Source of Truth Changes
- **Before**: `match_queue.mode` determines room type (chat vs game). Interests entered per-session.
- **After**: No mode. All rooms start as `chat`. Interests sourced from `profiles` table (editable pre-match). Gender/DOB/region from profiles used for scoring.

### State Ownership Changes
- **Game panel toggle**: New client-side state in ChatView (`showGame: boolean`, `selectedGame: string | null`)
- **Stranger's profile**: Chat needs to fetch partner's profile (interests, display_name) for prompt cards. Currently not fetched.

### Removed Concepts
- `MatchMode` type (`"text" | "games"`) — eliminated
- `match_queue.mode` column — no longer used for pairing (backward-compat: keep column, stop grouping by it)
- `/games` route and `/game` route — removed
- Games sidebar nav item — removed

### New Concepts
- **Match scoring**: Multi-factor score (interests + gender + age proximity + region) replaces interest-only scoring
- **Prompt cards**: Generated from stranger's interests, shown before first message
- **Inline game picker**: Small UI within chat header/toolbar to select and start a game

## Approach

### PR Breakdown (3 sub-PRs to keep changes manageable)

**PR 5a: `feat/ux-sidebar-and-matching`** — Remove mode, update sidebar, profile-based matching
**PR 5b: `feat/ux-chat-games-integration`** — Side-by-side game panel in chat, remove /games and /game routes
**PR 5c: `feat/ux-prompt-cards`** — Conversation starter prompt cards

---

### PR 5a: Sidebar + Matching Redesign

#### Changes

- `src/layout/dashboard-shell.tsx` — Remove "Chat" and "Games" from `sidebarNav`. Keep only Lobby and Settings.

- `src/features/lobby/types/index.ts` — Remove `MatchMode` type. Export new `MatchPreferences` type:
  ```ts
  interface MatchPreferences {
    interests: string[];
    // gender/age/region pulled from profile server-side
  }
  ```

- `src/features/lobby/components/match-config-card.tsx` — Remove mode toggle. Show profile interests (pre-filled from profile, editable). Remove mode param from `onStartMatching`.

- `src/features/lobby/hooks/use-matchmaking.ts` — Remove `mode` from state and queue insert. Always navigate to `/chat` on match. Fetch profile interests as defaults.

- `supabase/functions/match-users/index.ts` — Replace `byMode` grouping with single pool. Add multi-factor scoring:
  ```
  score = interestOverlap * 3 + genderMatch * 2 + regionMatch * 2 + ageProximity * 1
  ```
  Edge Function needs to JOIN profiles table to get gender/DOB/region for scoring.

- `supabase/migrations/XXXXXXXX_update_match_queue_for_redesign.sql` — 
  - Make `mode` column nullable or give default (keep for backward compat, stop using for pairing)
  - All rooms created as type `'chat'` (games are a feature within chat, not a room type)

#### Files Modified
- `src/layout/dashboard-shell.tsx` — Remove Chat + Games nav items
- `src/features/lobby/types/index.ts` — Replace MatchMode
- `src/features/lobby/components/match-config-card.tsx` — Remove mode toggle, pre-fill interests
- `src/features/lobby/components/lobby-view.tsx` — Remove initialMode prop
- `src/features/lobby/hooks/use-matchmaking.ts` — Remove mode logic
- `src/routes/_authenticated/dashboard.tsx` — Remove mode search param
- `supabase/functions/match-users/index.ts` — Multi-factor scoring
- New migration for schema changes

---

### PR 5b: Chat + Games Integration

#### Changes

- `src/features/chat/components/chat-view.tsx` — Add game panel state. Side-by-side layout:
  ```
  Desktop: [Chat (flex-1)] [Game Panel (w-96, collapsible)]
  Mobile: [Chat] with slide-up game sheet
  ```
  Add game toggle button in ChatHeader.

- `src/features/chat/components/chat-header.tsx` — Add "Play a game" button/icon that opens game picker.

- `src/features/chat/components/game-panel.tsx` (NEW) — Wrapper that shows game picker or active game. Contains:
  - Game picker (list of available games from `games/data/games.ts`)
  - Active game view (renders TicTacToeBoard etc.)
  - Uses existing `useGameRoom` hook

- `src/features/games/hooks/use-game-room.ts` — Minor: accept roomId that's already a chat room (no separate game room needed). Game state synced via `game:{roomId}` Broadcast channel (already works this way).

- Remove routes:
  - Delete `src/routes/_authenticated/game.tsx`
  - Delete `src/routes/_authenticated/games.tsx`

- `src/features/games/components/games-view.tsx` — Delete (catalog page)
- `src/features/games/components/game-view.tsx` — Refactor into `game-panel.tsx` (reuse logic, different layout)

#### Files Modified
- `src/features/chat/components/chat-view.tsx` — Side-by-side layout with game panel
- `src/features/chat/components/chat-header.tsx` — Add game toggle
- `src/features/chat/components/game-panel.tsx` — NEW: inline game panel
- `src/routes/_authenticated/game.tsx` — DELETE
- `src/routes/_authenticated/games.tsx` — DELETE
- `src/features/games/components/games-view.tsx` — DELETE
- `src/features/games/components/game-view.tsx` — DELETE (logic moves to game-panel)
- `src/features/games/index.ts` — Update barrel exports

---

### PR 5c: Prompt Cards

#### Changes

- `src/features/chat/hooks/use-stranger-profile.ts` (NEW) — Fetch stranger's profile (interests, display_name) using the partnerId from the room. Cached via TanStack Query.

- `src/features/chat/components/prompt-cards.tsx` (NEW) — Shows 3-4 clickable prompt cards based on stranger's interests. Examples:
  - Interest "hiking" → "What's the best trail you've ever hiked?"
  - Interest "anime" → "What anime are you watching right now?"
  - No interests → generic prompts ("What's something interesting that happened today?")
  Clicking a card populates the message input.

- `src/features/chat/components/message-list.tsx` — Show prompt cards when messages array is empty and stranger is connected.

- `src/features/chat/data/prompt-templates.ts` (NEW) — Map of interest keywords to prompt templates. Fallback generic prompts.

#### Files Modified
- `src/features/chat/hooks/use-stranger-profile.ts` — NEW
- `src/features/chat/components/prompt-cards.tsx` — NEW
- `src/features/chat/data/prompt-templates.ts` — NEW
- `src/features/chat/components/message-list.tsx` — Integrate prompt cards
- `src/features/chat/index.ts` — Update exports

---

## Verification

1. **Matching**: Two users with overlapping interests match faster than those without. Users with no overlap still match after 30s fallback. Gender/region preferences improve match quality but don't block.
2. **Chat**: After match, both users land in chat. Chat works as before.
3. **Games**: Click game icon in chat header → game picker appears → select Tic Tac Toe → side-by-side panel shows board. Game plays normally alongside chat.
4. **Prompt cards**: First message view shows interest-based prompts. Clicking populates input. Cards hide after first message sent.
5. **Navigation**: No /games or /game routes. Sidebar only shows Lobby + Settings. Chat route still works with roomId.
6. **Mobile**: Game panel is a bottom sheet or stacked below chat.
7. **`npm run check`** passes (Biome + typecheck)

---

# Refactoring Plan

## Summary

Systematic refactoring pass to enforce single responsibility, eliminate duplication, fix naming inconsistencies, and bring all files under 150 lines. No feature changes — purely structural improvements following the React Component Refactoring Skill guidelines.

## Audit Findings

- **7 files over 200 lines** (excluding shadcn/ui generated files)
- **3 files with tangled logic** (business logic mixed with UI)
- **~70 lines of duplicated code** (DOB picker, gender select across onboarding + settings)
- **Naming/export inconsistencies** (Footer.tsx PascalCase + default export, empty barrel files)
- **Inline schemas** in settings instead of dedicated files

## Approach: 8 PRs (stacked or parallel)

Each PR is independently reviewable and mergeable.

---

### PR 1: `refactor/shared-form-components` — Extract DateOfBirthPicker + GenderSelect

**Problem:** Nearly identical ~35-line DOB calendar popover and gender select blocks duplicated in `onboarding-form.tsx` and `profile-section.tsx`. `MAX_DOB` constant defined twice.

**Changes:**
- `src/components/form/date-of-birth-picker.tsx` — NEW: Extracted `<DateOfBirthPicker />` using FormInput + Popover + Calendar
- `src/components/form/gender-select.tsx` — NEW: Extracted `<GenderSelect />` using FormInput + Select
- `src/lib/constants.ts` — NEW: Move `MAX_DOB` here
- `src/features/onboarding/components/onboarding-form.tsx` — Replace inline DOB/gender blocks with shared components
- `src/features/settings/components/profile-section.tsx` — Same replacement
- `src/components/form/index.ts` — Update barrel exports

---

### PR 2: `refactor/use-game-room` — Break up use-game-room.ts (294 → ~150 lines)

**Problem:** 150-line useEffect with inline broadcast handlers. Rematch logic duplicated between broadcast handler and `requestRematch` callback.

**Changes:**
- `src/features/games/hooks/use-game-room.ts` — Refactor:
  - Extract `startNewGame(roomDataRef, setGameState, setRoomStatus, channel)` helper
  - Extract broadcast event handlers into named functions: `handleGameStart`, `handleGameMove`, `handleRematchRequest`, `handleRematchAccepted`
  - Break the monolithic useEffect into a `setupGameChannel()` async function composed of smaller pieces

---

### PR 3: `refactor/settings-cleanup` — Extract schema + mutations hook

**Problem:** Inline Zod schema in `profile-section.tsx`. Mutation definitions + success timers tangled in `settings-view.tsx`.

**Changes:**
- `src/features/settings/schema.ts` — NEW: Extract profile form schema from profile-section.tsx
- `src/features/settings/hooks/use-settings-mutations.ts` — NEW: Extract `useSettingsMutations()` hook from settings-view.tsx (profile + preferences mutations, success state, cache invalidation)
- `src/features/settings/components/settings-view.tsx` — Slim down to pure layout orchestration
- `src/features/settings/components/profile-section.tsx` — Import schema from dedicated file
- `src/features/settings/index.ts` — Update barrel exports

---

### PR 4: `refactor/naming-consistency` — Fix naming, exports, barrel files

**Problem:** `Footer.tsx` is PascalCase with default export (only file in codebase). Chat/games have empty barrel files. Inconsistent patterns.

**Changes:**
- `src/layout/Footer.tsx` → `src/layout/footer.tsx` — Rename + change to named export
- `src/layout/dashboard-shell.tsx` — Update Footer import
- `src/routes/_landing.tsx` — Update Footer import
- `src/features/chat/index.ts` — Populate with proper barrel exports (ChatView, useRealtimeChat, types)
- `src/features/games/index.ts` — Populate with proper barrel exports (TicTacToeBoard, useGameRoom, types)

---

### PR 5: `refactor/game-panel-decomposition` — Split game-panel.tsx (271 → ~100 lines)

**Problem:** 4 sub-components in one file. `ActiveGame` is ~135 lines with 6-level deep nesting.

**Changes:**
- `src/features/chat/components/active-game.tsx` — NEW: Extract ActiveGame component
- `src/features/chat/components/game-panel.tsx` — Keep as orchestrator importing ActiveGame, GamePickerCard, GameInviteModal
- `src/features/chat/components/game-status-bar.tsx` — NEW: Extract the game status/turn indicator (optional, if ActiveGame is still >150 lines)

---

### PR 6: `refactor/login-extraction` — Move login logic to feature

**Problem:** `login.tsx` route has mutation definitions, mode state, and SSR guards inline — inconsistent with other routes being thin shells.

**Changes:**
- `src/features/auth/components/login-view.tsx` — NEW: Extract login page component with auth mode toggle + mutations
- `src/routes/login.tsx` — Slim to thin route shell importing LoginView
- `src/features/auth/index.ts` — Update barrel exports

---

### PR 7: `refactor/dashboard-shell-split` — Split dashboard-shell.tsx (179 lines, 4 components)

**Problem:** DashboardTopBar, DashboardSidebar, MobileTabBar, and DashboardShell all in one file.

**Changes:**
- `src/layout/dashboard-topbar.tsx` — NEW: Extract DashboardTopBar
- `src/layout/dashboard-sidebar.tsx` — NEW: Extract DashboardSidebar
- `src/layout/mobile-tab-bar.tsx` — NEW: Extract MobileTabBar
- `src/layout/dashboard-shell.tsx` — Keep as orchestrator composing the above

---

### PR 8: `refactor/realtime-chat-cleanup` — Tidy use-realtime-chat.ts (259 lines)

**Problem:** Large useEffect with 5 inline channel event handlers.

**Changes:**
- `src/features/chat/hooks/use-realtime-chat.ts` — Extract named handler functions (`handleNewMessage`, `handleTyping`, `handlePresenceSync`, `handlePresenceLeave`), compose them in a cleaner `setupChatChannel()` function

---

## Verification

For every PR:
1. `npm run typecheck` passes
2. `npm run check` passes (Biome lint + format)
3. Manual test: matchmaking → chat → game invite → tic tac toe → rematch all still work
4. No behavioral changes — purely structural
