import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { ReEngagementCard } from '@/components/ReEngagementCard'

describe('ReEngagementCard', () => {
  it('renders the 15+ card message', () => {
    render(<ReEngagementCard onSave={vi.fn()} onDismiss={vi.fn()} />)
    expect(screen.getByText(/jawab 15\+ soal/i)).toBeInTheDocument()
  })

  it('calls onSave when Simpan Progress is tapped', async () => {
    const onSave = vi.fn()
    render(<ReEngagementCard onSave={onSave} onDismiss={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /simpan progress/i }))
    expect(onSave).toHaveBeenCalledOnce()
  })

  it('calls onDismiss when Ntar deh is tapped', async () => {
    const onDismiss = vi.fn()
    render(<ReEngagementCard onSave={vi.fn()} onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: /ntar deh/i }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })
})
