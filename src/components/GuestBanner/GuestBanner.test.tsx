import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { GuestBanner } from '@/components/GuestBanner'

describe('GuestBanner', () => {
  it('renders the guest warning message', () => {
    render(<GuestBanner />)
    expect(screen.getByText(/progress bisa ilang/i)).toBeInTheDocument()
  })

  it('renders the AlertTriangle icon', () => {
    render(<GuestBanner />)
    const icon = document.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })
})
