import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGenerateContent = vi.fn()

beforeEach(() => {
  vi.resetModules()
  mockGenerateContent.mockReset()

  vi.doMock('@google/genai', () => ({
    GoogleGenAI: vi.fn().mockReturnValue({
      models: { generateContent: mockGenerateContent },
    }),
  }))

  vi.doMock('@/env', () => ({
    env: { GEMINI_API_KEY: 'test-key' },
  }))
})

describe('generateMCQ', () => {
  it('returns 4 options and a valid correctIndex', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        question: 'Apa itu fotosintesis?',
        options: ['Proses A', 'Proses B', 'Proses C', 'Proses D'],
        correctIndex: 2,
        explanation: 'Karena fotosintesis mengubah cahaya menjadi energi.',
      }),
    })
    const { generateMCQ } = await import('./gemini')
    const result = await generateMCQ('Fotosintesis adalah proses...', 'sains')
    expect(result.options).toHaveLength(4)
    expect(result.correctIndex).toBeGreaterThanOrEqual(0)
    expect(result.correctIndex).toBeLessThanOrEqual(3)
    expect(result.explanation).toBeTruthy()
    expect(result.question).toBeTruthy()
  })

  it('throws when Gemini returns empty text', async () => {
    mockGenerateContent.mockResolvedValue({ text: '' })
    const { generateMCQ } = await import('./gemini')
    await expect(generateMCQ('excerpt', 'sains')).rejects.toThrow('empty response')
  })

  it('throws when Gemini returns invalid JSON', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'not json at all' })
    const { generateMCQ } = await import('./gemini')
    await expect(generateMCQ('excerpt', 'sains')).rejects.toThrow('not valid JSON')
  })

  it('throws when options array does not have exactly 4 elements', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        question: 'Q?',
        options: ['A', 'B', 'C'],
        correctIndex: 0,
        explanation: 'Penjelasan.',
      }),
    })
    const { generateMCQ } = await import('./gemini')
    await expect(generateMCQ('excerpt', 'sains')).rejects.toThrow('length !== 4')
  })

  it('throws when correctIndex is out of range', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        question: 'Q?',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 5,
        explanation: 'Penjelasan.',
      }),
    })
    const { generateMCQ } = await import('./gemini')
    await expect(generateMCQ('excerpt', 'sains')).rejects.toThrow('invalid correctIndex')
  })

  it('throws when explanation is empty', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        question: 'Q?',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 1,
        explanation: '   ',
      }),
    })
    const { generateMCQ } = await import('./gemini')
    await expect(generateMCQ('excerpt', 'sains')).rejects.toThrow('empty explanation')
  })

  it('propagates Gemini API errors', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API quota exceeded'))
    const { generateMCQ } = await import('./gemini')
    await expect(generateMCQ('excerpt', 'sains')).rejects.toThrow('API quota exceeded')
  })
})
