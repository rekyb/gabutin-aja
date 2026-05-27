'use client'
import type { FC } from 'react'
import { CARD_BASE, BUTTON_PRESS } from '@/lib/design-tokens'

export interface ReEngagementCardProps {
  onSave: () => void
  onDismiss: () => void
}

export const ReEngagementCard: FC<ReEngagementCardProps> = ({ onSave, onDismiss }) => (
  <div className={`${CARD_BASE} max-w-md space-y-4`}>
    <p className="font-sans font-bold text-base leading-snug">
      Lo udah jawab 15+ soal. Jangan sampe ilang — simpan progress lo dalam 10 detik.
    </p>
    <div className="flex gap-3">
      <button
        onClick={onSave}
        className={`${BUTTON_PRESS} bg-primary text-primary-foreground font-mono font-bold px-4 py-2 border-2 border-border flex-1`}
      >
        Simpan Progress
      </button>
      <button
        onClick={onDismiss}
        className={`${BUTTON_PRESS} bg-background text-foreground font-mono px-4 py-2 border-2 border-border`}
      >
        Ntar deh →
      </button>
    </div>
  </div>
)
