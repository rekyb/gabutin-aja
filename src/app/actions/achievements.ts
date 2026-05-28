'use server'
import mongoose from 'mongoose'
import { connectDB } from '@/db/connect'
import { User } from '@/db/models/User'
import { UserAchievement } from '@/db/models/UserAchievement'
import { ThemeScore } from '@/db/models/ThemeScore'
import type { UserAchievementDoc } from '@/types'
import { checkAchievements } from '@/lib/achievements/check'

type LeanUserAchievement = {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  achievementKey: string
  earnedAt: Date
  isShowcased: boolean
  showcasePosition: 1 | 2 | 3 | null
}

/**
 * Returns all earned achievements for a user, sorted newest first.
 */
export async function getUserAchievements(userId: string): Promise<UserAchievementDoc[]> {
  await connectDB()

  const dbUser = await User.findOne(
    { uniqueUserId: userId },
    { _id: 1, totalAnswers: 1, totalSkips: 1, level: 1, currentStreak: 1, consecutiveWrongs: 1 }
  ).lean<any>()
  if (!dbUser) return []

  const themeScoreDocs = await ThemeScore.find(
    { userId: dbUser._id },
    { theme: 1, points: 1, _id: 0 },
  ).lean<any[]>()

  const themeScores: Record<string, number> = {}
  for (const ts of themeScoreDocs) {
    themeScores[ts.theme] = ts.points
  }

  // Automatically check and persist achievements they qualify for
  await checkAchievements({
    userId: dbUser._id.toString(),
    totalAnswers: dbUser.totalAnswers ?? 0,
    currentStreak: dbUser.currentStreak ?? 0,
    level: dbUser.level ?? 1,
    themeScores,
    totalSkips: dbUser.totalSkips ?? 0,
    consecutiveWrongs: dbUser.consecutiveWrongs ?? 0,
    result: 'skip', // Dummy fallback for on-demand checks
  })

  const docs = await UserAchievement.find(
    { userId: dbUser._id },
  ).sort({ earnedAt: -1 }).lean<LeanUserAchievement[]>()

  return docs.map((d) => ({
    _id: d._id.toString(),
    userId: d.userId.toString(),
    achievementKey: d.achievementKey,
    earnedAt: d.earnedAt,
    isShowcased: d.isShowcased,
    showcasePosition: d.showcasePosition,
  }))
}

/**
 * Pins an achievement badge to the user's showcase (max 3 slots).
 * If 3 badges are already pinned, replaces the one with the oldest earnedAt.
 */
export async function pinBadge(userId: string, achievementKey: string): Promise<void> {
  await connectDB()

  const dbUser = await User.findOne({ uniqueUserId: userId }, { _id: 1 }).lean<{ _id: mongoose.Types.ObjectId }>()
  if (!dbUser) return

  const userObjId = dbUser._id

  // Get all currently showcased badges sorted by earnedAt ASC (oldest first)
  const showcased = await UserAchievement.find(
    { userId: userObjId, isShowcased: true },
  ).sort({ earnedAt: 1 }).lean<LeanUserAchievement[]>()

  let showcasePosition: 1 | 2 | 3

  if (showcased.length < 3) {
    // Find the next available position (1, 2, or 3)
    const usedPositions = new Set(showcased.map((b) => b.showcasePosition))
    const available = ([1, 2, 3] as const).find((p) => !usedPositions.has(p))
    showcasePosition = available ?? 1
  } else {
    // Replace the oldest-earned showcased badge
    const oldest = showcased[0]
    await UserAchievement.updateOne(
      { _id: oldest._id },
      { $set: { isShowcased: false, showcasePosition: null } },
    )
    showcasePosition = oldest.showcasePosition ?? 1
  }

  await UserAchievement.updateOne(
    { userId: userObjId, achievementKey },
    { $set: { isShowcased: true, showcasePosition } },
  )
}

/**
 * Unpins a previously pinned achievement badge.
 */
export async function unpinBadge(userId: string, achievementKey: string): Promise<void> {
  await connectDB()

  const dbUser = await User.findOne({ uniqueUserId: userId }, { _id: 1 }).lean<{ _id: mongoose.Types.ObjectId }>()
  if (!dbUser) return

  await UserAchievement.updateOne(
    { userId: dbUser._id, achievementKey },
    { $set: { isShowcased: false, showcasePosition: null } },
  )
}

/**
 * Fetches all achievements and statistics for a guest user by their uniqueUserId.
 */
export async function getGuestAchievementsData(uniqueUserId: string) {
  await connectDB()
  const dbUser = await User.findOne({ uniqueUserId }, {
    uniqueUserId: 1, totalAnswers: 1, totalSkips: 1, level: 1, currentStreak: 1,
  }).lean<any>()

  if (!dbUser) return null

  const [achievements, themeScoreDocs] = await Promise.all([
    getUserAchievements(uniqueUserId),
    ThemeScore.find(
      { userId: dbUser._id },
      { theme: 1, points: 1, _id: 0 },
    ).lean<any[]>(),
  ])

  const themeScores: Record<string, number> = {}
  for (const ts of themeScoreDocs) {
    themeScores[ts.theme] = ts.points
  }

  return {
    achievements,
    stats: {
      totalAnswers: dbUser.totalAnswers ?? 0,
      totalSkips: dbUser.totalSkips ?? 0,
      level: dbUser.level ?? 1,
      currentStreak: dbUser.currentStreak ?? 0,
      themeScores,
    }
  }
}
