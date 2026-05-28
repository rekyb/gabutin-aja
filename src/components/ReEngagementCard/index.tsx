'use client'
import type { FC } from 'react'
import { CARD_BASE } from '@/lib/design-tokens'
import { Button } from '@/components/Button'

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
      <Button
        onClick={onSave}
        variant="primary"
        className="flex-1"
      >
        Simpan Progress
      </Button>
      <Button
        onClick={onDismiss}
        variant="outline"
        className="bg-background text-foreground border-border hover:bg-muted hover:text-foreground"
      >
        Ntar deh →
      </Button>
    </div>
  </div>
)

