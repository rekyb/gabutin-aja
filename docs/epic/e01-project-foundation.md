# E01 — Project Foundation

**Status:** [ ] Not started 
**Wave:** 1 (no dependencies — start here)

---

## Goal

Bootstrap the Next.js 16 monorepo with all shared infrastructure in place — MongoDB connection, all five Mongoose models, TypeScript type system, Vitest test runner, GitHub Actions CI quality gate, MX-Brutalist design system, and layout shell — so every other epic has a stable, typed, testable, and gated foundation to build on.

## Why

Every other epic reads from or writes to the database, imports shared types, and runs tests. If the schema, types, or test tooling drift between epics, integration will fail. The CI workflow enforces this by blocking every PR that breaks types or drops coverage below 80%. Defining everything here, once, is the only way to keep ten parallel tracks aligned. This epic ships no visible features — it ships the ground the rest of the app stands on.

---

## Functional Requirements

1. `pnpm create next-app` bootstrapped with Next.js 16, App Router, Turbopack, strict TypeScript
2. Tailwind CSS v4 installed and configured with dark mode (`class` strategy)
3. shadcn/ui initialized non-interactively: `pnpm dlx shadcn@latest init -d`
4. **MX-Brutalist theme applied:** `pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/cmllfu8oc000004l1a0tidj2g`
5. Fonts: `Montserrat` (sans), `Lora` (serif), `Space_Mono` (mono) loaded via `next/font/google`
6. MongoDB Atlas connection via Mongoose (`src/db/connect.ts`)
7. All five Mongoose models defined with TypeScript interfaces (see schemas below)
8. Zod env validation at startup (`src/env.ts`) — app crashes fast if vars are missing
9. Shared TypeScript types in `src/types/index.ts`
10. Root layout (`app/layout.tsx`): MX-Brutalist fonts, responsive nav wiring, wrapped by `<Providers>` for theme support
11. **Bottom navigation** component (`src/components/BottomNav/`) — visible only on mobile (`lg:hidden`). Feed / Achievements / Profile with Lucide icons.
12. **Side navigation** component (`src/components/SideNav/`) — visible only on desktop (`hidden lg:flex`). 240px fixed left sidebar with logo, nav links, and mini XP stat area (placeholder for now).
13. Root layout wires both navs with correct offsets: `<main className="flex-1 lg:pl-60 pb-20 lg:pb-0">`
14. Placeholder pages at `/feed`, `/achievements`, `/profile` (one `<h1>` each)
13. `@/` path alias configured in `tsconfig.json`
14. **Vitest configured** (`vitest.config.ts`) with jsdom environment and `@testing-library/react`
15. Test setup file at `src/test/setup.ts` (imports `@testing-library/jest-dom`)
16. Custom render utility at `src/test/utils.tsx`
17. **GitHub Actions CI** workflow at `.github/workflows/ci.yml` with three jobs: `type-check`, `unit-tests`, `coverage`
18. CI uses Node 22 + pnpm 9 with `--frozen-lockfile` and pnpm store cache
19. `pnpm build` and `rtk vitest run` both pass before this epic is marked done
20. **`next-themes` installed** (`pnpm add next-themes`) — handles theme class injection, localStorage persistence, and SSR hydration mismatch suppression
21. **`app/providers.tsx`** — Client Component wrapping the app with `ThemeProvider` (`defaultTheme: 'dark'`, `attribute: 'class'`, `storageKey: 'gabutin-theme'`). E09 extends this same file to add PostHog.
22. **`ThemeToggle`** component (`src/components/ThemeToggle/index.tsx`) — fully implemented in E01. Calls `useTheme()` from next-themes. Placed at the bottom of `SideNav` (desktop) and in the profile page header area for mobile access.

---

## Theme Setup Detail

### Install

```bash
pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/cmllfu8oc000004l1a0tidj2g
```

This rewrites `globals.css` with MX-Brutalist CSS variables. After running it:

1. **Fix font declarations in `@theme inline`** — the theme may inject `var()` references that break under Tailwind v4's parse-time resolution. Replace with literal font names:

```css
/* app/globals.css — inside @theme inline */
--font-sans: "Montserrat", ui-sans-serif, system-ui, sans-serif;
--font-serif: "Lora", ui-serif, serif;
--font-mono: "Space Mono", ui-monospace, monospace;
```

