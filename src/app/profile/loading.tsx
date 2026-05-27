import { Skeleton } from '@/components/Skeleton'

const PROFILE_SKELETON_KEYS = ['prof-s1', 'prof-s2', 'prof-s3'] as const

export default function ProfileLoading() {
  return (
    <div className="p-6 space-y-6 max-w-lg mx-auto">
      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      {/* XP bar */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {PROFILE_SKELETON_KEYS.map((key) => (
          <div key={key} className="border-2 border-border p-4 space-y-2">
            <Skeleton className="h-6 w-12 mx-auto" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
