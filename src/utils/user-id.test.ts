import { describe, it, expect } from 'vitest'
import { generateUniqueUserId } from '@/utils/user-id'

describe('generateUniqueUserId', () => {
  it('returns a 9-digit string', () => {
    const id = generateUniqueUserId()
    expect(id).toMatch(/^\d{9}$/)
  })

  it('starts with a non-zero digit', () => {
    for (let i = 0; i < 20; i++) {
      expect(generateUniqueUserId().charAt(0)).not.toBe('0')
    }
  })

  it('generates unique IDs across calls', () => {
    const ids = new Set(Array.from({ length: 100 }, generateUniqueUserId))
    expect(ids.size).toBeGreaterThan(90)
  })
})
