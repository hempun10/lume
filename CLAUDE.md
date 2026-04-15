# Lume

A social platform for meeting strangers through text chat and multiplayer games — an alternative to Omegle and rumi.social. Built with TanStack Start (full-stack React SSR framework), Supabase authentication, protected routes, and shadcn/ui.

Originally scaffolded from a TanStack Start + Supabase Auth starter template, inspired by:

- https://github.com/vercel/next.js/blob/canary/examples/with-supabase/README.md
- https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

## Tech Stack

- **Framework**: TanStack Start v1 (React 19, Vite 7, Nitro SSR)
- **Auth & DB**: Supabase (email/password auth, PostgreSQL, RLS)
- **Styling**: Tailwind CSS v4, shadcn/ui (Radix primitives), Lucide icons
- **Code Quality**: Biome (lint/format), TypeScript (strict)
- **Analytics**: Vercel Analytics (automatic page view tracking)
- **Deployment**: Vercel via GitHub Actions CI/CD

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives (button, card, input, label, alert, dialog, checkbox, form)
│   ├── form/            # Reusable form field wrappers (FieldText, FieldPassword)
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
│   │   ├── components/  # OnboardingForm (display name input)
│   │   ├── schema.ts    # Zod schema for onboarding form
│   │   └── index.ts     # Barrel exports
│   ├── dashboard/       # Dashboard feature
│   │   ├── components/  # DashboardContent
│   │   ├── types/       # TypeScript interfaces
│   │   └── index.ts     # Barrel exports
│   ├── landing/         # Landing page feature
│   │   ├── components/  # Hero, Stats, Features, Comparison, HowItWorks, FAQ, CTA sections
│   │   └── index.tsx    # LandingPage composite component
│   └── theme/           # Theme (dark mode) feature
│       ├── context/     # ThemeProvider + useTheme hook (system/light/dark, localStorage)
│       ├── components/  # ThemeToggle button (cycles light → dark → system)
│       └── index.ts     # Barrel exports
├── layout/              # App-wide layout components (Header, Footer, nav-config)
├── lib/                 # Library configurations
│   ├── supabase/        # Supabase client singleton + getSessionReady()
│   └── utils.ts         # cn() helper (shadcn)
├── routes/              # File-based routing (TanStack Router) — thin shells importing from features
│   ├── __root.tsx       # Root layout (ThemeProvider, AuthProvider, Header, Footer)
│   ├── _authenticated.tsx # Route guard layout (redirects to /login if unauthenticated, to /onboarding if profile incomplete)
│   ├── _authenticated/dashboard.tsx # Protected dashboard page
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
- `src/features/onboarding/components/onboarding-form.tsx` — Post-signup onboarding form (display name)
- `src/features/onboarding/schema.ts` — Zod schema for onboarding form
- `src/lib/supabase/client.ts` — Supabase client singleton + `getSessionReady()` helper
- `src/components/form/field-text.tsx` / `field-password.tsx` — Reusable form field components wrapping shadcn Form primitives
- `src/components/errors/error-boundary.tsx` / `error-page.tsx` / `not-found.tsx` — Error handling components
- `src/layout/Header.tsx` / `Footer.tsx` — App layout components
- `src/layout/nav-config.ts` — Centralized navigation link definitions

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

- **Protected routes** use `_authenticated.tsx` layout with a `beforeLoad` hook that checks auth state and redirects. It also checks if the user's profile is complete (has `display_name`); if not, it redirects to `/onboarding`.
- **Auth flow** — Email/password only, no OAuth. Email confirmation is disabled (`enable_confirmations = false` in `supabase/config.toml`). Signup auto-signs in the user and redirects to `/onboarding`. Login redirects to `/dashboard`. Auth UI uses a UserJot-inspired split-screen layout (form card left, branding panel with dot-grid right).
- **Onboarding** — New users are redirected to `/onboarding` after signup to set their display name. The `_authenticated` layout guard also redirects to onboarding if `display_name` is null, catching users who somehow skip it.
- **Session initialisation** — `getSessionReady()` in `src/lib/supabase/client.ts` waits for Supabase's `INITIAL_SESSION` event before calling `getSession()`. This prevents race conditions on fresh page loads where `getSession()` returns `null` before localStorage is restored. All `beforeLoad` guards use this helper via `requireAuth()`. The login page also has a client-side `useEffect` fallback because SSR `beforeLoad` runs server-side without access to localStorage.
- **Auth state** is managed via `AuthContext` in `src/features/auth/` — access with `useAuth()` hook anywhere in the component tree
- **Forms** use React Hook Form + Zod for type-safe validation. Reusable field components live in `src/components/form/`. Auth form components live in `src/features/auth/` and accept `onSubmit` callbacks with validated data.
- **Feature-based architecture** — domain code is grouped by feature (`features/auth/`, `features/onboarding/`, `features/dashboard/`). Route files are thin shells that import UI from features and handle navigation/auth calls.
- **Database types** are auto-generated from the Supabase schema — run `npm run db:types` after migration changes
- **Profiles table** is auto-created on signup via a PostgreSQL trigger (`handle_new_user`)
- **RLS policies** ensure users can only read/update their own profile
- **Path alias**: `@/*` maps to `src/*`
- **Dark mode** uses the `class` strategy (`@custom-variant dark` in styles.css). `ThemeProvider` in `src/features/theme/` manages light/dark/system preference with localStorage persistence (`lume-theme` key). An inline `<script>` in `__root.tsx` prevents flash of wrong theme. All UI uses shadcn semantic tokens (`text-foreground`, `bg-background`, `border-border`, etc.) — avoid hardcoded gray/neutral colors.
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
