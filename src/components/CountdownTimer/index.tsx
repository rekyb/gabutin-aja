'use client'
import { useState, useEffect, type FC } from 'react'
import { TIMER_BAR_TRACK, TIMER_BAR_FILL } from '@/lib/design-tokens'

export interface CountdownTimerProps {
  seconds: number
  onExpire: () => void
}

export const CountdownTimer: FC<CountdownTimerProps> = ({ seconds, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(seconds)

  useEffect(() => {
    setTimeLeft(seconds)
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onExpire()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [seconds, onExpire])

  return (
    <div className="w-full space-y-1">
      <div className={`${TIMER_BAR_TRACK} border border-(--color-card-stroke)`}>
        <div
          className={`${TIMER_BAR_FILL} transition-[width] duration-1000 ease-linear`}
          style={{ width: `${(timeLeft / seconds) * 100}%` }}
        />
      </div>
      <span className="font-mono text-xs text-muted-foreground">{timeLeft}</span>
    </div>
  )
}
