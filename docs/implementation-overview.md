# Gabutin — Implementation Overview

> **This document is the integration seed.** Every agent executing an epic must read this document first. It defines the shared contracts, file structure, naming conventions, and integration checkpoints that prevent parallel tracks from diverging.

**Date:** 2026-05-27 
**Stack:** Next.js 16 App Router · TypeScript strict · MongoDB + Mongoose · Tailwind CSS v4 + shadcn/ui · Gemini AI · pnpm 
**Deploy target:** Google Cloud Run (single container) 
**Testing:** Vitest + React Testing Library (unit/integration) · 80% coverage on all new files

---

## Epic Registry

| ID | Name | Status | Can start after | Can parallelize with |
|----|------|--------|-----------------|----------------------|
| E01 | [Project Foundation](./epic/e01-project-foundation.md) | [ ] | — | — |
| E02 | [Guest Identity & Onboarding](./epic/e02-guest-identity-onboarding.md) | [ ] | E01 | E03, E05, E09 |
| E03 | [Card Generation Pipeline](./epic/e03-card-generation-pipeline.md) | [ ] | E01 | E02, E05, E09 |
| E04 | [Feed & Card Lifecycle](./epic/e04-feed-card-lifecycle.md) | [ ] | E01, E02, E03 | E06, E07, E08, E09 |
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
 E01 — Project Foundation

Wave 2 (unblock most tracks after E01):
 E02 — Guest Identity & Onboarding
 E03 — Card Generation Pipeline
 E05 — Scoring Engine

Wave 3 (feeds need data layer ready):
 E04 — Feed & Card Lifecycle   (after E02, E03; stubs E05/E07 API)
 E06 — Achievement System     (after E02, E05)
 E07 — Adaptive Feed Algorithm   (after E02, E03, E05)
 E09 — PWA & Analytics       (after E02)

Wave 4 (stitches everything):
 E08 — Profile Page        (after E02, E05, E06)

Wave 5 (final):
 E10 — Deployment         (after all complete)
```

> **CI gate note:** E01 ships the `.github/workflows/ci.yml`. Enable branch protection on `main` immediately after E01 merges so every subsequent PR (E02–E10) is gated by `TypeScript`, `Unit Tests`, and `Coverage Gate (≥80%)`.

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
 xpDelta: number;       // 0–7
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

Full schema definitions are in **E01 epic**. Every other epic references these — do not add fields outside of E01 without updating this document.

---

## Global Component Registry

All shared UI components are scaffolded as **empty shells in E01**. Feature epics fill in the implementation — they never create these files independently. This prevents parallel agents from building at conflicting paths or with incompatible prop shapes.

> **Rule for all agents:** Before creating a component file, check this table. If it is listed here, the file already exists from E01 — implement the body, don't scaffold the file.

| Component | File | Props Type | Owner Epic |
|-----------|------|------------|------------|
| `GuestBanner` | `src/components/GuestBanner/index.tsx` | `GuestBannerProps` | E02 |
| `ReEngagementCard` | `src/components/ReEngagementCard/index.tsx` | `ReEngagementCardProps` | E02 |
| `CardFact` | `src/components/Card/CardFact.tsx` | `CardFactProps` | E04 |
| `CardQuestion` | `src/components/Card/CardQuestion.tsx` | `CardQuestionProps` | E04 |
| `CardResult` | `src/components/Card/CardResult.tsx` | `CardResultProps` | E04 |
| `CardNext` | `src/components/Card/CardNext.tsx` | `CardNextProps` | E04 |
| `AchievementToast` | `src/components/AchievementToast/index.tsx` | `AchievementToastProps` | E04 |
| `CountdownTimer` | `src/components/CountdownTimer/index.tsx` | `CountdownTimerProps` | E04 |
| `CardSkeleton` | `src/components/CardSkeleton/index.tsx` | none | E04 |
| `XpBar` | `src/components/XpBar/index.tsx` | `XpBarProps` | E08 |
| `ProfileClient` | `src/components/ProfileClient/index.tsx` | none | E08 |
| `BottomNav` | `src/components/BottomNav/index.tsx` | `{ className: string }` | E01 [DONE] |
| `SideNav` | `src/components/SideNav/index.tsx` | `{ className: string }` | E01 [DONE] |
| `ThemeToggle` | `src/components/ThemeToggle/index.tsx` | none | E01 [DONE] |

**Design tokens:** All MX-Brutalist Tailwind class strings (shadows, borders, rarity colors, XP bar, etc.) are centralized in `src/lib/design-tokens.ts` (defined in E01). Import from there — never hardcode these strings in component files.

---

## Server Action Contracts

All mutations go through Server Actions. **Signatures are frozen after E05 merges.** E04 may stub with matching signatures.

```ts
// app/actions/user.ts
createUser(displayName: string, themes: ThemeName[], uniqueUserId: string): Promise<{ userId: string }>
getUserByUniqueId(uniqueUserId: string): Promise<UserDoc | null>

// app/actions/answer.ts
submitAnswer(userId: string, cardId: string, selectedIndex: number | null): Promise<SubmitAnswerResponse>

// app/actions/feed.ts
getNextCard(userId: string): Promise<CardDoc | null>

// app/actions/achievements.ts
pinBadge(userId: string, achievementKey: string): Promise<void>
unpinBadge(userId: string, achievementKey: string): Promise<void>
getUserAchievements(userId: string): Promise<UserAchievementDoc[]>

