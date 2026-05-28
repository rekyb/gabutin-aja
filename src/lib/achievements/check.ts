import { connectDB } from '@/db/connect'
import { UserAchievement } from '@/db/models/UserAchievement'
import type { AnswerResult, AchievementDef } from '@/types'
import { ACHIEVEMENTS } from './definitions'

export interface AchievementContext {
  userId: string          // Mongo ObjectId as string
  totalAnswers: number
  currentStreak: number   // after this answer
  level: number           // after this answer
  themeScores: Record<string, number> // theme → points, after this answer
  totalSkips: number
  consecutiveWrongs: number // before this answer (pre-update)
  result: AnswerResult
}

/**
 * Evaluates all 17 achievement conditions against the given context.
 * Fetches already-earned keys from the DB, filters them out,
 * persists newly earned ones, and returns the newly earned AchievementDef[].
 */
export async function checkAchievements(ctx: AchievementContext): Promise<AchievementDef[]> {
  await connectDB()

  // Fetch already-earned achievement keys for this user
  const earned = await UserAchievement.find(
    { userId: ctx.userId },
    { achievementKey: 1, _id: 0 },
  ).lean<{ achievementKey: string }[]>()

  const earnedKeys = new Set(earned.map((e) => e.achievementKey))

  // Evaluate conditions for each achievement
  const newlyEarned = ACHIEVEMENTS.filter((def) => {
    if (earnedKeys.has(def.key)) return false
    return evaluateCondition(def.key, ctx)
  })

  if (newlyEarned.length === 0) return []

  // Persist newly earned achievements (ordered:false for idempotency safety)
  const docs = newlyEarned.map((def) => ({
    userId: ctx.userId,
    achievementKey: def.key,
    earnedAt: new Date(),
    isShowcased: false,
    showcasePosition: null,
  }))

  try {
    await UserAchievement.insertMany(docs, { ordered: false })
  } catch {
    // Swallow duplicate key errors — unique index is the real guard
  }

  return newlyEarned
}

function evaluateCondition(key: string, ctx: AchievementContext): boolean {
  switch (key) {
    case 'first_answer':
      return ctx.totalAnswers >= 1
    case 'ten_answers':
      return ctx.totalAnswers >= 10
    case 'century':
      return ctx.totalAnswers >= 100
    case 'hot_streak':
      return ctx.currentStreak >= 3
    case 'on_fire':
      return ctx.currentStreak >= 5
    case 'unstoppable':
      return ctx.currentStreak >= 10
    case 'scholar':
      return ctx.level >= 6
    case 'sage':
      return ctx.level >= 16
    case 'mythic':
      return ctx.level >= 50
    case 'theme_focused':
      return Object.values(ctx.themeScores).some((pts) => pts >= 20)
    case 'theme_master':
      return Object.values(ctx.themeScores).some((pts) => pts >= 50)
    case 'comeback':
      return ctx.consecutiveWrongs >= 3 && ctx.result === 'correct'
    case 'hard_comeback':
      return ctx.consecutiveWrongs >= 5 && ctx.result === 'correct'
    case 'miracle':
      return ctx.consecutiveWrongs >= 10 && ctx.result === 'correct'
    case 'first_skip':
      return ctx.totalSkips >= 1
    case 'five_skips':
      return ctx.totalSkips >= 5
    case 'ten_skips':
      return ctx.totalSkips >= 10
    default:
      return false
  }
}
