'use client'
import type { FC } from 'react'
import type { CardDoc, SubmitAnswerResponse } from '@/types'

export interface CardResultProps {
  card: CardDoc
  response: SubmitAnswerResponse
  onNext: () => void
}

export const CardResult: FC<CardResultProps> = () => null
