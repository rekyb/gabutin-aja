'use client'
import { useState, useEffect, type FC } from 'react'
import { useRouter } from 'next/navigation'
import { ThemePicker } from '@/components/ThemePicker'
import { createUser } from '@/app/actions/user'
import { generateUniqueUserId } from '@/utils/user-id'
import { getUniqueUserId, setUniqueUserId, clearGuestOnly } from '@/lib/guest-state'
import { BUTTON_PRESS } from '@/lib/design-tokens'
import type { ThemeName } from '@/types'
import { validateDisplayName, DISPLAY_NAME_MAX_LENGTH } from '@/utils/validators'
import { useFeedStore } from '@/store/feedStore'
import { useToastStore } from '@/store/toastStore'

export const WelcomeClient: FC = () => {
  const router = useRouter()
  const resetFeed = useFeedStore((s) => s.reset)
  const showToast = useToastStore((s) => s.show)
  const [displayName, setDisplayName] = useState('')
  const [selectedThemes, setSelectedThemes] = useState<ThemeName[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [uid, setUid] = useState('')

  useEffect(() => {
    let currentId = getUniqueUserId()
    if (!currentId) {
      currentId = generateUniqueUserId()
      setUniqueUserId(currentId)
    }
    setUid(currentId)
  }, [])

  const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${uid}`

  const validation = validateDisplayName(displayName)
  const validationError = displayName.length > 0 && !validation.isValid ? validation.error : null

  const canSubmit = validation.isValid && selectedThemes.length === 3

  async function handleRegister() {
    if (!uid || !canSubmit || isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      await createUser(displayName.trim(), selectedThemes, uid, 0, 0)
      clearGuestOnly()
      resetFeed()
      showToast(`Halo ${displayName.trim()}! Selamat gabut bareng kita`)
      router.refresh()
      router.push('/feed')
    } catch {
      setError('Gagal menyimpan. Coba lagi.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 lg:p-6 bg-background">
      <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_var(--color-shadow)] w-full max-w-[490px] lg:w-[430px] lg:max-w-none p-6 space-y-6">
        
        {/* Header Section */}
        <div className="text-center space-y-1">
          <h1 className="font-sans font-black text-2xl tracking-wide uppercase">Gabut Bareng Kita!</h1>
          <p className="font-mono text-xs text-muted-foreground">
            Isi nama lo dan pilih 3 tema favorit buat mulai kuis harian.
          </p>
        </div>

        {/* Profile/DisplayName Section */}
        <div className="flex items-center gap-4 border-2 border-dashed border-border p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt="Avatar" className="h-16 w-16 border-2 border-border shrink-0 bg-muted" />
          <div className="flex-1">
            <label htmlFor="displayNameInput" className="font-mono text-xs text-muted-foreground block mb-1">
              Nama lo (wajib)
            </label>
            <input
              id="displayNameInput"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={DISPLAY_NAME_MAX_LENGTH}
              placeholder="e.g. Andi"
              className="w-full bg-background border-2 border-border px-3 py-2 font-sans text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {validationError && (
              <p className="text-secondary font-mono text-xs mt-1.5 leading-relaxed">
                {validationError}
              </p>
            )}
          </div>
        </div>

        {/* Theme Picker Component */}
        <ThemePicker selected={selectedThemes} onChange={setSelectedThemes} />

        {error && <p className="font-mono text-sm text-secondary text-center">{error}</p>}

        {/* Action Button */}
        <button
          onClick={handleRegister}
          disabled={!canSubmit || isSubmitting}
          className={`${BUTTON_PRESS} w-full bg-primary text-primary-foreground font-mono font-bold py-3 border-2 border-border disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
        >
          {isSubmitting ? 'Menyimpan...' : 'Mulai Gabutin →'}
        </button>

        {/* Alternative Google Login */}
        <div className="relative flex py-2 items-center">
          <div className="grow border-t border-border/40"></div>
          <span className="shrink mx-4 text-xs font-mono text-muted-foreground">ATAU</span>
          <div className="grow border-t border-border/40"></div>
        </div>

        <button
          onClick={() => { globalThis.location.href = `/api/auth/google?guest_uid=${uid}` }}
          className={`${BUTTON_PRESS} w-full bg-primary text-primary-foreground font-mono font-bold py-2.5 px-4 border-2 border-border flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer`}
        >
          {/* Circular White Wrapper for Google SVG */}
          <div className="bg-white p-1 mr-2 shrink-0 flex items-center justify-center w-7 h-7" style={{ borderRadius: '9999px' }}>
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
          </div>
          Masuk dengan Google
        </button>

      </div>
    </div>
  )
}

export default WelcomeClient
