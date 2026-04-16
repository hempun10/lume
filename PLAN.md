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
