'use client'
import type { FC } from 'react'
import { ArrowUp } from 'lucide-react'
import { BUTTON_PRESS } from '@/lib/design-tokens'

export interface CardNextProps {
  onNext: () => void
}

export const CardNext: FC<CardNextProps> = ({ onNext }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-8">
    <button
      onClick={onNext}
      className={`${BUTTON_PRESS} bg-primary text-primary-foreground font-mono font-bold py-2.5 px-5 border-2 border-border flex items-center gap-1.5`}
    >
      Lanjut →
    </button>
    <p className="font-mono text-xs text-muted-foreground flex items-center gap-1">
      <ArrowUp className="h-3.5 w-3.5" />
      atau swipe ke atas
    </p>
  </div>
)
