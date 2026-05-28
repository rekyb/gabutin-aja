import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { LoginModal } from '@/components/LoginModal'
import { useUiStore } from '@/store/uiStore'

describe('LoginModal', () => {
  beforeEach(() => {
    useUiStore.getState().closeLoginModal()
  })

  it('renders nothing when showLoginModal is false', () => {
    const { container } = render(<LoginModal />)
    expect(container.firstChild).toBeNull()
  })

  it('renders correctly when showLoginModal is true', () => {
    useUiStore.getState().openLoginModal()
    render(<LoginModal />)
    expect(screen.getByText('Masuk Akun')).toBeInTheDocument()
    expect(screen.getByText('Masuk pake Google')).toBeInTheDocument()
    expect(screen.getByText('Jadi tamu aja')).toBeInTheDocument()
  })

  it('closes when close button is clicked', async () => {
    useUiStore.getState().openLoginModal()
    render(<LoginModal />)
    const closeBtn = screen.getByRole('button', { name: /tutup/i })
    await userEvent.click(closeBtn)
    expect(useUiStore.getState().showLoginModal).toBe(false)
  })
})
