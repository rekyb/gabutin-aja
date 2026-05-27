import type { FC } from 'react'
import { CARD_BASE } from '@/lib/design-tokens'
import { Skeleton } from '@/components/Skeleton'

const OPTIONS_SKELETON_KEYS = ['opt-s1', 'opt-s2', 'opt-s3', 'opt-s4'] as const

export const CardSkeleton: FC = () => {
  return (
    <div className={`${CARD_BASE} w-full max-w-[490px] lg:w-[430px] min-h-[480px] flex flex-col justify-between transition-all duration-200`}>
      <div className="flex flex-col min-[481px]:flex-row gap-5 w-full">
        {/* Media Block Skeleton */}
        <div className="w-full h-[130px] min-[481px]:w-[130px] min-[481px]:h-[180px] shrink-0 bg-muted border-2 border-(--color-card-stroke) shadow-[2px_2px_0px_0px_var(--color-shadow)] overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Content Section Skeleton */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Timer bar skeleton */}
            <div className="h-1.5 w-full bg-muted border border-(--color-card-stroke) mb-2 overflow-hidden">
              <Skeleton className="w-2/3 h-full bg-primary/40" />
            </div>

            {/* Header skeleton */}
            <div className="flex justify-between items-center border-b-2 border-(--color-card-stroke) pb-2 mb-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-8" />
            </div>

            {/* Question Text skeleton */}
            <div className="space-y-2 mb-6">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
            </div>

            {/* Option buttons skeleton (4 options) */}
            <div className="flex flex-col gap-3 my-4">
              {OPTIONS_SKELETON_KEYS.map((key) => (
                <div
                  key={key}
                  className="border-2 border-(--color-card-stroke) py-3 px-4 w-full flex justify-between items-center bg-card shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                >
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Footer actions skeleton */}
          <div className="flex justify-between items-center mt-2">
            <div className="border-2 border-(--color-card-stroke) py-1.5 px-3 bg-card w-16 h-8 shadow-[2px_2px_0px_0px_var(--color-shadow)] flex items-center justify-center">
              <Skeleton className="h-3.5 w-full" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}
