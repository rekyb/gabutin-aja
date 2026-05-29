'use server'
import mongoose from 'mongoose'
import { connectDB } from '@/db/connect'
import { User } from '@/db/models/User'
import { ThemeScore } from '@/db/models/ThemeScore'
import { Card } from '@/db/models/Card'
import { generateCard } from '@/lib/pipeline/generate-card'
import { selectTheme } from '@/lib/feed/algorithm'
import type { CardDoc } from '@/types'

interface LeanThemeScore {
  _id: mongoose.Types.ObjectId
  theme: string
  points: number
  seenCardIds: mongoose.Types.ObjectId[]
}

interface LeanCard {
  _id: mongoose.Types.ObjectId
  theme: string
  fact: string
  sourceUrl: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface LeanUser {
  _id: mongoose.Types.ObjectId
  themes: string[]
}

async function fetchUnseenCard(
  theme: string,
  excludeIds: mongoose.Types.ObjectId[]
): Promise<LeanCard | null> {
  return Card.findOne({
    theme,
    status: 'approved',
    _id: { $nin: excludeIds },
  })
    .sort({ createdAt: 1 })
    .lean<LeanCard>()
}

export async function getNextCard(userId: string): Promise<CardDoc | null> {
  await connectDB()

  const user = await User.findOne({ uniqueUserId: userId })
    .select('_id themes')
    .lean<LeanUser>()
  if (!user?.themes?.length) return null

  const themeScores = await ThemeScore.find({
    userId: user._id,
    theme: { $in: user.themes },
  })
    .select('theme points seenCardIds')
    .lean<LeanThemeScore[]>()

  if (!themeScores.length) return null

  const selectedTheme = selectTheme(
    themeScores.map(ts => ({ theme: ts.theme, points: ts.points }))
  )

  const themeScore = themeScores.find(ts => ts.theme === selectedTheme)!

  // Fetch unseen card; on exhausted pool, reset seenCardIds and retry once
  let card = await fetchUnseenCard(selectedTheme, themeScore.seenCardIds)

  if (!card) {
    await ThemeScore.updateOne(
      { userId: user._id, theme: selectedTheme },
      { $set: { seenCardIds: [] } }
    )
    themeScore.seenCardIds = []
    card = await fetchUnseenCard(selectedTheme, [])
  }

  // Empty pool — trigger generation and wait up to 5s for first card
  if (!card) {
    generateCard(selectedTheme).catch(() => {})
    await new Promise(resolve => setTimeout(resolve, 5000))
    card = await fetchUnseenCard(selectedTheme, [])
    if (!card) return null
  }

  // Mark card as seen
  await ThemeScore.updateOne(
    { userId: user._id, theme: selectedTheme },
    { $push: { seenCardIds: card._id } }
  )

  // Background replenishment if pool is running low
  const unseenCount = await Card.countDocuments({
    theme: selectedTheme,
    status: 'approved',
    _id: { $nin: [...themeScore.seenCardIds, card._id] },
  })

  if (unseenCount < 10) {
    generateCard(selectedTheme).catch(() => {})
  }

  return {
    _id: card._id.toString(),
    theme: card.theme,
    fact: card.fact,
    sourceUrl: card.sourceUrl,
    question: card.question,
    options: card.options,
    correctIndex: card.correctIndex,
    explanation: card.explanation,
  }
}
