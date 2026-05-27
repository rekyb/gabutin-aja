import type { FC } from 'react'
import { CARD_BASE } from '@/lib/design-tokens'

export const CardSkeleton: FC = () => (
  <div className={`${CARD_BASE} animate-pulse`}>
    <div className="h-4 bg-muted w-3/4 mb-4" />
    <div className="h-4 bg-muted w-1/2 mb-2" />
    <div className="h-4 bg-muted w-full mb-2" />
    <div className="h-4 bg-muted w-2/3" />
  </div>
)
