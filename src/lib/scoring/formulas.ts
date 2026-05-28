import type { AnswerResult } from '@/types'

export const BASE_XP = 2

export function getStreakBonus(streak: number): number {
  if (streak >= 10) return 5
  if (streak >= 5) return 3
  if (streak >= 3) return 1
  return 0
}

export function calculateXP(result: AnswerResult, streak: number): number {
  if (result !== 'correct') return 0
  return BASE_XP + getStreakBonus(streak)
}

export function calculatePointsDelta(result: AnswerResult): number {
  if (result === 'correct') return 2
  if (result === 'wrong') return -2
  return -1
}

export function xpRequiredForLevel(level: number): number {
  return Math.floor(10 * Math.pow(level, 1.5))
}

export function computeLevel(totalXp: number): number {
  let level = 1
  let cumulative = 0
  while (true) {
    cumulative += xpRequiredForLevel(level)
    if (cumulative > totalXp) return level
    level++
  }
}

export function getLevelTitle(level: number): string {
  if (level <= 5) return 'Newbie Gabut'
  if (level <= 15) return 'Penasaran'
  if (level <= 30) return 'Anak Pintar'
  if (level <= 50) return 'Sultan Ilmu'
  return 'Dewa Gabut'
}
