import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@/test/utils'
import { CountdownTimer } from '@/components/CountdownTimer'

describe('CountdownTimer', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('displays initial seconds', () => {
    render(<CountdownTimer seconds={10} onExpire={vi.fn()} />)
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('calls onExpire when timer reaches 0', () => {
    const onExpire = vi.fn()
    render(<CountdownTimer seconds={3} onExpire={onExpire} />)
    act(() => { vi.advanceTimersByTime(3000) })
    expect(onExpire).toHaveBeenCalledOnce()
  })
})
