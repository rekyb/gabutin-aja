import { Skeleton } from '@/components/Skeleton'

const SKELETON_ITEMS = ['ach-s1', 'ach-s2', 'ach-s3', 'ach-s4', 'ach-s5', 'ach-s6'] as const

export default function AchievementsLoading() {
  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <Skeleton className="h-7 w-40" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {SKELETON_ITEMS.map((key) => (
          <div key={key} className="border-2 border-border p-4 space-y-3">
            <Skeleton className="h-12 w-12 mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
