import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import { BottomNav } from '@/components/BottomNav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/feed',
}))

describe('BottomNav', () => {
  it('renders FYP, Flex, and Profil links', () => {
    render(<BottomNav className="" />)
    expect(screen.getByRole('link', { name: /fyp/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /flex/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /profil/i })).toBeInTheDocument()
  })

  it('has correct hrefs', () => {
    render(<BottomNav className="" />)
    expect(screen.getByRole('link', { name: /fyp/i })).toHaveAttribute('href', '/feed')
    expect(screen.getByRole('link', { name: /flex/i })).toHaveAttribute('href', '/achievements')
    expect(screen.getByRole('link', { name: /profil/i })).toHaveAttribute('href', '/profile')
  })
})
