'use client'
import type { FC } from 'react'

export interface CountdownTimerProps {
  seconds: number
  onExpire: () => void
}

export const CountdownTimer: FC<CountdownTimerProps> = () => null
