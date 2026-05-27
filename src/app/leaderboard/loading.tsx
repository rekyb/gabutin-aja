import { Skeleton } from '@/components/Skeleton'

const LEADERBOARD_SKELETON_KEYS = [
  'lead-s1',
  'lead-s2',
  'lead-s3',
  'lead-s4',
  'lead-s5',
  'lead-s6',
  'lead-s7',
  'lead-s8',
  'lead-s9',
  'lead-s10',
] as const

export default function LeaderboardLoading() {
  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <Skeleton className="h-7 w-48" />
      <div className="space-y-2">
        {LEADERBOARD_SKELETON_KEYS.map((key) => (
          <div key={key} className="flex items-center gap-4 border-2 border-border p-3">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
