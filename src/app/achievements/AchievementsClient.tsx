'use client'
import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Pin, PinOff, Lock, AlertTriangle } from 'lucide-react'
import { ACHIEVEMENTS } from '@/lib/achievements/definitions'
import { pinBadge, unpinBadge } from '@/app/actions/achievements'
import { RARITY_COLORS, RARITY_BORDER_COLORS, SHADOW_HARD, BUTTON_PRESS } from '@/lib/design-tokens'
import { getUniqueUserId } from '@/lib/guest-state'
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
  const [guestUid, setGuestUid] = useState<string | null>(null)

  useEffect(() => {
    setGuestUid(getUniqueUserId())
  }, [])

  function handleGoogleConnect(uniqueUserId: string) {
    globalThis.location.href = `/api/auth/google?guest_uid=${uniqueUserId}`
  }

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
          Flexing
        </h1>
        <p className="font-mono text-sm text-muted-foreground">
          {achievements.length}/17 lencana diraih
          {showcasedCount > 0 && ` · ${showcasedCount}/3 dipasang`}
        </p>
      </div>

      {/* Guest warning prompt */}
      {!userId && (
        <div className="bg-secondary/10 border-2 border-secondary shadow-[4px_4px_0px_0px_var(--color-secondary)] p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-sm leading-relaxed text-secondary">
          <div className="flex gap-3 items-start">
            <AlertTriangle className="h-5 w-5 shrink-0 text-secondary mt-0.5" />
            <p className="flex-1">
              Lo main sebagai <strong>tamu</strong>. Progress, XP, dan lencana lo bisa hilang kalau lo hapus cache browser. Simpan progres lo biar aman!
            </p>
          </div>
          {guestUid && (
            <button
              onClick={() => handleGoogleConnect(guestUid)}
              className={`${BUTTON_PRESS} whitespace-nowrap bg-primary text-primary-foreground font-mono font-bold py-2 px-3 md:py-2.5 md:px-4 border-2 border-border flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer text-xs md:text-sm shrink-0`}
            >
              <div className="bg-white rounded-full p-0.5 shrink-0 flex items-center justify-center w-5 h-5 md:w-6 md:h-6">
                <svg className="h-3 w-3 md:h-3.5 md:w-3.5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
              </div>
              Simpan Progres
            </button>
          )}
        </div>
      )}

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
