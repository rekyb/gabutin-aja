import mongoose from 'mongoose'
import { connectDB } from '@/db/connect'
import { User } from '@/db/models/User'
import { ThemeScore } from '@/db/models/ThemeScore'
import { getSession } from '@/lib/session'
import { getUserAchievements } from '@/app/actions/achievements'
import { AchievementsClient } from './AchievementsClient'
import type { AchievementStats } from './AchievementsClient'

type LeanUser = {
  _id: mongoose.Types.ObjectId
  uniqueUserId: string
  totalAnswers: number
  totalSkips: number
  level: number
  currentStreak: number
}
type LeanThemeScore = { theme: string; points: number }

export default async function AchievementsPage() {
  const session = await getSession()

  if (!session) {
    // Guest: show all locked, no stats
    return (
      <AchievementsClient
        achievements={[]}
        userId=""
        stats={{ totalAnswers: 0, totalSkips: 0, level: 1, currentStreak: 0, themeScores: {} }}
      />
    )
  }

  await connectDB()

  const dbUser = await User.findById(session.userId, {
    uniqueUserId: 1, totalAnswers: 1, totalSkips: 1, level: 1, currentStreak: 1,
  }).lean<LeanUser>()

  if (!dbUser) {
    return (
      <AchievementsClient
        achievements={[]}
        userId=""
        stats={{ totalAnswers: 0, totalSkips: 0, level: 1, currentStreak: 0, themeScores: {} }}
      />
    )
  }

  const [achievements, themeScoreDocs] = await Promise.all([
    getUserAchievements(dbUser.uniqueUserId),
    ThemeScore.find(
      { userId: dbUser._id },
      { theme: 1, points: 1, _id: 0 },
    ).lean<LeanThemeScore[]>(),
  ])

  const themeScores: Record<string, number> = {}
  for (const ts of themeScoreDocs) {
    themeScores[ts.theme] = ts.points
  }

  const stats: AchievementStats = {
    totalAnswers: dbUser.totalAnswers,
    totalSkips: dbUser.totalSkips,
    level: dbUser.level,
    currentStreak: dbUser.currentStreak,
    themeScores,
  }

  return (
    <AchievementsClient
      achievements={achievements}
      userId={dbUser.uniqueUserId}
      stats={stats}
    />
  )
}
