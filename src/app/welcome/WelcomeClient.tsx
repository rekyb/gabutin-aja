'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, BookOpen } from 'lucide-react'
import { ThemePicker } from '@/components/ThemePicker'
import { createUser } from '@/app/actions/user'
import { generateUniqueUserId } from '@/utils/user-id'
import { getUniqueUserId, setUniqueUserId, setGuestOnly } from '@/lib/guest-state'
import { CARD_BASE, MCQ_OPTION, BUTTON_PRESS, BORDER_CORRECT, BORDER_WRONG } from '@/lib/design-tokens'
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
    if (!getUniqueUserId()) {
      setUniqueUserId(generateUniqueUserId())
    }
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

  if (phase === 'tutorial') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
        <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
          <BookOpen className="h-4 w-4" />
          Tutorial {cardIndex + 1} / {TUTORIAL_CARDS.length}
        </div>

        {cardPhase === 'fact' && (
          <div className={`${CARD_BASE} max-w-md w-full space-y-4`}>
            <p className="font-serif italic text-base leading-relaxed">{card.fact}</p>
            <a
              href={card.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-muted-foreground underline"
            >
              Sumber Wikipedia
            </a>
            <button
              onClick={() => setCardPhase('question')}
              className={`${BUTTON_PRESS} w-full bg-primary text-primary-foreground font-mono font-bold py-3 border-2 border-border`}
            >
              Mulai Menjawab <ChevronRight className="inline h-4 w-4" />
            </button>
          </div>
        )}

        {cardPhase === 'question' && (
          <div className={`${CARD_BASE} max-w-md w-full space-y-4`}>
            <p className="font-sans font-bold text-base">{card.question}</p>
            <div className="space-y-2">
              {card.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerSelect(i)}
                  className={MCQ_OPTION}
                >
                  <span className="font-mono text-muted-foreground mr-2">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {cardPhase === 'result' && selectedAnswer !== null && (
          <div
            className={`${CARD_BASE} max-w-md w-full space-y-4 ${
              selectedAnswer === card.correctIndex ? BORDER_CORRECT : BORDER_WRONG
            }`}
          >
            <p className="font-sans font-bold text-base">
              {selectedAnswer === card.correctIndex ? '✓ Bener!' : '✗ Salah'}
            </p>
            <p className="font-mono text-sm text-muted-foreground">
              Jawaban: <span className="text-foreground font-bold">{card.options[card.correctIndex]}</span>
            </p>
            <button
              onClick={handleNext}
              className={`${BUTTON_PRESS} w-full bg-primary text-primary-foreground font-mono font-bold py-3 border-2 border-border`}
            >
              {cardIndex < TUTORIAL_CARDS.length - 1 ? 'Kartu Berikutnya' : 'Lihat Hasilnya'}{' '}
              <ChevronRight className="inline h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    )
  }

  if (phase === 'decision') {
    const uid = getUniqueUserId() ?? ''
    const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${uid}`

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
        <div className={`${CARD_BASE} max-w-md w-full space-y-5 text-center`}>
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

  // register phase
  const uid = getUniqueUserId() ?? ''
  const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${uid}`
  const canSubmit = displayName.trim().length >= 1 && displayName.trim().length <= 30 && selectedThemes.length === 3

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
      <div className={`${CARD_BASE} max-w-md w-full space-y-5`}>
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
