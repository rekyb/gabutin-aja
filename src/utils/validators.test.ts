import { describe, it, expect } from 'vitest'
import { validateDisplayName, DISPLAY_NAME_MIN_LENGTH, DISPLAY_NAME_MAX_LENGTH } from './validators'

describe('validateDisplayName', () => {
  it('allows valid alphanumeric names within length bounds', () => {
    const validNames = ['Andi', 'GabutGamer', 'Rian123', 'Player99', 'aB1']
    for (const name of validNames) {
      const result = validateDisplayName(name)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    }
  })

  it('rejects empty names', () => {
    const result = validateDisplayName('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Nama lo nggak boleh kosong, sob!')

    const resultSpaces = validateDisplayName('   ')
    expect(resultSpaces.isValid).toBe(false)
    expect(resultSpaces.error).toBe('Nama lo nggak boleh kosong, sob!')
  })

  it(`rejects names shorter than ${DISPLAY_NAME_MIN_LENGTH} characters`, () => {
    const shortNames = ['A', 'Bo', '12']
    for (const name of shortNames) {
      const result = validateDisplayName(name)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain(`minimal ${DISPLAY_NAME_MIN_LENGTH} karakter`)
    }
  })

  it(`rejects names longer than ${DISPLAY_NAME_MAX_LENGTH} characters`, () => {
    const longName = 'A'.repeat(DISPLAY_NAME_MAX_LENGTH + 1)
    const result = validateDisplayName(longName)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain(`maksimal ${DISPLAY_NAME_MAX_LENGTH} karakter`)
  })

  it('allows names with single spaces', () => {
    const validWithSpaces = ['Andi Pratama', 'Reky B', 'Player One']
    for (const name of validWithSpaces) {
      const result = validateDisplayName(name)
      expect(result.isValid).toBe(true)
    }
  })

  it('rejects names with special characters or double spaces', () => {
    const invalidNames = [
      'Budi_99',      // Underscore
      'Player-1',     // Hyphen
      'Gamer!',       // Exclamation mark
      'Rian@Home',    // Special symbol
      'Gue#Gabut',    // Hash
      'Andi  P',      // Double space
    ]
    for (const name of invalidNames) {
      const result = validateDisplayName(name)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('cuma boleh huruf, angka, dan spasi tunggal')
    }
  })

  it('rejects names containing Indonesian bad words', () => {
    const toxicIndoNames = [
      'anjing',
      'siAnjing',
      'bangsatLo',
      'bajingan',
      'goblok99',
      'tololSih',
      'begoLu',
      'kontol',
      'ngentot',
      'memek',
      'perekGamer',
    ]
    for (const name of toxicIndoNames) {
      const result = validateDisplayName(name)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('mengandung kata kasar/toxic')
    }
  })

  it('rejects names containing English bad words', () => {
    const toxicEngNames = [
      'fuck',
      'fuckYou',
      'bitch',
      'shitGamer',
      'asshole',
      'bastard',
      'cunt',
      'nigger',
      'whore',
    ]
    for (const name of toxicEngNames) {
      const result = validateDisplayName(name)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('mengandung kata kasar/toxic')
    }
  })
})
