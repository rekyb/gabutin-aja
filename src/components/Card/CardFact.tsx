'use client'
import { useEffect, type FC } from 'react'
import { ChevronRight } from 'lucide-react'
import { CardShell } from '@/components/CardShell'
import { BUTTON_PRESS } from '@/lib/design-tokens'
import type { CardDoc } from '@/types'

export interface CardFactProps {
  card: CardDoc
  onReady: () => void
}

export const CardFact: FC<CardFactProps> = ({ card, onReady }) => {
  useEffect(() => {
    const timer = setTimeout(onReady, 5000)
    return () => clearTimeout(timer)
  }, [card, onReady])

  return (
    <CardShell
      sourceUrl={card.sourceUrl}
      action={
        <button
          onClick={onReady}
          className={`${BUTTON_PRESS} w-full bg-primary text-primary-foreground font-mono font-bold py-3 border-2 border-border`}
        >
          Siap Dites! <ChevronRight className="inline h-4 w-4" />
        </button>
      }
    >
      <p className="font-serif italic text-base leading-relaxed">{card.fact}</p>
      <a
        href={card.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-mono text-muted-foreground underline block"
      >
        Sumber Wikipedia
      </a>
    </CardShell>
  )
}
