# E04 — Feed & Card Lifecycle

**Status:** [x] Done — merged to main 2026-05-28
**Wave:** 3 (start after E01, E02, E03; stubs acceptable for E05/E07 during UI dev)

---

## Goal

Build the main `/feed` route with the full 4-state card lifecycle (Fact → Question → Result → Next), swipe-up navigation, 10-second countdown timer, skip handling, achievement toast, and loading skeleton. This is the core TikTok-scroll interaction loop.

## Why

The feed is the product. Every other epic either feeds into it (scoring, algorithm) or surfaces through it (achievements, re-engagement). Getting the UI states and transitions right — especially the timer and swipe gesture — is the highest-visibility work in the codebase.

---

## Functional Requirements

1. **STATE 1 — Fact:** Display Wikipedia excerpt (the `card.fact` field), source URL as a tappable link, and a "Siap?" button. Auto-advances to STATE 2 after 5 seconds if user doesn't tap.
2. **STATE 2 — Question:** Display `card.question`, four `<button>` elements for `card.options[0–3]`, and a visible 10-second countdown timer. Tapping an option immediately submits the answer and transitions to STATE 3.
3. **Timer expiry:** When the 10s timer hits 0 in STATE 2, call `submitAnswer(userId, cardId, null)` (null = skip/timer) and transition to STATE 3 with result `'skip'`.
4. **STATE 3 — Result:** Show correct/wrong indicator, theme points delta (e.g., `+2 tema`), XP delta (e.g., `+3 XP`), level-up animation if `response.leveledUp === true`, achievement toast for each item in `response.newAchievements`, and `card.explanation` text.
5. **STATE 4 — Next:** Swipe up or tap "Lanjut →" to fetch and display the next card (back to STATE 1). Show loading skeleton during the fetch.
6. **Swipe gesture:** Touch swipe-up advances the card. Works on both mobile (touch events) and desktop (mouse drag). Threshold: 50px upward movement.
7. **Achievement toast:** Slides in from bottom when a new achievement is earned. Shows icon + title + rarity color. Auto-dismisses after 3 seconds. Multiple toasts stack.
8. **Guest re-engagement card:** When E02's localStorage conditions are met (`guestCardCount >= 15`, `24h elapsed`), inject the `<ReEngagementCard />` component (built in E02) as the "next card" in the queue. This is a UI-only card — it does not call `getNextCard`.
9. **Stub mode during development:** If `getNextCard` or `submitAnswer` are not yet implemented by E05/E07, the feed must render correctly against mock data matching the exact TypeScript interface.

---

## API Contracts

This epic **calls** these Server Actions (implemented by E05 and E07). Use the exact signatures below for stubs:

```ts
// Stub for development (replace with real import when E05/E07 merge)

// Called to get the next card from the pool
// Implemented by: E07
export async function getNextCard(userId: string): Promise<ICard | null>

// Called when user selects an option or timer expires
// Implemented by: E05
export async function submitAnswer(
 userId: string,
 cardId: string,
 selectedIndex: number | null // null = timer expired / skip
): Promise<SubmitAnswerResponse>
```

`SubmitAnswerResponse` is defined in `src/types/index.ts` (E01). Do not redefine it.

---

## Component Structure

```
src/components/
 Card/
  CardFact.tsx     # STATE 1 — fact display + "Siap?" CTA
  CardQuestion.tsx   # STATE 2 — MCQ + timer
  CardResult.tsx    # STATE 3 — result + deltas + explanation
  CardNext.tsx     # STATE 4 — "Lanjut" button + swipe zone
 AchievementToast/
  index.tsx      # Toast notification (slides in from bottom)
 CountdownTimer/
  index.tsx      # Horizontal bar across top of card, 10s
 CardSkeleton/
   index.tsx      # Loading skeleton — brutalist bars, no radius
```

### Visual design rules (from design-system.md §8)
- **Card base:** `bg-card border-2 border-border shadow-[4px_4px_0px_0px_black] p-6 w-full max-w-md`
- **No `rounded-*` anywhere** — 0px radius is the law
- **Correct result:** border + shadow color switches to `primary` (teal)
- **Wrong result:** border + shadow color switches to `secondary` (orange)
- **Timer:** horizontal bar `h-1 bg-primary` at the top of the card, draining over 10s (CSS linear transition)
- **"Siap?" / "Lanjut" buttons:** `shadow-[2px_2px_0px_0px_black] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]` pressed effect
- **MCQ options:** `border-2 border-border py-3 px-4 text-left cursor-pointer transition-colors duration-150 hover:bg-primary/10`
- **Achievement toast:** `fixed bottom-24 lg:bottom-8 left-4 right-4 lg:left-auto lg:right-8 lg:w-80` — above bottom nav on mobile, bottom-right on desktop

