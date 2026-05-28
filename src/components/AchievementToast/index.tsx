'use client'
import { useEffect, type FC } from 'react'
import { TOAST_POSITION } from '@/lib/design-tokens'
import type { AchievementDef } from '@/types'

export interface AchievementToastProps {
  achievement: AchievementDef
  onDismiss?: () => void
}

interface RarityTheme {
  labelColor: string
  borderColor: string
  shadowStyle: string
}

const RARITY_THEMES: Record<string, RarityTheme> = {
  Common: {
    labelColor: 'text-[#94a3b8]',
    borderColor: 'border-[#94a3b8]',
    shadowStyle: 'shadow-[6px_6px_0px_0px_#94a3b8]',
  },
  Rare: {
    labelColor: 'text-[#38bdf8]',
    borderColor: 'border-[#38bdf8]',
    shadowStyle: 'shadow-[6px_6px_0px_0px_#38bdf8]',
  },
  Epic: {
    labelColor: 'text-[#c084fc]',
    borderColor: 'border-[#c084fc]',
    shadowStyle: 'shadow-[6px_6px_0px_0px_#c084fc]',
  },
  Mythic: {
    labelColor: 'text-[#f97316]',
    borderColor: 'border-[#f97316]',
    shadowStyle: 'shadow-[6px_6px_0px_0px_#f97316]',
  },
}

export const AchievementToast: FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss?.(), 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const theme = RARITY_THEMES[achievement.rarity] ?? RARITY_THEMES.Common

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
