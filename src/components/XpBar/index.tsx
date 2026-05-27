import type { FC } from 'react'

export interface XpBarProps {
  currentXp: number
  xpToNextLevel: number
  level: number
  levelTitle: string
}

export const XpBar: FC<XpBarProps> = () => null
