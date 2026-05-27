export interface ValidationResult {
  isValid: boolean
  error?: string
}

// Configurable display name length boundaries
export const DISPLAY_NAME_MIN_LENGTH = 3
export const DISPLAY_NAME_MAX_LENGTH = 20

// Curated list of common Indonesian and English bad words (emoji-free, clean copy register)
const BAD_WORDS: string[] = [
  // Indonesian
  'anjing',
  'bangsat',
  'bajingan',
  'kontol',
  'ngentot',
  'memek',
  'pantek',
  'goblok',
  'tolol',
  'bego',
  'perek',
  'babi',
  'monyet',
  'pepek',
  'tetek',
  'peler',
  'jembut',
  'itil',
  // English
  'fuck',
  'bitch',
  'shit',
  'asshole',
  'bastard',
  'cunt',
  'nigger',
  'dick',
  'whore',
]

/**
 * Validates a user display name according to the following rules:
 * 1. Must be alphanumeric (letters and numbers only, no spaces or special symbols)
 * 2. Must be between 3 and 20 characters in length
 * 3. Must not contain any toxic or profane words
 *
 * @param name The display name input to validate
 * @returns An object indicating if the name is valid and containing an optional error message in Bahasa Campur
 */
export function validateDisplayName(name: string): ValidationResult {
  const trimmed = name.trim()

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Nama lo nggak boleh kosong, sob!',
    }
  }

  if (trimmed.length < DISPLAY_NAME_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Nama minimal ${DISPLAY_NAME_MIN_LENGTH} karakter, sob!`,
    }
  }

  if (trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Nama maksimal ${DISPLAY_NAME_MAX_LENGTH} karakter aja ya!`,
    }
  }

  // Allow letters, numbers, and single spaces (no special symbols)
  const isValidChars = /^[a-zA-Z0-9 ]+$/.test(trimmed) && !/ {2}/.test(trimmed)
  if (!isValidChars) {
    return {
      isValid: false,
      error: 'Nama cuma boleh huruf, angka, dan spasi tunggal ya!',
    }
  }

  // Profanity check (convert to lowercase and check for bad words as substring)
  const lower = trimmed.toLowerCase()
  const hasBadWord = BAD_WORDS.some((badWord) => lower.includes(badWord))
  if (hasBadWord) {
    return {
      isValid: false,
      error: 'Waduh, namanya mengandung kata kasar/toxic nih!',
    }
  }

  return { isValid: true }
}
