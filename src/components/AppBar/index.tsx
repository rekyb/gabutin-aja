'use client'
import { useEffect, useState, type FC } from 'react'
import { Logo } from '@/components/Logo'
import { useUiStore } from '@/store/uiStore'
import { getUniqueUserId } from '@/lib/guest-state'
import { getUserByUniqueId } from '@/app/actions/user'
import { BUTTON_PRESS } from '@/lib/design-tokens'

interface AppBarProps {
  className?: string
}

export const AppBar: FC<AppBarProps> = ({ className }) => {
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
    <header
      className={`fixed top-0 left-0 right-0 z-30 h-16 bg-sidebar border-b-2 border-border flex items-center justify-between px-4 ${
        className ?? ''
      }`}
    >
      {/* Left: Logo + App Name */}
      <div className="flex items-center gap-3">
        <Logo size={32} />
        <span className="font-black text-lg tracking-widest text-foreground">GABUTIN</span>
      </div>

      {/* Right: Actions Group */}
      <div className="flex items-center gap-2">
        <a
          href="https://forms.gle/oPfqjNhDGwbavjqd6"
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-border font-mono font-bold text-[10px] sm:text-xs px-2.5 py-1 bg-muted text-foreground hover:bg-card transition-colors cursor-pointer"
        >
          Saran dong
        </a>

        {!isOnboarded && (
          <button
            onClick={openLoginModal}
            className={`${BUTTON_PRESS} bg-primary border-2 border-border font-mono font-bold text-[10px] sm:text-xs px-3 py-1 text-primary-foreground transition-all cursor-pointer`}
          >
            Masuk
          </button>
        )}
      </div>
    </header>
  )
}
