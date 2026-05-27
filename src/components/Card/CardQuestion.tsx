'use client'
import { useState, useEffect, type FC } from 'react'
import { Flame, ArrowRight } from 'lucide-react'
import { CardShell } from '@/components/CardShell'
import { CircularTimer } from '@/components/CircularTimer'
import { MCQ_OPTION, BUTTON_PRESS } from '@/lib/design-tokens'
import type { CardDoc } from '@/types'

export interface CardQuestionProps {
  card: CardDoc
  onAnswer: (selectedIndex: number | null) => void
  onExpire: () => void
}

export const CardQuestion: FC<CardQuestionProps> = ({ card, onAnswer, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(10)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('gabutin_user')
      if (savedUser) {
        const parsed = JSON.parse(savedUser) as { currentStreak?: number }
        if (typeof parsed.currentStreak === 'number') setStreak(parsed.currentStreak)
      }
    } catch {}
  }, [card])

  useEffect(() => {
    setTimeLeft(10)
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) { clearInterval(interval); onExpire(); return 0 }
        return prev - 0.1
      })
    }, 100)
    return () => clearInterval(interval)
  }, [card, onExpire])

  return (
    <CardShell
      sourceUrl={card.sourceUrl}
      hideImage
      timer={<CircularTimer timeLeft={timeLeft} />}
      streakSlot={
        <span className="flex items-center gap-1.5 font-mono font-bold text-sm text-foreground">
          Streak: {streak}
          <Flame className="h-4 w-4 text-secondary fill-secondary" />
        </span>
      }
    >
      <div className="bg-card border-2 border-(--color-card-stroke) p-5 min-h-[5rem] shadow-[2px_2px_0px_0px_var(--color-shadow)] flex items-center">
        <p className="font-sans font-bold text-xl leading-snug w-full">{card.question}</p>
      </div>

      <div className="space-y-2">
        {card.options.map((option, i) => (
          <button
            key={`opt-${option}`}
            onClick={() => onAnswer(i)}
            className={`${MCQ_OPTION} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
          >
            <span className="font-mono text-muted-foreground mr-2">{String.fromCodePoint(65 + i)}.</span>
            {option}
          </button>
        ))}
      </div>

      <button
        onClick={() => onAnswer(null)}
        className={`${BUTTON_PRESS} text-muted-foreground font-mono text-xs border border-border px-3 py-1.5 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center gap-1`}
      >
        Skip <ArrowRight className="h-3 w-3" />
      </button>
    </CardShell>
  )
}
