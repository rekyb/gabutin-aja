'use client'
import { useEffect, type FC } from 'react'
import { Trophy } from 'lucide-react'
import { TOAST_POSITION, RARITY_COLORS } from '@/lib/design-tokens'
import type { AchievementDef } from '@/types'

export interface AchievementToastProps {
  achievement: AchievementDef
  onDismiss?: () => void
}

export const AchievementToast: FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss?.(), 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const rarityClass = RARITY_COLORS[achievement.rarity] ?? RARITY_COLORS.Common

  return (
    <div
      className={`${TOAST_POSITION} ${rarityClass} bg-card border-2 border-(--color-card-stroke) shadow-[4px_4px_0px_0px_var(--color-shadow)] p-4 flex items-center gap-3`}
    >
      <Trophy className="h-5 w-5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-sans font-bold text-sm">{achievement.title}</p>
        <p className="font-mono text-xs opacity-70">{achievement.rarity}</p>
      </div>
    </div>
  )
}
