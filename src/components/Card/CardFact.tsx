'use client'
import { useEffect, type FC } from 'react'
import { ExternalLink } from 'lucide-react'
import { WikipediaImage } from '@/components/WikipediaImage'
import { CARD_BASE, BUTTON_PRESS } from '@/lib/design-tokens'
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
    <div className="min-h-[calc(100dvh-8rem)] lg:min-h-[calc(100dvh-4rem)] flex items-center justify-center p-4 lg:p-6">
      <div className={`${CARD_BASE} w-full max-w-[490px] lg:w-[430px] min-h-[480px] flex flex-col justify-between`}>
        <div className="flex flex-col min-[481px]:flex-row gap-5 w-full">
          <div className="w-full h-[130px] min-[481px]:w-[130px] min-[481px]:h-[180px] shrink-0 overflow-hidden bg-muted border-2 border-(--color-card-stroke) shadow-[2px_2px_0px_0px_var(--color-shadow)]">
            <WikipediaImage sourceUrl={card.sourceUrl} className="w-full h-full" />
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <div className="border-b-2 border-(--color-card-stroke) pb-2 font-mono text-xs font-bold uppercase text-muted-foreground">
              FAKTA
            </div>

            <p className="font-sans text-base leading-relaxed text-foreground flex-1">
              {card.fact}
            </p>

            <a
              href={card.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-primary underline underline-offset-2"
            >
              <ExternalLink className="h-3 w-3" />
              Sumber Wikipedia
            </a>

            <div className="flex justify-end">
              <button
                onClick={onReady}
                className={`${BUTTON_PRESS} bg-primary text-primary-foreground font-mono font-bold py-2.5 px-5 border-2 border-border`}
              >
                Siap Dites!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
