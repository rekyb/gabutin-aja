# E07 — Adaptive Feed Algorithm

**Status:** [ ] Not started 
**Wave:** 3 (start after E01, E02, E03, E05)

---

## Goal

Implement the weighted feed algorithm that selects a card from the user's weakest theme, marks it as seen, and silently triggers background card generation when a theme's pool drops below 10.

## Why

Without the algorithm, the feed is random — users get cards from all themes equally, even ones they're already strong at. The inverse-weight formula surfaces weak areas, making the app feel adaptive and creating a reason to keep playing. This epic also ensures the card pool never runs dry by replenishing it lazily in the background.

---

## Functional Requirements

1. **Fetch theme scores:** Load all `ThemeScore` documents for the user's 3 themes.
2. **Inverse-weight calculation:** For each theme, `weight = 1 / (score + 1)`. Normalize to sum = 1.0.
3. **Weighted random selection:** Pick a theme probabilistically based on normalized weights.
4. **Unseen card fetch:** Query `cards` for `{ theme: selectedTheme, status: 'approved', _id: { $nin: seenCardIds } }`. Fetch one, sorted by `createdAt` ascending (oldest first).
5. **seenCardIds update:** After selecting a card, push its `_id` to `ThemeScore.seenCardIds` atomically.
6. **Pool check:** Count unseen cards for the selected theme after the update. If count < 10, trigger background generation.
7. **Background generation:** Call `generateCard(selectedTheme)` as fire-and-forget — `generateCard(selectedTheme).catch(console.error)`. Do not await.
8. **Exhausted pool fallback:** If no unseen cards exist for the selected theme (all cards in `seenCardIds`), reset `seenCardIds` to `[]` for that theme and retry the query once. This allows the user to see cards again after exhausting the pool.
9. **No cards at all fallback:** If the theme has zero cards (brand-new pool), wait for the first generated card (up to 5s). E03's `generateCard` is fast enough for this one-time wait.

---

## Algorithm Implementation

```ts
// src/lib/feed/algorithm.ts

export function selectTheme(themeScores: { theme: string; points: number }[]): string {
 const weights = themeScores.map(ts => ({ theme: ts.theme, w: 1 / (ts.points + 1) }))
 const total = weights.reduce((sum, w) => sum + w.w, 0)
 let rand = Math.random() * total
 for (const { theme, w } of weights) {
  rand -= w
  if (rand <= 0) return theme
 }
 return weights[weights.length - 1].theme // fallback: last theme
}
```

---

## API Contracts

```ts
// src/lib/feed/algorithm.ts
export function selectTheme(
 themeScores: { theme: string; points: number }[]
): string

// app/actions/feed.ts
'use server'
export async function getNextCard(userId: string): Promise<ICard | null>
```

`getNextCard` flow:
1. Load user (get themes list)
2. Load ThemeScores for those themes
3. `selectTheme(themeScores)`
4. Fetch one unseen card (with seenCardIds exclusion)
5. Push cardId to seenCardIds
6. Check pool count → trigger background generation if < 10
7. Return card (or null if truly empty after fallback)

---

## Acceptance Criteria

- [ ] `selectTheme([{theme:'a',points:0},{theme:'b',points:10}])` returns `'a'` more often than `'b'` across 1000 calls (probability ~91% vs ~9%)
- [ ] Same card never returned twice to the same user within a pool cycle
- [ ] After `getNextCard`, the card's `_id` appears in the user's `ThemeScore.seenCardIds`
- [ ] Background `generateCard` called (not awaited) when unseen count < 10
- [ ] Pool reset: when seenCardIds covers all cards in a theme, seenCardIds resets and a card is returned
- [ ] `getNextCard` returns within 200ms when card pool is pre-populated (no generation)
- [ ] First-time user (empty pool) gets a card within 5s (generation wait)

---

## Tests

`selectTheme` is a pure function — test it exhaustively. `getNextCard` requires mocking the DB.

### `src/lib/feed/algorithm.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import { selectTheme } from '@/lib/feed/algorithm'

describe('selectTheme', () => {
 it('always returns one of the provided themes', () => {
  const themes = [
   { theme: 'sains', points: 5 },
   { theme: 'matematika', points: 10 },
   { theme: 'psikologi', points: 1 },
  ]
  for (let i = 0; i < 100; i++) {
   const selected = selectTheme(themes)
   expect(['sains', 'matematika', 'psikologi']).toContain(selected)
  }
 })

 it('selects the 0-point theme more often than the 10-point theme', () => {
  const themes = [{ theme: 'weak', points: 0 }, { theme: 'strong', points: 50 }]
  const counts = { weak: 0, strong: 0 }
  for (let i = 0; i < 1000; i++) {
   counts[selectTheme(themes) as keyof typeof counts]++
  }
  // weak weight = 1/1 = 1.0, strong weight = 1/51 ≈ 0.02 → weak chosen ~98% of the time
  expect(counts.weak).toBeGreaterThan(900)
 })

 it('handles equal-score themes by distributing roughly 50/50', () => {
  const themes = [{ theme: 'a', points: 5 }, { theme: 'b', points: 5 }]
  const counts = { a: 0, b: 0 }
  for (let i = 0; i < 1000; i++) {
   counts[selectTheme(themes) as keyof typeof counts]++
  }
  expect(counts.a).toBeGreaterThan(350)
  expect(counts.b).toBeGreaterThan(350)
 })

 it('works with a single theme', () => {
  expect(selectTheme([{ theme: 'solo', points: 99 }])).toBe('solo')
 })
})
```

Run: `rtk vitest run src/lib/feed/algorithm.test.ts` 
Expected: 4 passing tests, 0 mocks needed.

---

## In Scope

- `src/lib/feed/algorithm.ts` — `selectTheme` pure function
- `app/actions/feed.ts` — `getNextCard` Server Action
- seenCardIds push (atomic `$push` via Mongoose)
- Pool count check + background generation trigger
- Pool reset fallback when all cards seen

---

## Out of Scope / Guardrails

- No cross-theme deduplication (a card can appear in multiple themes — it doesn't in v1.0, but the algorithm doesn't enforce it)
- No personalization beyond the weight formula (no ML, no item response theory)
- `seenCardIds` is per `ThemeScore` document — do not store globally on `User`
- Do not block the response on card generation — fire-and-forget only
- Do not implement the `/feed/[cardId]` deep-link route here

---

## Dependencies

- **E01** — `ThemeScore`, `Card`, `User` Mongoose models
- **E02** — User + ThemeScore documents exist; `user.themes` populated
- **E03** — `generateCard` function exists at `@/lib/pipeline/generate-card`
- **E05** — `ThemeScore.points` values are the input to the weight formula (must be updated by scoring before being read here)

---

## References

- [implementation-overview.md](../implementation-overview.md) — `getNextCard` contract
- [product-design.md §11](../product-design.md) — Feed Algorithm
- [product-design.md §6](../product-design.md) — Card Generation Pipeline (background trigger)
- [E03 — Card Generation Pipeline](./e03-card-generation-pipeline.md) — `generateCard` signature
- [E05 — Scoring Engine](./e05-scoring-engine.md) — `ThemeScore.points` source of truth
