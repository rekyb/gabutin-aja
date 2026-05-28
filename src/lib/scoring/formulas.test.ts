import { describe, it, expect } from 'vitest'
import {
  calculateXP,
  calculatePointsDelta,
  getStreakBonus,
  xpRequiredForLevel,
  computeLevel,
  getLevelTitle,
} from '@/lib/scoring/formulas'

describe('getStreakBonus', () => {
  it('returns 0 for streak < 3', () => { expect(getStreakBonus(2)).toBe(0) })
  it('returns 0 for streak 0',   () => { expect(getStreakBonus(0)).toBe(0) })
  it('returns 1 for streak 3',   () => { expect(getStreakBonus(3)).toBe(1) })
  it('returns 1 for streak 4',   () => { expect(getStreakBonus(4)).toBe(1) })
  it('returns 3 for streak 5',   () => { expect(getStreakBonus(5)).toBe(3) })
  it('returns 3 for streak 9',   () => { expect(getStreakBonus(9)).toBe(3) })
  it('returns 5 for streak 10',  () => { expect(getStreakBonus(10)).toBe(5) })
  it('returns 5 for streak 99',  () => { expect(getStreakBonus(99)).toBe(5) })
})

describe('calculateXP', () => {
  it('returns 2 for correct streak 1',  () => { expect(calculateXP('correct', 1)).toBe(2) })
  it('returns 2 for correct streak 0',  () => { expect(calculateXP('correct', 0)).toBe(2) })
  it('returns 3 for correct streak 3',  () => { expect(calculateXP('correct', 3)).toBe(3) })
  it('returns 5 for correct streak 5',  () => { expect(calculateXP('correct', 5)).toBe(5) })
  it('returns 7 for correct streak 10', () => { expect(calculateXP('correct', 10)).toBe(7) })
  it('returns 0 for wrong',             () => { expect(calculateXP('wrong', 10)).toBe(0) })
  it('returns 0 for skip',              () => { expect(calculateXP('skip', 10)).toBe(0) })
})

describe('calculatePointsDelta', () => {
  it('returns +2 for correct', () => { expect(calculatePointsDelta('correct')).toBe(2) })
  it('returns -2 for wrong',   () => { expect(calculatePointsDelta('wrong')).toBe(-2) })
  it('returns -1 for skip',    () => { expect(calculatePointsDelta('skip')).toBe(-1) })
})

describe('xpRequiredForLevel', () => {
  it('returns 10 for level 1',  () => { expect(xpRequiredForLevel(1)).toBe(10) })
  it('returns 28 for level 2',  () => { expect(xpRequiredForLevel(2)).toBe(28) })
  it('returns 316 for level 10',() => { expect(xpRequiredForLevel(10)).toBe(316) })
})

describe('computeLevel', () => {
  it('returns 1 for 0 XP',  () => { expect(computeLevel(0)).toBe(1) })
  it('returns 2 for 10 XP', () => { expect(computeLevel(10)).toBe(2) })
  it('returns 3 for 38 XP', () => { expect(computeLevel(38)).toBe(3) })
  it('returns 1 for 9 XP',  () => { expect(computeLevel(9)).toBe(1) })
})

describe('getLevelTitle', () => {
  it('returns Newbie Gabut for level 1',  () => { expect(getLevelTitle(1)).toBe('Newbie Gabut') })
  it('returns Newbie Gabut for level 5',  () => { expect(getLevelTitle(5)).toBe('Newbie Gabut') })
  it('returns Penasaran for level 6',     () => { expect(getLevelTitle(6)).toBe('Penasaran') })
  it('returns Penasaran for level 15',    () => { expect(getLevelTitle(15)).toBe('Penasaran') })
  it('returns Anak Pintar for level 16',  () => { expect(getLevelTitle(16)).toBe('Anak Pintar') })
  it('returns Sultan Ilmu for level 31',  () => { expect(getLevelTitle(31)).toBe('Sultan Ilmu') })
  it('returns Dewa Gabut for level 51',   () => { expect(getLevelTitle(51)).toBe('Dewa Gabut') })
})
