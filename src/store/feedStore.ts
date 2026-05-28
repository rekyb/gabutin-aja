import { create } from 'zustand'
import { getNextCard } from '@/app/actions/feed'
import type { CardDoc, AchievementDef } from '@/types'

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
  cards: CardDoc[]
  achievements: AchievementDef[]
  showReEngagement: boolean
  isLoadingMore: boolean

  init: () => void
  loadInitialCards: () => Promise<void>
  loadMoreCards: () => Promise<void>
  appendAchievements: (newAchievements: AchievementDef[]) => void
  dismissAchievement: (index: number) => void
  dismissReEngagement: () => void
  reset: () => void
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  userId: '',
  cards: [],
  achievements: [],
  showReEngagement: false,
  isLoadingMore: false,

  init: () => {
    const uid = readUserId()
    set({ userId: uid })
    get().loadInitialCards().catch(() => {})
  },

  loadInitialCards: async () => {
    if (checkReEngagement()) {
      set({ showReEngagement: true })
      return
    }
    set({ isLoadingMore: true })
    const uid = get().userId || readUserId()
    try {
      // Load first 3 cards to pre-populate feed
      const list: CardDoc[] = []
      for (let i = 0; i < 3; i++) {
        const next = await getNextCard(uid)
        if (next) {
          // Prevent adjacent exact duplicates if any
          if (list.length === 0 || list[list.length - 1]._id !== next._id) {
            list.push(next)
          }
        }
      }
      set({ cards: list })
    } catch (err) {
      console.error('[feedStore] failed loading initial cards:', err)
    } finally {
      set({ isLoadingMore: false })
    }
  },

  loadMoreCards: async () => {
    const { isLoadingMore, cards, userId } = get()
    if (isLoadingMore) return
    set({ isLoadingMore: true })
    try {
      const uid = userId || readUserId()
      const next = await getNextCard(uid)
      if (next) {
        set({ cards: [...cards, next] })
      }
    } catch (err) {
      console.error('[feedStore] failed loading more cards:', err)
    } finally {
      set({ isLoadingMore: false })
    }
  },

  appendAchievements: (newAchievements) => {
    if (!newAchievements || newAchievements.length === 0) return
    set((s) => ({ achievements: [...s.achievements, ...newAchievements] }))
  },

  dismissAchievement: (index) =>
    set((s) => ({ achievements: s.achievements.filter((_, i) => i !== index) })),

  dismissReEngagement: () => set({ showReEngagement: false }),

  reset: () =>
    set({
      userId: '',
      cards: [],
      achievements: [],
      showReEngagement: false,
      isLoadingMore: false,
    }),
}))
