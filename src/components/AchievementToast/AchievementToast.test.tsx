import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { AchievementToast } from '@/components/AchievementToast'

const mockAchievement = {
  key: 'on_fire',
  icon: '',
  title: 'Gak Ada Obat!',
  rarity: 'Rare' as const,
  description: '5 jawaban bener',
}

describe('AchievementToast', () => {
  it('renders achievement title', () => {
    render(<AchievementToast achievement={mockAchievement} />)
    expect(screen.getByText('Gak Ada Obat!')).toBeInTheDocument()
  })

  it('applies Rare rarity border class', () => {
    const { container } = render(<AchievementToast achievement={mockAchievement} />)
    expect(container.firstChild).toHaveClass('border-[#38bdf8]')
  })
})
