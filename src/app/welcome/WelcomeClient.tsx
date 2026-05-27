'use client'
import { useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, BookOpen, X, Check, Flame, Sparkles } from 'lucide-react'
import { ThemePicker } from '@/components/ThemePicker'
import { WikipediaImage } from '@/components/WikipediaImage'
import { createUser } from '@/app/actions/user'
import { generateUniqueUserId } from '@/utils/user-id'
import { getUniqueUserId, setUniqueUserId, setGuestOnly, setGuestProgress } from '@/lib/guest-state'
import { MCQ_OPTION, BUTTON_PRESS, BORDER_CORRECT, BORDER_WRONG } from '@/lib/design-tokens'
import { CircularTimer } from '@/components/CircularTimer'
import type { ThemeName } from '@/types'
import { validateDisplayName, DISPLAY_NAME_MAX_LENGTH } from '@/utils/validators'

interface TutorialCard {
  fact: string
  sourceUrl: string
  question: string
  options: string[]
  correctIndex: number
}

const TUTORIAL_CARDS: TutorialCard[] = [
  {
    fact: 'Indonesia adalah negara kepulauan terbesar di dunia dengan lebih dari 17.000 pulau yang membentang sepanjang 5.000 km dari barat ke timur.',
    sourceUrl: 'https://id.wikipedia.org/wiki/Indonesia',
    question: 'Berapa perkiraan jumlah pulau di Indonesia?',
    options: ['Lebih dari 5.000', 'Lebih dari 10.000', 'Lebih dari 17.000', 'Lebih dari 25.000'],
    correctIndex: 2,
  },
  {
    fact: 'Borobudur adalah candi Buddha terbesar di dunia yang dibangun pada abad ke-9 oleh Dinasti Syailendra di Jawa Tengah.',
    sourceUrl: 'https://id.wikipedia.org/wiki/Borobudur',
    question: 'Borobudur dibangun oleh dinasti apa?',
    options: ['Mataram', 'Majapahit', 'Syailendra', 'Sriwijaya'],
    correctIndex: 2,
  },
  {
    fact: 'Bahasa Indonesia ditetapkan sebagai bahasa persatuan saat Sumpah Pemuda pada 28 Oktober 1928 — bukan saat kemerdekaan 1945.',
    sourceUrl: 'https://id.wikipedia.org/wiki/Sumpah_Pemuda',
    question: 'Kapan Bahasa Indonesia ditetapkan sebagai bahasa persatuan?',
    options: ['17 Agustus 1945', '1 Juni 1945', '28 Oktober 1928', '20 Mei 1908'],
    correctIndex: 2,
  },
]

type Phase = 'tutorial' | 'decision' | 'register'
type CardPhase = 'fact' | 'question' | 'result'

