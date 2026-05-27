# E06 — Achievement System

**Status:** [ ] Not started 
**Wave:** 3 (start after E01, E02, E05)

---

## Goal

Implement the 17-achievement system: condition evaluation after every answer, idempotent badge persistence, achievement toast trigger in the feed, the `/achievements` badge grid with locked silhouettes, and the 3-slot badge showcase mechanic.

## Why

Achievements are the primary progression signal in v1.0 — they replace leaderboards as social identity. The badge showcase gives users something to personalize and "own." The system must be reliable (never re-trigger earned badges), fast (evaluated server-side as part of `submitAnswer`), and satisfy the comeback mechanic which requires tracking consecutive wrong answers (not stored in the current `User` schema).

---

## Functional Requirements

1. **Achievement definitions:** All 17 achievements defined as a static array in `src/lib/achievements/definitions.ts`. Each has `key`, `title`, `icon`, `rarity`, `description`.
2. **`checkAchievements` function:** Given a context snapshot, return the list of achievements the user just earned (not already in `user_achievements`). Run after every `submitAnswer`.
3. **Idempotency:** Query `user_achievements` for already-earned keys before writing. Never insert duplicates (enforced by the unique index on `userId + achievementKey` from E01).
4. **Comeback tracking:** The `User` model does not store consecutive wrong counts. Add a field `consecutiveWrongs: number` to `User` (default: 0). Reset to 0 on correct or skip; increment on wrong.
  - **Schema addition to E01's User model** — this epic must add the field via `src/db/models/User.ts`. Coordinate with E01 agent.
5. **Integration with `submitAnswer`:** After E05's `submitAnswer` writes score updates, call `checkAchievements` and append results to `SubmitAnswerResponse.newAchievements`. This is done by wrapping or modifying `app/actions/answer.ts`.
6. **`/achievements` page:** Grid of all 17 achievement slots. Earned = full color badge. Locked = silhouette with rarity color border dimmed + progress hint text.
7. **Progress hints for locked achievements:**
  - Count-based (answers, skips): show `"X/Y soal"` using actual count
  - Level-based: show `"Level X/Y"`
  - Theme score-based: show `"X/Y poin"`
  - Streak-based: show `"Streak tertinggi: X"`
8. **Pin mechanic:** On `/achievements`, each earned badge has a "Pin ke Profil" button. Pinning calls `pinBadge`. Max 3 slots. Pinning a 4th replaces the badge at `showcasePosition: 1` (oldest, using `earnedAt`).
9. **Unpin mechanic:** Each pinned badge on `/achievements` shows an "Unpin" button.

---

## Achievement Definitions

```ts
// src/lib/achievements/definitions.ts
export const ACHIEVEMENTS: AchievementDef[] = [
 { key: 'first_answer',  icon: '', title: 'Menyala Abangku!',     rarity: 'Common', description: 'Jawab soal pertama lo' },
 { key: 'ten_answers',  icon: '', title: 'Ilmu Padi',         rarity: 'Common', description: 'Jawab 10 soal' },
 { key: 'century',    icon: '', title: 'Pinjam Dulu Seratus!',    rarity: 'Rare',  description: 'Jawab 100 soal' },
 { key: 'hot_streak',   icon: '', title: 'Ampun Bang Jago!',      rarity: 'Common', description: '3 jawaban bener berturut-turut' },
 { key: 'on_fire',    icon: '', title: 'Gak Ada Obat!',       rarity: 'Rare',  description: '5 jawaban bener berturut-turut' },
 { key: 'unstoppable',  icon: '', title: 'Puh, Ajarin Dong Puh',    rarity: 'Epic',  description: '10 jawaban bener berturut-turut' },
 { key: 'scholar',    icon: '', title: 'Si Paling Ambis',      rarity: 'Common', description: 'Capai Level 6' },
 { key: 'sage',      icon: '', title: 'Sepuh Turun Gunung',     rarity: 'Rare',  description: 'Capai Level 16' },
 { key: 'mythic',     icon: '', title: 'Admin Bumi',         rarity: 'Mythic', description: 'Capai Level 50' },
 { key: 'theme_focused', icon: '', title: 'Fokus Jalur VIP',      rarity: 'Common', description: 'Capai 20 poin di satu tema' },
 { key: 'theme_master',  icon: '', title: 'Raja Terakhir',        rarity: 'Epic',  description: 'Capai 50 poin di satu tema' },
 { key: 'comeback',    icon: '', title: 'Gak Jadi Turu!',       rarity: 'Rare',  description: 'Jawab bener setelah 3 jawaban salah' },
 { key: 'hard_comeback', icon: '🫡', title: 'Nyaris Kena Mental',     rarity: 'Epic',  description: 'Jawab bener setelah 5 jawaban salah' },
 { key: 'miracle',    icon: '', title: 'Bantuan Jalur Langit',    rarity: 'Mythic', description: 'Jawab bener setelah 10 jawaban salah' },
 { key: 'first_skip',   icon: '', title: 'Maaf, Skip Dulu!',      rarity: 'Common', description: 'Skip soal pertama kali' },
 { key: 'five_skips',   icon: '', title: 'Menolak Pusing',       rarity: 'Common', description: 'Udah skip 5 soal' },
 { key: 'ten_skips',   icon: '', title: 'Ini Jalan Ninja Ku',     rarity: 'Rare',  description: 'Udah skip 10 soal' },
]
```

