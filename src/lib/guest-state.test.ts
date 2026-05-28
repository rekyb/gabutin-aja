import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getGuestProgress,
  setGuestProgress,
  getUniqueUserId,
  setUniqueUserId,
  isGuestOnly,
  setGuestOnly,
  clearGuestOnly,
  getGuestCardCount,
  incrementGuestCardCount,
  getLastReminderShown,
  setLastReminderShown,
  shouldShowReEngagement,
} from '@/lib/guest-state'

describe('guest-state', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getGuestProgress and setGuestProgress', () => {
    it('returns default progress if nothing in localStorage', () => {
      const p = getGuestProgress()
      expect(p).toEqual({ xp: 0, level: 1, currentStreak: 0, totalAnswers: 0 })
    })

    it('returns saved progress if in localStorage', () => {
      localStorage.setItem('gabutin_user', JSON.stringify({ xp: 10, level: 2 }))
      const p = getGuestProgress()
      expect(p).toEqual({ xp: 10, level: 2, currentStreak: 0, totalAnswers: 0 })
    })

    it('ignores invalid JSON in localStorage and returns default', () => {
      localStorage.setItem('gabutin_user', 'invalid-json{')
      const p = getGuestProgress()
      expect(p).toEqual({ xp: 0, level: 1, currentStreak: 0, totalAnswers: 0 })
    })

    it('saves progress and merges partial progress updates', () => {
      setGuestProgress({ xp: 20 })
      expect(getGuestProgress()).toEqual({ xp: 20, level: 1, currentStreak: 0, totalAnswers: 0 })

      setGuestProgress({ level: 3, currentStreak: 2 })
      expect(getGuestProgress()).toEqual({ xp: 20, level: 3, currentStreak: 2, totalAnswers: 0 })
    })
  })

  describe('uniqueUserId', () => {
    it('gets and sets uniqueUserId', () => {
      expect(getUniqueUserId()).toBeNull()
      setUniqueUserId('test-uid')
      expect(getUniqueUserId()).toBe('test-uid')
    })
  })

  describe('guestOnly', () => {
    it('handles guestOnly flag states', () => {
      expect(isGuestOnly()).toBe(false)
      setGuestOnly()
      expect(isGuestOnly()).toBe(true)
      clearGuestOnly()
      expect(isGuestOnly()).toBe(false)
    })
  })

  describe('guestCardCount', () => {
    it('gets and increments guestCardCount', () => {
      expect(getGuestCardCount()).toBe(0)
      incrementGuestCardCount()
      expect(getGuestCardCount()).toBe(1)
      incrementGuestCardCount()
      expect(getGuestCardCount()).toBe(2)
    })

    it('handles invalid count stored in localStorage gracefully', () => {
      localStorage.setItem('guestCardCount', 'not-a-number')
      expect(getGuestCardCount()).toBeNaN()
    })
  })

  describe('lastReminderShown', () => {
    it('gets and sets lastReminderShown', () => {
      expect(getLastReminderShown()).toBeNull()
      const now = new Date('2026-05-28T12:00:00.000Z')
      vi.setSystemTime(now)
      setLastReminderShown()
      expect(getLastReminderShown()).toBe(now.toISOString())
    })
  })

  describe('shouldShowReEngagement', () => {
    it('returns false if count is less than threshold (15)', () => {
      expect(shouldShowReEngagement()).toBe(false)
      localStorage.setItem('guestCardCount', '14')
      expect(shouldShowReEngagement()).toBe(false)
    })

    it('returns true if count is >= threshold (15) and no last reminder was shown', () => {
      localStorage.setItem('guestCardCount', '15')
      expect(shouldShowReEngagement()).toBe(true)
    })

    it('returns false if count is >= 15 but cooldown is not reached (< 24h)', () => {
      localStorage.setItem('guestCardCount', '15')
      const now = new Date('2026-05-28T12:00:00.000Z')
      vi.setSystemTime(now)
      setLastReminderShown()

      // Advance by 23 hours
      vi.advanceTimersByTime(23 * 60 * 60 * 1000)
      expect(shouldShowReEngagement()).toBe(false)
    })

    it('returns true if count is >= 15 and cooldown is expired (>= 24h)', () => {
      localStorage.setItem('guestCardCount', '15')
      const now = new Date('2026-05-28T12:00:00.000Z')
      vi.setSystemTime(now)
      setLastReminderShown()

      // Advance by 24 hours
      vi.advanceTimersByTime(24 * 60 * 60 * 1000)
      expect(shouldShowReEngagement()).toBe(true)
    })
  })
})
