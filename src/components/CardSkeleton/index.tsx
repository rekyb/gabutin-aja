import type { FC } from 'react'
import { Skeleton } from '@/components/Skeleton'

export const CardSkeleton: FC = () => {
  return (
    <>
      {/* Mobile Card Skeleton (Instagram style) */}
      <div className="lg:hidden bg-sidebar overflow-hidden flex flex-col border-2 border-(--color-card-stroke) shadow-[4px_4px_0px_0px_var(--color-shadow)] w-full max-w-[490px]">
        {/* Image area */}
        <div className="aspect-16/10 shrink-0 bg-muted overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Content panel */}
        <div className="p-6 flex flex-col gap-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-4/6" />
          </div>
          <Skeleton className="h-10 w-24 shrink-0 self-end mt-2" />
        </div>
      </div>

      {/* Desktop Card Skeleton (X/Twitter style) */}
      <div className="hidden lg:block w-full border-b border-border p-6">
        {/* Right Column: Post Body skeleton */}
        <div className="w-full space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>

          {/* Fact Caption */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </div>

          {/* Media block skeleton */}
          <div className="aspect-16/10 border-2 border-border overflow-hidden w-full bg-sidebar">
            <Skeleton className="w-full h-full" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </>
  )
}
