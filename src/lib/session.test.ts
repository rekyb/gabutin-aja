import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSession, getSession, deleteSession } from './session'
import { Session } from '@/db/models/Session'

// Mock next/headers
const mockCookiesStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => mockCookiesStore),
}))

// Mock db connect
vi.mock('@/db/connect', () => ({
  connectDB: vi.fn(async () => {}),
}))

// Mock Session model
vi.mock('@/db/models/Session', () => {
  const mockSessionModel = {
    create: vi.fn(),
    findOne: vi.fn(),
    deleteOne: vi.fn(),
  }
  return {
    Session: mockSessionModel,
  }
})

describe('Session Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createSession', () => {
    it('creates a secure session record in MongoDB and sets the secure HTTP-only cookie', async () => {
      const mockUserId = 'user-123456'
      
      const sessionToken = await createSession(mockUserId)
      
      expect(sessionToken).toBeDefined()
      expect(sessionToken).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/) // UUID pattern
      
      expect(Session.create).toHaveBeenCalledOnce()
      expect(Session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          sessionToken,
          expiresAt: expect.any(Date),
        })
      )

      expect(mockCookiesStore.set).toHaveBeenCalledOnce()
      expect(mockCookiesStore.set).toHaveBeenCalledWith(
        'gabutin_session',
        sessionToken,
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        })
      )
    })
  })

  describe('getSession', () => {
    it('returns null if no session token cookie is found', async () => {
      mockCookiesStore.get.mockReturnValue(undefined)

      const result = await getSession()

      expect(result).toBeNull()
      expect(Session.findOne).not.toHaveBeenCalled()
    })

    it('returns null if token is not found in MongoDB', async () => {
      mockCookiesStore.get.mockReturnValue({ value: 'token-abc' })
      vi.mocked(Session.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      } as any)

      const result = await getSession()

      expect(result).toBeNull()
      expect(Session.findOne).toHaveBeenCalledWith({ sessionToken: 'token-abc' })
    })

    it('returns null and deletes session if token is found but expired', async () => {
      mockCookiesStore.get.mockReturnValue({ value: 'token-abc' })
      
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 1) // 1 day in the past

      vi.mocked(Session.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue({
          userId: { _id: 'user-789' },
          expiresAt: expiredDate,
        }),
      } as any)

      const result = await getSession()

      expect(result).toBeNull()
      expect(Session.deleteOne).toHaveBeenCalledWith({ sessionToken: 'token-abc' })
      expect(mockCookiesStore.delete).toHaveBeenCalledWith('gabutin_session')
    })

    it('returns userId if session is valid and active', async () => {
      mockCookiesStore.get.mockReturnValue({ value: 'token-abc' })
      
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1) // 1 day in the future

      vi.mocked(Session.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue({
          userId: { _id: 'user-789' },
          expiresAt: futureDate,
        }),
      } as any)

      const result = await getSession()

      expect(result).toEqual({ userId: 'user-789' })
    })

    it('returns null and clears session if populated userId is null (orphaned session)', async () => {
      mockCookiesStore.get.mockReturnValue({ value: 'token-abc' })

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)

      vi.mocked(Session.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue({
          userId: null,
          expiresAt: futureDate,
        }),
      } as any)

      const result = await getSession()

      expect(result).toBeNull()
      expect(Session.deleteOne).toHaveBeenCalledWith({ sessionToken: 'token-abc' })
      expect(mockCookiesStore.delete).toHaveBeenCalledWith('gabutin_session')
    })
  })

  describe('deleteSession', () => {
    it('deletes session from database and clears cookie', async () => {
      mockCookiesStore.get.mockReturnValue({ value: 'token-abc' })

      await deleteSession()

      expect(Session.deleteOne).toHaveBeenCalledWith({ sessionToken: 'token-abc' })
      expect(mockCookiesStore.delete).toHaveBeenCalledWith('gabutin_session')
    })

    it('clears cookie even if no session token was present in database', async () => {
      mockCookiesStore.get.mockReturnValue(undefined)

      await deleteSession()

      expect(Session.deleteOne).not.toHaveBeenCalled()
      expect(mockCookiesStore.delete).toHaveBeenCalledWith('gabutin_session')
    })
  })
})
