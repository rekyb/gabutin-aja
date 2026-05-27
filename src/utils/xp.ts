const XP_PER_LEVEL = 100

export function getLevelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function getXpProgress(xp: number): { current: number; required: number; percent: number } {
  const current = xp % XP_PER_LEVEL
  return { current, required: XP_PER_LEVEL, percent: (current / XP_PER_LEVEL) * 100 }
}