2. **Border radius is 0px** — the theme sets `--radius: 0px`. Do not override this with `rounded-*` classes in components. All UI must follow the brutalist flat-edge aesthetic.

### `app/providers.tsx`

```tsx
'use client'
import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="gabutin-theme"
    >
      {children}
    </ThemeProvider>
  )
}
```

`enableSystem: false` — we don't follow OS preference; default is always dark unless the user explicitly toggles. E09 extends this same `Providers` component to add PostHog; do not duplicate the file.

### Font Loading & Responsive Nav Layout (`app/layout.tsx`)

```tsx
import { Montserrat, Lora, Space_Mono } from 'next/font/google'
import { BottomNav } from '@/components/BottomNav'
import { SideNav } from '@/components/SideNav'
import { Providers } from './providers'

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-sans' })
const lora = Lora({ subsets: ['latin'], variable: '--font-serif' })
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${montserrat.variable} ${lora.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased bg-background text-foreground">
        <Providers>
          <div className="flex min-h-screen">
            {/* Side nav — desktop only (≥ lg / 1024px) */}
            <SideNav className="hidden lg:flex" />
            {/* Main content — offset for sidebar on desktop, bottom nav on mobile */}
            <main className="flex-1 lg:pl-60 pb-20 lg:pb-0 min-h-screen">
              {children}
            </main>
          </div>
          {/* Bottom nav — mobile only */}
          <BottomNav className="lg:hidden" />
        </Providers>
      </body>
    </html>
  )
}
```

Key changes from a static dark layout:
- No hardcoded `dark` class — `next-themes` injects `dark`/`light` on `<html>` at runtime
- `suppressHydrationWarning` on `<html>` — prevents React mismatch when next-themes adds the class client-side
- `<Providers>` wraps body content

---

## Vitest Setup

### `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
 plugins: [react()],
 test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/test/setup.ts'],
  coverage: {
   provider: 'v8',
   reporter: ['text', 'lcov'],
   thresholds: { lines: 80, functions: 80, branches: 80 },
   exclude: ['src/test/**', '**/*.d.ts', 'src/app/**', 'src/db/**'],
  },
 },
 resolve: {
  alias: {
   '@': path.resolve(__dirname, './src'),
  },
 },
})
```

Coverage excludes app routes and DB models (infrastructure) — focus coverage on `lib/` and `utils/`.

### `src/test/setup.ts`

```ts
import '@testing-library/jest-dom'
```

### `src/test/utils.tsx`

```tsx
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'

function customRender(ui: ReactElement, options?: RenderOptions) {
 return render(ui, { ...options })
}

export * from '@testing-library/react'
export { customRender as render }
```

### `package.json` scripts to add

```json
{
 "scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
 }
}
```

### Dev dependencies to install

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @vitest/coverage-v8
```

---

## CI Workflow

File: `.github/workflows/ci.yml`

Three jobs. `type-check` and `unit-tests` run in parallel; `coverage` runs after `unit-tests` passes.

```yaml
name: CI

on:
 push:
  branches: ['**']
 pull_request:
  branches: [main]

jobs:
 type-check:
  name: TypeScript
  runs-on: ubuntu-latest
  steps:
   - uses: actions/checkout@v4
   - uses: pnpm/action-setup@v4
    with:
     version: 9
   - uses: actions/setup-node@v4
    with:
     node-version: '22'
     cache: 'pnpm'
   - run: pnpm install --frozen-lockfile
   - run: pnpm tsc --noEmit

 unit-tests:
  name: Unit Tests
  runs-on: ubuntu-latest
  steps:
   - uses: actions/checkout@v4
   - uses: pnpm/action-setup@v4
    with:
     version: 9
   - uses: actions/setup-node@v4
    with:
     node-version: '22'
     cache: 'pnpm'
   - run: pnpm install --frozen-lockfile
   - run: pnpm test

 coverage:
  name: Coverage Gate (≥80%)
  runs-on: ubuntu-latest
  needs: unit-tests
  steps:
   - uses: actions/checkout@v4
   - uses: pnpm/action-setup@v4
    with:
     version: 9
   - uses: actions/setup-node@v4
    with:
     node-version: '22'
     cache: 'pnpm'
   - run: pnpm install --frozen-lockfile
   - run: pnpm test:coverage
```

