import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock connectDB to be a no-op
vi.mock('@/db/connect', () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}))

// Mock UserAchievement model — all vi.fn() calls here are safe (no external refs)
vi.mock('@/db/models/UserAchievement', () => ({
  UserAchievement: {
    find: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }),
    insertMany: vi.fn().mockResolvedValue([]),
  },
}))

// Import after mocks are established
import { checkAchievements } from '@/lib/achievements/check'
import { UserAchievement } from '@/db/models/UserAchievement'

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

function setNoEarnedAchievements() {
  vi.mocked(UserAchievement.find).mockReturnValue({
    lean: vi.fn().mockResolvedValue([]),
  } as unknown as ReturnType<typeof UserAchievement.find>)
}

describe('checkAchievements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setNoEarnedAchievements()
    vi.mocked(UserAchievement.insertMany).mockResolvedValue([])
  })

  // ─── Answer count achievements ────────────────────────────────────────────

  it('awards first_answer when totalAnswers >= 1', async () => {
    const earned = await checkAchievements({ ...baseCtx, totalAnswers: 1 })
    expect(earned.some((a) => a.key === 'first_answer')).toBe(true)
  })

  it('does NOT award first_answer when totalAnswers === 0', async () => {
    const earned = await checkAchievements({ ...baseCtx, totalAnswers: 0 })
    expect(earned.some((a) => a.key === 'first_answer')).toBe(false)
  })

  it('awards ten_answers when totalAnswers >= 10', async () => {
    const earned = await checkAchievements({ ...baseCtx, totalAnswers: 10 })
    expect(earned.some((a) => a.key === 'ten_answers')).toBe(true)
  })

  it('does NOT award ten_answers when totalAnswers < 10', async () => {
    const earned = await checkAchievements({ ...baseCtx, totalAnswers: 9 })
    expect(earned.some((a) => a.key === 'ten_answers')).toBe(false)
  })

  it('awards century when totalAnswers >= 100', async () => {
    const earned = await checkAchievements({ ...baseCtx, totalAnswers: 100 })
    expect(earned.some((a) => a.key === 'century')).toBe(true)
  })

  it('does NOT award century when totalAnswers < 100', async () => {
    const earned = await checkAchievements({ ...baseCtx, totalAnswers: 99 })
    expect(earned.some((a) => a.key === 'century')).toBe(false)
  })

  // ─── Streak achievements ──────────────────────────────────────────────────

  it('awards hot_streak when currentStreak >= 3', async () => {
    const earned = await checkAchievements({ ...baseCtx, currentStreak: 3 })
    expect(earned.some((a) => a.key === 'hot_streak')).toBe(true)
  })

  it('does NOT award hot_streak when currentStreak < 3', async () => {
    const earned = await checkAchievements({ ...baseCtx, currentStreak: 2 })
    expect(earned.some((a) => a.key === 'hot_streak')).toBe(false)
  })

  it('awards on_fire when currentStreak >= 5', async () => {
    const earned = await checkAchievements({ ...baseCtx, currentStreak: 5 })
    expect(earned.some((a) => a.key === 'on_fire')).toBe(true)
  })

  it('does NOT award on_fire when currentStreak < 5', async () => {
    const earned = await checkAchievements({ ...baseCtx, currentStreak: 4 })
    expect(earned.some((a) => a.key === 'on_fire')).toBe(false)
  })

  it('awards unstoppable when currentStreak >= 10', async () => {
    const earned = await checkAchievements({ ...baseCtx, currentStreak: 10 })
    expect(earned.some((a) => a.key === 'unstoppable')).toBe(true)
  })

  it('does NOT award unstoppable when currentStreak < 10', async () => {
    const earned = await checkAchievements({ ...baseCtx, currentStreak: 9 })
    expect(earned.some((a) => a.key === 'unstoppable')).toBe(false)
  })

  // ─── Level achievements ───────────────────────────────────────────────────

  it('awards scholar when level >= 6', async () => {
    const earned = await checkAchievements({ ...baseCtx, level: 6 })
    expect(earned.some((a) => a.key === 'scholar')).toBe(true)
  })

  it('does NOT award scholar when level < 6', async () => {
    const earned = await checkAchievements({ ...baseCtx, level: 5 })
    expect(earned.some((a) => a.key === 'scholar')).toBe(false)
  })

  it('awards sage when level >= 16', async () => {
    const earned = await checkAchievements({ ...baseCtx, level: 16 })
    expect(earned.some((a) => a.key === 'sage')).toBe(true)
  })

  it('does NOT award sage when level < 16', async () => {
    const earned = await checkAchievements({ ...baseCtx, level: 15 })
    expect(earned.some((a) => a.key === 'sage')).toBe(false)
  })

  it('awards mythic when level >= 50', async () => {
    const earned = await checkAchievements({ ...baseCtx, level: 50 })
    expect(earned.some((a) => a.key === 'mythic')).toBe(true)
  })

  it('does NOT award mythic when level < 50', async () => {
    const earned = await checkAchievements({ ...baseCtx, level: 49 })
    expect(earned.some((a) => a.key === 'mythic')).toBe(false)
  })

  // ─── Theme score achievements ─────────────────────────────────────────────

  it('awards theme_focused when any theme score >= 20', async () => {
    const earned = await checkAchievements({ ...baseCtx, themeScores: { sains: 20 } })
    expect(earned.some((a) => a.key === 'theme_focused')).toBe(true)
  })

  it('does NOT award theme_focused when all theme scores < 20', async () => {
    const earned = await checkAchievements({ ...baseCtx, themeScores: { sains: 19 } })
    expect(earned.some((a) => a.key === 'theme_focused')).toBe(false)
  })

  it('awards theme_master when any theme score >= 50', async () => {
    const earned = await checkAchievements({ ...baseCtx, themeScores: { sains: 50 } })
    expect(earned.some((a) => a.key === 'theme_master')).toBe(true)
  })

  it('does NOT award theme_master when all theme scores < 50', async () => {
    const earned = await checkAchievements({ ...baseCtx, themeScores: { sains: 49 } })
    expect(earned.some((a) => a.key === 'theme_master')).toBe(false)
  })

  // ─── Comeback achievements ────────────────────────────────────────────────

  it('awards comeback after 3 consecutive wrongs then correct', async () => {
    const earned = await checkAchievements({ ...baseCtx, consecutiveWrongs: 3, result: 'correct' })
    expect(earned.some((a) => a.key === 'comeback')).toBe(true)
  })

  it('does NOT award comeback when result is wrong (not correct)', async () => {
    const earned = await checkAchievements({ ...baseCtx, consecutiveWrongs: 3, result: 'wrong' })
    expect(earned.some((a) => a.key === 'comeback')).toBe(false)
  })

  it('does NOT award comeback when consecutiveWrongs < 3', async () => {
    const earned = await checkAchievements({ ...baseCtx, consecutiveWrongs: 2, result: 'correct' })
    expect(earned.some((a) => a.key === 'comeback')).toBe(false)
  })

  it('awards hard_comeback after 5 consecutive wrongs then correct', async () => {
    const earned = await checkAchievements({ ...baseCtx, consecutiveWrongs: 5, result: 'correct' })
    expect(earned.some((a) => a.key === 'hard_comeback')).toBe(true)
  })

  it('does NOT award hard_comeback when consecutiveWrongs < 5', async () => {
    const earned = await checkAchievements({ ...baseCtx, consecutiveWrongs: 4, result: 'correct' })
    expect(earned.some((a) => a.key === 'hard_comeback')).toBe(false)
  })

  it('awards miracle after 10 consecutive wrongs then correct', async () => {
    const earned = await checkAchievements({ ...baseCtx, consecutiveWrongs: 10, result: 'correct' })
    expect(earned.some((a) => a.key === 'miracle')).toBe(true)
  })

  it('does NOT award miracle when consecutiveWrongs < 10', async () => {
    const earned = await checkAchievements({ ...baseCtx, consecutiveWrongs: 9, result: 'correct' })
    expect(earned.some((a) => a.key === 'miracle')).toBe(false)
  })

  it('does NOT award miracle when result is not correct', async () => {
    const earned = await checkAchievements({ ...baseCtx, consecutiveWrongs: 10, result: 'skip' })
    expect(earned.some((a) => a.key === 'miracle')).toBe(false)
  })

  // ─── Skip achievements ────────────────────────────────────────────────────

  it('awards first_skip when totalSkips >= 1', async () => {
    const earned = await checkAchievements({ ...baseCtx, totalSkips: 1 })
    expect(earned.some((a) => a.key === 'first_skip')).toBe(true)
  })

  it('does NOT award first_skip when totalSkips === 0', async () => {
    const earned = await checkAchievements({ ...baseCtx, totalSkips: 0 })
    expect(earned.some((a) => a.key === 'first_skip')).toBe(false)
  })

  it('awards five_skips when totalSkips >= 5', async () => {
    const earned = await checkAchievements({ ...baseCtx, totalSkips: 5 })
    expect(earned.some((a) => a.key === 'five_skips')).toBe(true)
  })

  it('does NOT award five_skips when totalSkips < 5', async () => {
    const earned = await checkAchievements({ ...baseCtx, totalSkips: 4 })
    expect(earned.some((a) => a.key === 'five_skips')).toBe(false)
  })

  it('awards ten_skips when totalSkips >= 10', async () => {
    const earned = await checkAchievements({ ...baseCtx, totalSkips: 10 })
    expect(earned.some((a) => a.key === 'ten_skips')).toBe(true)
  })

  it('does NOT award ten_skips when totalSkips < 10', async () => {
    const earned = await checkAchievements({ ...baseCtx, totalSkips: 9 })
    expect(earned.some((a) => a.key === 'ten_skips')).toBe(false)
  })

  // ─── Idempotency ─────────────────────────────────────────────────────────

  it('does not re-award already earned achievements', async () => {
    vi.mocked(UserAchievement.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([{ achievementKey: 'first_answer' }]),
    } as unknown as ReturnType<typeof UserAchievement.find>)
    const earned = await checkAchievements({ ...baseCtx, totalAnswers: 1 })
    expect(earned.some((a) => a.key === 'first_answer')).toBe(false)
  })

  it('returns empty array when no new achievements are earned', async () => {
    const earned = await checkAchievements({ ...baseCtx })
    expect(earned).toHaveLength(0)
  })

  it('calls insertMany with newly earned docs', async () => {
    await checkAchievements({ ...baseCtx, totalAnswers: 1 })
    expect(UserAchievement.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ achievementKey: 'first_answer' }),
      ]),
      { ordered: false },
    )
  })

  it('swallows insertMany errors (duplicate key safety)', async () => {
    vi.mocked(UserAchievement.insertMany).mockRejectedValueOnce(new Error('E11000 duplicate key'))
    await expect(checkAchievements({ ...baseCtx, totalAnswers: 1 })).resolves.toBeDefined()
  })
})
