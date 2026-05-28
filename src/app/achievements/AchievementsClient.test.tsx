import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import { AchievementsClient } from './AchievementsClient'
import { getUniqueUserId } from '@/lib/guest-state'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}))

vi.mock('@/lib/guest-state', () => ({
  getUniqueUserId: vi.fn(),
}))

vi.mock('@/app/actions/achievements', () => ({
  pinBadge: vi.fn(),
  unpinBadge: vi.fn(),
}))

const mockStats = {
  totalAnswers: 0,
  totalSkips: 0,
  level: 1,
  currentStreak: 0,
  themeScores: {},
}

describe('AchievementsClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders achievements page correctly for authenticated user', () => {
    render(<AchievementsClient achievements={[]} userId="user-123" stats={mockStats} />)
    
    expect(screen.getByText('Flexing')).toBeInTheDocument()
    expect(screen.queryByText(/Lo main sebagai/i)).not.toBeInTheDocument()
  })

  it('renders guest warning prompt when userId is empty', () => {
    vi.mocked(getUniqueUserId).mockReturnValue('guest-456')
    
    render(<AchievementsClient achievements={[]} userId="" stats={mockStats} />)
    
    expect(screen.getByText(/Lo main sebagai/i)).toBeInTheDocument()
    expect(screen.getByText(/tamu/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Simpan Progres/i })).toBeInTheDocument()
  })
})