---

## API Contracts

```ts
// src/lib/achievements/check.ts
export interface AchievementContext {
 userId: string
 totalAnswers: number
 currentStreak: number     // after this answer
 level: number         // after this answer
 themeScores: Record<string, number> // after this answer
 totalSkips: number
 consecutiveWrongs: number   // before this answer (pre-update)
 result: AnswerResult
}

export async function checkAchievements(ctx: AchievementContext): Promise<AchievementDef[]>
// Returns only newly earned achievements (not previously earned)

// app/actions/achievements.ts
'use server'
export async function pinBadge(userId: string, achievementKey: string): Promise<void>
export async function unpinBadge(userId: string, achievementKey: string): Promise<void>
export async function getUserAchievements(userId: string): Promise<IUserAchievement[]>
```

---

## Rarity Color Tokens

| Rarity | Tailwind class |
|--------|---------------|
| Common | `text-gray-400 border-gray-400` |
| Rare  | `text-blue-400 border-blue-400` |
| Epic  | `text-purple-400 border-purple-400` |
| Mythic | `text-yellow-400 border-yellow-400` |

---

## Integration Point with E05

After E05 ships `app/actions/answer.ts`, this epic modifies it:

```ts
// In submitAnswer, after User/ThemeScore writes:
const earnedAchievements = await checkAchievements({
 userId,
 totalAnswers: updatedUser.totalAnswers,
 currentStreak: newStreak,
 level: newLevel,
 themeScores: { [card.theme]: updatedThemeScore.points },
 totalSkips: updatedUser.totalSkips,
 consecutiveWrongs: previousConsecutiveWrongs,
 result,
})
return { ...scoringResult, newAchievements: earnedAchievements }
```

Coordinate with E05 agent: do not modify `answer.ts` simultaneously.

---

## Schema Addition (coordinate with E01)

Add `consecutiveWrongs` to `User` schema:

```ts
consecutiveWrongs: { type: Number, default: 0 }
```

This field is updated in `submitAnswer`: increment on wrong, reset to 0 on correct or skip.

---

## Acceptance Criteria

- [ ] `first_answer` earned after first `submitAnswer` with `result: 'correct'`
- [ ] `on_fire` earned exactly once when streak reaches 5 (not re-earned if streak resets and reaches 5 again)
- [ ] `comeback` earned after 3 consecutive wrongs followed by a correct
- [ ] `miracle` earned after 10 consecutive wrongs followed by a correct
- [ ] `theme_focused` earned when any `ThemeScore.points >= 20`
- [ ] `pinBadge` sets `isShowcased: true`, `showcasePosition: 1|2|3` for the badge
- [ ] Pinning a 4th badge replaces the one with the oldest `earnedAt`
- [ ] `/achievements` renders all 17 slots (earned: full color, locked: grey silhouette)
- [ ] Locked badge shows a progress hint (e.g., `"47/100 soal"`)
- [ ] No duplicate `UserAchievement` documents (unique index enforces this)
- [ ] `getUserAchievements` returns all earned achievements for a user

---

## Tests

Target: 100% branch coverage on `checkAchievements` — every achievement condition must have a test.

