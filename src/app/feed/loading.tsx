import { Skeleton } from '@/components/Skeleton'

const FEED_SKELETON_KEYS = ['feed-s1', 'feed-s2', 'feed-s3', 'feed-s4'] as const

export default function FeedLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
      {/* Card skeleton */}
      <div className="w-full max-w-[490px] lg:w-[430px] border-2 border-border overflow-hidden">
        <Skeleton className="aspect-3/1 lg:h-48 w-full" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <div className="space-y-2 pt-2">
            {FEED_SKELETON_KEYS.map((key) => (
              <Skeleton key={key} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
