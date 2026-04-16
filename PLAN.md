# Lume Dashboard Implementation Plan

## Summary

Replace the placeholder dashboard with a full stranger-matching lobby interface, chat view, games page, and settings — implemented as separate PRs to keep changes reviewable. All UI is frontend-only (mock state, no backend matching/realtime yet). Each PR builds on the previous, adding one cohesive feature at a time.

## Context

**Current state:** Dashboard is a placeholder `Card` saying "Welcome, {user}! You are on a protected route." The `DashboardShell` (topbar + sidebar) wraps all authenticated routes except `/onboarding`. Sidebar links to `/chat`, `/games`, `/settings` but those routes don't exist.

**Key constraints:**
- Feature-based architecture: domain code in `src/features/<name>/`, route files are thin shells
- Tailwind v4 CSS-first config, shadcn/ui (New York style), semantic dark mode tokens
- Biome formatting (tabs, double quotes), `npm run check` must pass
- No backend matching/realtime — all state is local/mock for now
- Reuse `INTEREST_OPTIONS` from onboarding schema for matching interests
- Sidebar currently uses `<a>` tags — needs `<Link>` for client-side navigation

**Existing patterns to follow:**
- Route files: `createFileRoute` with `head()` for meta, thin component that delegates to feature
- Feature modules: `components/`, `types/`, `index.ts` barrel export
- Auth data: `useAuth()` → `{ user, session, isLoading }`
- Profile data: `useSuspenseQuery(profileOnboardingOptions(userId))`

## System Impact

- **Source of truth:** Match state (idle/searching/chatting/ended) will be local React state for now. When backend arrives, this moves to Supabase Realtime channel state.
- **Data flow:** Lobby → local state machine → chat view. No persistent data. Messages are ephemeral.
- **Routes added:** `/chat`, `/games`, `/settings` (all under `_authenticated` layout)
- **Sidebar:** Updated from `<a>` to `<Link>` for client-side navigation

## PR Breakdown

---

### PR 1: `feat/lobby-ui` — Lobby Matching Interface

Replace the placeholder dashboard with the lobby — the primary matching interface users see after login.

**New shadcn components:**
- `badge` (for interest tags)
- `toggle-group` (for mode selector)

**New files:**
- `src/features/lobby/components/lobby-view.tsx` — Main lobby layout (centered card + activity footer)
- `src/features/lobby/components/match-config-card.tsx` — Mode toggle, interests input, Start button, live counter
- `src/features/lobby/components/interest-input.tsx` — Tag input with add/remove for matching interests
- `src/features/lobby/types/index.ts` — Types (MatchMode, LobbyState)
- `src/features/lobby/index.ts` — Barrel exports

**Modified files:**
- `src/routes/_authenticated/dashboard.tsx` — Import LobbyView instead of DashboardContent
- `src/layout/dashboard-shell.tsx` — Change sidebar `<a>` tags to `<Link>`, fix active state matching
- `CLAUDE.md` — Update project structure, key files, layout system docs

**Deleted files:**
- `src/features/dashboard/` — Entire directory (replaced by lobby feature)

---

### PR 2: `feat/matching-flow` — Searching State + State Machine

Add the searching/matching flow — animated searching overlay with cancel and timer.

**New files:**
- `src/features/lobby/components/searching-view.tsx` — Animated searching state (pulsing dots, timer, cancel button)
- `src/features/lobby/hooks/use-match-state.ts` — State machine hook (idle → searching → matched → chatting → ended)

**Modified files:**
- `src/features/lobby/components/lobby-view.tsx` — Integrate state machine, toggle between idle/searching views
- `src/features/lobby/types/index.ts` — Add MatchState type union

---

### PR 3: `feat/chat-ui` — Chat Route + Interface

Full chat view with message bubbles, input, header, and post-chat ended state.

**New files:**
- `src/features/chat/components/chat-view.tsx` — Main chat layout (header + messages + input)
- `src/features/chat/components/chat-header.tsx` — "Stranger" label, timer, game invite button, end button
- `src/features/chat/components/message-list.tsx` — Scrollable message area with bubbles
- `src/features/chat/components/message-input.tsx` — Text input with send button
- `src/features/chat/components/chat-ended-view.tsx` — Post-chat summary, new match / back to lobby, feedback
- `src/features/chat/types/index.ts` — Message, ChatSession, ChatState types
- `src/features/chat/hooks/use-chat.ts` — Mock chat hook (simulates stranger messages)
- `src/features/chat/index.ts` — Barrel exports
- `src/routes/_authenticated/chat.tsx` — Chat route

**Modified files:**
- `src/features/lobby/hooks/use-match-state.ts` — Add navigation to chat on match
- `CLAUDE.md` — Add chat feature docs

---

### PR 4: `feat/games-page` — Game Catalog

Games catalog page with game cards.

**New files:**
- `src/features/games/components/games-view.tsx` — Page layout with game card grid
- `src/features/games/components/game-card.tsx` — Individual game card (icon, name, players, duration, play button)
- `src/features/games/data/games.ts` — Game definitions (Tic Tac Toe, Trivia, Word Game, Chess, etc.)
- `src/features/games/types/index.ts` — Game type definitions
- `src/features/games/index.ts` — Barrel exports
- `src/routes/_authenticated/games.tsx` — Games route

---

### PR 5: `feat/settings-page` — Settings/Profile

Settings page with profile editing and matching preferences.

**New files:**
- `src/features/settings/components/settings-view.tsx` — Settings page layout
- `src/features/settings/components/profile-section.tsx` — Display name, avatar
- `src/features/settings/components/preferences-section.tsx` — Default mode, interests
- `src/features/settings/types/index.ts` — Types
- `src/features/settings/index.ts` — Barrel exports
- `src/routes/_authenticated/settings.tsx` — Settings route

**Modified files:**
- `src/layout/dashboard-shell.tsx` — Update Profile dropdown link to use `/settings` route

---

### PR 6: `feat/mobile-nav` — Mobile Responsive Navigation

Bottom tab bar for mobile, responsive adjustments.

**Modified files:**
- `src/layout/dashboard-shell.tsx` — Add bottom tab bar (visible < md), hide sidebar on mobile
- `src/features/lobby/components/lobby-view.tsx` — Mobile padding/sizing adjustments
- `src/features/chat/components/chat-view.tsx` — Full-screen mobile chat

---

## Verification

For each PR:
1. `npm run check` — Biome lint + format passes
2. `npm run typecheck` — TypeScript compiles cleanly
3. `npm run build` — Production build succeeds
4. Manual verification: `npm run dev` and navigate through the flow

## Edge Cases

- User navigates directly to `/chat` without matching → show empty state or redirect to lobby
- User refreshes during searching → return to idle state (no persistent queue yet)
- Mobile keyboard appearing during chat → input should remain anchored to bottom
- Dark mode → all new UI uses semantic tokens, no hardcoded colors
