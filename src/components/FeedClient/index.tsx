'use client'
import { useEffect, useRef, useState, type FC } from 'react'
import { FeedCard } from '@/components/Feed/FeedCard'
import { CardSkeleton } from '@/components/CardSkeleton'
import { AchievementToast } from '@/components/AchievementToast'
import { ReEngagementCard } from '@/components/ReEngagementCard'
import { useFeedStore } from '@/store/feedStore'

export const FeedClient: FC = () => {
  const [hasMounted, setHasMounted] = useState(false)

  const {
    cards,
    achievements,
    showReEngagement,
    isLoadingMore,
    init,
    loadMoreCards,
    dismissAchievement,
    dismissReEngagement,
  } = useFeedStore()

  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 1. Initialise feed list once on mount
  useEffect(() => {
    init()
    setHasMounted(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2. Set up IntersectionObserver for infinite scrolling / lazy loading
  useEffect(() => {
    const trigger = loadMoreRef.current
    if (!trigger) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMoreCards().catch(() => {})
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(trigger)
    return () => {
      observer.unobserve(trigger)
    }
  }, [isLoadingMore, loadMoreCards])

  // 3. Render ReEngagement overlay if triggered
  if (hasMounted && showReEngagement) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 lg:p-6 bg-background">
        <ReEngagementCard
          onSave={() => {
            dismissReEngagement()
            init()
          }}
          onDismiss={() => {
            dismissReEngagement()
            init()
          }}
        />
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center bg-background min-h-screen">
      
      {/* Scrollable Feed List */}
      <div className="w-full max-w-[490px] lg:max-w-[720px] lg:w-[720px] flex flex-col gap-6 lg:gap-0 px-4 lg:px-0 py-8 lg:py-0 lg:border-x-2 lg:border-border lg:min-h-screen lg:bg-sidebar">
        
        {/* Render Multiple Cards */}
        {(hasMounted ? cards : []).map((card, index) => (
          <FeedCard key={`${card._id}-${index}`} card={card} />
        ))}

        {/* Loading Skeletons */}
        {isLoadingMore && <CardSkeleton />}

        {/* Infinite Scroll Load Trigger */}
        <div ref={loadMoreRef} className="h-10 w-full shrink-0" />
      </div>

      {/* Global Achievement Toasts */}
      {(hasMounted ? achievements : []).map((achievement, index) => (
        <AchievementToast
          key={`${achievement.key}-${index}`}
          achievement={achievement}
          onDismiss={() => dismissAchievement(index)}
        />
      ))}
      
    </div>
  )
}

export default FeedClient
