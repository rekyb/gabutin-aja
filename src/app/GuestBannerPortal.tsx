'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { GuestBanner } from '@/components/GuestBanner'
import { isGuestOnly } from '@/lib/guest-state'

export function GuestBannerPortal() {
  const [showBanner, setShowBanner] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setShowBanner(isGuestOnly())
  }, [pathname])

  if (!showBanner) return null
  return <GuestBanner />
}
