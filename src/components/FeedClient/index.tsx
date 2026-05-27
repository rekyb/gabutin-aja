'use client'
import { useState, useEffect, useRef, type FC } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { CardFact } from '@/components/Card/CardFact'
import { CardQuestion } from '@/components/Card/CardQuestion'
import { CardResult } from '@/components/Card/CardResult'
import { CardSkeleton } from '@/components/CardSkeleton'
import { AchievementToast } from '@/components/AchievementToast'
import { ReEngagementCard } from '@/components/ReEngagementCard'
import { useFeedStore } from '@/store/feedStore'

const SWIPE_THRESHOLD = 80
const SLIDE_MS = 240

function scrollableAncestor(target: EventTarget | null, root: HTMLElement | null): HTMLElement | null {
  let el = target as HTMLElement | null
  while (el && el !== root) {
    const { overflowY } = window.getComputedStyle(el)
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) return el
    el = el.parentElement
  }
  return null
}

const FeedClient: FC = () => {
  const {
    phase, card, response, achievements, showReEngagement,
    historyIndex, userId, wasTimeout,
    init, loadCard, goToPrev, goToNext, answerCard,
    setPhase, dismissAchievement, dismissReEngagement,
  } = useFeedStore()

  const [slideOffset, setSlideOffset] = useState(0)
  const [slideAnimated, setSlideAnimated] = useState(true)

  const outerRef = useRef<HTMLDivElement>(null)
  const navigatingRef = useRef(false)
  const touchStartY = useRef<number | null>(null)
  const phaseRef = useRef(phase)
  const navUpRef = useRef<() => void>(() => {})
  const navDownRef = useRef<() => void>(() => {})

  phaseRef.current = phase

  // Init once — skip if already loaded (user returning from another route)
  useEffect(() => {
    if (historyIndex === -1) init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Wheel listener — non-passive to allow preventDefault
  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      if (phaseRef.current === 'loading') return
      const inner = scrollableAncestor(e.target, el)
      if (inner) {
        const atTop = inner.scrollTop <= 0
        const atBottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 1
        if (e.deltaY < 0 && !atTop) return
        if (e.deltaY > 0 && !atBottom) return
      }
      e.preventDefault()
      if (e.deltaY < 0) navUpRef.current()
      else navDownRef.current()
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  function animateNav(direction: 'up' | 'down', doNav: () => void) {
    if (navigatingRef.current) return
    navigatingRef.current = true

    setSlideAnimated(true)
    setSlideOffset(direction === 'down' ? -105 : 105)

    setTimeout(() => {
      doNav()
      setSlideAnimated(false)
      setSlideOffset(direction === 'down' ? 105 : -105)

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSlideAnimated(true)
          setSlideOffset(0)
          setTimeout(() => { navigatingRef.current = false }, SLIDE_MS)
        })
      })
    }, SLIDE_MS)
  }

  function handleNavUp() {
    if (navigatingRef.current || historyIndex <= 0 || phaseRef.current === 'loading') return
    animateNav('up', () => goToPrev())
  }

  function handleNavDown() {
    if (navigatingRef.current || phaseRef.current === 'loading') return
    animateNav('down', () => { void goToNext() })
  }

  navUpRef.current = handleNavUp
  navDownRef.current = handleNavDown

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartY.current === null) return
    const delta = touchStartY.current - e.changedTouches[0].clientY
    touchStartY.current = null
    if (Math.abs(delta) < SWIPE_THRESHOLD) return
    if (delta > 0) handleNavDown()
    else handleNavUp()
  }

  if (showReEngagement) {
    return (
      <div className="h-[calc(100dvh-8rem)] lg:h-dvh flex flex-col items-center justify-center p-4 lg:p-6 overflow-hidden">
        <ReEngagementCard
          onSave={() => { dismissReEngagement(); void loadCard(userId) }}
          onDismiss={() => { dismissReEngagement(); void loadCard(userId) }}
        />
      </div>
    )
  }

  return (
    <div
      ref={outerRef}
      className="w-full h-[calc(100dvh-8rem)] lg:h-dvh flex flex-col items-center p-4 lg:p-6 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="w-full flex-1 min-h-0 flex flex-col items-center"
        style={{
          transform: `translateY(${slideOffset}vh)`,
          transition: slideAnimated ? `transform ${SLIDE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)` : 'none',
        }}
      >
        {phase === 'loading' && <CardSkeleton />}
        {phase === 'fact' && card && (
          <CardFact card={card} onReady={() => setPhase('question')} />
        )}
        {phase === 'question' && card && (
          <CardQuestion card={card} onAnswer={(i) => void answerCard(i, false)} onExpire={() => void answerCard(null, true)} />
        )}
        {phase === 'result' && card && response && (
          <CardResult card={card} response={response} onNext={() => animateNav('down', () => { void goToNext() })} wasTimeout={wasTimeout} />
        )}
      </div>

      {achievements.map((a, i) => (
        <AchievementToast
          key={`${a.key}-${i}`}
          achievement={a}
          onDismiss={() => dismissAchievement(i)}
        />
      ))}

      {phase !== 'loading' && (
        <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col gap-2 z-40">
          <button
            onClick={handleNavUp}
            disabled={historyIndex <= 0}
            aria-label="Fakta sebelumnya"
            className="border-2 border-border bg-sidebar p-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-card transition-colors"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <button
            onClick={handleNavDown}
            aria-label="Fakta berikutnya"
            className="border-2 border-border bg-sidebar p-2 hover:bg-card transition-colors"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default FeedClient