See [design-system.md](../design-system.md) for full token and shadow values.

`app/feed/page.tsx` is a Server Component that passes `userId` from localStorage... wait — localStorage is not accessible in RSC. The feed page must be a Client Component or use a Server Component shell with a Client Component that reads from localStorage.

**Pattern to use:**
```tsx
// app/feed/page.tsx — Server Component shell (no data fetching here)
import FeedClient from '@/components/FeedClient'
export default function FeedPage() {
 return (
  // Mobile: full-screen. Desktop: max-w-md column, no extra centering needed
  // (SideNav offset already applied by root layout's lg:pl-60)
  <div className="flex justify-center lg:justify-start lg:px-8">
   <FeedClient />
  </div>
 )
}

// src/components/FeedClient/index.tsx — 'use client'
// Reads userId from localStorage, manages card state machine
// Card container: w-full max-w-md min-h-[calc(100dvh-64px)] lg:min-h-[calc(100dvh-48px)]
```

### Desktop feed behavior
On desktop (lg+), the feed card sits in a `max-w-md` column just to the right of the side nav. It does **not** center in the full remaining viewport — it aligns to the left side of the content area with `lg:px-8` padding. This matches TikTok Web's phone-column aesthetic rather than a centered island.

---

## State Machine

```
IDLE
  mount + userId resolved
 
LOADING  getNextCard() FACT(card)
                    tap "Siap?" or 5s elapsed
                   
                 QUESTION(card)
                    tap option → submitAnswer()
                    timer expires → submitAnswer(null)
                   
                 RESULT(response, card)
                    swipe up or tap "Lanjut"
                   
                 LOADING  getNextCard() (loop)
```

Use `useState<'loading' | 'fact' | 'question' | 'result' | 'next'>` + `useReducer` if transitions become complex.

---

## Timer Implementation

```tsx
// src/components/CountdownTimer/index.tsx
'use client'
// Props: seconds (default 10), onExpire: () => void
// Use setInterval + clearInterval in useEffect
// Display as a circular progress ring (SVG) or horizontal bar
// Color: green → yellow → red as time decreases
```

The timer must start fresh every time STATE 2 is entered. Clear the interval when leaving STATE 2 (answer submitted or component unmounts).

---

## Acceptance Criteria

- [ ] STATE 1 renders `card.fact` and `card.sourceUrl` link
- [ ] STATE 1 auto-advances to STATE 2 after 5 seconds (no user action required)
- [ ] STATE 2 renders all 4 MCQ options as `<button>` elements
- [ ] Timer counts down visually from 10s; expiry calls `submitAnswer(userId, cardId, null)`
- [ ] Correct answer: STATE 3 shows green indicator + `+2 tema` + `+N XP`
- [ ] Wrong answer: STATE 3 shows red indicator + `-2 tema` + `+0 XP`
- [ ] Skip/timer: STATE 3 shows grey indicator + `-1 tema` + `+0 XP`
- [ ] Achievement toast appears within 500ms when `newAchievements.length > 0`
- [ ] Level-up animation fires when `response.leveledUp === true`
- [ ] Swipe-up and "Lanjut" button both trigger the next card load
- [ ] Loading skeleton shown during `getNextCard` fetch
- [ ] Guest re-engagement card injected when localStorage conditions met
- [ ] Feed renders correctly with mock `SubmitAnswerResponse` (stub mode)
- [ ] No card state leaks across card transitions (timers cleared, state reset)

---

## In Scope

- `/feed` route (Server Component shell + `FeedClient` Client Component)
- **`CardFact`, `CardQuestion`, `CardResult`, `CardNext`** — shells exist at `src/components/Card/Card*.tsx` (from E01). E04 fills in the implementation bodies and imports `CardDoc` from `@/types`. Do not recreate these files.
- **`CountdownTimer`** — shell exists at `src/components/CountdownTimer/index.tsx` (from E01). E04 fills in the 10s countdown logic.
- **`AchievementToast`** — shell exists at `src/components/AchievementToast/index.tsx` (from E01). E04 fills in slide-in animation and rarity colors.
- **`CardSkeleton`** — shell exists at `src/components/CardSkeleton/index.tsx` (from E01) with a pulse placeholder. E04 may refine the skeleton layout.
- Swipe-up gesture handler (touch + mouse)
- Level-up animation (CSS transition is enough — no library required)
- Guest re-engagement card injection logic
- Stub implementations of `getNextCard` and `submitAnswer` (for UI dev before E05/E07)
- Design token usage: import all class strings from `@/lib/design-tokens` — `CARD_BASE`, `MCQ_OPTION`, `BORDER_CORRECT`, `BORDER_WRONG`, `BORDER_SKIP`, `TOAST_POSITION`, `RARITY_COLORS`, etc.

