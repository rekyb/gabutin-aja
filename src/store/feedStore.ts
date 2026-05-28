import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getNextCard } from '@/app/actions/feed'
import { getUniqueUserId, isGuestOnly, shouldShowReEngagement } from '@/lib/guest-state'
import type { CardDoc, AchievementDef, SubmitAnswerResponse } from '@/types'

function readUserId(): string {
  try {
    if (globalThis.window === undefined) return 'guest'
    return getUniqueUserId() ?? 'guest'
  } catch {
    return 'guest'
  }
}

function checkReEngagement(): boolean {
  try {
    if (globalThis.window === undefined) return false
    return isGuestOnly() && shouldShowReEngagement()
  } catch {
    return false
  }
}

export interface CardState {
  phase: 'fact' | 'question' | 'result'
  selectedAnswer: number | null
  response: SubmitAnswerResponse | null
  wasTimeout: boolean
}

interface FeedStore {
  userId: string
  cards: CardDoc[]
  achievements: AchievementDef[]
  showReEngagement: boolean
  isLoadingMore: boolean
  cardStates: Record<string, CardState>

  init: () => void
  loadInitialCards: () => Promise<void>
  loadMoreCards: () => Promise<void>
  appendAchievements: (newAchievements: AchievementDef[]) => void
  updateCardState: (cardId: string, updates: Partial<CardState>) => void
  dismissAchievement: (index: number) => void
  dismissReEngagement: () => void
  reset: () => void
}

export const useFeedStore = create<FeedStore>()(
  persist(
    (set, get) => ({
      userId: '',
      cards: [],
      achievements: [],
      showReEngagement: false,
      isLoadingMore: false,
      cardStates: {},

      init: () => {
        const uid = readUserId()
        set({ userId: uid })
        if (get().cards.length === 0) {
          get().loadInitialCards().catch(() => {})
        }
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
              if (list.length === 0 || list.at(-1)?._id !== next._id) {
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

      updateCardState: (cardId, updates) => {
        set((s) => ({
          cardStates: {
            ...s.cardStates,
            [cardId]: {
              ...(s.cardStates[cardId] ?? {
                phase: 'fact',
                selectedAnswer: null,
                response: null,
                wasTimeout: false,
              }),
              ...updates,
            },
          },
        }))
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
          cardStates: {},
        }),
    }),
    {
      name: 'gabutin-feed-store',
      partialize: (state) => ({
        userId: state.userId,
        cards: state.cards,
        achievements: state.achievements,
        showReEngagement: state.showReEngagement,
        cardStates: state.cardStates,
      }),
    }
  )
)
