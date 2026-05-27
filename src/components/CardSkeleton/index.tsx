import type { FC } from 'react'
import { Skeleton } from '@/components/Skeleton'

export const CardSkeleton: FC = () => {
  return (
    <div className="bg-sidebar overflow-hidden flex flex-col border-2 border-(--color-card-stroke) shadow-[4px_4px_0px_0px_var(--color-shadow)] w-full max-w-[490px] flex-1 min-h-0 lg:w-[430px] lg:max-w-none lg:max-h-[820px]">
      {/* Image area */}
      <div className="aspect-3/1 lg:aspect-auto lg:h-[45%] shrink-0 bg-muted overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content panel */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-4/6" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
        <Skeleton className="h-12 w-full shrink-0" />
      </div>
    </div>
  )
}
