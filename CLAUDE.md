# Lume

A social platform for meeting strangers through text chat and multiplayer games — an alternative to Omegle and rumi.social. Built with TanStack Start (full-stack React SSR framework), Supabase authentication, protected routes, and shadcn/ui.

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
│   ├── form/            # Reusable form field wrappers (FormInput)
│   └── errors/          # Error handling components (ErrorBoundary, ErrorPage, NotFound)
├── features/            # Domain-based feature modules (each with components/, context/, guards/, types/, schema.ts)
│   ├── auth/            # Auth feature
│   │   ├── components/  # AuthInput, AuthLayout (split-screen), form-login, form-signup, form-forgot-password, form-reset-password
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
│   │   ├── components/  # LobbyView, MatchConfigCard, InterestInput, SearchingView
│   │   ├── hooks/       # useMatchState (idle/searching/matched state machine)
│   │   ├── types/       # MatchMode, LobbyViewProps
│   │   └── index.ts     # Barrel exports
│   ├── chat/            # Chat feature (1-on-1 stranger chat)
│   │   ├── components/  # ChatView, ChatHeader, MessageList, MessageInput, ChatEndedView
│   │   ├── hooks/       # useChat (mock stranger responses + typing indicator)
│   │   ├── types/       # ChatMessage, ChatSession, ChatStatus
│   │   └── index.ts     # Barrel exports
│   ├── games/           # Games catalog feature
│   │   ├── components/  # GamesView (page layout + grid), GameCard (individual game card)
│   │   ├── data/        # games.ts (game definitions — Tic Tac Toe, Trivia, Word Chain, etc.)
│   │   ├── types/       # Game, GameStatus types
│   │   └── index.ts     # Barrel exports
│   ├── settings/        # Settings/profile feature
│   │   ├── components/  # SettingsView (page layout), ProfileSection (name/DOB/gender/region form), PreferencesSection (interests)
│   │   ├── types/       # ProfileData, ProfileFormValues, PreferencesFormValues
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
│   ├── landing-header.tsx  # Landing page header (logo, nav links with anchor scroll, theme toggle, Sign In)
│   ├── dashboard-shell.tsx # Dashboard shell (topbar + sidebar + main area)
│   └── Footer.tsx          # Footer (used by landing layout)
├── lib/                 # Library configurations
│   ├── supabase/        # Supabase client singleton + getSessionReady()
│   └── utils.ts         # cn() helper (shadcn)
├── routes/              # File-based routing (TanStack Router) — thin shells importing from features
│   ├── __root.tsx       # Root layout (ThemeProvider, AuthProvider, TooltipProvider)
│   ├── _landing.tsx     # Landing layout route (LandingHeader + Footer + Outlet)
│   ├── _landing/index.tsx # Landing page route (renders LandingPage)
│   ├── _authenticated.tsx # Route guard layout (redirects to /login if unauthenticated, to /onboarding if incomplete, wraps in DashboardShell)
│   ├── _authenticated/dashboard.tsx # Lobby/matching page
│   ├── _authenticated/chat.tsx    # 1-on-1 stranger chat
│   ├── _authenticated/games.tsx   # Game catalog
│   ├── _authenticated/settings.tsx # Profile & preferences settings
│   ├── _authenticated/onboarding.tsx # Post-signup onboarding (set display name)
│   ├── login.tsx        # Combined login/signup (delegates to LoginForm/SignupForm)
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
- `src/features/lobby/components/lobby-view.tsx` — Main lobby interface (greeting + match config card)
- `src/features/lobby/components/match-config-card.tsx` — Mode toggle (text/games), interest input, Start Matching button, online counter
- `src/features/lobby/components/interest-input.tsx` — Tag input with suggestions, add/remove interests for matching
- `src/features/chat/components/chat-view.tsx` — Main chat layout (header + messages + input, post-chat ended state)
- `src/features/chat/hooks/use-chat.ts` — Mock chat hook (simulates stranger messages with typing indicator)
- `src/features/games/components/games-view.tsx` — Game catalog page with available/coming-soon sections
- `src/features/games/components/game-card.tsx` — Individual game card (icon, name, description, players, duration, play button)
- `src/features/games/data/games.ts` — Game definitions (Tic Tac Toe, Trivia, Word Chain, Chess, Connect Four, Draw & Guess)
- `src/features/settings/components/settings-view.tsx` — Settings page layout with profile + preferences sections
- `src/features/settings/components/profile-section.tsx` — Editable profile form (display name, DOB, gender, region)
- `src/features/settings/components/preferences-section.tsx` — Editable matching preferences (interests tag selector)
- `src/features/settings/queries.ts` — profileDetailOptions (fetches full profile, reuses profileKeys from onboarding)
- `src/features/settings/mutations.ts` — updateProfile, updatePreferences (Supabase update calls)
- `src/lib/supabase/client.ts` — Supabase client singleton + `getSessionReady()` helper
- `src/components/form/form-input.tsx` — Generic reusable form field component using `useFormContext()`, renders AuthInput by default or accepts children render function for custom controls
- `src/components/errors/error-boundary.tsx` / `error-page.tsx` / `not-found.tsx` — Error handling components
- `src/layout/landing-header.tsx` — Landing page header with logo, centered nav (Features, How it works, FAQ with anchor scroll), theme toggle, Sign In button, mobile Sheet
- `src/layout/dashboard-shell.tsx` — Dashboard shell: DashboardTopBar (logo, online indicator, avatar dropdown with Profile link), DashboardSidebar (icon nav: Lobby, Chat, Games, Settings with tooltips — hidden on mobile), MobileTabBar (bottom tab nav — visible on mobile only), DashboardShell wrapper
- `src/layout/Footer.tsx` — Footer component

