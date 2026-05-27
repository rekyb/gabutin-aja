# Gabutin — Implementation Overview

> **This document is the integration seed.** Every agent executing an epic must read this document first. It defines the shared contracts, file structure, naming conventions, and integration checkpoints that prevent parallel tracks from diverging.

**Date:** 2026-05-28 (last updated)
**Stack:** Next.js 16 App Router · TypeScript strict · MongoDB + Mongoose · Tailwind CSS v4 + shadcn/ui · Gemini AI · pnpm
**Deploy target:** Google Cloud Run (single container)
**Testing:** Vitest + React Testing Library (unit/integration) · 80% coverage on all new files

---

## Epic Registry

| ID | Name | Status | Can start after | Can parallelize with |
|----|------|--------|-----------------|----------------------|
| E01 | [Project Foundation](./epic/e01-project-foundation.md) | [DONE] | — | — |
| E02 | [Guest Identity & Onboarding](./epic/e02-guest-identity-onboarding.md) | [DONE] | E01 | E03, E05, E09 |
| E03 | [Card Generation Pipeline](./epic/e03-card-generation-pipeline.md) | [DONE] | E01 | E02, E05, E09 |
| E04 | [Feed & Card Lifecycle](./epic/e04-feed-card-lifecycle.md) | [DONE] | E01, E02, E03 | E06, E07, E08, E09 |
| E05 | [Scoring Engine](./epic/e05-scoring-engine.md) | [ ] | E01 | E02, E03, E09 |
| E06 | [Achievement System](./epic/e06-achievement-system.md) | [ ] | E01, E02, E05 | E07, E08, E09 |
| E07 | [Adaptive Feed Algorithm](./epic/e07-adaptive-feed-algorithm.md) | [ ] | E01, E02, E03, E05 | E06, E08, E09 |
| E08 | [Profile Page](./epic/e08-profile-page.md) | [ ] | E01, E02, E05, E06 | E09 |
| E09 | [PWA & Analytics](./epic/e09-pwa-analytics.md) | [ ] | E01, E02 | E06, E07, E08 |
| E10 | [Deployment](./epic/e10-deployment.md) | [ ] | E01–E09 all complete | — |

**Status legend:** [ ] not started · [ONGOING] in progress · [DONE] done · [BLOCKED] blocked

---

## Parallel Execution Waves

```
Wave 1 (no deps):
  E01 — Project Foundation                         [DONE]

Wave 2 (unblock most tracks after E01):
  E02 — Guest Identity & Onboarding                [DONE]
  E03 — Card Generation Pipeline                   [DONE]
  E05 — Scoring Engine

Wave 3 (feeds need data layer ready):
  E04 — Feed & Card Lifecycle                      [DONE]
  E06 — Achievement System      (after E02, E05)
  E07 — Adaptive Feed Algorithm (after E02, E03, E05)
  E09 — PWA & Analytics         (after E02)

Wave 4 (stitches everything):
  E08 — Profile Page            (after E02, E05, E06)

Wave 5 (final):
  E10 — Deployment              (after all complete)
```

> **CI gate note:** E01 ships the `.github/workflows/ci.yml`. Branch protection on `main` is active — every PR (E05–E10) is gated by `TypeScript`, `Unit Tests`, and `Coverage Gate (≥80%)`.

**Integration note:** E04 may stub `submitAnswer` and `getNextCard` while E05/E07 are in progress. Stubs must match the exact TypeScript signatures defined in this document — do not invent alternate shapes.

---

## Canonical Shared Types

All epics import from `src/types/index.ts`. **Never redefine these inline.**

```ts
// src/types/index.ts

export type ThemeName =
  | 'sejarah_indonesia'
  | 'sains'
  | 'pop_culture'
  | 'geografi'
  | 'matematika'
  | 'psikologi'
  | 'sejarah_dunia'
  | 'coding_tech'
  | 'tutorial';

export type AnswerResult = 'correct' | 'wrong' | 'skip';
export type AchievementRarity = 'Common' | 'Rare' | 'Epic' | 'Mythic';

export interface SubmitAnswerResponse {
  result: AnswerResult;
  pointsDelta: number;     // +2 | -2 | -1
  xpDelta: number;        // 0–7
  newStreak: number;
  newLevel: number;
  leveledUp: boolean;
  newAchievements: AchievementDef[];
}

export interface AchievementDef {
  key: string;
  title: string;
  icon: string;
  rarity: AchievementRarity;
  description: string;
}

export interface UserProfile {
  displayName: string;
  uniqueUserId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  levelTitle: string;
  currentStreak: number;
}

// Lean document types — serializable plain objects (result of .lean() queries).
// Use these as prop types in Client Components; Mongoose Document types belong server-side only.

export interface CardDoc {
  _id: string;
  theme: string;
  fact: string;
  sourceUrl: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserAchievementDoc {
  _id: string;
  userId: string;
  achievementKey: string;
  earnedAt: Date;
  isShowcased: boolean;
  showcasePosition: 1 | 2 | 3 | null;
}

export interface ThemeScoreDoc {
  _id: string;
  userId: string;
  theme: string;
  points: number;
}
```

