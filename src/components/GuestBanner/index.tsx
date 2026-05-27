'use client'
import type { FC } from 'react'

export interface GuestBannerProps {
  guestCardCount: number
  onDismiss?: () => void
}

export const GuestBanner: FC<GuestBannerProps> = () => null
