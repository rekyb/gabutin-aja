'use server'
import mongoose from 'mongoose'
import { connectDB } from '@/db/connect'
import { User } from '@/db/models/User'
import { Card } from '@/db/models/Card'
import { Answer } from '@/db/models/Answer'
import { ThemeScore } from '@/db/models/ThemeScore'
import type { AnswerResult, SubmitAnswerResponse } from '@/types'
import { calculateXP, calculatePointsDelta, computeLevel } from '@/lib/scoring/formulas'

type LeanUser = { _id: mongoose.Types.ObjectId; xp: number; level: number; currentStreak: number }
type LeanCard = { _id: mongoose.Types.ObjectId; theme: string; correctIndex: number }
type LeanThemeScore = { points: number }

export async function submitAnswer(
  userId: string,
  cardId: string,
  selectedIndex: number | null,
): Promise<SubmitAnswerResponse> {
  await connectDB()

  const [user, card] = await Promise.all([
    User.findOne({ uniqueUserId: userId }).lean<LeanUser>(),
    Card.findById(cardId).lean<LeanCard>(),
  ])

  if (!card) throw new Error(`Card not found: ${cardId}`)

  const result: AnswerResult =
    selectedIndex === null
      ? 'skip'
      : selectedIndex === card.correctIndex
        ? 'correct'
        : 'wrong'

  const pointsDelta = calculatePointsDelta(result)

  // Guest (no DB user record) — return computed result without DB writes
  if (!user) {
    return { result, pointsDelta, xpDelta: 0, newStreak: 0, newLevel: 1, leveledUp: false, newAchievements: [] }
  }

  // First-attempt XP guard: only award XP on the first answer per card
  const alreadyAnswered = await Answer.exists({ userId: user._id, cardId: card._id })
  const xpDelta = alreadyAnswered ? 0 : calculateXP(result, user.currentStreak)

  const newStreak = result === 'correct' ? user.currentStreak + 1 : 0
  const newXp = user.xp + xpDelta
  const newLevel = computeLevel(newXp)
  const leveledUp = newLevel > user.level

  // Floor theme points at 0
  const themeScore = await ThemeScore.findOne({ userId: user._id, theme: card.theme }).lean<LeanThemeScore>()
  const currentPoints = themeScore?.points ?? 0
  const flooredDelta = Math.max(0, currentPoints + pointsDelta) - currentPoints

  const incFields: Record<string, number> = { xp: xpDelta, totalAnswers: 1 }
  if (result === 'skip') incFields.totalSkips = 1

  await ThemeScore.updateOne(
    { userId: user._id, theme: card.theme },
    { $inc: { points: flooredDelta } },
    { upsert: true },
  )
  await User.updateOne(
    { _id: user._id },
    { $inc: incFields, $set: { currentStreak: newStreak, level: newLevel } },
  )
  await Answer.create({ userId: user._id, cardId: card._id, theme: card.theme, result, pointsDelta, xpDelta })

  return { result, pointsDelta, xpDelta, newStreak, newLevel, leveledUp, newAchievements: [] }
}
