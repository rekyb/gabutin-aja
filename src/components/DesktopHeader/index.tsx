'use client'
import { useEffect, useState, type FC } from 'react'
import { useUiStore } from '@/store/uiStore'
import { getUniqueUserId } from '@/lib/guest-state'
import { getUserByUniqueId } from '@/app/actions/user'
import { Button } from '@/components/Button'

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
      <a
        href="https://forms.gle/oPfqjNhDGwbavjqd6"
        target="_blank"
        rel="noopener noreferrer"
        className="border-2 border-border font-mono font-bold text-xs px-3 py-1.5 bg-muted text-foreground hover:bg-card transition-colors cursor-pointer"
      >
        Saran dong
      </a>

      {!isOnboarded && (
        <Button
          onClick={openLoginModal}
          variant="primary"
          size="sm"
          className="px-4 py-1.5"
        >
          Masuk
        </Button>
      )}
    </div>
  )
}

