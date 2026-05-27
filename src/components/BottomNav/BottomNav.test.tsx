import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import { BottomNav } from '@/components/BottomNav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/feed',
}))

describe('BottomNav', () => {
  it('renders Feed, Achievements, and Profile links', () => {
    render(<BottomNav className="" />)
    expect(screen.getByRole('link', { name: /feed/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /achievements/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument()
  })

  it('has correct hrefs', () => {
    render(<BottomNav className="" />)
    expect(screen.getByRole('link', { name: /feed/i })).toHaveAttribute('href', '/feed')
    expect(screen.getByRole('link', { name: /achievements/i })).toHaveAttribute('href', '/achievements')
    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/profile')
  })
})
