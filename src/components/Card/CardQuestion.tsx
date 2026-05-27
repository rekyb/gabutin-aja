'use client'
import { useState, useEffect, type FC } from 'react'
import { Brain, Flame, ArrowRight } from 'lucide-react'
import { WikipediaImage } from '@/components/WikipediaImage'
import {
  CARD_BASE,
  MCQ_OPTION,
  BUTTON_PRESS,
  TIMER_BAR_TRACK,
  TIMER_BAR_FILL,
} from '@/lib/design-tokens'
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
        const parsed = JSON.parse(savedUser)
        if (typeof parsed?.currentStreak === 'number') {
          setStreak(parsed.currentStreak)
        }
      }
    } catch {
      // Graceful fallback
    }
  }, [card])

  useEffect(() => {
    setTimeLeft(10)
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval)
          onExpire()
          return 0
        }
        return prev - 0.1
      })
    }, 100)

    return () => clearInterval(interval)
  }, [card, onExpire])

  return (
    <div className="min-h-[calc(100dvh-8rem)] lg:min-h-[calc(100dvh-4rem)] flex items-center justify-center p-4 lg:p-6">
    <div className={`${CARD_BASE} w-full max-w-[490px] lg:w-[430px] min-h-[480px] flex flex-col justify-between transition-all duration-200`}>
      <div className="flex flex-col min-[481px]:flex-row gap-5 w-full">
        {/* Media section */}
        <div className="w-full h-[130px] min-[481px]:w-[130px] min-[481px]:h-[180px] shrink-0 overflow-hidden bg-muted border-2 border-(--color-card-stroke) shadow-[2px_2px_0px_0px_var(--color-shadow)]">
          <WikipediaImage sourceUrl={card.sourceUrl} className="w-full h-full" />
        </div>

        {/* Content section */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Timer bar */}
            <div className={`${TIMER_BAR_TRACK} border border-(--color-card-stroke) relative overflow-hidden mb-2`}>
              <div
                className={`${TIMER_BAR_FILL} transition-[width] duration-100 ease-linear`}
                style={{ width: `${(timeLeft / 10) * 100}%` }}
              />
            </div>

            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-(--color-card-stroke) pb-2 mb-4 font-mono text-xs">
              <span className="font-bold uppercase text-primary flex items-center gap-1">
                <Brain className="h-4 w-4" /> SOAL
              </span>
              <span className="font-bold text-muted-foreground">
                {Math.ceil(timeLeft)}s
              </span>
            </div>

            {/* Question Text */}
            <h2 className="font-sans font-bold text-base mb-4 leading-relaxed text-foreground">
              {card.question}
            </h2>

            {/* Option buttons */}
            <div className="flex flex-col gap-3 my-4">
              {card.options.map((option, i) => (
                <button
                  key={`opt-${option}`}
                  onClick={() => onAnswer(i)}
                  className={`${MCQ_OPTION} flex justify-between items-center font-bold text-sm ${BUTTON_PRESS} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                >
                  <span>{option}</span>
                  <span className="font-mono text-xs opacity-35">
                    {String.fromCodePoint(65 + i)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={() => onAnswer(null)}
              className={`border-2 border-(--color-card-stroke) py-1.5 px-3 bg-card font-bold text-xs ${BUTTON_PRESS} hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center gap-1`}
            >
              Skip <ArrowRight className="h-3 w-3" />
            </button>
            <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-secondary animate-pulse" />
              Streak: {streak}
            </span>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
