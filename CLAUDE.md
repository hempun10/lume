# Lume

A social platform for meeting strangers through text chat and multiplayer games — an alternative to Omegle-style random chat. Built with TanStack Start (full-stack React SSR framework), Supabase authentication, protected routes, and shadcn/ui.

Originally scaffolded from a TanStack Start + Supabase Auth starter template, inspired by:

- https://github.com/vercel/next.js/blob/canary/examples/with-supabase/README.md
- https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

## Tech Stack

- **Framework**: TanStack Start v1 (React 19, Vite 7, Nitro SSR)
- **Auth & DB**: Supabase (email/password auth, PostgreSQL, RLS)
- **Data Fetching**: TanStack Query (React Query) for caching, mutations, and server state; integrated with TanStack Router via `@tanstack/react-router-ssr-query` for automatic SSR dehydration/hydration
- **Styling**: Tailwind CSS v4, shadcn/ui (Radix primitives), Lucide icons
- **Code Quality**: Biome (lint/format), TypeScript (strict)
- **Analytics**: Vercel Analytics (automatic page view tracking)
- **Deployment**: Vercel via GitHub Actions CI/CD

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives (button, card, input, badge, toggle-group, avatar, dropdown-menu, tooltip, etc.)
│   ├── form/            # Reusable form field wrappers (FormInput, DateOfBirthPicker, GenderSelect)
│   └── errors/          # Error handling components (ErrorBoundary, ErrorPage, NotFound)
├── features/            # Domain-based feature modules (each with components/, context/, guards/, types/, schema.ts)
│   ├── auth/            # Auth feature
│   │   ├── components/  # AuthInput, AuthLayout, LoginView, form-login, form-signup, form-forgot-password, form-reset-password
│   │   ├── context/     # AuthContext provider + useAuth hook
│   │   ├── guards/      # Route guard (guard-authenticated)
│   │   ├── types/       # TypeScript interfaces (component props)
│   │   ├── schema.ts    # Zod validation schemas + inferred form value types
│   │   └── index.ts     # Barrel exports (public API)
│   ├── onboarding/      # Onboarding feature (post-signup profile setup)
│   │   ├── components/  # OnboardingForm, InterestTagSelector, AuthSelect
│   │   ├── schema.ts    # Zod schema + constants (GENDER_OPTIONS, INTEREST_OPTIONS)
│   │   └── index.ts     # Barrel exports
│   ├── lobby/           # Lobby/matching feature (main dashboard view)
│   │   ├── components/  # LobbyView, LobbyGreeting, LobbyHeroCard, GamesRail, PromptPreviewCard, YourVibeCard, SearchingView
│   │   ├── hooks/       # useMatchmaking (Supabase queue + Broadcast matching), useOnlineCount (Supabase Presence)
│   │   ├── types/       # MatchMode, LobbyViewProps
│   │   └── index.ts     # Barrel exports
│   ├── chat/            # Chat feature (1-on-1 stranger chat)
│   │   ├── components/  # ChatView, ChatHeader, MessageList, MessageInput, ChatEndedView, ActiveGame, GamePanel, GamePickerCard, GameInviteModal
│   │   ├── hooks/       # useRealtimeChat (Supabase Broadcast messages + Presence), useGameInvite, useStrangerProfile
│   │   ├── types/       # ChatMessage (senderId-based), ChatSession, ChatStatus
│   │   └── index.ts     # Barrel exports
│   ├── games/           # Games catalog + playable games
│   │   ├── components/  # GamesView, GameCard, and per-game boards (TicTacToe, Trivia, WouldYouRather, RockPaperScissors, TwoTruths, EmojiCharades, DrawAndGuess)
│   │   ├── engines/     # Pure function game engines (tic-tac-toe, trivia, would-you-rather, rock-paper-scissors, two-truths, emoji-charades, draw-and-guess)
│   │   ├── hooks/       # useGameRoom (Broadcast moves + Presence + rematch)
│   │   ├── data/        # games.ts (game catalog — 7 available, 2 coming soon)
│   │   ├── types/       # Game, GameStatus types
│   │   └── index.ts     # Barrel exports
│   ├── settings/        # Settings/profile feature
│   │   ├── components/  # SettingsView (page layout), ProfileSection (name/DOB/gender/region form), PreferencesSection (interests)
│   │   ├── hooks/       # useSettingsMutations (profile + preferences mutations with success state)
│   │   ├── types/       # ProfileData, ProfileFormValues, PreferencesFormValues
│   │   ├── schema.ts    # Zod schemas (profileSchema, preferencesSchema)
│   │   ├── queries.ts   # profileDetailOptions (fetch full profile from Supabase)
│   │   ├── mutations.ts # updateProfile, updatePreferences (Supabase updates)
│   │   └── index.ts     # Barrel exports
│   ├── landing/         # Landing page feature
│   │   ├── components/  # Hero, Stats, Features, Comparison, HowItWorks, FAQ, CTA sections
│   │   └── index.tsx    # LandingPage composite component
│   └── theme/           # Theme (dark mode) feature
│       ├── context/     # ThemeProvider + useTheme hook (light/dark, localStorage)
│       ├── components/  # ThemeToggle button (light ↔ dark, Sun/Moon icons)
│       └── index.ts     # Barrel exports
├── layout/              # App-wide layout components
│   ├── landing-header.tsx    # Landing page header (logo, nav links with anchor scroll, theme toggle, Sign In)
│   ├── dashboard-shell.tsx   # Dashboard shell composer (imports topbar + sidebar + mobile tab bar)
│   ├── dashboard-topbar.tsx  # Dashboard top bar (logo, online indicator, avatar dropdown)
│   ├── dashboard-sidebar.tsx # Desktop icon sidebar (Lobby, Settings) + shared sidebarNav config
│   ├── mobile-tab-bar.tsx    # Mobile bottom tab bar (reuses sidebarNav)
│   └── footer.tsx            # Footer (used by landing layout)
├── lib/                 # Library configurations
│   ├── supabase/        # Supabase client singleton + getSessionReady()
│   ├── constants.ts     # Shared constants (MAX_DOB)
│   └── utils.ts         # cn() helper (shadcn)
├── routes/              # File-based routing (TanStack Router) — thin shells importing from features
│   ├── __root.tsx       # Root layout (ThemeProvider, AuthProvider, TooltipProvider)
│   ├── _landing.tsx     # Landing layout route (LandingHeader + Footer + Outlet)
│   ├── _landing/index.tsx # Landing page route (renders LandingPage)
│   ├── _authenticated.tsx # Route guard layout (redirects to /login if unauthenticated, to /onboarding if incomplete, wraps in DashboardShell)
│   ├── _authenticated/dashboard.tsx # Lobby/matching page
│   ├── _authenticated/chat.tsx    # 1-on-1 stranger chat (roomId search param) + inline game panel
│   ├── _authenticated/games.tsx   # Game catalogue (browse before matching)
│   ├── _authenticated/settings.tsx # Profile & preferences settings
│   ├── _authenticated/onboarding.tsx # Post-signup onboarding (set display name)
│   ├── login.tsx        # Combined login/signup (thin shell, delegates to LoginView)
│   ├── forgot-password.tsx / reset-password.tsx # Password reset flow
│   └── logout.tsx       # Sign out and redirect
├── types/               # TypeScript types (database.types.ts — auto-generated)
├── router.tsx
├── routeTree.gen.ts
└── styles.css
```

### Key files

- `src/features/auth/context/auth-context.tsx` — React context providing `session`, `user`, `isLoading` via `useAuth()` hook
- `src/features/auth/guards/guard-authenticated.ts` — `requireAuth()` guard used by protected route layouts
- `src/features/auth/schema.ts` — Zod validation schemas for auth forms (login: email+password, signup: email+password, forgot-password, reset-password)
- `src/features/auth/components/auth-layout.tsx` — Split-screen auth layout (UserJot-inspired: form left, branding panel right, customizable quote/caption)
- `src/features/auth/components/auth-input.tsx` — Reusable styled input with left-side icon, used across all auth & onboarding forms
- `src/features/auth/components/form-login.tsx` / `form-signup.tsx` / `form-forgot-password.tsx` / `form-reset-password.tsx` — Auth form components using React Hook Form + Zod
- `src/features/onboarding/components/onboarding-form.tsx` — Post-signup onboarding form (display name, DOB, gender, region, interests)
- `src/features/onboarding/components/interest-tag-selector.tsx` — Toggleable tag chip grid for selecting interests
- `src/features/onboarding/schema.ts` — Zod schema for onboarding form + GENDER_OPTIONS + INTEREST_OPTIONS constants (reused by lobby for matching interests)
- `src/features/lobby/components/lobby-view.tsx` — Main lobby as a scrollable editorial feed (greeting → hero card → games rail → conversation starters → your vibe)
- `src/features/lobby/components/lobby-hero-card.tsx` — Primary match card (mode toggle chat/games, one-tap interest chips, live online counter, Start matching CTA)
- `src/features/lobby/components/games-rail.tsx` — Horizontal games preview (mobile scroll / desktop grid)
- `src/features/lobby/components/prompt-preview-card.tsx` — 3 interest-seeded conversation starters with copy + shuffle
- `src/features/lobby/components/your-vibe-card.tsx` — Profile mini-preview with edit link
- `src/features/lobby/components/lobby-greeting.tsx` — Time-aware greeting (morning/afternoon/evening/late-night)
- `src/features/lobby/hooks/use-online-count.ts` — Supabase Presence count on `lume:lobby-presence` channel
- `src/features/chat/components/chat-view.tsx` — Main chat layout (header + messages + input, post-chat ended state)
- `src/features/chat/hooks/use-realtime-chat.ts` — Real-time chat hook (Broadcast messages + Presence typing/connection); channel event handlers extracted as named functions
- `src/features/chat/components/active-game.tsx` — Active game component (TicTacToe board, status, rematch UI) — extracted from game-panel.tsx
- `src/features/games/components/games-view.tsx` — Game catalog page with available/coming-soon sections
- `src/features/games/components/game-view.tsx` — Game room wrapper (connects to game room, renders board, handles rematch)
- `src/features/games/components/tic-tac-toe-board.tsx` — 3x3 game board with animated marks and win highlighting
- `src/features/games/components/trivia-board.tsx` — Six-question multiple-choice trivia with blind answers + reveal
- `src/features/games/components/would-you-rather-board.tsx` — Eight either/or prompts with synced reveal
- `src/features/games/components/rock-paper-scissors-board.tsx` — Best-of-five with blind commit + simultaneous reveal
- `src/features/games/components/two-truths-board.tsx` — Two truths & a lie (take turns authoring + guessing)
- `src/features/games/components/emoji-charades-board.tsx` — Emoji charades with prompt author and guesser roles
- `src/features/games/components/draw-and-guess-board.tsx` — Live drawing canvas + guess input, per-round difficulty picker (easy / medium / hard)
- `src/features/games/engines/tic-tac-toe.ts` — Pure function game engine (createInitialState, applyMove, checkWinner, isDraw)
- `src/features/games/engines/trivia.ts` / `would-you-rather.ts` / `rock-paper-scissors.ts` / `two-truths.ts` / `emoji-charades.ts` / `draw-and-guess.ts` — Pure function engines for the remaining available games
- `src/features/games/engines/types.ts` — Shared game engine types + `customEvents` adapter (engines can register non-move Broadcast events that `useGameRoom` wires up automatically — used for drawing strokes in Draw & Guess)
- `src/features/games/hooks/use-game-room.ts` — Game room hook (Broadcast moves, Presence player detection, rematch protocol, customEvents)
- `src/features/games/components/game-card.tsx` — Individual game card (icon, name, description, players, duration, play button with onPlay callback)
- `src/features/games/data/games.ts` — Game catalogue. **Available (7):** Tic Tac Toe, Trivia, Would You Rather, Rock Paper Scissors, Two Truths & a Lie, Emoji Charades, Draw & Guess. **Coming soon (2):** Word Chain, Chess.
- `src/features/settings/components/settings-view.tsx` — Settings page layout with profile + preferences sections (delegates mutations to useSettingsMutations hook)
- `src/features/settings/components/profile-section.tsx` — Editable profile form (display name, DOB, gender, region) — uses shared DateOfBirthPicker + GenderSelect
- `src/features/settings/components/preferences-section.tsx` — Editable matching preferences (interests tag selector)
- `src/features/settings/hooks/use-settings-mutations.ts` — Encapsulates profile + preferences mutations with success state and cache invalidation
- `src/features/settings/schema.ts` — Zod schemas (profileSchema, preferencesSchema) used by settings form components
- `src/features/settings/queries.ts` — profileDetailOptions (fetches full profile, reuses profileKeys from onboarding for cache coherence)
- `src/features/settings/mutations.ts` — updateProfile, updatePreferences (Supabase update calls)
- `src/lib/supabase/client.ts` — Supabase client singleton + `getSessionReady()` helper
- `src/components/form/form-input.tsx` — Generic reusable form field component using `useFormContext()`, renders AuthInput by default or accepts children render function for custom controls
- `src/components/form/date-of-birth-picker.tsx` — Reusable DOB picker (Calendar popover, enforces 18+ via MAX_DOB)
- `src/components/form/gender-select.tsx` — Reusable gender select (shadcn Select, uses GENDER_OPTIONS from onboarding schema)
- `src/lib/constants.ts` — Shared constants (MAX_DOB for 18+ age requirement)
- `src/components/errors/error-boundary.tsx` / `error-page.tsx` / `not-found.tsx` — Error handling components
- `src/layout/landing-header.tsx` — Landing page header with logo, centered nav (Features, How it works, FAQ with anchor scroll), theme toggle, Sign In button, mobile Sheet
- `src/layout/dashboard-shell.tsx` — Dashboard shell composer (thin wrapper importing topbar, sidebar, mobile tab bar)
- `src/layout/dashboard-topbar.tsx` — Top bar (logo, online indicator, avatar dropdown with Profile link)
- `src/layout/dashboard-sidebar.tsx` — Desktop icon sidebar (Lobby, Settings with tooltips) + shared `sidebarNav` config
- `src/layout/mobile-tab-bar.tsx` — Mobile bottom tab bar (reuses `sidebarNav` from dashboard-sidebar)
- `src/layout/footer.tsx` — Footer component

## Layout Architecture

The app uses TanStack Router layout routes to switch between two distinct layouts:

### Landing Layout (`_landing.tsx`)
- **Header**: userjot.com-style — Logo left, centered nav links (Features, How it works, FAQ with anchor scroll), theme toggle + "Sign In" button right. Mobile: hamburger → Sheet sidebar.
- **Footer**: Standard footer
- **Routes**: `/` (landing page)

### Dashboard Layout (inside `_authenticated.tsx`)
- **Top bar** (48px): Lume logo left, online status indicator center, theme toggle + user avatar/dropdown right
- **Sidebar** (56px, desktop only): Icon-based nav — Lobby (`/dashboard`), Settings (`/settings`). Uses tooltips for labels. All links use `<Link>` for client-side navigation. Hidden on mobile (`hidden md:flex`).
- **Mobile tab bar** (56px, mobile only): Bottom navigation bar with icon + label for each nav item. Visible below `md` breakpoint (`flex md:hidden`). Active tab highlighted with `text-primary`.
- **Main area**: Full-height content area, no footer. Content shrinks to accommodate both topbar and mobile tab bar on small screens.
- **Responsive padding**: Page components use tighter padding on mobile (`px-4 py-6`) and wider on desktop (`md:px-6 md:py-8`). Centered card layouts (lobby, searching, chat-ended) use `px-4` and are naturally mobile-friendly.
- **Onboarding** (`/onboarding`) renders WITHOUT the dashboard shell (its own full-screen layout)

### Theme
- Light/dark only (no "system" option). `ThemeToggle` uses Sun/Moon icons with CSS `dark:` classes.
- `ThemeProvider` persists to localStorage (`lume-theme` key). Inline `<script>` in `__root.tsx` prevents FOUC.
- All UI uses shadcn semantic tokens (`text-foreground`, `bg-background`, `border-border`, etc.) — never hardcode gray/neutral colors.

## Key Commands

```bash
npm run dev              # Dev server at http://127.0.0.1:3000
npm run build            # Production build
npm run db:start         # Start local Supabase (Docker)
npm run db:reset         # Migrate + type-gen + seed
npm run db:types         # Regenerate TypeScript types from schema
npm run lint             # Biome lint
npm run format           # Biome format
npm run check            # Lint + format
npm run typecheck       # TypeScript type checking
```

## Key Patterns

- **Protected routes** use `_authenticated.tsx` layout with a `beforeLoad` hook that checks auth state and redirects. It also checks if the user's profile is complete (has `onboarding_completed`); if not, it redirects to `/onboarding`.
- **Auth flow** — Email/password only, no OAuth. Email confirmation is disabled (`enable_confirmations = false` in `supabase/config.toml`). Signup auto-signs in the user and redirects to `/onboarding`. Login redirects to `/dashboard`. Auth UI uses a UserJot-inspired split-screen layout (form card left, branding panel with dot-grid right).
- **Onboarding** — New users are redirected to `/onboarding` after signup to complete their profile (display name, date of birth, gender, region, interests). The `_authenticated` layout guard redirects to onboarding if `onboarding_completed` is false, catching users who somehow skip it. Users must be 18+ (DOB validated client-side). Region is optional. Interests use a tag chip selector (1–8 selections from a predefined list).
- **Lobby/Dashboard** — The main authenticated view at `/dashboard`, rendered as a vertical editorial feed (`max-w-5xl`, stacked sections, subtle staggered entrance). The hero card is the primary CTA (mode toggle + interest chips + live online counter + Start matching button). Below it: a Games rail, interest-seeded conversation starters (copy + shuffle), and a profile vibe preview linking to `/settings`. The lobby reuses `INTEREST_OPTIONS` from `src/features/onboarding/schema.ts` for matching interests. Visual style is monochrome editorial — no gradients or glow, one accent (primary) for the CTA, `tabular-nums` + `font-mono` for numeric data (online count, interest counter).
- **Games** — Games are played inline within chat via a side-by-side game panel. `/games` is a catalogue route (browse before matching) but gameplay itself happens inside `/chat`. Game definitions live in `src/features/games/data/games.ts`. Seven games are playable: **Tic Tac Toe**, **Trivia**, **Would You Rather**, **Rock Paper Scissors**, **Two Truths & a Lie**, **Emoji Charades**, and **Draw & Guess** (with a per-round difficulty picker: easy / medium / hard). Two are marked "coming soon": Word Chain, Chess. Each playable game has a pure-function engine in `src/features/games/engines/` and a board component in `src/features/games/components/`. Game state is synced client-side via Supabase Broadcast on the chat room's channel (no DB writes for moves). The `useGameRoom` hook handles the full game lifecycle: connecting, waiting for opponent, playing, finished, and rematch. Engines can opt into extra Broadcast events via the `customEvents` adapter (used by Draw & Guess for live stroke sync).
- **Settings** — Profile and preferences editor at `/settings`. Two card sections: Profile (display name, DOB, gender, region) and Matching Preferences (interests). Fetches profile from Supabase via `profileDetailOptions` query (reuses `profileKeys` from onboarding for cache coherence). Saves via `updateProfile` and `updatePreferences` mutations. Shows success/error feedback inline.
- **Profiles table** has columns: `id`, `display_name`, `date_of_birth`, `gender`, `region`, `interests` (text[]), `onboarding_completed` (boolean), `created_at`, `updated_at`
- **Session initialisation** — `getSessionReady()` in `src/lib/supabase/client.ts` waits for Supabase's `INITIAL_SESSION` event before calling `getSession()`. This prevents race conditions on fresh page loads where `getSession()` returns `null` before localStorage is restored. All `beforeLoad` guards use this helper via `requireAuth()`. The login page also has a client-side `useEffect` fallback because SSR `beforeLoad` runs server-side without access to localStorage.
- **Auth state** is managed via `AuthContext` in `src/features/auth/` — access with `useAuth()` hook anywhere in the component tree
- **TanStack Start SSR** — `beforeLoad` runs on both server and client, but does NOT re-run after SSR hydration. Auth guards use `Route.useRouteContext()` session as fallback for the `useAuth()` race condition.
- **Forms** use React Hook Form + Zod for type-safe validation. Reusable field components live in `src/components/form/`. Auth form components live in `src/features/auth/` and accept `onSubmit` callbacks with validated data.
- **Feature-based architecture** — domain code is grouped by feature (`features/auth/`, `features/onboarding/`, `features/lobby/`). Route files are thin shells that import UI from features and handle navigation/auth calls.
- **Database types** are auto-generated from the Supabase schema — run `npm run db:types` after migration changes
- **Profiles table** is auto-created on signup via a PostgreSQL trigger (`handle_new_user`). Profile fields (display_name, DOB, gender, region, interests) are set during onboarding.
- **RLS policies** ensure users can only read/update their own profile
- **Gender constraint** — Database CHECK constraint limits values to: male, female, non-binary, prefer-not-to-say
- **Path alias**: `@/*` maps to `src/*`
- **Dark mode** uses the `class` strategy (`@custom-variant dark` in styles.css). All UI uses shadcn semantic tokens (`text-foreground`, `bg-background`, `border-border`, etc.) — avoid hardcoded gray/neutral colors.
- **shadcn/ui** — Always use shadcn components. If a needed component doesn't exist, install via `npx shadcn@latest add <component> --yes --overwrite`, then format with `npx @biomejs/biome format --write`.
- **No unnecessary useEffect** — Use declarative `<Navigate>` for redirects, `beforeLoad` for route-level logic.
- **Mutation functions** — Extract all Supabase calls into dedicated mutation/query files per feature.
- **Homepage** is the Lume landing page (hero, features, comparison, FAQ, CTA), always accessible (no auth redirect)

## Automated Matchmaking (pg_cron + pg_net)

The `match-users` Edge Function is automatically invoked every 2 seconds via a pg_cron job that uses pg_net for HTTP requests. See migration `20260416070000_add_matchmaker_cron.sql`.

**Local dev quirks:**
- pg_net's libcurl **cannot resolve Docker container hostnames** (e.g., `supabase_kong_lume`). Use `host.docker.internal:54321` instead.
- `current_setting('app.settings.service_role_key')` is **empty** in local dev (only set in hosted Supabase). The migration falls back to the hardcoded local secret key.
- Both `apikey` and `Authorization` headers are required to call Edge Functions.
- Verify cron responses: `docker exec -i $(docker ps --filter "name=supabase_db_lume" -q) psql -U postgres -d postgres -c "SELECT id, status_code, created FROM net._http_response ORDER BY created DESC LIMIT 5;"`

## Safety & Trust (PR A)

Migration `20260417121137_add_safety_tables.sql` adds the moderation primitives:

- **`reports`** — reporter_id, reported_id, room_id, reason (check: `harassment|nudity|spam|underage|hate_speech|self_harm|other`), notes (≤1000 chars), status, reviewed_at. RLS: users see only reports they filed.
- **`blocks`** — blocker_id, blocked_id (unique pair). RLS: only the blocker can see/insert/delete their rows — the blocked user **never** learns they were blocked.
- **`match_history`** — canonical ordered pair (`user_a_id < user_b_id`) + matched_at. Used for the recent-pair cooldown.
- **Helper functions:** `canonical_pair(a,b)`, `is_recent_pair(a,b)` (**1-minute window** — was 30 minutes originally; shortened in migration `20260418060000_shorten_recent_pair_window.sql` for hackathon demo/testing), `is_blocked_pair(a,b)` (mutual).
- **`match_pair(p_a, p_b)` RPC** — SECURITY DEFINER; now rejects blocked + recent pairs and logs a `match_history` row on success.

The `match-users` Edge Function also pre-filters the batch via `fetchExclusions()` (see `supabase/functions/match-users/queue.ts`) so blocked/recent pairs are skipped before the RPC is called.

Client surfaces:
- `src/features/chat/mutations.ts` — `reportUser`, `blockUser` (idempotent), `unblockUser`, `REPORT_REASONS`.
- `src/features/chat/components/report-dialog.tsx` — reason radio + notes textarea + "Also block" checkbox (default on). Reachable from chat header Flag icon and end-of-chat screen.
- Onboarding requires a Terms + Privacy consent checkbox (see `OnboardingForm` / `onboardingSchema`).
- Stub legal routes: `/terms`, `/privacy`, `/community-guidelines`.

## Environment Variables

- `VITE_SUPABASE_URL` — Supabase API URL
- `VITE_SUPABASE_ANON_KEY` — Public anon key (safe for client)
- `SUPABASE_SECRET_KEY` — Server-side only (seeding, admin operations)

**File convention** (gitignored; `.env.example` and `.env.local.example` are committed):

- `.env` — Hosted/production Supabase credentials (from `.env.example`)
- `.env.local` — Local development overrides, takes precedence over `.env` (from `.env.local.example`)

## Test Users (local dev)

- `user-a@example.com` / `password123` (Alice)
- `user-b@example.com` / `password123` (Bob)
- Local email capture: Mailpit at `http://127.0.0.1:54324`

## Seed Data

Seed data lives in `supabase/seed-data.ts` as the single source of truth. Always reference seed data from this file rather than hardcoding values (in scripts, etc.). Keep `seed-data.ts` and `seed.ts` up to date when schema or data changes.

## Testing

There is no Vitest or Playwright suite — automated testing is driven by **TestSprite** against a production preview build (`npm run build && npm run preview`). See [`docs/TESTING.md`](docs/TESTING.md) for the test strategy, credentials, TestSprite configuration, feature→test-case matrix, and known gotchas (e.g. single-browser limitations for two-user matchmaking/chat/game flows).

The canonical product spec for TestSprite (and for onboarding new contributors) lives in [`docs/PRD.md`](docs/PRD.md).

## Updates made by Claude

- Please ensure documentation found in the repo is also updated alongside changes before processing to commiting or pushing features.
- Please ensure that release notes are created when pushing new features. They should be semantic and claude should auto detect what version to create next. New release route files should be added to `src/routes/(clean-up)/release-notes/` and their metadata added to `src/data/releases.ts`. Bump the `version` in `package.json` to match. The `release.yml` GitHub Action will auto-create a GitHub Release and git tag on merge to main.

Allow claude to run the following commands;

- npm run typecheck
- npm run check
- npm run lint