// app/actions/profile.ts
getUserProfile(userId: string): Promise<UserProfile & { showcasedBadges: UserAchievementDoc[]; themeScores: ThemeScoreDoc[] }>
```

---

## File Tree (target state)

```
src/
 app/
  layout.tsx        # Root layout — dark mode, fonts, bottom nav
  page.tsx         # Redirect → /feed or /welcome
  welcome/
    page.tsx       # Tutorial + registration prompt
  feed/
    page.tsx       # Main feed
  achievements/
    page.tsx       # Badge grid
  profile/
    page.tsx       # Profile page
  providers.tsx       # PostHog + other client providers
  actions/
    user.ts
    answer.ts
    feed.ts
    achievements.ts
    profile.ts
 components/
  BottomNav/      # mobile only (lg:hidden)
  SideNav/       # desktop only (hidden lg:flex)
  Card/
    CardFact.tsx
    CardQuestion.tsx
    CardResult.tsx
    CardNext.tsx
  AchievementToast/
  GuestBanner/
  ReEngagementCard/
  XpBar/
 db/
  connect.ts
  models/
    User.ts
    ThemeScore.ts
    Card.ts
    Answer.ts
    UserAchievement.ts
 lib/
  scoring/
    formulas.ts      # Pure XP + level functions
  achievements/
    definitions.ts    # 17 achievement configs
    check.ts       # Condition evaluator
  feed/
    algorithm.ts     # Weighted theme selection
  pipeline/
    generate-card.ts   # Orchestrator
    wikipedia.ts     # Wikipedia REST API client
    gemini.ts       # Gemini MCQ generator
  analytics/
    events.ts       # PostHog wrappers
 types/
  index.ts         # Shared TypeScript types (see above)
 utils/
  user-id.ts        # 9-digit uniqueUserId generator
 test/
  setup.ts         # jest-dom matchers
  utils.tsx         # custom render + providers wrapper
 env.ts            # Zod env validation

.github/
 workflows/
   ci.yml          # E11 — type-check + unit-tests + coverage gate
```

---

## Environment Variables

Every agent must have these in `.env.local`. All are validated at startup via Zod in `src/env.ts`.

```
MONGODB_URI          # MongoDB Atlas connection string
GEMINI_API_KEY        # Google Gemini API key
NEXT_PUBLIC_APP_URL      # Production URL
NEXT_PUBLIC_POSTHOG_KEY    # PostHog project API key
NEXT_PUBLIC_POSTHOG_HOST   # https://app.posthog.com
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

### Install command (E01 sets this up)

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

### Run commands

```bash
rtk vitest run     # all tests, failures only
rtk vitest run --coverage # with coverage report
vitest watch      # watch mode during development
```

### Coverage requirement

**80% on all new files** before marking an epic complete. Pure functions (scoring formulas, algorithm, achievement checks) should reach 100%.

### Test file location

Co-located with source: `src/lib/scoring/formulas.test.ts`, `src/components/CardFact/CardFact.test.tsx`.

### What to test per layer

| Layer | Test type | Mock policy |
|-------|-----------|-------------|
| Pure functions (`lib/scoring`, `lib/feed`, `lib/achievements`) | Unit — no mocks | No mocks needed |
| Server Actions | Integration — real DB | Use test MongoDB instance |
| React components | Component — jsdom | Mock Server Actions |
| API clients (Wikipedia, Gemini) | Unit | Mock `fetch` / SDK calls |

### Test utilities (`src/test/utils.tsx`)

```tsx
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'

function customRender(ui: ReactElement, options?: RenderOptions) {
 return render(ui, { ...options })
}

export * from '@testing-library/react'
export { customRender as render }
```

### TDD discipline

- Write the failing test first. Watch it fail. Write minimal code to pass.
- No production code without a prior failing test.
- Pure functions first: they're the fastest feedback loop.

---

## Shared Conventions

- **Language:** TypeScript strict. No `any`. No `@ts-ignore`.
- **'use client':** Only on components that use browser APIs, event handlers, or React state — never at page level.
- **Server Actions:** All mutations. No `/api` routes for internal use.
- **DB reads in RSC:** Call DB/model directly (no fetch). Use `.lean()` for read-only queries.
- **Imports:** Use `@/` path alias for `src/`.
- **No default exports on Server Actions** — named exports only.
- **Styling:** Tailwind utility classes. No inline styles. No CSS modules. Use shadcn/ui components as base.
- **Dark mode:** Class-based (`class="dark"`), set on `<html>` by default.
- **Theme:** MX-Brutalist — 0px radius everywhere, hard shadows, teal/orange/gold. Do not add `rounded-*` classes unless it's inside a custom override.
- **Copy language:** Bahasa Indonesia with casual English mix ("lo/gue" not "kamu/saya"). See product-design.md §5 for copy examples.
- **No console.log in production** — structured logging or remove before merge.

---

## Integration Checklist (run before E10)

- [ ] All 5 Mongoose models importable without TS error
- [ ] `pnpm build` passes with no type errors
- [ ] `.github/workflows/ci.yml` exists (ships with E01) and all three jobs pass on `main`
- [ ] Branch protection enabled on `main` after E01 merges (TypeScript + Unit Tests + Coverage Gate required)
- [ ] `rtk vitest run` passes with zero failures
- [ ] `rtk vitest run --coverage` reports ≥80% on all epic files
- [ ] `submitAnswer` returns `SubmitAnswerResponse` shape (not stub)
- [ ] `getNextCard` returns real card from DB (not hardcoded)
- [ ] Achievement toast fires on first correct answer
- [ ] Level-up animation fires when XP threshold crossed
- [ ] No card shown twice to same user
- [ ] Guest banner visible when no DB record
- [ ] /profile renders without client-side data fetch
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
