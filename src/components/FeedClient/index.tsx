'use client'
import { useState, useEffect, useRef, type FC } from 'react'
import { getNextCard } from '@/app/actions/feed'
import { submitAnswer } from '@/app/actions/answer'
import { CardFact } from '@/components/Card/CardFact'
import { CardQuestion } from '@/components/Card/CardQuestion'
import { CardResult } from '@/components/Card/CardResult'
import { CardSkeleton } from '@/components/CardSkeleton'
import { AchievementToast } from '@/components/AchievementToast'
import { ReEngagementCard } from '@/components/ReEngagementCard'
import type { CardDoc, SubmitAnswerResponse, AchievementDef } from '@/types'

type FeedState = 'loading' | 'fact' | 'question' | 'result'

const SWIPE_THRESHOLD = 50

function readUserId(): string {
  try {
    const parsed = JSON.parse(localStorage.getItem('gabutin_user') ?? '{}') as { uniqueUserId?: string }
    return parsed.uniqueUserId ?? 'guest'
  } catch {
    return 'guest'
  }
}

function checkReEngagement(): boolean {
  try {
    const parsed = JSON.parse(localStorage.getItem('gabutin_user') ?? '{}') as {
      guestOnly?: boolean
      guestCardCount?: number
      guestReEngagementShownAt?: number
    }
    if (!parsed.guestOnly || (parsed.guestCardCount ?? 0) < 15) return false
    return Date.now() - (parsed.guestReEngagementShownAt ?? 0) > 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

const FeedClient: FC = () => {
  const [userId, setUserId] = useState('')
  const [state, setState] = useState<FeedState>('loading')
  const [card, setCard] = useState<CardDoc | null>(null)
  const [response, setResponse] = useState<SubmitAnswerResponse | null>(null)
  const [achievements, setAchievements] = useState<AchievementDef[]>([])
  const [showReEngagement, setShowReEngagement] = useState(false)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => { setUserId(readUserId()) }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (userId) loadCard(userId) }, [userId])

  function loadCard(uid: string) {
    if (checkReEngagement()) { setShowReEngagement(true); return }
    setState('loading')
    getNextCard(uid)
      .then((next) => { if (next) { setCard(next); setState('fact') } })
      .catch(() => {})
  }

  async function handleAnswer(selectedIndex: number | null) {
    if (!card || !userId) return
    setState('loading')
    try {
      const res = await submitAnswer(userId, card._id, selectedIndex)
      setResponse(res)
      if (res.newAchievements.length > 0) setAchievements((prev) => [...prev, ...res.newAchievements])
      setState('result')
    } catch {}
  }

  function handleNext() {
    setResponse(null)
    loadCard(userId)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartY.current === null || state !== 'result') { touchStartY.current = null; return }
    if (touchStartY.current - e.changedTouches[0].clientY >= SWIPE_THRESHOLD) handleNext()
    touchStartY.current = null
  }

  if (showReEngagement) {
    return (
      <div className="min-h-[calc(100dvh-8rem)] lg:min-h-[calc(100dvh-4rem)] flex items-center justify-center p-4 lg:p-6">
        <ReEngagementCard
          onSave={() => { setShowReEngagement(false); loadCard(userId) }}
          onDismiss={() => { setShowReEngagement(false); loadCard(userId) }}
        />
      </div>
    )
  }

  return (
    <div className="w-full" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {state === 'loading' && (
        <div className="min-h-[calc(100dvh-8rem)] lg:min-h-[calc(100dvh-4rem)] flex items-center justify-center p-4 lg:p-6">
          <CardSkeleton />
        </div>
      )}
      {state === 'fact' && card && (
        <CardFact card={card} onReady={() => setState('question')} />
      )}
      {state === 'question' && card && (
        <CardQuestion card={card} onAnswer={handleAnswer} onExpire={() => handleAnswer(null)} />
      )}
      {state === 'result' && card && response && (
        <div className="min-h-[calc(100dvh-8rem)] lg:min-h-[calc(100dvh-4rem)] flex items-center justify-center p-4 lg:p-6">
          <CardResult card={card} response={response} onNext={handleNext} />
        </div>
      )}
      {achievements.map((a, i) => (
        <AchievementToast
          key={`${a.key}-${i}`}
          achievement={a}
          onDismiss={() => setAchievements((prev) => prev.filter((_, j) => j !== i))}
        />
      ))}
    </div>
  )
}

export default FeedClient
