import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { CardFact } from '@/components/Card/CardFact'

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))

const mockCard = {
  _id: 'card1',
  theme: 'sains',
  fact: 'Indonesia punya lebih dari 17.000 pulau.',
  sourceUrl: 'https://id.wikipedia.org/wiki/Indonesia',
  question: '',
  options: [],
  correctIndex: 0,
  explanation: '',
}

describe('CardFact', () => {
  it('renders the fact text', () => {
    render(<CardFact card={mockCard} onReady={vi.fn()} />)
    expect(screen.getByText(/17\.000 pulau/i)).toBeInTheDocument()
  })

  it('renders source URL as a link', () => {
    render(<CardFact card={mockCard} onReady={vi.fn()} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', mockCard.sourceUrl)
  })

  it('calls onReady when Kuis! is clicked', async () => {
    const onReady = vi.fn()
    render(<CardFact card={mockCard} onReady={onReady} />)
    await userEvent.click(screen.getByRole('button', { name: /kuis/i }))
    expect(onReady).toHaveBeenCalledOnce()
  })
})
