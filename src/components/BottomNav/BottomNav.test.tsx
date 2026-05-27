import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import { BottomNav } from '@/components/BottomNav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/feed',
}))

describe('BottomNav', () => {
  it('renders Gabutin, Lencana, and Profil Gue links', () => {
    render(<BottomNav className="" />)
    expect(screen.getByRole('link', { name: /gabutin/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /lencana/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /profil gue/i })).toBeInTheDocument()
  })

  it('has correct hrefs', () => {
    render(<BottomNav className="" />)
    expect(screen.getByRole('link', { name: /gabutin/i })).toHaveAttribute('href', '/feed')
    expect(screen.getByRole('link', { name: /lencana/i })).toHaveAttribute('href', '/achievements')
    expect(screen.getByRole('link', { name: /profil gue/i })).toHaveAttribute('href', '/profile')
  })
})
