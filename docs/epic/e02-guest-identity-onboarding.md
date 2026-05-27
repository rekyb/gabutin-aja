# E02 — Guest Identity & Onboarding

**Status:** [ ] Not started 
**Wave:** 2 (start after E01)

---

## Goal

Implement the full guest user identity system and onboarding flow: first-visit detection, uniqueUserId generation, 3-card tutorial, display-name + theme-selection registration, skip-to-guest fallback, persistent guest banner, and the 15-card re-engagement reminder.

## Why

Every feature that personalizes the experience — feed algorithm, scoring, achievements, profile — requires a user record. This epic creates that record and handles the localStorage-first identity pattern. Getting the identity lifecycle right here prevents all downstream epics from having to deal with "what if there's no user?" edge cases.

---

## Functional Requirements

1. **First-visit detection:** Check `localStorage.getItem('uniqueUserId')` on app load. If absent, route to `/welcome`.
2. **uniqueUserId generation:** 9-digit numeric string, `Math.floor(100_000_000 + Math.random() * 900_000_000).toString()`. Store in localStorage immediately on first visit, before registration.
3. **Tutorial:** `/welcome` shows exactly 3 hand-curated cards (theme: `'tutorial'`). These cards must be pre-seeded in MongoDB by this epic's setup script.
4. **End-of-tutorial prompt:** After the 3rd tutorial card is answered, show "Simpan progress lo?" decision screen.
  - **Option A (Register):** User enters a display name (required, 1–30 chars) → picks exactly 3 themes from the 8 available → creates user in DB → stores `uniqueUserId` in localStorage → redirects to `/feed`.
  - **Option B (Skip):** Sets `localStorage.setItem('guestOnly', 'true')` → redirects to `/feed` with no DB record. No account created.
5. **Guest banner:** If `guestOnly` flag is set and no DB record exists, render a persistent non-dismissable banner at the top of every page: `"Main sebagai tamu — progress bisa ilang kalau lo hapus cache"`.
6. **Returning-user detection:** On app load, if `uniqueUserId` is in localStorage AND a DB record exists for that ID, skip `/welcome` and go straight to `/feed`.
7. **Re-engagement card:** Injected into the feed (not a popup) when `guestCardCount >= 15` AND `(now - lastReminderShown) >= 24h`. Tracked via `localStorage.setItem('guestCardCount', n)` and `localStorage.setItem('lastReminderShown', isoString)`.
  - Card text: `"Lo udah jawab 15+ soal. Jangan sampe ilang — simpan progress lo dalam 10 detik."`
  - Two actions: `[Simpan Progress]` (opens registration flow) and `[Ntar deh →]` (dismisses, resets 24h clock)
8. **Theme picker:** Shows all 8 theme options as selectable cards. Exactly 3 must be selected before continuing. Deselecting below 3 disables the Continue button.
9. **DiceBear avatar:** Generated client-side from `uniqueUserId` as seed. No upload or storage — regenerated on demand. Use `https://api.dicebear.com/7.x/pixel-art/svg?seed={uniqueUserId}`.
10. **Guest banner visual:** Persistent non-dismissible strip. Style: `bg-secondary/20 border-b-2 border-secondary px-4 py-2 flex items-center justify-between`. Uses Lucide `AlertTriangle` icon — no emoji. See design-system.md §13.
11. **Re-engagement card visual:** Full `max-w-md` card matching the feed card style (`border-2 border-border shadow-[4px_4px_0px_0px_black]`). It is injected as a card in the feed — not a modal or popup.

---

## API Contracts

```ts
// app/actions/user.ts
'use server'

import type { ThemeName } from '@/types'

export async function createUser(
 displayName: string,
 themes: ThemeName[],
 uniqueUserId: string
): Promise<{ userId: string }>

export async function getUserByUniqueId(
 uniqueUserId: string
): Promise<{ _id: string; displayName: string; themes: string[]; xp: number; level: number } | null>
```

`createUser` must:
- Validate `themes.length === 3`
- Create the `User` document
- Create three `ThemeScore` documents (one per theme, points: 0)
- Return `{ userId: user._id.toString() }`

`getUserByUniqueId` returns `null` if no record found (not an error).

---

## Database Seed (tutorial cards)

This epic is responsible for seeding exactly 3 tutorial cards. Use a seed script at `scripts/seed-tutorial.ts`.

```ts
// scripts/seed-tutorial.ts
// Run once: pnpm tsx scripts/seed-tutorial.ts
const tutorialCards = [
 {
  theme: 'tutorial',
  fact: 'Indonesia adalah negara kepulauan terbesar di dunia dengan lebih dari 17.000 pulau yang membentang sepanjang 5.000 km dari barat ke timur.',
  sourceUrl: 'https://id.wikipedia.org/wiki/Indonesia',
  question: 'Berapa perkiraan jumlah pulau di Indonesia?',
  options: ['Lebih dari 5.000', 'Lebih dari 10.000', 'Lebih dari 17.000', 'Lebih dari 25.000'],
  correctIndex: 2,
  status: 'approved',
  generatedBy: 'ai',
 },
 // card 2 and card 3 — must showcase different interaction states
]
```

Cards must have `status: 'approved'` and not appear in any user's `seenCardIds` by default.

---

## Acceptance Criteria

