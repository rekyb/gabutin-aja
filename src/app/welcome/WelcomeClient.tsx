'use client'
import { useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, BookOpen } from 'lucide-react'
import { ThemePicker } from '@/components/ThemePicker'
import { WikipediaImage } from '@/components/WikipediaImage'
import { createUser } from '@/app/actions/user'
import { generateUniqueUserId } from '@/utils/user-id'
import { getUniqueUserId, setUniqueUserId, setGuestOnly } from '@/lib/guest-state'
import { MCQ_OPTION, BUTTON_PRESS, BORDER_CORRECT, BORDER_WRONG } from '@/lib/design-tokens'
import type { ThemeName } from '@/types'

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
  children,
}: {
  sourceUrl: string
  borderOverride?: string
  progress?: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  const border = borderOverride ?? 'border-2 border-border shadow-[4px_4px_0px_0px_black]'
  return (
    <div
      className={[
        'bg-card overflow-hidden flex flex-col',
        border,
        'w-full max-w-md',
        'lg:w-[390px] lg:max-w-none lg:h-[calc(100dvh-4rem)] lg:max-h-[820px]',
      ].join(' ')}
    >
      {/* Image — 4:3 on mobile, top 45% on desktop */}
      <div className="aspect-[4/3] lg:aspect-auto lg:h-[45%] shrink-0 overflow-hidden relative">
        <WikipediaImage sourceUrl={sourceUrl} className="w-full h-full" />

        {progress && (
          <div className="absolute top-3 left-3 hidden lg:flex items-center gap-1.5 bg-black/60 px-2 py-1">
            {progress}
          </div>
        )}
      </div>

      {/* Content panel: scrollable body + pinned action */}
      <div className="flex-1 lg:h-[55%] flex flex-col overflow-hidden p-6 gap-4">
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

  useEffect(() => {
    if (!getUniqueUserId()) setUniqueUserId(generateUniqueUserId())
  }, [])

  const card = TUTORIAL_CARDS[cardIndex]

  function handleAnswerSelect(index: number) {
    if (cardPhase !== 'question') return
    setSelectedAnswer(index)
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
    if (!uid || !displayName.trim() || selectedThemes.length !== 3) return
    setIsSubmitting(true)
    setError(null)
    try {
      await createUser(displayName.trim(), selectedThemes, uid)
      router.push('/feed')
    } catch {
      setError('Gagal menyimpan. Coba lagi.')
      setIsSubmitting(false)
    }
  }

  function handleSkip() {
    setGuestOnly()
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
      <div className="min-h-screen lg:h-screen flex flex-col items-center justify-center gap-4 p-4 lg:p-6">
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
                Mulai Menjawab <ChevronRight className="inline h-4 w-4" />
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
          <CardShell sourceUrl={card.sourceUrl} progress={progressBadge}>
            <p className="font-sans font-bold text-base">{card.question}</p>
            <div className="space-y-2">
              {card.options.map((option, i) => (
                <button key={i} onClick={() => handleAnswerSelect(i)} className={MCQ_OPTION}>
                  <span className="font-mono text-muted-foreground mr-2">
                    {String.fromCharCode(65 + i)}.
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
                className={`${BUTTON_PRESS} w-full bg-primary text-primary-foreground font-mono font-bold py-3 border-2 border-border`}
              >
                {cardIndex < TUTORIAL_CARDS.length - 1 ? 'Kartu Berikutnya' : 'Lihat Hasilnya'}{' '}
                <ChevronRight className="inline h-4 w-4" />
              </button>
            }
          >
            <p className="font-sans font-bold text-base">
              {selectedAnswer === card.correctIndex ? '✓ Bener!' : '✗ Salah'}
            </p>
            <p className="font-mono text-sm text-muted-foreground">
              Jawaban:{' '}
              <span className="text-foreground font-bold">{card.options[card.correctIndex]}</span>
            </p>
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
      <div className="min-h-screen lg:h-screen flex flex-col items-center justify-center p-4 lg:p-6">
        <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_black] w-full max-w-md lg:w-[390px] lg:max-w-none p-6 space-y-5 text-center">
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
  const canSubmit =
    displayName.trim().length >= 1 && displayName.trim().length <= 30 && selectedThemes.length === 3

  return (
    <div className="min-h-screen lg:h-screen flex flex-col items-center justify-center p-4 lg:p-6">
      <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_black] w-full max-w-md lg:w-[390px] lg:max-w-none p-6 space-y-5">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt="Avatar" className="h-14 w-14 border-2 border-border shrink-0" />
          <div className="flex-1">
            <label className="font-mono text-xs text-muted-foreground block mb-1">
              Nama lo (wajib)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={30}
              placeholder="e.g. Andi"
              className="w-full bg-background border-2 border-border px-3 py-2 font-sans text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
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
