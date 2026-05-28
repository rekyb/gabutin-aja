import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { LoginModal } from '@/components/LoginModal'
import { useUiStore } from '@/store/uiStore'

describe('LoginModal', () => {
  beforeEach(() => {
    useUiStore.getState().closeLoginModal()
    localStorage.clear()
    vi.stubGlobal('location', {
      href: '',
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
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

  it('triggers Google login with current unique user ID when clicked', async () => {
    localStorage.setItem('uniqueUserId', 'test-user-123')
    useUiStore.getState().openLoginModal()
    render(<LoginModal />)

    const googleBtn = screen.getByText('Masuk pake Google')
    await userEvent.click(googleBtn)

    expect(globalThis.location.href).toBe('/api/auth/google?guest_uid=test-user-123')
    expect(useUiStore.getState().showLoginModal).toBe(false)
  })

  it('triggers Google login with empty unique user ID if none in localStorage', async () => {
    useUiStore.getState().openLoginModal()
    render(<LoginModal />)

    const googleBtn = screen.getByText('Masuk pake Google')
    await userEvent.click(googleBtn)

    expect(globalThis.location.href).toBe('/api/auth/google?guest_uid=')
    expect(useUiStore.getState().showLoginModal).toBe(false)
  })

  it('triggers Guest login and redirects to welcome when clicked', async () => {
    useUiStore.getState().openLoginModal()
    render(<LoginModal />)

    const guestBtn = screen.getByText('Jadi tamu aja')
    await userEvent.click(guestBtn)

    expect(localStorage.getItem('guestOnly')).toBe('true')
    expect(globalThis.location.href).toBe('/welcome')
    expect(useUiStore.getState().showLoginModal).toBe(false)
  })
})
