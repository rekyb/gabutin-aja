# E05 — Scoring Engine

**Status:** [ ] Not started 
**Wave:** 2 (start after E01, parallel with E02/E03)

---

## Goal

Implement the server-side scoring system as pure, unit-testable functions plus a `submitAnswer` Server Action that atomically updates theme points, XP, streak, and level in MongoDB and returns the full scoring delta.

## Why

Scoring is the reward loop that drives retention — every correct answer must feel immediately satisfying. The formulas must be exact (E06 and E07 both depend on the output), and the DB writes must be atomic (no partial updates that leave points but not XP updated). This epic defines the canonical `submitAnswer` Server Action that E04 calls.

---

## Functional Requirements

1. **Pure formula functions** in `src/lib/scoring/formulas.ts` — no DB access, fully unit-testable:
  - `calculateXP(result, streak)`: returns 0 for wrong/skip; `BASE_XP + getStreakBonus(streak)` for correct
  - `getStreakBonus(streak)`: 0 for streak < 3, 1 for 3–4, 3 for 5–9, 5 for 10+
  - `calculatePointsDelta(result)`: +2 for correct, -2 for wrong, -1 for skip
  - `xpRequiredForLevel(level)`: `Math.floor(10 * Math.pow(level, 1.5))`
  - `computeLevel(totalXp)`: iterate levels until cumulative threshold exceeds `totalXp`
  - `getLevelTitle(level)`: returns level title string (see table below)
2. **`submitAnswer` Server Action:**
  - Fetch `User` and relevant `ThemeScore` from DB
  - Determine `result`: if `selectedIndex === card.correctIndex` → `'correct'`; if `selectedIndex === null` → `'skip'`; else `'wrong'`
  - **First-attempt XP guard:** check if an `Answer` doc already exists for `(userId, cardId)`. If one exists, set `xpDelta = 0`. `pointsDelta`, streak, and `totalAnswers` still update normally — only XP is suppressed on repeats.
  - Compute `pointsDelta` and `xpDelta` using formula functions
  - Update `ThemeScore.points` (floor at 0)
  - Update `User.xp`, `User.level`, `User.currentStreak`, `User.totalAnswers`, `User.totalSkips`
  - Write `Answer` record to DB
  - Return `SubmitAnswerResponse` (achievement checking returns empty array — E06 wires in later)
3. **Streak rules:** correct → streak + 1; wrong or skip → streak = 0
4. **Theme points floor:** `Math.max(0, currentPoints + pointsDelta)` — never negative
5. **Client-side option shuffle:** In `CardQuestion`, shuffle the options array on each mount using Fisher-Yates (seeded by `card._id` so the order is stable within a single card view but differs across visits). Remap `correctIndex` to match the shuffled order before passing `selectedIndex` to `submitAnswer`.

---

## Level Titles

```ts
export function getLevelTitle(level: number): string {
 if (level <= 5) return 'Newbie Gabut'
 if (level <= 15) return 'Penasaran'
 if (level <= 30) return 'Anak Pintar'
 if (level <= 50) return 'Sultan Ilmu'
 return 'Dewa Gabut'
}
```

---

## XP Formula Reference

| Streak | XP |
|--------|----|
| 1–2  | 2 |
| 3–4  | 3 |
| 5–9  | 5 |
| 10+  | 7 |
| wrong/skip | 0 |

---

## API Contracts

```ts
// src/lib/scoring/formulas.ts
export const BASE_XP = 2

export function getStreakBonus(streak: number): number
export function calculateXP(result: AnswerResult, streak: number): number
export function calculatePointsDelta(result: AnswerResult): number  // +2 | -2 | -1
export function xpRequiredForLevel(level: number): number
export function computeLevel(totalXp: number): number
export function getLevelTitle(level: number): string

// app/actions/answer.ts
'use server'
export async function submitAnswer(
 userId: string,
 cardId: string,
 selectedIndex: number | null
): Promise<SubmitAnswerResponse>
```

`SubmitAnswerResponse.newAchievements` returns `[]` until E06 integrates. E06 will import this action and wrap it — do not leave a TODO, return an empty array literal.

---

## DB Write Strategy

Use separate `updateOne` calls in sequence (not a transaction — MongoDB Atlas free tier does not require multi-document transactions here since each update is independent):

```ts
// 1. Update ThemeScore
await ThemeScore.updateOne(
 { userId, theme: card.theme },
 { $inc: { points: pointsDeltaWithFloor } } // pre-floor the delta before passing
)

// 2. Update User atomically
await User.updateOne(
 { _id: userId },
 {
  $inc: { xp: xpDelta, totalAnswers: 1 }, // totalSkips only if skip
  $set: { currentStreak: newStreak, level: newLevel },
 }
)

// 3. Create Answer record
await Answer.create({ userId, cardId, theme, result, pointsDelta, xpDelta })
```

`totalSkips` increments only when `result === 'skip'`. Compute `newStreak` before the DB write.

---

## Acceptance Criteria

