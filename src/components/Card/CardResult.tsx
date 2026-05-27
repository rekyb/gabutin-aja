'use client'
import type { FC } from 'react'
import { Sparkles, X, Check, Flame } from 'lucide-react'
import { CardShell } from '@/components/CardShell'
import { BUTTON_PRESS, BORDER_CORRECT, BORDER_WRONG, BORDER_SKIP } from '@/lib/design-tokens'
import type { CardDoc, SubmitAnswerResponse } from '@/types'

export interface CardResultProps {
  card: CardDoc
  response: SubmitAnswerResponse
  onNext: () => void
  wasTimeout?: boolean
}

export const CardResult: FC<CardResultProps> = ({ card, response, onNext, wasTimeout = false }) => {
  const isCorrect = response.result === 'correct'
  const isWrong = response.result === 'wrong'
  const isSkip = response.result === 'skip'

  let borderClass: string = BORDER_SKIP
  if (isCorrect) borderClass = BORDER_CORRECT
  if (isWrong) borderClass = BORDER_WRONG

  return (
    <CardShell
      sourceUrl={card.sourceUrl}
      borderOverride={borderClass}
      action={
        <button
          onClick={onNext}
          className={`${BUTTON_PRESS} w-full bg-transparent text-primary font-mono font-bold py-3 border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-1.5`}
        >
          Lanjut
        </button>
      }
    >
      <div className="flex justify-between items-center pb-3 border-b-2 border-border/20">
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
            <X className="h-4 w-4 stroke-3" /> {wasTimeout ? 'TIMEOUT!' : 'SKIP!'}
          </span>
        )}
        <span className="font-sans font-bold text-foreground flex items-center gap-1">
          Streak: <Flame className="h-4 w-4 text-secondary fill-secondary" /> {response.newStreak}
        </span>
      </div>

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
          <p className="font-sans font-bold text-lg text-foreground">Salah woi! Baca dulu nih</p>
        )}
        {isSkip && (
          <p className="font-sans font-bold text-lg text-foreground">
            {wasTimeout ? 'Waktunya habis! Yuk fokus dikit' : 'Yahh di-skip'}
          </p>
        )}
        <div className="border-l-4 border-border/40 pl-4 py-1">
          <p className="font-serif italic text-base leading-relaxed text-foreground/90">
            &ldquo;{card.explanation}&rdquo;
          </p>
        </div>
      </div>
    </CardShell>
  )
}