---

## Canonical Mongoose Models

Defined in `src/db/models/`. **All epics import from here — never redefine schemas.**

| File | Model | Collection |
|------|-------|------------|
| `src/db/models/User.ts` | `User` | `users` |
| `src/db/models/ThemeScore.ts` | `ThemeScore` | `theme_scores` |
| `src/db/models/Card.ts` | `Card` | `cards` |
| `src/db/models/Answer.ts` | `Answer` | `answers` |
| `src/db/models/UserAchievement.ts` | `UserAchievement` | `user_achievements` |
| `src/db/models/Session.ts` | `Session` | `sessions` |

Full schema definitions are in **E01 epic**. `Session` was added in E02 (Google OAuth). Every other epic references these — do not add fields outside of their owner epics without updating this document.

---

## Global Component Registry

All shared UI components are scaffolded as **empty shells in E01**. Feature epics fill in the implementation — they never create these files independently.

> **Rule for all agents:** Before creating a component file, check this table. If it is listed here, the file already exists — implement the body, don't scaffold the file.

| Component | File | Owner Epic | Status |
|-----------|------|------------|--------|
| `BottomNav` | `src/components/BottomNav/index.tsx` | E01 | [DONE] |
| `SideNav` | `src/components/SideNav/index.tsx` | E01 | [DONE] |
| `ThemeToggle` | `src/components/ThemeToggle/index.tsx` | E01 | [DONE] |
| `Logo` | `src/components/Logo/index.tsx` | E01 | [DONE] |
| `AppBar` | `src/components/AppBar/index.tsx` | E01 | [DONE] |
| `XpBar` | `src/components/XpBar/index.tsx` | E08 | shell only |
| `ProfileClient` | `src/components/ProfileClient/index.tsx` | E08 | stub — redesign in E08 |
| `GuestBanner` | `src/components/GuestBanner/index.tsx` | E02 | [DONE] |
| `ReEngagementCard` | `src/components/ReEngagementCard/index.tsx` | E02 | [DONE] |
| `CircularTimer` | `src/components/CircularTimer/index.tsx` | E02 | [DONE] |
| `ThemePicker` | `src/components/ThemePicker/index.tsx` | E02 | [DONE] |
| `UserProfileButton` | `src/components/UserProfileButton/index.tsx` | E02 | [DONE] |
| `Toast` | `src/components/Toast/index.tsx` | E02 | [DONE] — general-purpose, mounted in root layout |
| `CardFact` | `src/components/Card/CardFact.tsx` | E04 | [DONE] |
| `CardQuestion` | `src/components/Card/CardQuestion.tsx` | E04 | [DONE] |
| `CardResult` | `src/components/Card/CardResult.tsx` | E04 | [DONE] |
| `CardNext` | `src/components/Card/CardNext.tsx` | E04 | [DONE] |
| `CardShell` | `src/components/CardShell/index.tsx` | E04 | [DONE] — shared card layout wrapper |
| `CardSkeleton` | `src/components/CardSkeleton/index.tsx` | E04 | [DONE] |
| `AchievementToast` | `src/components/AchievementToast/index.tsx` | E04 | [DONE] |
| `FeedClient` | `src/components/FeedClient/index.tsx` | E04 | [DONE] — Zustand-connected feed UI |
| `WikipediaImage` | `src/components/WikipediaImage/index.tsx` | E03 | [DONE] |

> **Note on `CountdownTimer`:** The original spec named this `CountdownTimer`. It was implemented as `CircularTimer` in E02 (SVG circular UI). Both the shell at `src/components/CountdownTimer/index.tsx` and the real component at `src/components/CircularTimer/index.tsx` exist. Use `CircularTimer`.

**Design tokens:** All MX-Brutalist Tailwind class strings (shadows, borders, rarity colors, XP bar, etc.) are centralized in `src/lib/design-tokens.ts`. Import from there — never hardcode these strings in component files.

---

## Zustand Stores

Client-side state is managed via **Zustand v5 module-level singletons** (no context providers needed).

