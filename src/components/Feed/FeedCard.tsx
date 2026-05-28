'use client'
import { useState, useEffect, type FC } from 'react'
import { Sparkles, X, Check, Flame } from 'lucide-react'
import { CardShell } from '@/components/CardShell'
import { CircularTimer } from '@/components/CircularTimer'
import { submitAnswer } from '@/app/actions/answer'
import { getUniqueUserId } from '@/lib/guest-state'
import { useFeedStore } from '@/store/feedStore'
import type { CardDoc, SubmitAnswerResponse } from '@/types'
import {
  BUTTON_PRESS,
  MCQ_OPTION,
  BORDER_CORRECT,
  BORDER_WRONG,
  BORDER_SKIP,
} from '@/lib/design-tokens'

export interface FeedCardProps {
  card: CardDoc
}

type CardPhase = 'fact' | 'question' | 'result'

export const FeedCard: FC<FeedCardProps> = ({ card }) => {
  const [phase, setPhase] = useState<CardPhase>('fact')
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [response, setResponse] = useState<SubmitAnswerResponse | null>(null)
  const [wasTimeout, setWasTimeout] = useState(false)
  const [userId, setUserId] = useState('')
  const [streak, setStreak] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const appendAchievements = useFeedStore((s) => s.appendAchievements)

  // 1. Resolve userId and streak on mount
  useEffect(() => {
    const uid = getUniqueUserId() ?? 'guest'
    setUserId(uid)
    try {
      const savedUser = localStorage.getItem('gabutin_user')
      if (savedUser) {
        const parsed = JSON.parse(savedUser) as { currentStreak?: number }
        if (typeof parsed.currentStreak === 'number') {
          setStreak(parsed.currentStreak)
        }
      }
    } catch {}
  }, [])

  // 2. Countdown timer effect during Quiz Question phase
  useEffect(() => {
    if (phase !== 'question') return
    setTimeLeft(10)
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval)
          handleExpire()
          return 0
        }
        return prev - 0.1
      })
    }, 100)
    return () => clearInterval(interval)
  }, [phase])

  // 3. Actions
  async function handleSubmit(index: number | null, isTimeout = false) {
    if (!userId || isSubmitting) return
    setIsSubmitting(true)
    setSelectedAnswer(index)
    setWasTimeout(isTimeout)
    try {
      const res = await submitAnswer(userId, card._id, index)
      setResponse(res)
      setStreak(res.newStreak)
      if (res.newAchievements && res.newAchievements.length > 0) {
        appendAchievements(res.newAchievements)
      }
      setPhase('result')
    } catch (err) {
      console.error('[FeedCard] submit answer failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleExpire() {
    handleSubmit(null, true).catch(() => {})
  }

  function handleSkip() {
    handleSubmit(null, false).catch(() => {})
  }

  // 4. State-based layouts
  if (phase === 'fact') {
    return (
      <CardShell
        sourceUrl={card.sourceUrl}
        naturalHeight
        action={
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setPhase('question')}
              className={`${BUTTON_PRESS} bg-primary border-2 border-border font-mono font-bold text-xs px-6 py-2 text-primary-foreground transition-all cursor-pointer`}
            >
              Kuis!
            </button>
          </div>
        }
      >
        <p className="font-serif italic text-base leading-relaxed text-foreground/90">
          {card.fact}
        </p>
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

  if (phase === 'question') {
    return (
      <CardShell
        sourceUrl={card.sourceUrl}
        naturalHeight
        hideImage
        timer={<CircularTimer timeLeft={timeLeft} />}
        streakSlot={
          <span className="flex items-center gap-1.5 font-mono font-bold text-sm text-foreground">
            Streak: {streak}
            <Flame className="h-4 w-4 text-secondary fill-secondary" />
          </span>
        }
      >
        {/* Question Panel */}
        <div className="bg-card border-2 border-(--color-card-stroke) p-5 min-h-[5rem] shadow-[2px_2px_0px_0px_var(--color-shadow)] flex items-center">
          <p className="font-sans font-bold text-xl leading-snug w-full">{card.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {card.options.map((option, i) => (
            <button
              key={`opt-${option}`}
              onClick={() => handleSubmit(i, false)}
              disabled={isSubmitting}
              className={`${MCQ_OPTION} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 cursor-pointer`}
            >
              <span className="font-mono text-muted-foreground mr-2">
                {String.fromCodePoint(65 + i)}.
              </span>
              {option}
            </button>
          ))}
        </div>

        {/* Skip button */}
        <div className="flex">
          <button
            onClick={handleSkip}
            disabled={isSubmitting}
            className={`${BUTTON_PRESS} text-muted-foreground font-mono text-xs border border-border px-3 py-1.5 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center gap-1 cursor-pointer disabled:opacity-50`}
          >
            Skip
          </button>
        </div>
      </CardShell>
    )
  }

  if (phase === 'result' && response) {
    const isCorrect = response.result === 'correct'
    const isWrong = response.result === 'wrong'
    const isSkip = response.result === 'skip'

    let borderClass: string = BORDER_SKIP
    if (isCorrect) borderClass = BORDER_CORRECT
    if (isWrong) borderClass = BORDER_WRONG

    return (
      <CardShell sourceUrl={card.sourceUrl} naturalHeight borderOverride={borderClass}>
        {/* Header Indicator */}
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

        {/* Results text details */}
        <div className="space-y-4">
          {isCorrect && (
            <>
              <p className="font-sans font-extrabold text-3xl text-primary tracking-wide">
                +{response.xpDelta} XP
              </p>
              <p className="font-sans font-bold text-lg text-foreground flex items-center gap-2">
                Nah bener! Menyala ilmu lo!{' '}
                <Sparkles className="h-5 w-5 text-accent fill-accent animate-pulse" />
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

          {/* Fact Explanation blockquote */}
          <div className="border-l-4 border-border/40 pl-4 py-1">
            <p className="font-serif italic text-base leading-relaxed text-foreground/90">
              &ldquo;{card.explanation}&rdquo;
            </p>
          </div>
        </div>
      </CardShell>
    )
  }

  return null
}
