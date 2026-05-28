'use client'
import { useEffect, useState, type FC } from 'react'
import { useUiStore } from '@/store/uiStore'
import { getUniqueUserId } from '@/lib/guest-state'
import { getUserByUniqueId } from '@/app/actions/user'
import { BUTTON_PRESS } from '@/lib/design-tokens'

export const DesktopHeader: FC = () => {
  const [isOnboarded, setIsOnboarded] = useState(true)
  const openLoginModal = useUiStore((s) => s.openLoginModal)

  useEffect(() => {
    async function checkUser() {
      const id = getUniqueUserId()
      if (!id) {
        setIsOnboarded(false)
        return
      }
      try {
        const dbUser = await getUserByUniqueId(id)
        setIsOnboarded(!!dbUser)
      } catch {
        setIsOnboarded(false)
      }
    }
    checkUser()
  }, [])

  return (
    <div className="hidden lg:flex fixed top-4 right-6 z-30 items-center gap-3">
      <button
        onClick={(e) => e.preventDefault()}
        className="border-2 border-border font-mono font-bold text-xs px-3 py-1.5 bg-muted text-foreground hover:bg-card transition-colors cursor-pointer"
      >
        Saran dong
      </button>

      {!isOnboarded && (
        <button
          onClick={openLoginModal}
          className={`${BUTTON_PRESS} bg-primary border-2 border-border font-mono font-bold text-xs px-4 py-1.5 text-primary-foreground transition-all cursor-pointer`}
        >
          Masuk
        </button>
      )}
    </div>
  )
}