- [ ] `calculateXP('correct', 0)` → `2`
- [ ] `calculateXP('correct', 3)` → `3`
- [ ] `calculateXP('correct', 5)` → `5`
- [ ] `calculateXP('correct', 10)` → `7`
- [ ] `calculateXP('wrong', 5)` → `0`
- [ ] `calculateXP('skip', 10)` → `0`
- [ ] `calculatePointsDelta('correct')` → `2`
- [ ] `calculatePointsDelta('wrong')` → `-2`
- [ ] `calculatePointsDelta('skip')` → `-1`
- [ ] Theme points floor at 0: user with 1 point getting a wrong answer ends at 0, not -1
- [ ] `computeLevel(0)` → `1`
- [ ] `computeLevel(10)` → `2`
- [ ] `computeLevel(38)` → `3` (or the correct level from the cumulative table)
- [ ] `submitAnswer` returns `SubmitAnswerResponse` with correct `result`, `pointsDelta`, `xpDelta`, `newStreak`, `newLevel`, `leveledUp`
- [ ] `Answer` document exists in DB after call
- [ ] `User.xp` and `User.level` updated in DB after call
- [ ] `ThemeScore.points` updated (and floored at 0) in DB after call
- [ ] `leveledUp: true` when XP crosses a level threshold
- [ ] Answering the same card a second time awards `xpDelta = 0`; `Answer` record is still written
- [ ] `pointsDelta` and streak still update normally on repeat answers
- [ ] MCQ options in `CardQuestion` are displayed in a shuffled order on each mount
- [ ] The shuffled `selectedIndex` maps correctly back to the original `correctIndex` — scoring is unaffected

---

## In Scope

- `src/lib/scoring/formulas.ts` — pure formula functions
- `app/actions/answer.ts` — `submitAnswer` Server Action
- DB writes: `Answer.create`, `User.updateOne`, `ThemeScore.updateOne`
- Level title lookup
- `leveledUp` flag computation
- First-attempt XP guard: `Answer.exists({ userId, cardId })` check before awarding XP
- Client-side option shuffle in `src/components/Card/CardQuestion.tsx` (Fisher-Yates, stable within session)

---

## Tests

Pure functions in `src/lib/scoring/formulas.ts` are the highest-value tests in the project — no mocks, deterministic, fast. Target 100% coverage on formulas, ≥80% on the Server Action.

### `src/lib/scoring/formulas.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import {
 calculateXP,
 calculatePointsDelta,
 getStreakBonus,
 xpRequiredForLevel,
 computeLevel,
 getLevelTitle,
} from '@/lib/scoring/formulas'

describe('getStreakBonus', () => {
 it('returns 0 for streak < 3', () => { expect(getStreakBonus(2)).toBe(0) })
 it('returns 1 for streak 3–4',  () => { expect(getStreakBonus(3)).toBe(1); expect(getStreakBonus(4)).toBe(1) })
 it('returns 3 for streak 5–9',  () => { expect(getStreakBonus(5)).toBe(3); expect(getStreakBonus(9)).toBe(3) })
 it('returns 5 for streak 10+',  () => { expect(getStreakBonus(10)).toBe(5); expect(getStreakBonus(99)).toBe(5) })
})

describe('calculateXP', () => {
 it('returns 2 for correct streak 1', () => { expect(calculateXP('correct', 1)).toBe(2) })
 it('returns 3 for correct streak 3', () => { expect(calculateXP('correct', 3)).toBe(3) })
 it('returns 5 for correct streak 5', () => { expect(calculateXP('correct', 5)).toBe(5) })
 it('returns 7 for correct streak 10', () => { expect(calculateXP('correct', 10)).toBe(7) })
 it('returns 0 for wrong',       () => { expect(calculateXP('wrong', 10)).toBe(0) })
 it('returns 0 for skip',       () => { expect(calculateXP('skip', 10)).toBe(0) })
})

describe('calculatePointsDelta', () => {
 it('returns +2 for correct', () => { expect(calculatePointsDelta('correct')).toBe(2) })
 it('returns -2 for wrong',  () => { expect(calculatePointsDelta('wrong')).toBe(-2) })
 it('returns -1 for skip',  () => { expect(calculatePointsDelta('skip')).toBe(-1) })
})

describe('xpRequiredForLevel', () => {
 it('returns 10 for level 1', () => { expect(xpRequiredForLevel(1)).toBe(10) })
 it('returns 28 for level 2', () => { expect(xpRequiredForLevel(2)).toBe(28) })
 it('returns 316 for level 10',() => { expect(xpRequiredForLevel(10)).toBe(316) })
})

describe('computeLevel', () => {
 it('returns 1 for 0 XP', () => { expect(computeLevel(0)).toBe(1) })
 it('returns 2 for 10 XP', () => { expect(computeLevel(10)).toBe(2) })
 it('returns 3 for 38 XP', () => { expect(computeLevel(38)).toBe(3) })
})

describe('getLevelTitle', () => {
 it('returns Newbie Gabut for level 1', () => { expect(getLevelTitle(1)).toBe('Newbie Gabut') })
 it('returns Penasaran for level 6',   () => { expect(getLevelTitle(6)).toBe('Penasaran') })
 it('returns Dewa Gabut for level 51',  () => { expect(getLevelTitle(51)).toBe('Dewa Gabut') })
})
```

Run: `rtk vitest run src/lib/scoring/formulas.test.ts` 
Expected: all 20+ assertions passing.

---

## Out of Scope / Guardrails

- Achievement checking — E06 wires into this action later; return `[]` for now
- Feed algorithm — E07 owns card selection
- `seenCardIds` update — E07 owns that (on `getNextCard`, not on `submitAnswer`)
- Preventing the *same card from appearing* in the feed — E07 owns dedup at the feed level; E05 only suppresses XP on repeat answers
- No bonus XP beyond the streak tiers defined above
- Do not add per-theme XP — only `user.xp` is global
- Do not implement transactions (free tier Atlas, overkill for hackathon)

---

## Dependencies

- **E01** — `User`, `ThemeScore`, `Answer` Mongoose models; `src/types/index.ts` (`SubmitAnswerResponse`, `AnswerResult`)

---

## References

- [implementation-overview.md](../implementation-overview.md) — `SubmitAnswerResponse` type (canonical)
- [product-design.md §9](../product-design.md) — XP & Leveling System
- [product-design.md §12](../product-design.md) — Scoring Rules table