## Layout Architecture

The app uses TanStack Router layout routes to switch between two distinct layouts:

### Landing Layout (`_landing.tsx`)
- **Header**: userjot.com-style — Logo left, centered nav links (Features, How it works, FAQ with anchor scroll), theme toggle + "Sign In" button right. Mobile: hamburger → Sheet sidebar.
- **Footer**: Standard footer
- **Routes**: `/` (landing page)

### Dashboard Layout (inside `_authenticated.tsx`)
- **Top bar** (48px): Lume logo left, online status indicator center, theme toggle + user avatar/dropdown right
- **Sidebar** (56px, desktop only): Icon-based nav — Lobby (`/dashboard`), Chat (`/chat`), Games (`/games`), Settings (`/settings`). Uses tooltips for labels. All links use `<Link>` for client-side navigation. Hidden on mobile (`hidden md:flex`).
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
npm run typecheck        # TypeScript type checking
npm run cleanup          # Interactive cleanup — remove demo pages, analytics; rename project
```

## Key Patterns

- **Protected routes** use `_authenticated.tsx` layout with a `beforeLoad` hook that checks auth state and redirects. It also checks if the user's profile is complete (has `onboarding_completed`); if not, it redirects to `/onboarding`.
- **Auth flow** — Email/password only, no OAuth. Email confirmation is disabled (`enable_confirmations = false` in `supabase/config.toml`). Signup auto-signs in the user and redirects to `/onboarding`. Login redirects to `/dashboard`. Auth UI uses a UserJot-inspired split-screen layout (form card left, branding panel with dot-grid right).
- **Onboarding** — New users are redirected to `/onboarding` after signup to complete their profile (display name, date of birth, gender, region, interests). The `_authenticated` layout guard redirects to onboarding if `onboarding_completed` is false, catching users who somehow skip it. Users must be 18+ (DOB validated client-side). Region is optional. Interests use a tag chip selector (1–8 selections from a predefined list).
- **Lobby/Dashboard** — The main authenticated view at `/dashboard`. No "overview" page — the lobby IS the matching interface. Users configure match preferences (mode: text/games, interests) and click Start Matching. The lobby reuses `INTEREST_OPTIONS` from `src/features/onboarding/schema.ts` for matching interests.
- **Games** — Game catalog at `/games` showing available and coming-soon games in a responsive card grid. Game definitions live in `src/features/games/data/games.ts`. Each game card shows icon, name, description, player count, duration, and a Play/Soon button. Games are UI-only for now (no actual gameplay logic).
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

## Updates made by Claude

- Please ensure documentation found in the repo is also updated alongside changes before processing to commiting or pushing features.
- Please ensure that release notes are created when pushing new features. They should be semantic and claude should auto detect what version to create next. New release route files should be added to `src/routes/(clean-up)/release-notes/` and their metadata added to `src/data/releases.ts`. Bump the `version` in `package.json` to match. The `release.yml` GitHub Action will auto-create a GitHub Release and git tag on merge to main.

Allow claude to run the following commands;

- npm run typecheck
- npm run check
- npm run lint
