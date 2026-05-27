import type { FC } from 'react'

interface CircularTimerProps {
  timeLeft: number
  total?: number
}

export const CircularTimer: FC<CircularTimerProps> = ({ timeLeft, total = 10 }) => {
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - timeLeft / total)
  const seconds = Math.ceil(timeLeft)
  const danger = timeLeft <= 3

  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={radius} fill="none" strokeWidth="4"
          className="stroke-muted" />
        <circle cx="28" cy="28" r={radius} fill="none" strokeWidth="4"
          className={danger ? 'stroke-secondary' : 'stroke-primary'}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center font-mono font-bold text-sm ${danger ? 'text-secondary' : 'text-foreground'}`}>
        {seconds}
      </span>
    </div>
  )
}
