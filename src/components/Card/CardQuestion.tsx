'use client'
import type { FC } from 'react'
import type { CardDoc } from '@/types'

export interface CardQuestionProps {
  card: CardDoc
  onAnswer: (selectedIndex: number) => void
  onExpire: () => void
}

export const CardQuestion: FC<CardQuestionProps> = () => null
