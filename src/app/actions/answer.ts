'use server'
import type { SubmitAnswerResponse } from '@/types'

// Stub: E05 replaces this with real scoring + streak + achievement logic
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function submitAnswer(
  userId: string,
  cardId: string,
  selectedIndex: number | null,
): Promise<SubmitAnswerResponse> {
  if (selectedIndex === null) {
    return {
      result: 'skip',
      pointsDelta: -1,
      xpDelta: 0,
      newStreak: 0,
      newLevel: 1,
      leveledUp: false,
      newAchievements: [],
    }
  }
  return {
    result: 'correct',
    pointsDelta: 2,
    xpDelta: 3,
    newStreak: 1,
    newLevel: 1,
    leveledUp: false,
    newAchievements: [],
  }
}