No secrets needed — all unit tests mock DB and API calls. Coverage thresholds (80%) are enforced inside `vitest.config.ts`; Vitest exits non-zero automatically when any threshold is missed, which fails the job.

**Branch protection (one-time manual step after this epic merges):** 
GitHub → Settings → Branches → Add rule for `main` → require status checks: `TypeScript`, `Unit Tests`, `Coverage Gate (≥80%)`.

---

## API Contracts

None. This epic creates the shared infrastructure — it exports types and models, it does not expose Server Actions.

---

## Tests

This epic sets up the test runner itself. Smoke-test it with one test before marking done.

**`src/test/setup.test.ts`** — verify the test environment works:

```ts
import { describe, it, expect } from 'vitest'

describe('test environment', () => {
 it('runs a basic assertion', () => {
  expect(1 + 1).toBe(2)
 })

 it('has jest-dom matchers available', () => {
  const div = document.createElement('div')
  document.body.appendChild(div)
  expect(div).toBeInTheDocument()
 })
})
```

Run: `rtk vitest run src/test/setup.test.ts` 
Expected: 2 passing tests.

**`src/components/BottomNav/BottomNav.test.tsx`** — verify nav links render:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { BottomNav } from '@/components/BottomNav'

describe('BottomNav', () => {
 it('renders Feed, Achievements, and Profile links', () => {
  render(<BottomNav className="" />)
  expect(screen.getByRole('link', { name: /feed/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /achievements/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument()
 })

 it('has correct hrefs', () => {
  render(<BottomNav className="" />)
  expect(screen.getByRole('link', { name: /feed/i })).toHaveAttribute('href', '/feed')
  expect(screen.getByRole('link', { name: /achievements/i })).toHaveAttribute('href', '/achievements')
  expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/profile')
 })
})
```

---

## Acceptance Criteria

- [ ] `pnpm dev` starts without errors on a clean checkout with valid `.env.local`
- [ ] MongoDB connection is established; startup log prints `"MongoDB connected"` (dev only)
- [ ] All five models are importable from `@/db/models/*` without TypeScript errors
- [ ] `src/types/index.ts` exports: `ThemeName`, `AnswerResult`, `AchievementRarity`, `SubmitAnswerResponse`, `AchievementDef`, `UserProfile`
- [ ] MX-Brutalist theme applied: dark background is navy (`oklch(0.1649 ...)`), primary is teal
- [ ] No `rounded-*` class present anywhere in the initial layout or components
- [ ] Montserrat font loads (check DevTools → Network for Montserrat font file)
- [ ] Dark mode active by default on first visit (`html` has class `"dark"` injected by `next-themes`)
- [ ] `ThemeToggle` button renders at the bottom of `SideNav` on desktop
- [ ] Clicking `ThemeToggle` switches `html` class between `dark` and `light`
- [ ] Theme preference persists across page reloads (`localStorage` key `gabutin-theme`)
- [ ] Bottom nav renders on all pages at < 1024px viewport; hidden at ≥ 1024px
- [ ] Side nav renders at ≥ 1024px; hidden on mobile
- [ ] Main content does not overlap bottom nav on mobile (`pb-20`)
- [ ] Main content not clipped by side nav on desktop (`lg:pl-60`)
- [ ] Missing env var throws a descriptive Zod error, not a silent runtime crash
- [ ] `pnpm build` passes with zero TypeScript errors
- [ ] `rtk vitest run` passes (2 setup smoke tests + BottomNav tests green)
- [ ] `rtk tsc` reports zero errors
- [ ] `.github/workflows/ci.yml` exists; pushing a commit triggers all three CI jobs
- [ ] Breaking a type in a test file causes `TypeScript` CI job to fail
- [ ] A failing test causes `Unit Tests` CI job to fail
- [ ] CI completes in under 3 minutes (pnpm cache working on second run)
- [ ] `src/lib/design-tokens.ts` exists and all exports compile without errors
- [ ] All 11 global component shells exist at the correct paths and export the named component
- [ ] `import { CARD_BASE } from '@/lib/design-tokens'` resolves without TS errors in a test file
- [ ] `import { CardFact } from '@/components/Card/CardFact'` resolves and `CardFact` matches `CardFactProps`

---

## Data Models (canonical — all other epics import these)

### `src/db/models/User.ts`
```ts
import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
 uniqueUserId: string
 displayName: string
 avatar?: string
 themes: string[]
 xp: number
 level: number
 currentStreak: number
 consecutiveWrongs: number  // for comeback achievements — default 0
 totalAnswers: number
 totalSkips: number
 createdAt: Date
}

const UserSchema = new Schema<IUser>({
 uniqueUserId:   { type: String, required: true, unique: true, index: true },
 displayName:    { type: String, required: true },
 avatar:      { type: String },
 themes:      { type: [String], required: true },
 xp:        { type: Number, default: 0 },
 level:       { type: Number, default: 1 },
 currentStreak:   { type: Number, default: 0 },
 consecutiveWrongs: { type: Number, default: 0 },
 totalAnswers:   { type: Number, default: 0 },
 totalSkips:    { type: Number, default: 0 },
}, { timestamps: true })

export const User = mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)
```

### `src/db/models/ThemeScore.ts`
```ts
import mongoose, { Document, Schema } from 'mongoose'

export interface IThemeScore extends Document {
 userId: mongoose.Types.ObjectId
 theme: string
 points: number
 seenCardIds: mongoose.Types.ObjectId[]
}

const ThemeScoreSchema = new Schema<IThemeScore>({
 userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
 theme:    { type: String, required: true },
 points:   { type: Number, default: 0 },
 seenCardIds: { type: [Schema.Types.ObjectId], default: [] },
})
ThemeScoreSchema.index({ userId: 1, theme: 1 }, { unique: true })

export const ThemeScore = mongoose.models.ThemeScore ?? mongoose.model<IThemeScore>('ThemeScore', ThemeScoreSchema)
```

### `src/db/models/Card.ts`
```ts
import mongoose, { Document, Schema } from 'mongoose'

export interface ICard extends Document {
 theme: string
 fact: string
 sourceUrl: string
 question: string
 options: string[]
 correctIndex: number
 explanation: string
 status: 'approved' | 'pending'
 generatedBy: 'ai' | 'user'
 createdAt: Date
}

const CardSchema = new Schema<ICard>({
 theme:    { type: String, required: true, index: true },
 fact:     { type: String, required: true },
 sourceUrl:  { type: String, required: true },
 question:   { type: String, required: true },
 options:   { type: [String], required: true },
 correctIndex: { type: Number, required: true },
 explanation: { type: String, required: true },
 status:    { type: String, enum: ['approved', 'pending'], default: 'approved' },
 generatedBy: { type: String, enum: ['ai', 'user'], default: 'ai' },
}, { timestamps: true })

export const Card = mongoose.models.Card ?? mongoose.model<ICard>('Card', CardSchema)
```

### `src/db/models/Answer.ts`
```ts
import mongoose, { Document, Schema } from 'mongoose'

export interface IAnswer extends Document {
 userId: mongoose.Types.ObjectId
 cardId: mongoose.Types.ObjectId
 theme: string
 result: 'correct' | 'wrong' | 'skip'
 pointsDelta: number
 xpDelta: number
 answeredAt: Date
}

const AnswerSchema = new Schema<IAnswer>({
 userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
 cardId:   { type: Schema.Types.ObjectId, ref: 'Card', required: true },
 theme:    { type: String, required: true },
 result:   { type: String, enum: ['correct', 'wrong', 'skip'], required: true },
 pointsDelta: { type: Number, required: true },
 xpDelta:   { type: Number, required: true },
 answeredAt: { type: Date, default: Date.now },
})

export const Answer = mongoose.models.Answer ?? mongoose.model<IAnswer>('Answer', AnswerSchema)
```

### `src/db/models/UserAchievement.ts`
```ts
import mongoose, { Document, Schema } from 'mongoose'

export interface IUserAchievement extends Document {
 userId: mongoose.Types.ObjectId
 achievementKey: string
 earnedAt: Date
 isShowcased: boolean
 showcasePosition: 1 | 2 | 3 | null
}

const UserAchievementSchema = new Schema<IUserAchievement>({
 userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
 achievementKey:  { type: String, required: true },
 earnedAt:     { type: Date, default: Date.now },
 isShowcased:   { type: Boolean, default: false },
 showcasePosition: { type: Number, enum: [1, 2, 3, null], default: null },
})
UserAchievementSchema.index({ userId: 1, achievementKey: 1 }, { unique: true })

export const UserAchievement = mongoose.models.UserAchievement ?? mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema)
```

---

## Shared Types (`src/types/index.ts`)

```ts
export type ThemeName =
 | 'sejarah_indonesia'
 | 'sains'
 | 'pop_culture'
 | 'geografi'
 | 'matematika'
 | 'psikologi'
 | 'sejarah_dunia'
 | 'coding_tech'
 | 'tutorial'

export type AnswerResult = 'correct' | 'wrong' | 'skip'
export type AchievementRarity = 'Common' | 'Rare' | 'Epic' | 'Mythic'

export interface SubmitAnswerResponse {
 result: AnswerResult
 pointsDelta: number
 xpDelta: number
 newStreak: number
 newLevel: number
 leveledUp: boolean
 newAchievements: AchievementDef[]
}

export interface AchievementDef {
 key: string
 title: string
 icon: string
 rarity: AchievementRarity
 description: string
}

export interface UserProfile {
 displayName: string
 uniqueUserId: string
 level: number
 xp: number
 xpToNextLevel: number
 levelTitle: string
 currentStreak: number
}

// Lean document types — serializable plain objects (result of .lean() queries).
// Use these as prop types in Client Components; Mongoose Document types belong server-side only.

export interface CardDoc {
 _id: string
 theme: string
 fact: string
 sourceUrl: string
 question: string
 options: string[]
 correctIndex: number
 explanation: string
}

export interface UserAchievementDoc {
 _id: string
 userId: string
 achievementKey: string
 earnedAt: Date
 isShowcased: boolean
 showcasePosition: 1 | 2 | 3 | null
}

export interface ThemeScoreDoc {
 _id: string
 userId: string
 theme: string
 points: number
}
```

---

## Env Validation (`src/env.ts`)

```ts
import { z } from 'zod'

const envSchema = z.object({
 MONGODB_URI:       z.string().url(),
 GEMINI_API_KEY:      z.string().min(1),
 NEXT_PUBLIC_APP_URL:   z.string().url(),
 NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
 NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

---

## Design Tokens (`src/lib/design-tokens.ts`)

All MX-Brutalist Tailwind class strings are centralized here. Import from this file in every component — never repeat these literals inline. When the design system changes, update once here.

```ts
// src/lib/design-tokens.ts

// Card surfaces
export const CARD_BASE = 'bg-card border-2 border-border shadow-[4px_4px_0px_0px_black] p-6' as const
export const CARD_LIGHT_BORDER = 'border border-border p-3' as const

// Shadows (hard-edged, 0px blur — brutalist)
export const SHADOW_HARD  = 'shadow-[4px_4px_0px_0px_black]' as const
export const SHADOW_MEDIUM = 'shadow-[2px_2px_0px_0px_black]' as const

// Button pressed effect (active state)
export const BUTTON_PRESS = 'shadow-[2px_2px_0px_0px_black] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]' as const

// Result card border+shadow states (correct / wrong / skip)
export const BORDER_CORRECT = 'border-2 border-primary shadow-[4px_4px_0px_0px_hsl(var(--primary))]' as const
export const BORDER_WRONG  = 'border-2 border-secondary shadow-[4px_4px_0px_0px_hsl(var(--secondary))]' as const
export const BORDER_SKIP  = 'border-2 border-muted-foreground shadow-[4px_4px_0px_0px_hsl(var(--muted-foreground))]' as const

// Achievement rarity text colors
export const RARITY_COLORS: Record<string, string> = {
 Common: 'text-muted-foreground',
 Rare:  'text-blue-400',
 Epic:  'text-purple-400',
 Mythic: 'text-yellow-400',
}

// XP bar
export const XP_BAR_TRACK = 'h-2 bg-muted border border-border w-full' as const
export const XP_BAR_FILL = 'h-full bg-primary transition-[width] duration-500' as const

// MCQ answer option button
export const MCQ_OPTION = 'border-2 border-border py-3 px-4 text-left cursor-pointer transition-colors duration-150 hover:bg-primary/10 w-full' as const

// Showcase badge slot
export const SHOWCASE_SLOT    = 'border-2 border-border shadow-[4px_4px_0px_0px_black] p-4' as const
export const SHOWCASE_SLOT_EMPTY = 'bg-muted text-muted-foreground text-center text-sm' as const

// Timer bar (drains over 10s)
export const TIMER_BAR_TRACK = 'h-1 w-full bg-muted' as const
export const TIMER_BAR_FILL = 'h-full bg-primary' as const

// Achievement toast position
export const TOAST_POSITION = 'fixed bottom-24 lg:bottom-8 left-4 right-4 lg:left-auto lg:right-8 lg:w-80 z-50' as const
```

---

## Global Component Shells

E01 scaffolds every shared UI component as an **empty shell** — correct file path, frozen prop interface, named export, returns `null`. Feature epics (E02, E04, E08) fill in the implementation body. Parallel agents never create these files independently.

> **Rule:** If a component appears in this list, the file already exists after E01. Feature epics call `// E0X implements this component` and replace `() => null` with real code.

### `src/components/GuestBanner/index.tsx` _(E02 implements)_

```tsx
'use client'
import type { FC } from 'react'

export interface GuestBannerProps {
 guestCardCount: number
 onDismiss?: () => void
}

export const GuestBanner: FC<GuestBannerProps> = () => null
```

### `src/components/ReEngagementCard/index.tsx` _(E02 implements)_

```tsx
'use client'
import type { FC } from 'react'

export interface ReEngagementCardProps {
 onRegister?: () => void
}

export const ReEngagementCard: FC<ReEngagementCardProps> = () => null
```

### `src/components/AchievementToast/index.tsx` _(E04 implements)_

```tsx
import type { FC } from 'react'
import type { AchievementDef } from '@/types'

export interface AchievementToastProps {
 achievement: AchievementDef
 onDismiss?: () => void
}

export const AchievementToast: FC<AchievementToastProps> = () => null
```

### `src/components/CountdownTimer/index.tsx` _(E04 implements)_

```tsx
'use client'
import type { FC } from 'react'

export interface CountdownTimerProps {
 seconds: number
 onExpire: () => void
}

export const CountdownTimer: FC<CountdownTimerProps> = () => null
```

### `src/components/CardSkeleton/index.tsx` _(E04 implements)_

```tsx
import type { FC } from 'react'
import { CARD_BASE } from '@/lib/design-tokens'

export const CardSkeleton: FC = () => (
 <div className={`${CARD_BASE} animate-pulse`}>
  <div className="h-4 bg-muted w-3/4 mb-4" />
  <div className="h-4 bg-muted w-1/2 mb-2" />
  <div className="h-4 bg-muted w-full mb-2" />
  <div className="h-4 bg-muted w-2/3" />
 </div>
)
```

### `src/components/Card/CardFact.tsx` _(E04 implements)_

```tsx
'use client'
import type { FC } from 'react'
import type { CardDoc } from '@/types'

export interface CardFactProps {
 card: CardDoc
 onReady: () => void
}

export const CardFact: FC<CardFactProps> = () => null
```

### `src/components/Card/CardQuestion.tsx` _(E04 implements)_

```tsx
'use client'
import type { FC } from 'react'
import type { CardDoc } from '@/types'

export interface CardQuestionProps {
 card: CardDoc
 onAnswer: (selectedIndex: number) => void
 onExpire: () => void
}

export const CardQuestion: FC<CardQuestionProps> = () => null
```

### `src/components/Card/CardResult.tsx` _(E04 implements)_

```tsx
'use client'
import type { FC } from 'react'
import type { CardDoc, SubmitAnswerResponse } from '@/types'

export interface CardResultProps {
 card: CardDoc
 response: SubmitAnswerResponse
 onNext: () => void
}

export const CardResult: FC<CardResultProps> = () => null
```

### `src/components/Card/CardNext.tsx` _(E04 implements)_

```tsx
'use client'
import type { FC } from 'react'

export interface CardNextProps {
 onNext: () => void
}

export const CardNext: FC<CardNextProps> = () => null
```

### `src/components/XpBar/index.tsx` _(E08 implements)_

```tsx
import type { FC } from 'react'

export interface XpBarProps {
 currentXp: number
 xpToNextLevel: number
 level: number
 levelTitle: string
}

export const XpBar: FC<XpBarProps> = () => null
```

### `src/components/ProfileClient/index.tsx` _(E08 implements)_

```tsx
'use client'
import type { FC } from 'react'

export const ProfileClient: FC = () => null
```

### `src/components/ThemeToggle/index.tsx` _(E01 fully implements — not a shell)_

```tsx
'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import type { FC } from 'react'

export const ThemeToggle: FC = () => {
  const { theme, setTheme } = useTheme()
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2"
      aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
```

Place this at the bottom of `SideNav` on desktop. For mobile, `ProfileClient` (E08) renders it in the profile page header.

---

## In Scope

- Project scaffolding (`create-next-app`)
- Tailwind CSS v4 + shadcn/ui init (`-d` flag, non-interactive)
- MX-Brutalist theme installation + font fix
- Google Fonts setup (Montserrat, Lora, Space Mono)
- `src/db/connect.ts` (MongoDB connection singleton)
- All five Mongoose model files with TypeScript interfaces
- `src/types/index.ts` (shared types — including `CardDoc`, `UserAchievementDoc`, `ThemeScoreDoc`)
- `src/env.ts` (Zod validation)
- **`src/lib/design-tokens.ts`** (centralized Tailwind class strings — all MX-Brutalist tokens)
- **`next-themes`** installed (`pnpm add next-themes`)
- **`app/providers.tsx`** — ThemeProvider, `defaultTheme: 'dark'`, `storageKey: 'gabutin-theme'`
- Root `app/layout.tsx` — MX-Brutalist fonts, `<Providers>` wrapper, `suppressHydrationWarning`, no hardcoded `dark` class
- `src/components/BottomNav/index.tsx` — `lg:hidden`, Lucide icons, active-link detection
- `src/components/SideNav/index.tsx` — `hidden lg:flex`, fixed 240px left, logo + nav links + `ThemeToggle` at bottom
- **`src/components/ThemeToggle/index.tsx`** — fully implemented toggle (not a shell)
- **Global component shells** (11 files — see section above): `GuestBanner`, `ReEngagementCard`, `AchievementToast`, `CountdownTimer`, `CardSkeleton`, `Card/CardFact`, `Card/CardQuestion`, `Card/CardResult`, `Card/CardNext`, `XpBar`, `ProfileClient`
- Placeholder pages: `/feed`, `/achievements`, `/profile`
- Vitest configuration (`vitest.config.ts`, `src/test/setup.ts`, `src/test/utils.tsx`)
- Test smoke test (`src/test/setup.test.ts`)
- `.github/workflows/ci.yml` (three-job CI workflow)
- `pnpm build` green + `rtk vitest run` green + CI green

---

## Out of Scope / Guardrails

- No business logic — models are schema definitions only
- No seeding tutorial cards (E02 owns that)
- No actual page content beyond placeholder `<h1>`
- Do not add `rounded-*` to any component — 0px radius is the theme law
- Do not use `var(--font-*)` inside `@theme inline` — use literal font family strings
- Do not add Mongoose middleware or virtuals unless required by schema

---

## Dependencies

None. This is the root of the dependency graph.

---

## References

- [implementation-overview.md](../implementation-overview.md) — canonical types, file tree, testing strategy, theme tokens
- [product-design.md §4](../product-design.md) — Tech Stack
- [product-design.md §7](../product-design.md) — Data Models
- [product-design.md §15](../product-design.md) — Routes
- [product-design.md §17](../product-design.md) — Bootstrap Commands
- TweakCN theme: `https://tweakcn.com/r/themes/cmllfu8oc000004l1a0tidj2g`
- Vitest docs: `https://vitest.dev/config/`
- [design-system.md §6](../design-system.md) — Navigation responsive pattern + exact component code
- [design-system.md §5](../design-system.md) — Shadow system (4px hard shadow)
- [design-system.md §16](../design-system.md) — Icon usage (Lucide, no emoji in nav)
- GitHub Actions docs: `pnpm/action-setup@v4`, `actions/setup-node@v4`
