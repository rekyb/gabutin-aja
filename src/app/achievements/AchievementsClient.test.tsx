import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import { AchievementsClient } from './AchievementsClient'
import { getUniqueUserId } from '@/lib/guest-state'
import { getGuestAchievementsData } from '@/app/actions/achievements'

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
  getGuestAchievementsData: vi.fn().mockResolvedValue(null),
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

  it('hydrates guest achievements and stats on mount using getGuestAchievementsData', async () => {
    vi.mocked(getUniqueUserId).mockReturnValue('guest-456')
    
    const mockGuestData = {
      achievements: [
        {
          _id: 'ach-1',
          userId: 'guest-456',
          achievementKey: 'first_answer',
          earnedAt: new Date(),
          isShowcased: false,
          showcasePosition: null,
        },
      ],
      stats: {
        totalAnswers: 5,
        totalSkips: 1,
        level: 2,
        currentStreak: 2,
        themeScores: { sains: 10 },
      },
    }
    
    const getGuestAchievementsDataMock = vi.mocked(getGuestAchievementsData)
    getGuestAchievementsDataMock.mockResolvedValue(mockGuestData)
    
    render(<AchievementsClient achievements={[]} userId="" stats={mockStats} />)
    
    expect(getGuestAchievementsDataMock).toHaveBeenCalledWith('guest-456')
    
    // Wait for the async hydration to update the lencana counter from 0/17 to 1/17
    const countText = await screen.findByText(/1\/17 lencana diraih/i)
    expect(countText).toBeInTheDocument()
  })
})
