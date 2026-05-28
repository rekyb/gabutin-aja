'use client'
import { useEffect, useRef, type FC } from 'react'
import { FeedCard } from '@/components/Feed/FeedCard'
import { CardSkeleton } from '@/components/CardSkeleton'
import { AchievementToast } from '@/components/AchievementToast'
import { ReEngagementCard } from '@/components/ReEngagementCard'
import { useFeedStore } from '@/store/feedStore'

export const FeedClient: FC = () => {
  const {
    cards,
    achievements,
    showReEngagement,
    isLoadingMore,
    userId,
    init,
    loadMoreCards,
    dismissAchievement,
    dismissReEngagement,
  } = useFeedStore()

  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 1. Initialise feed list once on mount
  useEffect(() => {
    init()
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
  if (showReEngagement) {
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
      <div className="w-full max-w-[490px] lg:w-[430px] flex flex-col gap-6 px-4 py-8">
        
        {/* Render Multiple Cards */}
        {cards.map((card, index) => (
          <FeedCard key={`${card._id}-${index}`} card={card} />
        ))}

        {/* Loading Skeletons */}
        {isLoadingMore && <CardSkeleton />}

        {/* Infinite Scroll Load Trigger */}
        <div ref={loadMoreRef} className="h-10 w-full shrink-0" />
      </div>

      {/* Global Achievement Toasts */}
      {achievements.map((achievement, index) => (
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
