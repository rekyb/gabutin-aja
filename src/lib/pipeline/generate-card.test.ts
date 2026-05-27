import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()
const mockConnectDB = vi.fn().mockResolvedValue(undefined)
const mockFetchWikipedia = vi.fn()
const mockGenerateMCQ = vi.fn()

beforeEach(() => {
  vi.resetModules()
  mockCreate.mockReset()
  mockFetchWikipedia.mockReset()
  mockGenerateMCQ.mockReset()

  vi.doMock('@/db/connect', () => ({ connectDB: mockConnectDB }))
  vi.doMock('@/db/models/Card', () => ({ Card: { create: mockCreate } }))
  vi.doMock('./wikipedia', () => ({ fetchWikipediaArticle: mockFetchWikipedia }))
  vi.doMock('./gemini', () => ({ generateMCQ: mockGenerateMCQ }))
})

const fakeWiki = {
  excerpt: 'Fotosintesis adalah proses mengubah cahaya matahari.',
  sourceUrl: 'https://id.wikipedia.org/wiki/Fotosintesis',
  title: 'Fotosintesis',
}

const fakeMCQ = {
  question: 'Apa fungsi fotosintesis?',
  options: ['Menghasilkan energi', 'Menyerap air', 'Menghasilkan CO2', 'Memecah protein'],
  correctIndex: 0,
  explanation: 'Fotosintesis mengubah cahaya menjadi energi kimia.',
}

describe('generateCard', () => {
  it('returns a saved card with correct fields', async () => {
    mockFetchWikipedia.mockResolvedValue(fakeWiki)
    mockGenerateMCQ.mockResolvedValue(fakeMCQ)
    const savedCard = {
      theme: 'sains', status: 'approved', generatedBy: 'ai',
      fact: `${fakeWiki.title}: ${fakeWiki.excerpt}`,
      sourceUrl: fakeWiki.sourceUrl,
      ...fakeMCQ,
    }
    mockCreate.mockResolvedValue(savedCard)

    const { generateCard } = await import('./generate-card')
    const result = await generateCard('sains')

    expect(result.theme).toBe('sains')
    expect(result.status).toBe('approved')
    expect(result.generatedBy).toBe('ai')
    expect(result.sourceUrl).toBe(fakeWiki.sourceUrl)
    expect(mockCreate).toHaveBeenCalledOnce()
  })

  it('passes the theme to both wikipedia and gemini', async () => {
    mockFetchWikipedia.mockResolvedValue(fakeWiki)
    mockGenerateMCQ.mockResolvedValue(fakeMCQ)
    mockCreate.mockResolvedValue({})

    const { generateCard } = await import('./generate-card')
    await generateCard('sejarah_indonesia')

    expect(mockFetchWikipedia).toHaveBeenCalledWith('sejarah_indonesia')
    expect(mockGenerateMCQ).toHaveBeenCalledWith(fakeWiki.excerpt, 'sejarah_indonesia')
  })

  it('throws when wikipedia fetch fails', async () => {
    mockFetchWikipedia.mockRejectedValue(new Error('Wikipedia fetch failed'))

    const { generateCard } = await import('./generate-card')
    await expect(generateCard('sains')).rejects.toThrow('Wikipedia fetch failed')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('throws when gemini generation fails', async () => {
    mockFetchWikipedia.mockResolvedValue(fakeWiki)
    mockGenerateMCQ.mockRejectedValue(new Error('Gemini API error'))

    const { generateCard } = await import('./generate-card')
    await expect(generateCard('sains')).rejects.toThrow('Gemini API error')
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
