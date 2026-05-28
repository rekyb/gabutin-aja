'use client'
import { useState, useEffect, type FC } from 'react'
import {
  Sparkles,
  X,
  Check,
  Flame,
} from 'lucide-react'
import { CardShell } from '@/components/CardShell'
import { CircularTimer } from '@/components/CircularTimer'
import { WikipediaImage } from '@/components/WikipediaImage'
import { submitAnswer } from '@/app/actions/answer'
import { getUniqueUserId } from '@/lib/guest-state'
import { useFeedStore } from '@/store/feedStore'
import type { CardDoc } from '@/types'
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

const themeHandles: Record<string, string> = {
  sejarah_indonesia: '@sejarah_indo',
  sains: '@sains_gabut',
  pop_culture: '@pop_cult',
  geografi: '@geografi_id',
  matematika: '@matem_gabut',
  psikologi: '@psiko_logi',
  sejarah_dunia: '@sejarah_dunia',
  coding_tech: '@coding_tech',
  tutorial: '@tutor_id',
}

const themeDisplayNames: Record<string, string> = {
  sejarah_indonesia: 'Sejarah Indonesia',
  sains: 'Sains & Teknologi',
  pop_culture: 'Pop Culture',
  geografi: 'Geografi',
  matematika: 'Matematika',
  psikologi: 'Psikologi',
  sejarah_dunia: 'Sejarah Dunia',
  coding_tech: 'Coding & Tech',
  tutorial: 'Tutorial',
}

