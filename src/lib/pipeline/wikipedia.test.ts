import { describe, it, expect, vi, beforeEach } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  vi.unstubAllGlobals()
})

describe('fetchWikipediaArticle', () => {
  it('returns excerpt, sourceUrl, and title on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        extract: 'Fotosintesis adalah proses.',
        content_urls: { desktop: { page: 'https://id.wikipedia.org/wiki/Fotosintesis' } },
        title: 'Fotosintesis',
      }),
    }))
    const { fetchWikipediaArticle } = await import('./wikipedia')
    const result = await fetchWikipediaArticle('sains')
    expect(result.excerpt).toBe('Fotosintesis adalah proses.')
    expect(result.sourceUrl).toBe('https://id.wikipedia.org/wiki/Fotosintesis')
    expect(result.title).toBe('Fotosintesis')
  })

  it('truncates excerpt to 200 words', async () => {
    const longText = Array(300).fill('kata').join(' ')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        extract: longText,
        content_urls: { desktop: { page: 'https://id.wikipedia.org/wiki/Test' } },
        title: 'Test',
      }),
    }))
    const { fetchWikipediaArticle } = await import('./wikipedia')
    const result = await fetchWikipediaArticle('sains')
    expect(result.excerpt.split(' ').length).toBeLessThanOrEqual(200)
  })

  it('does not truncate excerpt that is already ≤200 words', async () => {
    const shortText = Array(100).fill('kata').join(' ')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        extract: shortText,
        content_urls: { desktop: { page: 'https://id.wikipedia.org/wiki/Test' } },
        title: 'Test',
      }),
    }))
    const { fetchWikipediaArticle } = await import('./wikipedia')
    const result = await fetchWikipediaArticle('sains')
    expect(result.excerpt.split(' ').length).toBe(100)
  })

  it('throws when fetch returns non-ok status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    const { fetchWikipediaArticle } = await import('./wikipedia')
    await expect(fetchWikipediaArticle('sains')).rejects.toThrow('Wikipedia fetch failed')
  })

  it('throws when extract field is missing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ content_urls: { desktop: { page: 'https://id.wikipedia.org/wiki/Test' } }, title: 'Test' }),
    }))
    const { fetchWikipediaArticle } = await import('./wikipedia')
    await expect(fetchWikipediaArticle('sains')).rejects.toThrow('No extract found')
  })

  it('falls back to the fetch URL when content_urls is missing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ extract: 'Teks singkat.', title: 'Test' }),
    }))
    const { fetchWikipediaArticle } = await import('./wikipedia')
    const result = await fetchWikipediaArticle('sains')
    expect(result.sourceUrl).toContain('id.wikipedia.org')
  })
})