---

## Tests

Target: ≥80% on all Card components and CountdownTimer. Mock Server Actions with `vi.mock`.

### `src/components/Card/CardFact.test.tsx`
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { CardFact } from '@/components/Card/CardFact'

const mockCard = {
 _id: 'card1',
 fact: 'Indonesia punya lebih dari 17.000 pulau.',
 sourceUrl: 'https://id.wikipedia.org/wiki/Indonesia',
 question: '', options: [], correctIndex: 0, theme: 'sains', explanation: '',
}

describe('CardFact', () => {
 it('renders the fact text', () => {
  render(<CardFact card={mockCard} onReady={vi.fn()} />)
  expect(screen.getByText(/17\.000 pulau/i)).toBeInTheDocument()
 })

 it('renders source URL as a link', () => {
  render(<CardFact card={mockCard} onReady={vi.fn()} />)
  expect(screen.getByRole('link')).toHaveAttribute('href', mockCard.sourceUrl)
 })

 it('calls onReady when Siap? is clicked', async () => {
  const onReady = vi.fn()
  render(<CardFact card={mockCard} onReady={onReady} />)
  await userEvent.click(screen.getByRole('button', { name: /siap/i }))
  expect(onReady).toHaveBeenCalledOnce()
 })
})
```

### `src/components/CountdownTimer/CountdownTimer.test.tsx`
```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@/test/utils'
import { CountdownTimer } from '@/components/CountdownTimer'

describe('CountdownTimer', () => {
 beforeEach(() => { vi.useFakeTimers() })
 afterEach(() => { vi.useRealTimers() })

 it('displays initial seconds', () => {
  render(<CountdownTimer seconds={10} onExpire={vi.fn()} />)
  expect(screen.getByText('10')).toBeInTheDocument()
 })

 it('calls onExpire when timer reaches 0', () => {
  const onExpire = vi.fn()
  render(<CountdownTimer seconds={3} onExpire={onExpire} />)
  act(() => { vi.advanceTimersByTime(3000) })
  expect(onExpire).toHaveBeenCalledOnce()
 })
})
```

### `src/components/AchievementToast/AchievementToast.test.tsx`
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { AchievementToast } from '@/components/AchievementToast'

const mockAchievement = { key: 'on_fire', icon: '', title: 'Gak Ada Obat!', rarity: 'Rare' as const, description: '5 jawaban bener' }

describe('AchievementToast', () => {
 it('renders achievement title', () => {
  render(<AchievementToast achievement={mockAchievement} />)
  expect(screen.getByText('Gak Ada Obat!')).toBeInTheDocument()
 })

 it('applies Rare rarity color class', () => {
  const { container } = render(<AchievementToast achievement={mockAchievement} />)
  expect(container.firstChild).toHaveClass('text-blue-400')
 })
})
```

Run: `rtk vitest run src/components/Card src/components/CountdownTimer src/components/AchievementToast`

---

## Out of Scope / Guardrails

- `/feed/[cardId]` deep-link route — defer to post-hackathon
- Scoring logic — E05 owns `submitAnswer`
- Feed algorithm — E07 owns `getNextCard`
- Achievement checking — E06 owns the check; this epic only renders `newAchievements[]`
- No swipe-down (back) navigation — forward only
- Do not persist card state across page reloads — always start fresh from `getNextCard`
- No `rounded-*` Tailwind classes — MX-Brutalist 0px radius. Hard box shadows (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`) are the aesthetic instead.

---

## Dependencies

- **E01** — layout, types (`SubmitAnswerResponse`, `ICard`), dark mode
- **E02** — `ReEngagementCard` component, `userId` from localStorage
- **E03** — `ICard` shape (fact, question, options, explanation fields)
- **E05** — `submitAnswer` Server Action (stub during UI dev)
- **E07** — `getNextCard` Server Action (stub during UI dev)

---

## References

- [implementation-overview.md](../implementation-overview.md) — `SubmitAnswerResponse` type
- [product-design.md §15](../product-design.md) — Card Lifecycle (4 states)
- [product-design.md §12](../product-design.md) — Scoring Rules (for STATE 3 display values)
- [product-design.md §5](../product-design.md) — UI copy ("Benerr!", "Yahhh salah!", "Waktunya habis!")
- [product-design.md §13](../product-design.md) — Achievement toast trigger
- [design-system.md §7](../design-system.md) — Feed desktop layout
- [design-system.md §8](../design-system.md) — Card component visual spec (shadows, border, colors)
- [design-system.md §11](../design-system.md) — Animation guidelines
