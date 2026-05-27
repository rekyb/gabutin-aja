# E08 — Profile Page

**Status:** [ ] Not started 
**Wave:** 4 (start after E01, E02, E05, E06)

---

## Goal

Build the `/profile` page: DiceBear avatar, display name, user ID, level + XP bar, 3-slot badge showcase (populated from pinned achievements), and per-theme score breakdown. This page is a read-only Server Component.

## Why

Profile is the identity page — where users feel ownership over their progress and want to "show off" their showcase badges. It reinforces the achievement system built in E06 by surfacing the pinned badges prominently. Since it's a read-heavy page with no user-initiated mutations, it's an ideal Server Component.

---

## Functional Requirements

1. **Route:** `/profile` — Server Component. No `'use client'` on the page. Reads directly from DB via a Server Action / service call.
2. **Avatar:** Render DiceBear avatar using `uniqueUserId` as seed. URL pattern: `https://api.dicebear.com/7.x/pixel-art/svg?seed={uniqueUserId}`. Render as `<img>` (not `<Image>` with Next.js optimization — SVG from external URL is easier as plain img).
3. **Display name + user ID:** Show display name in large text. Show `#uniqueUserId` in small muted text below.
4. **Level + XP bar:**
  - Level title (e.g., "Penasaran")
  - Level number (e.g., "Level 7")
  - Progress bar: `xp / xpRequiredForLevel(level + 1)` as a filled bar
  - Text label: `"243 / 316 XP"`
5. **Badge showcase:** 3 slots. Each slot shows the badge icon + title + rarity color. Empty slots show a grey placeholder with text `"Belum ada badge"`. Slots ordered by `showcasePosition` (1, 2, 3).
6. **"Edit Showcase" CTA:** Link to `/achievements`. Not a button — use `<Link href="/achievements">`.
7. **Theme breakdown:** For each of the user's 3 themes, show:
  - Theme label (e.g., "Sains & Teknologi")
  - Current points (e.g., `"47 poin"`)
  - A relative strength indicator (optional: thin progress bar capped at 100 points)
8. **`userId` source:** Read from `localStorage` on the client. But since this is a Server Component, the client must pass `userId` to the server somehow. Use a Client Component wrapper to read localStorage and call the Server Action:

```tsx
// app/profile/page.tsx — Server Component shell
import ProfileClient from '@/components/ProfileClient'
export default function ProfilePage() {
 // Content area (sidebar offset already in root layout via lg:pl-60)
 // Profile uses max-w-2xl — wider than feed card
 return (
  <div className="px-4 py-6 lg:px-8 max-w-2xl">
   <ProfileClient />
  </div>
 )
}

// src/components/ProfileClient/index.tsx — 'use client'
// Reads uniqueUserId from localStorage, calls getUserProfile Server Action
// Renders the full profile UI — single-column layout on all breakpoints
```

### Visual design rules (from design-system.md)
- **Avatar:** `<img>` (not Next.js `<Image>`) — external SVG. Size: `w-16 h-16 border-2 border-border`
- **XP bar:** `h-2 bg-muted border border-border` track; `h-full bg-primary transition-[width] duration-500` fill. Must have `data-testid="xp-progress"` on the fill element.
- **Showcase slots:** `border-2 border-border shadow-[4px_4px_0px_0px_black] p-4`. Empty slot: `bg-muted text-muted-foreground text-center text-sm`
- **Theme score cards:** `border border-border p-3` (lighter — no hard shadow on secondary info)
- No `rounded-*` anywhere

---

## API Contracts

```ts
// app/actions/profile.ts
'use server'

import type { IUserAchievement } from '@/db/models/UserAchievement'
import type { IThemeScore } from '@/db/models/ThemeScore'
import type { UserProfile } from '@/types'

export async function getUserProfile(userId: string): Promise<{
 profile: UserProfile
 showcasedBadges: Array<IUserAchievement & { def: AchievementDef }>
 themeScores: IThemeScore[]
} | null>
```

`getUserProfile` returns `null` if no user found. Client handles the null case (redirect to `/welcome`).

Internally, `getUserProfile` calls `xpRequiredForLevel(level + 1)` from `src/lib/scoring/formulas.ts` to compute `xpToNextLevel`. It joins `UserAchievement` docs with `ACHIEVEMENTS` definitions array for `def`.

---

## Theme Label Map

```ts
// src/lib/theme-labels.ts
export const THEME_LABELS: Record<string, string> = {
 sejarah_indonesia: 'Sejarah Indonesia',
 sains:       'Sains & Teknologi',
 pop_culture:    'Pop Culture',
 geografi:     'Geografi Dunia',
 matematika:    'Matematika',
 psikologi:     'Psikologi',
 sejarah_dunia:   'Sejarah Dunia',
 coding_tech:    'Coding & Tech',
}
```

