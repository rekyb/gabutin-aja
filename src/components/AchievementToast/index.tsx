'use client'
import { useEffect, type FC } from 'react'
import { TOAST_POSITION, VIBRANT_RARITY_THEMES } from '@/lib/design-tokens'
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

  const theme = VIBRANT_RARITY_THEMES[achievement.rarity] ?? VIBRANT_RARITY_THEMES.Common

  return (
    <div
      className={`${TOAST_POSITION} animate-slide-up bg-[#18181b] border-2 ${theme.borderColor} ${theme.shadowStyle} p-4 md:p-5 flex items-center gap-4 transition-all duration-300`}
    >
      <div className="text-4xl shrink-0 select-none flex items-center justify-center">
        {achievement.icon || '🏆'}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-sans font-black text-[10px] tracking-widest uppercase ${theme.labelColor}`}>
          LENCANA TERBUKA!
        </p>
        <h4 className="font-sans font-black text-base md:text-lg text-white leading-tight mt-0.5 truncate">
          {achievement.title}
        </h4>
        <p className="font-mono text-[11px] text-neutral-400 leading-snug mt-1">
          {achievement.description}
        </p>
      </div>
    </div>
  )
}
