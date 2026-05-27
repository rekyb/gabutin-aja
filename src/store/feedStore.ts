import { create } from 'zustand'
import { getNextCard } from '@/app/actions/feed'
import { submitAnswer } from '@/app/actions/answer'
import type { CardDoc, SubmitAnswerResponse, AchievementDef } from '@/types'

export type FeedPhase = 'loading' | 'fact' | 'question' | 'result'

function readUserId(): string {
  try {
    const parsed = JSON.parse(localStorage.getItem('gabutin_user') ?? '{}') as { uniqueUserId?: string }
    return parsed.uniqueUserId ?? 'guest'
  } catch {
    return 'guest'
  }
}

function checkReEngagement(): boolean {
  try {
    const parsed = JSON.parse(localStorage.getItem('gabutin_user') ?? '{}') as {
      guestOnly?: boolean
      guestCardCount?: number
      guestReEngagementShownAt?: number
    }
    if (!parsed.guestOnly || (parsed.guestCardCount ?? 0) < 15) return false
    return Date.now() - (parsed.guestReEngagementShownAt ?? 0) > 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

interface FeedStore {
  userId: string
  phase: FeedPhase
  card: CardDoc | null
  response: SubmitAnswerResponse | null
  achievements: AchievementDef[]
  showReEngagement: boolean
  cardHistory: CardDoc[]
  historyIndex: number
  wasTimeout: boolean

  init: () => void
  loadCard: (uid: string) => Promise<void>
  goToPrev: () => void
  goToNext: () => Promise<void>
  answerCard: (selectedIndex: number | null, isTimeout?: boolean) => Promise<void>
  setPhase: (phase: FeedPhase) => void
  dismissAchievement: (index: number) => void
  dismissReEngagement: () => void
  reset: () => void
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  userId: '',
  phase: 'loading',
  card: null,
  response: null,
  achievements: [],
  showReEngagement: false,
  cardHistory: [],
  historyIndex: -1,
  wasTimeout: false,

  init: () => {
    const uid = readUserId()
    set({ userId: uid })
    void get().loadCard(uid)
  },

  loadCard: async (uid) => {
    if (checkReEngagement()) {
      set({ showReEngagement: true })
      return
    }
    set({ phase: 'loading' })
    try {
      const next = await getNextCard(uid)
      if (next) {
        set((s) => ({
          card: next,
          cardHistory: [...s.cardHistory, next],
          historyIndex: s.cardHistory.length,
          phase: 'fact',
          wasTimeout: false,
        }))
      }
    } catch {}
  },

  goToPrev: () => {
    const { historyIndex, cardHistory } = get()
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    set({ historyIndex: newIndex, card: cardHistory[newIndex], response: null, phase: 'fact', wasTimeout: false })
  },

  goToNext: async () => {
    const { historyIndex, cardHistory, userId } = get()
    if (historyIndex < cardHistory.length - 1) {
      const newIndex = historyIndex + 1
      set({ historyIndex: newIndex, card: cardHistory[newIndex], response: null, phase: 'fact', wasTimeout: false })
    } else {
      set({ response: null })
      await get().loadCard(userId)
    }
  },

  answerCard: async (selectedIndex, isTimeout = false) => {
    const { card, userId } = get()
    if (!card || !userId) return
    set({ phase: 'loading', wasTimeout: isTimeout })
    try {
      const res = await submitAnswer(userId, card._id, selectedIndex)
      set((s) => ({
        response: res,
        phase: 'result',
        achievements: res.newAchievements.length > 0
          ? [...s.achievements, ...res.newAchievements]
          : s.achievements,
      }))
    } catch {}
  },

  setPhase: (phase) => set({ phase }),

  dismissAchievement: (index) =>
    set((s) => ({ achievements: s.achievements.filter((_, i) => i !== index) })),

  dismissReEngagement: () => set({ showReEngagement: false }),

  reset: () => set({
    userId: '',
    phase: 'loading',
    card: null,
    response: null,
    achievements: [],
    showReEngagement: false,
    cardHistory: [],
    historyIndex: -1,
    wasTimeout: false,
  }),
}))
