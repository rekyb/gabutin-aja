export type ThemeName =
  | 'sejarah_indonesia'
  | 'sains'
  | 'pop_culture'
  | 'geografi'
  | 'matematika'
  | 'psikologi'
  | 'sejarah_dunia'
  | 'coding_tech'
  | 'tutorial'

export type AnswerResult = 'correct' | 'wrong' | 'skip'
export type AchievementRarity = 'Common' | 'Rare' | 'Epic' | 'Mythic'

export interface SubmitAnswerResponse {
  result: AnswerResult
  pointsDelta: number
  xpDelta: number
  newStreak: number
  newLevel: number
  leveledUp: boolean
  newAchievements: AchievementDef[]
}

export interface AchievementDef {
  key: string
  title: string
  icon: string
  rarity: AchievementRarity
  description: string
}

export interface UserProfile {
  displayName: string
  uniqueUserId: string
  level: number
  xp: number
  xpToNextLevel: number
  levelTitle: string
  currentStreak: number
}

// Lean document types — serializable plain objects (result of .lean() queries).
// Use these as prop types in Client Components; Mongoose Document types belong server-side only.

export interface CardDoc {
  _id: string
  theme: string
  fact: string
  sourceUrl: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface UserAchievementDoc {
  _id: string
  userId: string
  achievementKey: string
  earnedAt: Date
  isShowcased: boolean
  showcasePosition: 1 | 2 | 3 | null
}

export interface ThemeScoreDoc {
  _id: string
  userId: string
  theme: string
  points: number
}
