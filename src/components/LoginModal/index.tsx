'use client'
import type { FC } from 'react'
import { X } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { getUniqueUserId, setGuestOnly } from '@/lib/guest-state'
import { BUTTON_PRESS } from '@/lib/design-tokens'

export const LoginModal: FC = () => {
  const { showLoginModal, closeLoginModal } = useUiStore()

  if (!showLoginModal) return null

  function handleGoogleLogin() {
    const uid = getUniqueUserId() ?? ''
    closeLoginModal()
    globalThis.location.href = `/api/auth/google?guest_uid=${uid}`
  }

  function handleGuestLogin() {
    setGuestOnly()
    closeLoginModal()
    globalThis.location.href = '/welcome'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      {/* Modal Container */}
      <div className="relative bg-card border-2 border-[var(--color-card-stroke)] shadow-[4px_4px_0px_0px_var(--color-shadow)] w-full max-w-[400px] p-6 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          aria-label="Tutup"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground focus-visible:outline-none"
        >
          <X className="h-5 w-5 stroke-2" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <h2 className="font-sans font-black text-2xl tracking-wide uppercase">Masuk Akun</h2>
          <p className="font-mono text-xs text-muted-foreground">
            Pilih cara masuk buat simpan progress dan kumpulin lencana lo.
          </p>
        </div>

        {/* Modal Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoogleLogin}
            className={`${BUTTON_PRESS} w-full bg-white text-black font-mono font-bold py-3 border-2 border-border flex items-center justify-center hover:bg-neutral-100 transition-colors`}
          >
            {/* Google SVG Icon */}
            <svg className="h-5 w-5 mr-2 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Masuk pake Google
          </button>

          <button
            onClick={handleGuestLogin}
            className={`${BUTTON_PRESS} w-full bg-transparent text-primary font-mono font-bold py-3 border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-colors`}
          >
            Jadi tamu aja
          </button>
        </div>
      </div>
    </div>
  )
}
