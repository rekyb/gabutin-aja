'use client'
import type { FC } from 'react'
import { ArrowRight, Sparkles, X, Check, Flame } from 'lucide-react'
import { WikipediaImage } from '@/components/WikipediaImage'
import {
  CARD_BASE,
  BUTTON_PRESS,
  BORDER_CORRECT,
  BORDER_WRONG,
  BORDER_SKIP,
} from '@/lib/design-tokens'
import type { CardDoc, SubmitAnswerResponse } from '@/types'

export interface CardResultProps {
  card: CardDoc
  response: SubmitAnswerResponse
  onNext: () => void
}

export const CardResult: FC<CardResultProps> = ({ card, response, onNext }) => {
  const isCorrect = response.result === 'correct'
  const isWrong = response.result === 'wrong'
  const isSkip = response.result === 'skip'

  let borderClass: string = BORDER_SKIP
  if (isCorrect) borderClass = BORDER_CORRECT
  if (isWrong) borderClass = BORDER_WRONG

  return (
    <div className={`${CARD_BASE} ${borderClass} w-full max-w-[490px] lg:w-[430px] min-h-[480px] flex flex-col justify-between transition-all duration-200`}>
      <div className="flex flex-col min-[481px]:flex-row gap-5 w-full">
        {/* Media section */}
        <div className="w-full h-[130px] min-[481px]:w-[130px] min-[481px]:h-[180px] shrink-0 overflow-hidden bg-muted border-2 border-(--color-card-stroke) shadow-[2px_2px_0px_0px_var(--color-shadow)]">
          <WikipediaImage sourceUrl={card.sourceUrl} className="w-full h-full" />
        </div>

        {/* Content section */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-4">
          <div>
            {/* Top header bar */}
            <div className="flex justify-between items-center pb-2 border-b-2 border-border/20 font-mono text-xs mb-4">
              {isCorrect && (
                <span className="font-sans font-black text-sm text-primary flex items-center gap-1.5 uppercase">
                  <Check className="h-4 w-4 stroke-3" /> BENAR!
                </span>
              )}
              {isWrong && (
                <span className="font-sans font-black text-sm text-secondary flex items-center gap-1.5 uppercase">
                  <X className="h-4 w-4 stroke-3" /> SALAH!
                </span>
              )}
              {isSkip && (
                <span className="font-sans font-black text-sm text-muted-foreground flex items-center gap-1.5 uppercase">
                  <X className="h-4 w-4 stroke-3" /> SKIP!
                </span>
              )}
              <span className="font-sans font-bold text-foreground flex items-center gap-1">
                Streak: <Flame className="h-4 w-4 text-secondary fill-secondary" /> {response.newStreak}
              </span>
            </div>

            {/* Score Delta & Text section */}
            <div className="space-y-4">
              {isCorrect && (
                <>
                  <p className="font-sans font-extrabold text-3xl text-primary tracking-wide">
                    +{response.xpDelta} XP
                  </p>
                  <p className="font-sans font-bold text-lg text-foreground flex items-center gap-2">
                    Nah bener! Menyala ilmu lo! <Sparkles className="h-5 w-5 text-accent fill-accent" />
                  </p>
                </>
              )}
              {isWrong && (
                <p className="font-sans font-bold text-lg text-foreground">
                  Salah woi! Baca dulu nih
                </p>
              )}
              {isSkip && (
                <p className="font-sans font-bold text-lg text-foreground">
                  Waktunya habis! Yuk fokus dikit
                </p>
              )}

              {/* Blockquote with explanation */}
              <div className="border-l-4 border-border/40 pl-4 py-1">
                <p className="font-serif italic text-base leading-relaxed text-foreground/90">
                  "{card.explanation}"
                </p>
              </div>
            </div>
          </div>

          {/* Footer action button */}
          <div className="flex justify-end mt-2">
            <button
              onClick={onNext}
              className={`${BUTTON_PRESS} bg-primary text-primary-foreground font-mono font-bold py-2.5 px-5 border-2 border-border flex items-center gap-1.5`}
            >
              Lanjut <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
