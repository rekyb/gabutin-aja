import type { FC, ReactNode } from 'react'
import { WikipediaImage } from '@/components/WikipediaImage'

export interface CardShellProps {
  sourceUrl: string
  borderOverride?: string
  progress?: ReactNode
  action?: ReactNode
  timer?: ReactNode
  streakSlot?: ReactNode
  className?: string
  hideImage?: boolean
  children: ReactNode
}

export const CardShell: FC<CardShellProps> = ({
  sourceUrl,
  borderOverride,
  progress,
  action,
  timer,
  streakSlot,
  className,
  hideImage,
  children,
}) => {
  const border =
    borderOverride ?? 'border-2 border-(--color-card-stroke) shadow-[4px_4px_0px_0px_var(--color-shadow)]'
  const hasHeader = timer != null || streakSlot != null

  return (
    <div
      className={[
        'bg-sidebar overflow-hidden flex flex-col',
        border,
        'flex-1 min-h-0 w-full max-w-[490px] lg:w-[430px] lg:max-w-none',
        className ?? '',
      ].join(' ')}
    >
      <div
        className={`${hideImage ? 'hidden' : ''} h-[35%] lg:h-[45%] shrink-0 overflow-hidden relative`}
      >
        <WikipediaImage sourceUrl={sourceUrl} className="w-full h-full" />
        {progress && (
          <div className="absolute top-3 left-3 hidden lg:flex items-center gap-1.5 bg-black/60 px-2 py-1">
            {progress}
          </div>
        )}
      </div>

      <div className="flex-1 lg:h-[55%] flex flex-col overflow-hidden p-6 gap-4">
        {hasHeader && (
          <div className="shrink-0 flex items-center justify-between border-b-2 border-border pb-4">
            <div>{timer ?? <div />}</div>
            <div>{streakSlot ?? <div />}</div>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4">{children}</div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}