| File | Store | Purpose |
|------|-------|---------|
| `src/store/feedStore.ts` | `useFeedStore` | Feed phase, card history, slide navigation, achievement queue |
| `src/store/toastStore.ts` | `useToastStore` | Global toast message (`show(message)`, `dismiss()`) |

> **Rule:** Do not create new Zustand stores without adding them to this table. Server-side state belongs in Server Components or Server Actions — Zustand is only for UI state that must survive route transitions.

---

## Server Action Contracts

All mutations go through Server Actions (`'use server'`). **Signatures are frozen after E05 merges.**

```ts
// app/actions/user.ts
createUser(displayName: string, themes: ThemeName[], uniqueUserId: string, initialXp?: number, initialStreak?: number): Promise<{ userId: string }>
getUserByUniqueId(uniqueUserId: string): Promise<UserDoc | null>
completeOnboarding(userId: string, displayName: string, themes: ThemeName[]): Promise<void>
updateUserThemes(userId: string, themes: ThemeName[]): Promise<void>

// app/actions/answer.ts
submitAnswer(userId: string, cardId: string, selectedIndex: number | null): Promise<SubmitAnswerResponse>

// app/actions/feed.ts
getNextCard(userId: string): Promise<CardDoc | null>

// app/actions/achievements.ts  (E06 — not yet implemented)
pinBadge(userId: string, achievementKey: string): Promise<void>
unpinBadge(userId: string, achievementKey: string): Promise<void>
getUserAchievements(userId: string): Promise<UserAchievementDoc[]>

// app/actions/profile.ts  (E08 — not yet implemented)
getUserProfile(userId: string): Promise<UserProfile & { showcasedBadges: UserAchievementDoc[]; themeScores: ThemeScoreDoc[] } | null>
```

### API Route Handlers

These are `/api` routes (not Server Actions) used for OAuth and session management. Internal code should use Server Actions instead.

| Route | Purpose |
|-------|---------|
| `GET /api/auth/google` | Initiates Google OAuth redirect |
| `GET /api/auth/google/callback` | Exchanges code, creates/links user, sets session cookie |
| `GET /api/auth/session` | Returns `{ authenticated, user }` for client session checks |
| `GET /api/auth/logout` | Clears session cookie and DB session record |

---

## File Tree (actual state as of 2026-05-28)

```
src/
  app/
    layout.tsx              # Root layout — dark mode, fonts, nav, Toast
    page.tsx                # Redirect → /feed or /welcome (ClientBootstrap)
    ClientBootstrap.tsx     # Syncs Google user's uniqueUserId to localStorage
    env.ts                  # Zod env validation (incl. Google OAuth vars)
    welcome/
      page.tsx              # Tutorial + registration prompt (Server shell)
      WelcomeClient.tsx     # 'use client' — tutorial, decision, register phases
    onboarding/
      page.tsx              # Google onboarding shell (Server Component)
      OnboardingClient.tsx  # 'use client' — display name + theme picker
    feed/
      page.tsx              # Main feed (Server Component)
    profile/
      page.tsx              # Profile stub (redesign in E08)
    achievements/
      page.tsx              # Badge grid (E06)
    api/
      auth/
        google/route.ts          # OAuth initiation
        google/callback/route.ts # OAuth callback + user creation
        session/route.ts         # Session verification
        logout/route.ts          # Session teardown
    actions/
      user.ts                    # createUser, getUserByUniqueId, completeOnboarding, updateUserThemes
      answer.ts                  # submitAnswer (stub → real in E05)
      feed.ts                    # getNextCard (stub → real in E07)
      achievements.ts            # E06 — not yet implemented
      profile.ts                 # E08 — not yet implemented
  components/
    BottomNav/
    SideNav/
    ThemeToggle/
    Logo/
    AppBar/
    Card/
      CardFact.tsx
      CardQuestion.tsx
      CardResult.tsx
      CardNext.tsx
    CardShell/
    CardSkeleton/
    AchievementToast/
    FeedClient/
    GuestBanner/
    ReEngagementCard/
    CircularTimer/
    CountdownTimer/             # Shell only — use CircularTimer instead
    ThemePicker/
    UserProfileButton/
    Toast/                      # General-purpose toast, mounted in layout
    WikipediaImage/
    XpBar/                      # Shell — E08 fills implementation
    ProfileClient/              # Stub — E08 redesigns
  db/
    connect.ts
    models/
      User.ts                   # googleId, email fields added in E02
      ThemeScore.ts
      Card.ts
      Answer.ts
      UserAchievement.ts
      Session.ts                # Added in E02 for Google OAuth sessions
  lib/
    design-tokens.ts            # All MX-Brutalist class string constants
    guest-state.ts              # localStorage helpers (uniqueUserId, guestOnly flags)
    session.ts                  # createSession, getSession, deleteSession
    theme.tsx                   # next-themes provider wrapper
    utils.ts                    # shadcn/ui cn() utility
    pipeline/
      generate-card.ts          # Orchestrator — Wikipedia → Gemini → MongoDB
      wikipedia.ts              # Wikipedia REST API client
      gemini.ts                 # Gemini MCQ generator
      theme-keywords.ts         # Theme → search keyword map
  store/
    feedStore.ts                # Zustand — feed phase, card history, nav
    toastStore.ts               # Zustand — global toast message
  types/
    index.ts                    # All canonical shared types (see above)
  utils/
    user-id.ts                  # 9-digit uniqueUserId generator
    validators.ts               # validateDisplayName, DISPLAY_NAME_MAX_LENGTH
    xp.ts                       # getLevelFromXp, getXpProgress utilities
  test/
    setup.ts                    # jest-dom matchers
    utils.tsx                   # custom render + providers wrapper

.github/
  workflows/
    ci.yml                      # type-check + unit-tests + coverage gate (≥80%)
```