---

## Acceptance Criteria

- [ ] `/profile` renders without a `'use client'` directive on `app/profile/page.tsx`
- [ ] Avatar image loads using `https://api.dicebear.com/7.x/pixel-art/svg?seed={uniqueUserId}`
- [ ] XP bar accurately reflects `user.xp` vs threshold for next level
- [ ] Badge showcase shows exactly the pinned badges (0–3 depending on user's showcase state)
- [ ] Empty showcase slots show grey placeholder, not blank space
- [ ] Theme scores show current points from DB
- [ ] "Edit Showcase" link navigates to `/achievements`
- [ ] Page renders correctly for a user with 0 points and no badges (new user)
- [ ] Page returns null-state (or redirects) for unknown `userId`

---

## Tests

Target: ≥80% on `XpBar` component. `getUserProfile` Server Action is covered by E05's formula tests indirectly.

### `src/components/XpBar/XpBar.test.tsx`
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { XpBar } from '@/components/XpBar'

describe('XpBar', () => {
 it('renders current XP and threshold', () => {
  render(<XpBar currentXp={45} xpToNextLevel={100} level={3} levelTitle="Penasaran" />)
  expect(screen.getByText(/45/)).toBeInTheDocument()
  expect(screen.getByText(/100/)).toBeInTheDocument()
 })

 it('renders level title', () => {
  render(<XpBar currentXp={0} xpToNextLevel={10} level={1} levelTitle="Newbie Gabut" />)
  expect(screen.getByText('Newbie Gabut')).toBeInTheDocument()
 })

 it('progress bar width reflects XP fraction', () => {
  const { container } = render(<XpBar currentXp={50} xpToNextLevel={100} level={2} levelTitle="Newbie Gabut" />)
  const bar = container.querySelector('[data-testid="xp-progress"]')
  expect(bar).toHaveStyle({ width: '50%' })
 })
})
```

Run: `rtk vitest run src/components/XpBar/XpBar.test.tsx`

---

## In Scope

- `app/profile/page.tsx` (Server Component shell)
- **`ProfileClient`** — shell exists at `src/components/ProfileClient/index.tsx` (from E01). E08 fills in the localStorage read + `getUserProfile` call + full profile UI. Do not recreate the file. Include `<ThemeToggle />` (from `@/components/ThemeToggle`) in the profile page header — this is the mobile entry point for dark/light switching.
- `app/actions/profile.ts` — `getUserProfile` Server Action
- **`XpBar`** — shell exists at `src/components/XpBar/index.tsx` (from E01) with frozen `XpBarProps`. E08 fills in the progress bar render. `data-testid="xp-progress"` must be on the fill element for tests.
- Badge showcase display (3 slots)
- Theme score breakdown
- `src/lib/theme-labels.ts` — theme ID → display label
- Design token usage: import `XP_BAR_TRACK`, `XP_BAR_FILL`, `SHOWCASE_SLOT`, `SHOWCASE_SLOT_EMPTY` from `@/lib/design-tokens`

---

## Out of Scope / Guardrails

- No profile editing (display name, avatar) in v1.0
- No public profile URLs (no `/profile/[userId]`)
- Badge pin/unpin interaction lives on `/achievements` (E06), not here
- Do not duplicate the XP formula — import `xpRequiredForLevel` from `src/lib/scoring/formulas.ts`
- Theme score "strength bar" is cosmetic — cap display at 100 points, don't normalize against max
- No `rounded-*` Tailwind classes — MX-Brutalist 0px radius. Add `data-testid="xp-progress"` to the XP bar fill element for testability.

---

## Dependencies

- **E01** — models, types, layout
- **E02** — `User` document exists; `uniqueUserId` in localStorage
- **E05** — `xpRequiredForLevel`, `getLevelTitle` from `src/lib/scoring/formulas.ts`; `ThemeScore.points` populated
- **E06** — `UserAchievement` documents with `isShowcased: true`; `ACHIEVEMENTS` definitions

---

## References

- [implementation-overview.md](../implementation-overview.md) — `UserProfile` type, file tree
- [product-design.md §15](../product-design.md) — Routes
- [product-design.md §13](../product-design.md) — Badge Showcase Mechanic
- [product-design.md §9](../product-design.md) — Level Titles
- [E05 — Scoring Engine](./e05-scoring-engine.md) — `getLevelTitle`, `xpRequiredForLevel`
- [E06 — Achievement System](./e06-achievement-system.md) — `ACHIEVEMENTS` definitions, rarity colors
- [design-system.md §10](../design-system.md) — XP bar design
- [design-system.md §9](../design-system.md) — Achievement badge design
- [design-system.md §14](../design-system.md) — Responsive breakpoints
