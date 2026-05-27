'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ThemePicker } from '@/components/ThemePicker'
import { completeOnboarding } from '@/app/actions/user'
import { useFeedStore } from '@/store/feedStore'
import { BUTTON_PRESS } from '@/lib/design-tokens'
import { validateDisplayName, DISPLAY_NAME_MAX_LENGTH } from '@/utils/validators'
import type { ThemeName } from '@/types'

interface Props {
  readonly userId: string
  readonly defaultDisplayName: string
  readonly uniqueUserId: string
}

export function OnboardingClient({ userId, defaultDisplayName, uniqueUserId }: Props) {
  const router = useRouter()
  const resetFeed = useFeedStore((s) => s.reset)
  const [displayName, setDisplayName] = useState(defaultDisplayName)
  const [selectedThemes, setSelectedThemes] = useState<ThemeName[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${uniqueUserId}`
  const validation = validateDisplayName(displayName)
  const validationError = displayName.length > 0 && !validation.isValid ? validation.error : null
  const canSubmit = validation.isValid && selectedThemes.length === 3

  async function handleSubmit() {
    if (!canSubmit || isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      await completeOnboarding(userId, displayName, selectedThemes)
      resetFeed()
      router.push('/feed?toast=google')
    } catch {
      setError('Gagal nyimpen. Coba lagi ya.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100dvh-8rem)] lg:min-h-dvh flex flex-col items-center justify-center p-4 lg:p-6">
      <div className="bg-card border-2 border-(--color-card-stroke) shadow-[4px_4px_0px_0px_var(--color-shadow)] w-full max-w-[490px] lg:w-[430px] lg:max-w-none p-6 space-y-5">

        {/* Avatar + name input */}
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt="Avatar" className="h-14 w-14 border-2 border-border shrink-0" />
          <div className="flex-1">
            <label htmlFor="onboardingName" className="font-mono text-xs text-muted-foreground block mb-1">
              Nama lo (bisa diganti)
            </label>
            <input
              id="onboardingName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={DISPLAY_NAME_MAX_LENGTH}
              placeholder="e.g. Andi"
              className="w-full bg-background border-2 border-border px-3 py-2 font-sans text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {validationError && (
              <p className="text-secondary font-mono text-xs mt-1.5 leading-relaxed">{validationError}</p>
            )}
          </div>
        </div>

        <div className="border-t-2 border-border/20 pt-4 space-y-1">
          <h2 className="font-sans font-bold text-xl">Satu langkah lagi!</h2>
          <p className="font-mono text-sm text-muted-foreground">
            Pilih 3 topik yang bikin lo penasaran biar feed lo gak random.
          </p>
        </div>

        <ThemePicker selected={selectedThemes} onChange={setSelectedThemes} />

        {error && <p className="font-mono text-sm text-secondary">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`${BUTTON_PRESS} w-full bg-primary text-primary-foreground font-mono font-bold py-3 border-2 border-border disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? 'Bentar...' : 'Mulai Gabutin!'}
        </button>
      </div>
    </div>
  )
}