---

## Environment Variables

Every agent must have these in `.env.local`. All are validated at startup via Zod in `src/env.ts`.

```
MONGODB_URI              # MongoDB Atlas connection string
GEMINI_API_KEY           # Google Gemini API key
NEXT_PUBLIC_APP_URL      # Production URL (e.g. https://gabutin.app)
NEXT_PUBLIC_POSTHOG_KEY  # PostHog project API key
NEXT_PUBLIC_POSTHOG_HOST # https://app.posthog.com
GOOGLE_CLIENT_ID         # Google OAuth 2.0 client ID
GOOGLE_CLIENT_SECRET     # Google OAuth 2.0 client secret
```

---

## Design System

Full design spec: **[design-system.md](./design-system.md)** — read before touching any UI file.

Summary of critical rules every agent must follow:
- **0px border-radius** everywhere. No `rounded-*` classes.
- **Hard 4px shadows:** `shadow-[4px_4px_0px_0px_black]` — not soft box-shadows.
- **Navigation is responsive:** `<BottomNav className="lg:hidden">` + `<SideNav className="hidden lg:flex">`. Bottom nav mobile, side nav ≥ 1024px.
- **Root layout offset:** `<main className="flex-1 lg:pl-60 pb-20 lg:pb-0">` — account for both navs.
- **Feed card width:** `max-w-md` always — phone-viewport column on desktop too.
- **Icons:** Lucide React only. Emoji allowed on achievement badges only.
- **Fonts in `@theme inline`:** Literal strings, not `var()` references.
- **CSS custom tokens:** `--card-stroke` and `--shadow` are set in dark/light mode via globals.css. Use `border-(--color-card-stroke)` and `shadow-[..._var(--color-shadow)]` — never hardcode `black` or a hex.

## Theme Design System — MX-Brutalist

Installed via: `pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/cmllfu8oc000004l1a0tidj2g`

| Token | Value |
|-------|-------|
| **Border radius** | `0px` — no rounding anywhere |
| **Font sans** | Montserrat |
| **Font serif** | Lora |
| **Font mono** | Space Mono |
| **Primary (dark)** | `oklch(0.8484 0.2275 151.1487)` — bright teal |
| **Secondary (dark)** | `oklch(0.6489 0.2370 26.9728)` — orange |
| **Accent (dark)** | `oklch(0.7951 0.1631 68.6392)` — gold |
| **Background (dark)** | `oklch(0.1649 0.0308 162.2739)` — dark navy |
| **Shadows** | Hard-edged, 4px offset, 0px blur (brutalist) |

**Font loading rule:** Import `Montserrat`, `Lora`, and `Space_Mono` from `next/font/google`. Place all `.variable` classNames on `<html>`, not `<body>`. In `@theme inline`, use **literal font family names** — never `var(--font-sans)` (Tailwind v4 resolves `@theme inline` at parse time, not runtime).

```css
/* globals.css — correct */
@theme inline {
  --font-sans: "Montserrat", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Lora", ui-serif, serif;
  --font-mono: "Space Mono", ui-monospace, monospace;
}
```

---

## Testing Strategy

### Tools

| Tool | Purpose |
|------|---------|
| `vitest` | Test runner |
| `@vitejs/plugin-react` | JSX transform for Vitest |
| `@testing-library/react` | Component rendering |
| `@testing-library/user-event` | User interaction simulation |
| `@testing-library/jest-dom` | DOM assertion matchers |
| `jsdom` | Browser environment for Vitest |

