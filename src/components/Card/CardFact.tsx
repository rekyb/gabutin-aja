'use client'
import type { FC } from 'react'
import type { CardDoc } from '@/types'

export interface CardFactProps {
  card: CardDoc
  onReady: () => void
}

export const CardFact: FC<CardFactProps> = () => null