- [ ] First visit (empty localStorage): routed to `/welcome`, not `/feed`
- [ ] `localStorage.getItem('uniqueUserId')` is set after landing on `/welcome`
- [ ] Tutorial renders exactly 3 cards sequentially (no swipe algorithm — fixed order)
- [ ] Skipping registration: no User document in MongoDB, guest banner visible on `/feed`
- [ ] Registering: User document exists in MongoDB with correct `displayName`, `themes`, `xp: 0`, `level: 1`
- [ ] Three ThemeScore documents created (one per selected theme)
- [ ] Returning visit: if uniqueUserId + DB record exist, routed directly to `/feed` without `/welcome`
- [ ] Re-engagement card appears after 15 guest answers and 24h wait (localStorage-driven)
- [ ] Theme picker enforces exactly 3 selections — Continue button disabled otherwise
- [ ] DiceBear avatar renders without error using `uniqueUserId` as seed

---

## In Scope

- `/welcome` page and route
- Tutorial card renderer (3-card fixed sequence, no algorithm)
- `uniqueUserId` generation utility (`src/utils/user-id.ts`)
- Registration form (display name input + theme picker)
- `createUser` and `getUserByUniqueId` Server Actions
- **`GuestBanner`** — shell exists at `src/components/GuestBanner/index.tsx` (from E01). E02 fills in the implementation body; do not recreate the file. Import `GuestBannerProps` from that path.
- **`ReEngagementCard`** — shell exists at `src/components/ReEngagementCard/index.tsx` (from E01). E02 fills in the implementation body; do not recreate the file.
- localStorage helpers for guest state
- Tutorial card seed script (`scripts/seed-tutorial.ts`)
- Root layout integration: redirect logic based on localStorage
- Design token usage: import card/border constants from `@/lib/design-tokens` (e.g., `CARD_BASE`, `SHADOW_HARD`)

---

## Tests

Target: ≥80% coverage on `src/utils/user-id.ts` and `src/lib/` files in this epic.

### `src/utils/user-id.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import { generateUniqueUserId } from '@/utils/user-id'

describe('generateUniqueUserId', () => {
 it('returns a 9-digit string', () => {
  const id = generateUniqueUserId()
  expect(id).toMatch(/^\d{9}$/)
 })

 it('starts with a non-zero digit', () => {
  // Math.floor(100_000_000 + ...) guarantees this
  for (let i = 0; i < 20; i++) {
   expect(generateUniqueUserId().charAt(0)).not.toBe('0')
  }
 })

 it('generates unique IDs across calls', () => {
  const ids = new Set(Array.from({ length: 100 }, generateUniqueUserId))
  expect(ids.size).toBeGreaterThan(90) // probabilistic, very unlikely to collide
 })
})
```

### `src/components/GuestBanner/GuestBanner.test.tsx`
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { GuestBanner } from '@/components/GuestBanner'

describe('GuestBanner', () => {
 it('renders the guest warning message', () => {
  render(<GuestBanner />)
  expect(screen.getByText(/progress bisa ilang/i)).toBeInTheDocument()
 })
})
```

### `src/components/ReEngagementCard/ReEngagementCard.test.tsx`
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { ReEngagementCard } from '@/components/ReEngagementCard'

describe('ReEngagementCard', () => {
 it('renders the 15+ card message', () => {
  render(<ReEngagementCard onSave={vi.fn()} onDismiss={vi.fn()} />)
  expect(screen.getByText(/jawab 15\+ soal/i)).toBeInTheDocument()
 })

 it('calls onSave when Simpan Progress is tapped', async () => {
  const onSave = vi.fn()
  render(<ReEngagementCard onSave={onSave} onDismiss={vi.fn()} />)
  await userEvent.click(screen.getByRole('button', { name: /simpan progress/i }))
  expect(onSave).toHaveBeenCalledOnce()
 })

 it('calls onDismiss when Ntar deh is tapped', async () => {
  const onDismiss = vi.fn()
  render(<ReEngagementCard onSave={vi.fn()} onDismiss={onDismiss} />)
  await userEvent.click(screen.getByRole('button', { name: /ntar deh/i }))
  expect(onDismiss).toHaveBeenCalledOnce()
 })
})
```

Run: `rtk vitest run src/utils/user-id.test.ts src/components/GuestBanner src/components/ReEngagementCard`

---

## Out of Scope / Guardrails

- No OAuth, email, or password auth (v1.x)
- No display name uniqueness check (names are not unique by design)
- No avatar upload or customization
- Re-engagement card is injected by feed logic — this epic builds the **component** and the **localStorage tracking**; E04 handles injection into the feed
- No account deletion or data export
- Tutorial cards are static — do not run them through the feed algorithm
- No `rounded-*` Tailwind classes — MX-Brutalist theme enforces 0px radius everywhere

---

## Dependencies

- **E01** — Mongoose models (`User`, `ThemeScore`), `src/types/index.ts`, MongoDB connection, layout shell

---

## References

- [implementation-overview.md](../implementation-overview.md) — Server Action contracts, shared types
- [product-design.md §8](../product-design.md) — User Identity
- [product-design.md §10](../product-design.md) — Onboarding Flow
- [product-design.md §5](../product-design.md) — UI copy examples (lo/gue register, banner text)
- [product-design.md §7](../product-design.md) — `users` and `theme_scores` schema
- [design-system.md §13](../design-system.md) — Guest banner visual spec
- [design-system.md §6](../design-system.md) — Navigation pattern (BottomNav / SideNav)