### `src/lib/achievements/check.test.ts`
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock DB call so checkAchievements can run without MongoDB
vi.mock('@/db/models/UserAchievement', () => ({
 UserAchievement: {
  find: vi.fn().mockResolvedValue([]), // no previously earned achievements
  insertMany: vi.fn().mockResolvedValue([]),
 },
}))

const baseCtx = {
 userId: 'user1',
 totalAnswers: 0,
 currentStreak: 0,
 level: 1,
 themeScores: { sains: 0 },
 totalSkips: 0,
 consecutiveWrongs: 0,
 result: 'correct' as const,
}

describe('checkAchievements', () => {
 beforeEach(() => { vi.clearAllMocks() })

 it('awards first_answer on first correct answer', async () => {
  const { checkAchievements } = await import('@/lib/achievements/check')
  const earned = await checkAchievements({ ...baseCtx, totalAnswers: 1 })
  expect(earned.some(a => a.key === 'first_answer')).toBe(true)
 })

 it('awards hot_streak when streak reaches 3', async () => {
  const { checkAchievements } = await import('@/lib/achievements/check')
  const earned = await checkAchievements({ ...baseCtx, currentStreak: 3 })
  expect(earned.some(a => a.key === 'hot_streak')).toBe(true)
 })

 it('awards comeback after 3 consecutive wrongs then correct', async () => {
  const { checkAchievements } = await import('@/lib/achievements/check')
  const earned = await checkAchievements({ ...baseCtx, consecutiveWrongs: 3, result: 'correct' })
  expect(earned.some(a => a.key === 'comeback')).toBe(true)
 })

 it('awards theme_focused when any theme score reaches 20', async () => {
  const { checkAchievements } = await import('@/lib/achievements/check')
  const earned = await checkAchievements({ ...baseCtx, themeScores: { sains: 20 } })
  expect(earned.some(a => a.key === 'theme_focused')).toBe(true)
 })

 it('does not re-award already earned achievements', async () => {
  const { UserAchievement } = await import('@/db/models/UserAchievement')
  vi.mocked(UserAchievement.find).mockResolvedValue([{ achievementKey: 'first_answer' }] as any)
  const { checkAchievements } = await import('@/lib/achievements/check')
  const earned = await checkAchievements({ ...baseCtx, totalAnswers: 1 })
  expect(earned.some(a => a.key === 'first_answer')).toBe(false)
 })

 it('awards miracle after 10 consecutive wrongs then correct', async () => {
  const { checkAchievements } = await import('@/lib/achievements/check')
  const earned = await checkAchievements({ ...baseCtx, consecutiveWrongs: 10, result: 'correct' })
  expect(earned.some(a => a.key === 'miracle')).toBe(true)
 })
})
```

Run: `rtk vitest run src/lib/achievements/check.test.ts`

---

## In Scope

- `src/lib/achievements/definitions.ts` — 17 achievement configs
- `src/lib/achievements/check.ts` — condition evaluator
- `app/actions/achievements.ts` — `pinBadge`, `unpinBadge`, `getUserAchievements`
- Integration into `app/actions/answer.ts` (wrap E05's action)
- `/achievements` page — badge grid + lock silhouettes + pin buttons
- `consecutiveWrongs` field addition to `User` model
- Rarity color tokens applied to badge components

---

## Out of Scope / Guardrails

- Achievement animations beyond the toast (no confetti library)
- Badge showcase display on `/profile` — E08 owns that read
- Achievement editing or admin panel (v1.x)
- `showcasePosition` is managed by pin order — do not allow manual position selection
- Do not add new achievements beyond the 17 defined above

---

## Dependencies

- **E01** — `UserAchievement` Mongoose model (unique index on `userId + achievementKey`)
- **E02** — `User._id` available (user must exist to earn achievements)
- **E05** — `submitAnswer` must exist to integrate; `consecutiveWrongs` added to `User` model

---

## References

- [implementation-overview.md](../implementation-overview.md) — `AchievementDef` type
- [product-design.md §13](../product-design.md) — Achievement System (full 17 definitions)
- [product-design.md §13](../product-design.md) — Badge Showcase Mechanic
- [E05 — Scoring Engine](./e05-scoring-engine.md) — `submitAnswer` integration point
