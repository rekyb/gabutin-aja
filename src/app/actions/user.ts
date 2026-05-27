'use server'

import { connectDB } from '@/db/connect'
import { User, type IUser } from '@/db/models/User'
import { ThemeScore } from '@/db/models/ThemeScore'
import type { ThemeName } from '@/types'
import { validateDisplayName } from '@/utils/validators'

export async function createUser(
  displayName: string,
  themes: ThemeName[],
  uniqueUserId: string,
  initialXp = 0,
  initialStreak = 0,
): Promise<{ userId: string }> {
  const validation = validateDisplayName(displayName)
  if (!validation.isValid) throw new Error(validation.error || 'Invalid display name')
  if (themes.length !== 3) throw new Error('Exactly 3 themes required')

  await connectDB()

  const user = await User.create({
    uniqueUserId,
    displayName,
    themes,
    xp: initialXp,
    level: 1,
    currentStreak: initialStreak,
    consecutiveWrongs: 0,
    totalAnswers: 0,
    totalSkips: 0,
  })

  await ThemeScore.insertMany(
    themes.map((theme) => ({ userId: user._id, theme, points: 0, seenCardIds: [] })),
  )

  return { userId: user._id.toString() }
}

export async function getUserByUniqueId(
  uniqueUserId: string,
): Promise<{ _id: string; displayName: string; themes: string[]; xp: number; level: number } | null> {
  await connectDB()

  const user = await User.findOne({ uniqueUserId }).lean<IUser>()
  if (!user) return null

  return {
    _id: user._id.toString(),
    displayName: user.displayName,
    themes: user.themes,
    xp: user.xp,
    level: user.level,
  }
}