// ─── Phone-frame card shell ──────────────────────────────────────────────────
// Mobile : 4:3 image stacked above content, max-w-md
// Desktop: portrait phone frame (390px wide, ~100dvh tall), image fills top 45%,
//          content panel occupies bottom 55%. Action button is always pinned to
//          the bottom of the content panel, outside the scrollable body area.
function CardShell({
  sourceUrl,
  borderOverride,
  progress,
  action,
  timer,
  streakSlot,
  className,
  hideImage,
  children,
}: Readonly<{
  sourceUrl: string
  borderOverride?: string
  progress?: ReactNode
  action?: ReactNode
  timer?: ReactNode
  streakSlot?: ReactNode
  className?: string
  hideImage?: boolean
  children: ReactNode
}>) {
  const border = borderOverride ?? 'border-2 border-[var(--color-card-stroke)] shadow-[4px_4px_0px_0px_var(--color-shadow)]'
  const hasHeader = timer || streakSlot
  return (
    <div
      className={[
        'bg-sidebar overflow-hidden flex flex-col',
        border,
        'w-full max-w-[490px] flex-1 min-h-0',
        'lg:w-[430px] lg:max-w-none lg:max-h-[820px]',
        className ?? '',
      ].join(' ')}
    >
      {/* Image — hidden when hideImage is true */}
      <div className={`${hideImage ? 'hidden' : ''} aspect-3/1 lg:aspect-auto lg:h-[45%] shrink-0 overflow-hidden relative`}>
        <WikipediaImage sourceUrl={sourceUrl} className="w-full h-full" />

        {progress && (
          <div className="absolute top-3 left-3 hidden lg:flex items-center gap-1.5 bg-black/60 px-2 py-1">
            {progress}
          </div>
        )}
      </div>

      {/* Content panel: scrollable body + pinned action */}
      <div className="flex-1 lg:h-[55%] flex flex-col overflow-hidden p-6 gap-4">
        {/* Timer + streak header row */}
        {hasHeader && (
          <div className="shrink-0 flex items-center justify-between border-b-2 border-border pb-4">
            <div>{timer ?? <div />}</div>
            <div>{streakSlot ?? <div />}</div>
          </div>
        )}
        {/* Scrollable body — grows, scrolls if content overflows */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4">{children}</div>
        {/* Action button — always pinned to bottom */}
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export function WelcomeClient() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('tutorial')
  const [cardIndex, setCardIndex] = useState(0)
  const [cardPhase, setCardPhase] = useState<CardPhase>('fact')
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [selectedThemes, setSelectedThemes] = useState<ThemeName[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [tutorialXp, setTutorialXp] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)

  const XP_PER_CORRECT = 10

  useEffect(() => {
    if (!getUniqueUserId()) setUniqueUserId(generateUniqueUserId())
  }, [])

  useEffect(() => {
    if (cardPhase !== 'question') return
    setTimeLeft(10)
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval)
          setStreak(0)
          setSelectedAnswer(-1)
          setCardPhase('result')
          return 0
        }
        return prev - 0.1
      })
    }, 100)
    return () => clearInterval(interval)
  }, [cardPhase, cardIndex])

  const card = TUTORIAL_CARDS[cardIndex]

  // Feedback badge definition to avoid nested ternary operations in JSX rendering
  let feedbackBadge: ReactNode = null
  if (selectedAnswer === card.correctIndex) {
    feedbackBadge = (
      <span className="font-sans font-black text-sm text-primary flex items-center gap-1.5 uppercase">
        <Check className="h-4 w-4 stroke-3" /> BENAR!
      </span>
    )
  } else if (selectedAnswer === -1) {
    feedbackBadge = (
      <span className="font-sans font-black text-sm text-secondary flex items-center gap-1.5 uppercase">
        <X className="h-4 w-4 stroke-3" /> WAKTU HABIS!
      </span>
    )
  } else if (selectedAnswer !== null) {
    feedbackBadge = (
      <span className="font-sans font-black text-sm text-secondary flex items-center gap-1.5 uppercase">
        <X className="h-4 w-4 stroke-3" /> SALAH!
      </span>
    )
  }

  function handleAnswerSelect(index: number) {
    if (cardPhase !== 'question') return
    setSelectedAnswer(index)
    if (index === card.correctIndex) {
      setStreak((s) => s + 1)
      setTutorialXp((xp) => xp + XP_PER_CORRECT)
    } else {
      setStreak(0)
    }
    setCardPhase('result')
  }

  function handleNext() {
    if (cardIndex < TUTORIAL_CARDS.length - 1) {
      setCardIndex((i) => i + 1)
      setCardPhase('fact')
      setSelectedAnswer(null)
    } else {
      setPhase('decision')
    }
  }

  async function handleRegister() {
    const uid = getUniqueUserId()
    const validation = validateDisplayName(displayName)
    if (!uid || !validation.isValid || selectedThemes.length !== 3) return
    setIsSubmitting(true)
    setError(null)
    try {
      await createUser(displayName.trim(), selectedThemes, uid, tutorialXp, streak)
      router.push('/feed')
    } catch {
      setError('Gagal menyimpan. Coba lagi.')
      setIsSubmitting(false)
    }
  }

  function handleSkip() {
    setGuestOnly()
    setGuestProgress({ xp: tutorialXp, currentStreak: streak, totalAnswers: cardIndex + 1 })
    router.push('/feed')
  }

  // Progress badge content — used on mobile (outside card) and desktop (overlaid)
  const progressBadge = (
    <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground lg:text-white">
      <BookOpen className="h-3.5 w-3.5" />
      Tutorial {cardIndex + 1} / {TUTORIAL_CARDS.length}
    </span>
  )

  // ── Tutorial phase ─────────────────────────────────────────────────────────
  if (phase === 'tutorial') {
    return (
      // Full-height centering on desktop, normal scroll on mobile
      <div className="h-[calc(100dvh-8rem)] lg:h-dvh flex flex-col items-center justify-center gap-4 p-4 lg:p-6 overflow-hidden">
        {/* Mobile-only progress indicator (desktop version is overlaid on image) */}
        <div className="lg:hidden">{progressBadge}</div>

        {cardPhase === 'fact' && (
          <CardShell
            sourceUrl={card.sourceUrl}
            progress={progressBadge}
            action={
              <button
                onClick={() => setCardPhase('question')}
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
        )}

        {cardPhase === 'question' && (
          <CardShell
            sourceUrl={card.sourceUrl}
            progress={progressBadge}
            hideImage
            timer={<CircularTimer timeLeft={timeLeft} />}
            streakSlot={
              <span className="flex items-center gap-1.5 font-mono font-bold text-sm text-foreground">
                Streak: {streak}
                <Flame className="h-4 w-4 text-secondary fill-secondary" />
              </span>
            }
          >
            <div className="bg-card border-2 border-(--color-card-stroke) p-6 min-h-48 shadow-[2px_2px_0px_0px_var(--color-shadow)] flex items-center justify-center">
              <p className="font-sans font-bold text-xl leading-snug w-full text-left">{card.question}</p>
            </div>
            <div className="space-y-2">
              {card.options.map((option, i) => (
                <button key={`opt-${option}`} onClick={() => handleAnswerSelect(i)} className={MCQ_OPTION}>
                  <span className="font-mono text-muted-foreground mr-2">
                    {String.fromCodePoint(65 + i)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </CardShell>
        )}

        {cardPhase === 'result' && selectedAnswer !== null && (
          <CardShell
            sourceUrl={card.sourceUrl}
            progress={progressBadge}
            borderOverride={selectedAnswer === card.correctIndex ? BORDER_CORRECT : BORDER_WRONG}
            action={
              <button
                onClick={handleNext}
                className={`${BUTTON_PRESS} w-full bg-transparent text-primary font-mono font-bold py-3 border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-colors`}
              >
                {cardIndex < TUTORIAL_CARDS.length - 1 ? 'Gaskeun!' : 'Lanjutin'}{' '}
                <ChevronRight className="inline h-4 w-4" />
              </button>
            }
          >
            {/* Top header bar */}
            <div className="flex justify-between items-center pb-2 border-b-2 border-border/20 font-mono text-xs mb-4">
              {feedbackBadge}
              <span className="font-sans font-bold text-foreground flex items-center gap-1">
                Streak: <Flame className="h-4 w-4 text-secondary fill-secondary" /> {streak}
              </span>
            </div>

            {/* Score Delta & Text section */}
            <div className="space-y-4">
              {selectedAnswer === card.correctIndex ? (
                <>
                  <p className="font-sans font-extrabold text-3xl text-primary tracking-wide">
                    +3 XP
                  </p>
                  <p className="font-sans font-bold text-lg text-foreground flex items-center gap-2">
                    Nah bener! Menyala ilmu lo! <Sparkles className="h-5 w-5 text-accent fill-accent" />
                  </p>
                </>
              ) : (
                <p className="font-sans font-bold text-lg text-foreground">
                  Salah woi! Baca dulu nih
                </p>
              )}

              {/* Blockquote with explanation */}
              <div className="border-l-4 border-border/40 pl-4 py-1">
                <p className="font-serif italic text-base leading-relaxed text-foreground/90">
                  "{card.fact}"
                </p>
              </div>
            </div>
          </CardShell>
        )}
      </div>
    )
  }

  // ── Decision phase ─────────────────────────────────────────────────────────
  if (phase === 'decision') {
    const uid = getUniqueUserId() ?? ''
    const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${uid}`
    return (
      <div className="h-[calc(100dvh-8rem)] lg:h-dvh flex flex-col items-center justify-center p-4 lg:p-6 overflow-hidden">
        <div className="bg-sidebar border-2 border-(--color-card-stroke) shadow-[4px_4px_0px_0px_var(--color-shadow)] w-full max-w-[490px] lg:w-[430px] lg:max-w-none p-6 space-y-5 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt="Avatar" className="h-20 w-20 mx-auto border-2 border-border" />
          <h2 className="font-sans font-bold text-xl">Simpan progress lo?</h2>
          <p className="font-mono text-sm text-muted-foreground">
            Lo udah selesain tutorial! Kalau lo daftar sekarang, progress lo tersimpan dan bisa
            dilanjut kapanpun.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setPhase('register')}
              className={`${BUTTON_PRESS} w-full bg-primary text-primary-foreground font-mono font-bold py-3 border-2 border-border`}
            >
              Simpan &amp; Daftar
            </button>
            <button
              onClick={handleSkip}
              className="font-mono text-sm text-muted-foreground underline"
            >
              Main sebagai tamu dulu
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Register phase ─────────────────────────────────────────────────────────
  const uid = getUniqueUserId() ?? ''
  const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${uid}`
  
  const validation = validateDisplayName(displayName)
  const validationError = displayName.length > 0 && !validation.isValid ? validation.error : null
  
  const canSubmit =
    validation.isValid && selectedThemes.length === 3

  return (
    <div className="min-h-screen lg:h-screen flex flex-col items-center justify-center p-4 lg:p-6">
      <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_var(--color-shadow)] w-full max-w-[490px] lg:w-[430px] lg:max-w-none p-6 space-y-5">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt="Avatar" className="h-14 w-14 border-2 border-border shrink-0" />
          <div className="flex-1">
            <label htmlFor="displayNameInput" className="font-mono text-xs text-muted-foreground block mb-1">
              Nama lo (wajib)
            </label>
            <input
              id="displayNameInput"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={DISPLAY_NAME_MAX_LENGTH}
              placeholder="e.g. Andi"
              className="w-full bg-background border-2 border-border px-3 py-2 font-sans text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {validationError && (
              <p className="text-secondary font-mono text-xs mt-1.5 leading-relaxed">
                {validationError}
              </p>
            )}
          </div>
        </div>

        <ThemePicker selected={selectedThemes} onChange={setSelectedThemes} />

        {error && <p className="font-mono text-sm text-secondary">{error}</p>}

        <button
          onClick={handleRegister}
          disabled={!canSubmit || isSubmitting}
          className={`${BUTTON_PRESS} w-full bg-primary text-primary-foreground font-mono font-bold py-3 border-2 border-border disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? 'Menyimpan...' : 'Mulai Gabutin →'}
        </button>
      </div>
    </div>
  )
}
