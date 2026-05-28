'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Pin, PinOff, Lock } from 'lucide-react'
import { ACHIEVEMENTS } from '@/lib/achievements/definitions'
import { pinBadge, unpinBadge } from '@/app/actions/achievements'
import { RARITY_COLORS, RARITY_BORDER_COLORS, SHADOW_HARD, BUTTON_PRESS } from '@/lib/design-tokens'
import type { UserAchievementDoc } from '@/types'

export interface AchievementStats {
  totalAnswers: number
  totalSkips: number
  level: number
  currentStreak: number
  themeScores: Record<string, number>
}

interface AchievementsClientProps {
  achievements: UserAchievementDoc[]
  userId: string
  stats: AchievementStats
}

function getProgressHint(key: string, stats: AchievementStats): string {
  switch (key) {
    case 'first_answer':
      return `${Math.min(stats.totalAnswers, 1)}/1 soal`
    case 'ten_answers':
      return `${Math.min(stats.totalAnswers, 10)}/10 soal`
    case 'century':
      return `${Math.min(stats.totalAnswers, 100)}/100 soal`
    case 'hot_streak':
      return `Streak tertinggi: ${stats.currentStreak}`
    case 'on_fire':
      return `Streak tertinggi: ${stats.currentStreak}`
    case 'unstoppable':
      return `Streak tertinggi: ${stats.currentStreak}`
    case 'scholar':
      return `Level ${stats.level}/6`
    case 'sage':
      return `Level ${stats.level}/16`
    case 'mythic':
      return `Level ${stats.level}/50`
    case 'theme_focused': {
      const maxPts = Math.max(0, ...Object.values(stats.themeScores))
      return `${Math.min(maxPts, 20)}/20 poin`
    }
    case 'theme_master': {
      const maxPts = Math.max(0, ...Object.values(stats.themeScores))
      return `${Math.min(maxPts, 50)}/50 poin`
    }
    case 'comeback':
    case 'hard_comeback':
    case 'miracle':
      return 'Jawab bener setelah combo salah'
    case 'first_skip':
      return `${Math.min(stats.totalSkips, 1)}/1 skip`
    case 'five_skips':
      return `${Math.min(stats.totalSkips, 5)}/5 skip`
    case 'ten_skips':
      return `${Math.min(stats.totalSkips, 10)}/10 skip`
    default:
      return ''
  }
}

export function AchievementsClient({ achievements, userId, stats }: AchievementsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loadingKey, setLoadingKey] = useState<string | null>(null)

  const earnedMap = new Map<string, UserAchievementDoc>()
  for (const a of achievements) {
    earnedMap.set(a.achievementKey, a)
  }

  const showcasedCount = achievements.filter((a) => a.isShowcased).length

  async function handlePin(achievementKey: string) {
    if (!userId || isPending) return
    setLoadingKey(achievementKey)
    startTransition(async () => {
      await pinBadge(userId, achievementKey)
      router.refresh()
      setLoadingKey(null)
    })
  }

  async function handleUnpin(achievementKey: string) {
    if (!userId || isPending) return
    setLoadingKey(achievementKey)
    startTransition(async () => {
      await unpinBadge(userId, achievementKey)
      router.refresh()
      setLoadingKey(null)
    })
  }

  return (
    <div className="w-full max-w-[720px] mx-auto px-4 lg:px-0 py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="font-sans font-black text-3xl uppercase tracking-wide text-foreground">
          Achievements
        </h1>
        <p className="font-mono text-sm text-muted-foreground">
          {achievements.length}/17 badge diraih
          {showcasedCount > 0 && ` · ${showcasedCount}/3 dipasang`}
        </p>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((def) => {
          const earned = earnedMap.get(def.key)
          const isEarned = Boolean(earned)
          const isPinned = earned?.isShowcased ?? false
          const isThisLoading = loadingKey === def.key

          const rarityTextClass = RARITY_COLORS[def.rarity] ?? RARITY_COLORS.Common
          const rarityBorderClass = RARITY_BORDER_COLORS[def.rarity] ?? RARITY_BORDER_COLORS.Common

          if (isEarned) {
            return (
              <div
                key={def.key}
                className={`bg-card border-2 ${rarityBorderClass} ${SHADOW_HARD} p-4 space-y-3 flex flex-col`}
              >
                {/* Badge Icon + Rarity */}
                <div className="flex items-start justify-between">
                  <span className="text-3xl" aria-label={def.title}>{def.icon}</span>
                  <span className={`font-mono text-xs font-bold uppercase ${rarityTextClass}`}>
                    {def.rarity}
                  </span>
                </div>

                {/* Badge Info */}
                <div className="flex-1 space-y-1">
                  <p className="font-sans font-black text-sm text-foreground">{def.title}</p>
                  <p className="font-mono text-xs text-muted-foreground leading-snug">{def.description}</p>
                </div>

                {/* Pin / Unpin Button */}
                {userId && (
                  <div className="pt-1">
                    {isPinned ? (
                      <button
                        id={`unpin-${def.key}`}
                        onClick={() => handleUnpin(def.key)}
                        disabled={isThisLoading || isPending}
                        className={`${BUTTON_PRESS} w-full flex items-center justify-center gap-1.5 font-mono text-xs border border-border py-1.5 px-3 text-muted-foreground hover:border-secondary hover:text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer disabled:opacity-50`}
                        aria-pressed="true"
                      >
                        <PinOff className="h-3 w-3" />
                        {isThisLoading ? 'Loading...' : 'Unpin'}
                      </button>
                    ) : (
                      <button
                        id={`pin-${def.key}`}
                        onClick={() => handlePin(def.key)}
                        disabled={isThisLoading || isPending}
                        className={`${BUTTON_PRESS} w-full flex items-center justify-center gap-1.5 font-mono text-xs border border-border py-1.5 px-3 text-muted-foreground hover:border-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer disabled:opacity-50`}
                        aria-pressed="false"
                      >
                        <Pin className="h-3 w-3" />
                        {isThisLoading ? 'Loading...' : 'Pin ke Profil'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          }

          // Locked badge
          const hint = getProgressHint(def.key, stats)
          return (
            <div
              key={def.key}
              className={`bg-card border-2 border-border ${SHADOW_HARD} p-4 space-y-3 flex flex-col opacity-50`}
              aria-label={`Terkunci: ${def.title}`}
            >
              {/* Locked Icon + Rarity */}
              <div className="flex items-start justify-between">
                <div className="text-3xl grayscale" aria-hidden="true">{def.icon}</div>
                <span className="font-mono text-xs font-bold uppercase text-muted-foreground">
                  {def.rarity}
                </span>
              </div>

              {/* Badge Info */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <p className="font-sans font-black text-sm text-muted-foreground">{def.title}</p>
                </div>
                <p className="font-mono text-xs text-muted-foreground/70 leading-snug">{def.description}</p>
              </div>

              {/* Progress Hint */}
              {hint && (
                <div className="pt-1">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-xs text-muted-foreground">{hint}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
