import { describe, it, expect, vi } from 'vitest'
import { selectTheme } from '@/lib/feed/algorithm'

describe('selectTheme', () => {
  it('always returns one of the provided themes', () => {
    const themes = [
      { theme: 'sains', points: 5 },
      { theme: 'matematika', points: 10 },
      { theme: 'psikologi', points: 1 },
    ]
    for (let i = 0; i < 100; i++) {
      const selected = selectTheme(themes)
      expect(['sains', 'matematika', 'psikologi']).toContain(selected)
    }
  })

  it('selects the 0-point theme more often than the 50-point theme', () => {
    const themes = [{ theme: 'weak', points: 0 }, { theme: 'strong', points: 50 }]
    const counts = { weak: 0, strong: 0 }
    for (let i = 0; i < 1000; i++) {
      counts[selectTheme(themes) as keyof typeof counts]++
    }
    // weak weight = 1/1 = 1.0, strong weight = 1/51 ≈ 0.02 → weak chosen ~98% of the time
    expect(counts.weak).toBeGreaterThan(900)
  })

  it('handles equal-score themes by distributing roughly 50/50', () => {
    const themes = [{ theme: 'a', points: 5 }, { theme: 'b', points: 5 }]
    const counts = { a: 0, b: 0 }
    for (let i = 0; i < 1000; i++) {
      counts[selectTheme(themes) as keyof typeof counts]++
    }
    expect(counts.a).toBeGreaterThan(350)
    expect(counts.b).toBeGreaterThan(350)
  })

  it('works with a single theme', () => {
    expect(selectTheme([{ theme: 'solo', points: 99 }])).toBe('solo')
  })

  it('falls back to the last theme when random exceeds total weight range', () => {
    // Mock Math.random to return 2 — beyond [0,1) — forcing rand > total after all subtractions
    const spy = vi.spyOn(Math, 'random').mockReturnValueOnce(2)
    const themes = [{ theme: 'first', points: 0 }, { theme: 'last', points: 0 }]
    expect(selectTheme(themes)).toBe('last')
    spy.mockRestore()
  })
})
