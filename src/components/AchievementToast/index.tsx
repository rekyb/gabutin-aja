import type { FC } from 'react'
import type { AchievementDef } from '@/types'

export interface AchievementToastProps {
  achievement: AchievementDef
  onDismiss?: () => void
}

export const AchievementToast: FC<AchievementToastProps> = () => null
