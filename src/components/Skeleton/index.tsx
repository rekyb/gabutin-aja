interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: Readonly<SkeletonProps>) {
  return <div className={`animate-pulse bg-muted ${className}`} />
}
