import { describe, it, expect } from 'vitest'
import { THEME_KEYWORDS, pickKeyword } from './theme-keywords'

describe('THEME_KEYWORDS', () => {
  it('defines all 8 themes', () => {
    const expected = [
      'sejarah_indonesia', 'sains', 'pop_culture', 'geografi',
      'matematika', 'psikologi', 'sejarah_dunia', 'coding_tech',
    ]
    expect(Object.keys(THEME_KEYWORDS)).toEqual(expect.arrayContaining(expected))
    expect(Object.keys(THEME_KEYWORDS)).toHaveLength(8)
  })

  it('each theme has at least one keyword', () => {
    for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
      expect(keywords.length, `${theme} should have keywords`).toBeGreaterThan(0)
    }
  })
})

describe('pickKeyword', () => {
  it('returns a string from the theme keyword list', () => {
    const keyword = pickKeyword('sains')
    expect(THEME_KEYWORDS.sains).toContain(keyword)
  })

  it('throws for unknown theme', () => {
    expect(() => pickKeyword('unknown_theme')).toThrow('Unknown theme: unknown_theme')
  })

  it('returns different keywords across calls (probabilistic)', () => {
    const results = new Set(Array.from({ length: 50 }, () => pickKeyword('sains')))
    expect(results.size).toBeGreaterThan(1)
  })
})