export const FeedCard: FC<FeedCardProps> = ({ card }) => {
  const [timeLeft, setTimeLeft] = useState(10)
  const [userId, setUserId] = useState('')
  const [streak, setStreak] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const appendAchievements = useFeedStore((s) => s.appendAchievements)
  const cardStates = useFeedStore((s) => s.cardStates)
  const updateCardState = useFeedStore((s) => s.updateCardState)

  const cardState = cardStates[card._id] ?? {
    phase: 'fact' as const,
    selectedAnswer: null,
    response: null,
    wasTimeout: false,
  }
  const { phase, response, wasTimeout } = cardState

  const displayNameLabel = themeDisplayNames[card.theme] ?? 'Gabutin Theme'

  const articleTitle = (() => {
    try {
      const parts = card.sourceUrl.split('/wiki/')
      if (parts.length > 1) {
        return decodeURIComponent(parts[1]).replaceAll('_', ' ')
      }
    } catch {}
    return displayNameLabel
  })()

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
    try {
      const res = await submitAnswer(userId, card._id, index)
      setStreak(res.newStreak)
      if (res.newAchievements && res.newAchievements.length > 0) {
        appendAchievements(res.newAchievements)
      }
      updateCardState(card._id, {
        phase: 'result',
        selectedAnswer: index,
        response: res,
        wasTimeout: isTimeout,
      })
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

  // Result card border overrides (desktop uses normal X post bottom border instead)
  const isCorrect = response?.result === 'correct'
  const isWrong = response?.result === 'wrong'
  const isSkip = response?.result === 'skip'

  let borderClass: string = BORDER_SKIP
  if (isCorrect) borderClass = BORDER_CORRECT
  if (isWrong) borderClass = BORDER_WRONG

  return (
    <>
      {/* ───────────────────────────────────────────────────────────────────────
          MOBILE VIEW (Instagram Card Vibe — UNCHANGED)
          ─────────────────────────────────────────────────────────────────────── */}
      <div className="lg:hidden w-full shrink-0">
        {phase === 'fact' && (
          <CardShell
            sourceUrl={card.sourceUrl}
            action={
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => updateCardState(card._id, { phase: 'question' })}
                  className={`${BUTTON_PRESS} bg-transparent text-primary font-mono font-bold text-xs px-6 py-2 border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150 cursor-pointer`}
                >
                  Kuis!
                </button>
              </div>
            }
          >
            <h3 className="font-sans font-black text-lg text-foreground mb-1 uppercase tracking-wide">
              {articleTitle}
            </h3>
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
        )}

        {phase === 'question' && (
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
            <div className="bg-card border-2 border-(--color-card-stroke) p-5 min-h-20 shadow-[2px_2px_0px_0px_var(--color-shadow)] flex items-center">
              <p className="font-sans font-bold text-xl leading-snug w-full">{card.question}</p>
            </div>

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
        )}

        {phase === 'result' && response && (
          <CardShell sourceUrl={card.sourceUrl} borderOverride={borderClass}>
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
            </div>

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

              <div className="border-l-4 border-border/40 pl-4 py-1">
                <p className="font-serif italic text-base leading-relaxed text-foreground/90">
                  &ldquo;{card.explanation}&rdquo;
                </p>
              </div>

              {/* Wikipedia Link */}
              <div className="pt-2">
                <a
                  href={card.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-muted-foreground underline block"
                >
                  Sumber Wikipedia
                </a>
              </div>
            </div>
          </CardShell>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          DESKTOP VIEW (X/Twitter Post Vibe — NEW)
          ─────────────────────────────────────────────────────────────────────── */}
      <div
        className={`hidden lg:block w-full border-b border-border p-6 hover:bg-neutral-900/10 transition-all duration-300 shrink-0 ${
          phase === 'result' ? 'lg:opacity-60 hover:opacity-100' : ''
        }`}
      >
        {/* Right Column: Post Body */}
        <div className="w-full space-y-3 text-left">
          
          {/* Header Actions & Meta */}
          <div className="flex items-center justify-between text-sm pb-1 border-b border-border/10">
            <span className="font-sans font-extrabold text-foreground">{articleTitle}</span>
          </div>

          {/* STATE 1: Fact Post */}
          {phase === 'fact' && (
            <div className="space-y-4">
              {/* Fact Caption */}
              <p className="font-serif italic text-base leading-relaxed text-foreground/90">
                {card.fact}
              </p>

              {/* Wikipedia Image Post Attachment */}
              <div className="aspect-16/10 border-2 border-border overflow-hidden relative w-full bg-sidebar">
                <WikipediaImage sourceUrl={card.sourceUrl} className="w-full h-full object-cover" />
              </div>

              {/* Action Bar (Wikipedia Link + Outlined Kuis! button) */}
              <div className="flex items-center justify-between pt-2">
                <a
                  href={card.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-muted-foreground underline hover:text-primary transition-colors cursor-pointer"
                >
                  Sumber Wikipedia
                </a>
                <button
                  onClick={() => updateCardState(card._id, { phase: 'question' })}
                  className={`${BUTTON_PRESS} bg-transparent text-primary font-mono font-bold text-xs px-5 py-1.5 border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150 cursor-pointer`}
                >
                  Kuis!
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: Interactive Question */}
          {phase === 'question' && (
            <div className="space-y-4">
              
              {/* Header inside right column */}
              <div className="flex items-center justify-between border-b-2 border-border pb-3">
                <CircularTimer timeLeft={timeLeft} />
                <span className="flex items-center gap-1 font-mono font-bold text-xs text-foreground">
                  Streak: {streak}
                  <Flame className="h-4 w-4 text-secondary fill-secondary" />
                </span>
              </div>

              {/* Question Text */}
              <div className="bg-card border-2 border-(--color-card-stroke) p-5 min-h-20 shadow-[2px_2px_0px_0px_var(--color-shadow)] flex items-center">
                <p className="font-sans font-bold text-lg leading-snug w-full">{card.question}</p>
              </div>

              {/* Stacked Options */}
              <div className="space-y-2">
                {card.options.map((option, i) => (
                  <button
                    key={`opt-${option}`}
                    onClick={() => handleSubmit(i, false)}
                    disabled={isSubmitting}
                    className={`${MCQ_OPTION} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 cursor-pointer text-sm`}
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
            </div>
          )}

          {/* STATE 3: Quiz Feedback Result */}
          {phase === 'result' && response && (
            <div className="space-y-4">
              
              {/* Header metadata */}
              <div className="flex justify-between items-center pb-2 border-b border-border/20">
                {isCorrect && (
                  <>
                    <span className="font-sans font-black text-sm text-primary flex items-center gap-1.5 uppercase">
                      <Check className="h-4 w-4 stroke-3" /> BENAR!
                    </span>
                    <span className="font-sans font-extrabold text-sm text-primary tracking-wide">
                      +{response.xpDelta} XP
                    </span>
                  </>
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
              </div>

              {/* Result Details */}
              <div className="space-y-3">
                {isCorrect && (
                  <p className="font-sans font-bold text-base text-foreground flex items-center gap-2">
                    Nah bener! Menyala ilmu lo!{' '}
                    <Sparkles className="h-4 w-4 text-accent fill-accent animate-pulse" />
                  </p>
                )}
                {isWrong && (
                  <p className="font-sans font-bold text-base text-foreground">Salah woi! Baca dulu nih</p>
                )}
                {isSkip && (
                  <p className="font-sans font-bold text-base text-foreground">
                    {wasTimeout ? 'Waktunya habis! Yuk fokus dikit' : 'Yahh di-skip'}
                  </p>
                )}

                {/* Wikipedia Image attachment inside result phase */}
                <div className="aspect-16/10 border-2 border-border overflow-hidden relative w-full bg-sidebar my-3">
                  <WikipediaImage sourceUrl={card.sourceUrl} className="w-full h-full object-cover" />
                </div>

                {/* Explanation text */}
                <div className="py-1">
                  <p className="font-serif italic text-sm leading-relaxed text-foreground/90">
                    &ldquo;{card.explanation}&rdquo;
                  </p>
                </div>

                {/* Wikipedia Link */}
                <div className="pt-2">
                  <a
                    href={card.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-muted-foreground underline hover:text-primary transition-colors cursor-pointer block"
                  >
                    Sumber Wikipedia
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
