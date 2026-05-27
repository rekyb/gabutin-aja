import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { CardResult } from '@/components/Card/CardResult'
import type { CardDoc, SubmitAnswerResponse } from '@/types'

const mockCard: CardDoc = {
  _id: 'card-123',
  theme: 'sejarah_indonesia',
  fact: 'Indonesia merdeka pada 17 Agustus 1945.',
  sourceUrl: 'https://id.wikipedia.org/wiki/Proklamasi_Kemerdekaan_Indonesia',
  question: 'Kapan Indonesia merdeka?',
  options: ['17 Agustus 1945', '1 Juni 1945', '28 Oktober 1928', '20 Mei 1908'],
  correctIndex: 0,
  explanation: 'Proklamasi Kemerdekaan Indonesia dibacakan pada hari Jumat, 17 Agustus 1945 oleh Soekarno didampingi Mohammad Hatta.',
}

describe('CardResult', () => {
  it('renders Correct state with BENAR! copy, +3 XP delta and explanation', () => {
    const mockResponse: SubmitAnswerResponse = {
      result: 'correct',
      pointsDelta: 2,
      xpDelta: 3,
      newStreak: 1,
      newLevel: 1,
      leveledUp: false,
      newAchievements: [],
    }

    render(
      <CardResult
        card={mockCard}
        response={mockResponse}
        onNext={vi.fn()}
      />
    )

    expect(screen.getByText('BENAR!')).toBeInTheDocument()
    expect(screen.getByText(/Nah bener! Menyala ilmu lo!/i)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(mockCard.explanation))).toBeInTheDocument()
    expect(screen.getByText('+3 XP')).toBeInTheDocument()
    expect(screen.queryByText(/Poin/i)).not.toBeInTheDocument()
  })

  it('renders Wrong state with SALAH! copy, no deltas, and explanation', () => {
    const mockResponse: SubmitAnswerResponse = {
      result: 'wrong',
      pointsDelta: -2,
      xpDelta: 0,
      newStreak: 0,
      newLevel: 1,
      leveledUp: false,
      newAchievements: [],
    }

    render(
      <CardResult
        card={mockCard}
        response={mockResponse}
        onNext={vi.fn()}
      />
    )

    expect(screen.getByText('SALAH!')).toBeInTheDocument()
    expect(screen.getByText(/Salah woi! Baca dulu nih/i)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(mockCard.explanation))).toBeInTheDocument()
    expect(screen.queryByText(/Poin/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/XP/i)).not.toBeInTheDocument()
  })

  it('renders Skip state with SKIP! copy and no deltas', () => {
    const mockResponse: SubmitAnswerResponse = {
      result: 'skip',
      pointsDelta: -1,
      xpDelta: 0,
      newStreak: 0,
      newLevel: 1,
      leveledUp: false,
      newAchievements: [],
    }

    render(
      <CardResult
        card={mockCard}
        response={mockResponse}
        onNext={vi.fn()}
      />
    )

    expect(screen.getByText('SKIP!')).toBeInTheDocument()
    expect(screen.getByText(new RegExp(mockCard.explanation))).toBeInTheDocument()
    expect(screen.queryByText(/Poin/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/XP/i)).not.toBeInTheDocument()
  })

  it('triggers onNext when Lanjut is clicked', async () => {
    const onNext = vi.fn()
    const mockResponse: SubmitAnswerResponse = {
      result: 'correct',
      pointsDelta: 2,
      xpDelta: 3,
      newStreak: 1,
      newLevel: 1,
      leveledUp: false,
      newAchievements: [],
    }

    render(
      <CardResult
        card={mockCard}
        response={mockResponse}
        onNext={onNext}
      />
    )

    const button = screen.getByRole('button', { name: /lanjut/i })
    await userEvent.click(button)
    expect(onNext).toHaveBeenCalledOnce()
  })
})