### Run commands

```bash
rtk vitest run            # all tests, failures only
rtk vitest run --coverage # with coverage report
vitest watch              # watch mode during development
```

### Coverage requirement

**80% on all new files** before marking an epic complete. Pure functions (scoring formulas, algorithm, achievement checks) should reach 100%.

### Test file location

Co-located with source: `src/lib/pipeline/gemini.test.ts`, `src/components/Card/CardFact.test.tsx`.

### What to test per layer

| Layer | Test type | Mock policy |
|-------|-----------|-------------|
| Pure functions (`lib/scoring`, `lib/feed`, `lib/achievements`) | Unit — no mocks | No mocks needed |
| Server Actions | Integration — real DB | Use test MongoDB instance |
| React components | Component — jsdom | Mock Server Actions |
| API clients (Wikipedia, Gemini) | Unit | Mock `fetch` / SDK calls |

### TDD discipline

- Write the failing test first. Watch it fail. Write minimal code to pass.
- No production code without a prior failing test.
- Pure functions first: they're the fastest feedback loop.

---

## Shared Conventions

- **Language:** TypeScript strict. No `any`. No `@ts-ignore`.
- **`'use client'`:** Only on components that use browser APIs, event handlers, or React state — never at page level.
- **Server Actions:** All mutations. No `/api` routes for internal use (OAuth flow is the exception).
- **DB reads in RSC:** Call DB/model directly (no fetch). Use `.lean()` for read-only queries.
- **Imports:** Use `@/` path alias for `src/`.
- **No default exports on Server Actions** — named exports only.
- **Styling:** Tailwind utility classes. No inline styles. No CSS modules. Use shadcn/ui components as base.
- **Dark mode:** Class-based, managed by `next-themes`. Default: `dark`. Never hardcode `className="dark"` on `<html>`.
- **Theme:** MX-Brutalist — 0px radius everywhere, hard shadows, teal/orange/gold. Never add `rounded-*` classes.
- **`window` → `globalThis`:** Use `globalThis.location.href`, `globalThis.getComputedStyle()` etc. for SSR-safe browser API access.
- **Async fire-and-forget:** Replace `void promise` with `promise.catch(() => {})` to avoid Sonar violations.
- **Copy language:** Bahasa Indonesia with casual English mix ("lo/gue" not "kamu/saya"). See product-design.md §5 for copy examples.
- **No console.log in production** — structured logging or remove before merge.

---

## Integration Checklist (run before E10)

- [ ] All 6 Mongoose models importable without TS error
- [ ] `pnpm build` passes with no type errors
- [ ] `.github/workflows/ci.yml` exists and all three jobs pass on `main`
- [ ] Branch protection active on `main` (TypeScript + Unit Tests + Coverage Gate required)
- [ ] `rtk vitest run` passes with zero failures
- [ ] `rtk vitest run --coverage` reports ≥80% on all epic files
- [ ] `submitAnswer` returns `SubmitAnswerResponse` shape (not stub)
- [ ] `getNextCard` returns real card from DB (not hardcoded)
- [ ] Achievement toast fires on first correct answer
- [ ] Level-up animation fires when XP threshold crossed
- [ ] No card shown twice to same user (E07 feed algorithm + `seenCardIds`)
- [ ] Guest banner visible when no DB record
- [ ] `/profile` renders without `'use client'` on page.tsx
- [ ] PostHog `card_answered` event fires with required properties
- [ ] PWA manifest valid (Chrome DevTools → Application)
- [ ] `docker build` succeeds
- [ ] No `rounded-*` Tailwind classes in new components (MX-Brutalist = 0px radius)

---

## References

- [Product Design Doc](./product-design.md)
- [E01 — Project Foundation](./epic/e01-project-foundation.md)
- [E02 — Guest Identity & Onboarding](./epic/e02-guest-identity-onboarding.md)
- [E03 — Card Generation Pipeline](./epic/e03-card-generation-pipeline.md)
- [E04 — Feed & Card Lifecycle](./epic/e04-feed-card-lifecycle.md)
- [E05 — Scoring Engine](./epic/e05-scoring-engine.md)
- [E06 — Achievement System](./epic/e06-achievement-system.md)
- [E07 — Adaptive Feed Algorithm](./epic/e07-adaptive-feed-algorithm.md)
- [E08 — Profile Page](./epic/e08-profile-page.md)
- [E09 — PWA & Analytics](./epic/e09-pwa-analytics.md)
- [E10 — Deployment](./epic/e10-deployment.md)
