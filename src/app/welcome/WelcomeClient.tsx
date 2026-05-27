'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, X, Check, Flame, Sparkles } from 'lucide-react'
import { ThemePicker } from '@/components/ThemePicker'
import { createUser } from '@/app/actions/user'
import { generateUniqueUserId } from '@/utils/user-id'
import { getUniqueUserId, setUniqueUserId } from '@/lib/guest-state'
import { MCQ_OPTION, BUTTON_PRESS, BORDER_CORRECT, BORDER_WRONG, BORDER_SKIP } from '@/lib/design-tokens'
import { CircularTimer } from '@/components/CircularTimer'
import { CardShell } from '@/components/CardShell'
import type { ThemeName } from '@/types'
import { validateDisplayName, DISPLAY_NAME_MAX_LENGTH } from '@/utils/validators'
import { useFeedStore } from '@/store/feedStore'
import { useToastStore } from '@/store/toastStore'

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

const SLIDE_MS = 240

function FeedbackBadge({ selected, correct }: { readonly selected: number | null; readonly correct: number }) {
  if (selected === correct) return (
    <span className="font-sans font-black text-sm text-primary flex items-center gap-1.5 uppercase">
      <Check className="h-4 w-4 stroke-3" /> BENAR!
    </span>
  )
  if (selected === -1) return (
    <span className="font-sans font-black text-sm text-muted-foreground flex items-center gap-1.5 uppercase">
      <X className="h-4 w-4 stroke-3" /> TIMEOUT!
    </span>
  )
  if (selected === -2) return (
    <span className="font-sans font-black text-sm text-muted-foreground flex items-center gap-1.5 uppercase">
      <X className="h-4 w-4 stroke-3" /> SKIP!
    </span>
  )
  if (selected !== null) return (
    <span className="font-sans font-black text-sm text-secondary flex items-center gap-1.5 uppercase">
      <X className="h-4 w-4 stroke-3" /> SALAH!
    </span>
  )
  return null
}

function ResultMessage({ selected, correct }: { readonly selected: number; readonly correct: number }) {
  if (selected === correct) return (
    <>
      <p className="font-sans font-extrabold text-3xl text-primary tracking-wide">+3 XP</p>
      <p className="font-sans font-bold text-lg text-foreground flex items-center gap-2">
        Nah bener! Menyala ilmu lo! <Sparkles className="h-5 w-5 text-accent fill-accent" />
      </p>
    </>
  )
  if (selected === -1) return <p className="font-sans font-bold text-lg text-foreground">Waktunya habis! Yuk fokus dikit</p>
  if (selected === -2) return <p className="font-sans font-bold text-lg text-foreground">Di-skip nih! Jangan kebiasaan ya</p>
  return <p className="font-sans font-bold text-lg text-foreground">Salah woi! Baca dulu nih</p>
}

// ─── Main component ──────────────────────────────────────────────────────────
export function WelcomeClient() {
  const router = useRouter()
  const resetFeed = useFeedStore((s) => s.reset)
  const showToast = useToastStore((s) => s.show)
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

  const [slideOffset, setSlideOffset] = useState(0)
  const [slideAnimated, setSlideAnimated] = useState(true)
  const navigatingRef = useRef(false)

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

  function handleSkipQuestion() {
    if (cardPhase !== 'question') return
    setStreak(0)
    setSelectedAnswer(-2)
    setCardPhase('result')
  }

  function completeTransition() {
    setSlideAnimated(true)
    setSlideOffset(0)
    setTimeout(() => { navigatingRef.current = false }, SLIDE_MS)
  }

  function animateTransition(doNav: () => void) {
    if (navigatingRef.current) return
    navigatingRef.current = true
    setSlideAnimated(true)
    setSlideOffset(-105)
    setTimeout(() => {
      doNav()
      setSlideAnimated(false)
      setSlideOffset(105)
      requestAnimationFrame(() => requestAnimationFrame(completeTransition))
    }, SLIDE_MS)
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
      resetFeed()
      showToast(`Halo ${displayName.trim()}! Selamat gabut bareng kita`)
      router.refresh()
      router.push('/feed')
    } catch {
      setError('Gagal menyimpan. Coba lagi.')
      setIsSubmitting(false)
    }
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
      <div className="h-[calc(100dvh-8rem)] lg:h-dvh flex flex-col items-center p-4 lg:p-6 overflow-hidden">
        {/* Mobile-only progress indicator (desktop version is overlaid on image) */}
        <div className="lg:hidden mb-4">{progressBadge}</div>

        <div
          className="w-full flex-1 min-h-0 flex flex-col items-center justify-center"
          style={{
            transform: `translateY(${slideOffset}vh)`,
            transition: slideAnimated ? `transform ${SLIDE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)` : 'none',
          }}
        >

        {cardPhase === 'fact' && (
          <CardShell
            sourceUrl={card.sourceUrl}
            progress={progressBadge}
            action={
              <button
                onClick={() => setCardPhase('question')}
                className={`${BUTTON_PRESS} w-full bg-primary text-primary-foreground font-mono font-bold py-3 border-2 border-border`}
              >
                Kuis!
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

            <button
              onClick={handleSkipQuestion}
              className={`${BUTTON_PRESS} text-muted-foreground font-mono text-xs border border-border px-3 py-1.5 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
            >
              Skip
            </button>
          </CardShell>
        )}

        {cardPhase === 'result' && selectedAnswer !== null && (
          <CardShell
            sourceUrl={card.sourceUrl}
            progress={progressBadge}
            borderOverride={selectedAnswer === card.correctIndex ? BORDER_CORRECT : (selectedAnswer === -1 || selectedAnswer === -2) ? BORDER_SKIP : BORDER_WRONG}
            action={
              <button
                onClick={() => animateTransition(handleNext)}
                className={`${BUTTON_PRESS} w-full bg-transparent text-primary font-mono font-bold py-3 border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-colors`}
              >
                Lanjut
              </button>
            }
          >
            {/* Top header bar */}
            <div className="flex justify-between items-center pb-2 border-b-2 border-border/20 font-mono text-xs mb-4">
              <FeedbackBadge selected={selectedAnswer} correct={card.correctIndex} />
              <span className="font-sans font-bold text-foreground flex items-center gap-1">
                Streak: <Flame className="h-4 w-4 text-secondary fill-secondary" /> {streak}
              </span>
            </div>

            <div className="space-y-4">
              <ResultMessage selected={selectedAnswer} correct={card.correctIndex} />

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
              onClick={() => { globalThis.location.href = `/api/auth/google?guest_uid=${uid}` }}
              className={`${BUTTON_PRESS} w-full bg-white text-black font-mono font-bold py-3 border-2 border-border flex items-center justify-center`}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Masuk pake Google
            </button>

            <button
              onClick={() => setPhase('register')}
              className={`${BUTTON_PRESS} w-full bg-transparent text-primary font-mono font-bold py-3 border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-colors`}
            >
              Jadi tamu aja
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

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border/40"></div>
          <span className="flex-shrink mx-4 text-xs font-mono text-muted-foreground">ATAU</span>
          <div className="flex-grow border-t border-border/40"></div>
        </div>

        <button
          onClick={() => { globalThis.location.href = `/api/auth/google?guest_uid=${uid}` }}
          className={`${BUTTON_PRESS} w-full bg-white text-black font-mono font-bold py-3 border-2 border-border flex items-center justify-center`}
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Masuk dengan Google
        </button>
      </div>
    </div>
  )
}
