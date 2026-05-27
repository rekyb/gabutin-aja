const UNIQUE_USER_ID_KEY = 'uniqueUserId'
const GUEST_ONLY_KEY = 'guestOnly'
const GUEST_CARD_COUNT_KEY = 'guestCardCount'
const LAST_REMINDER_SHOWN_KEY = 'lastReminderShown'

const REENGAGEMENT_THRESHOLD = 15
const REENGAGEMENT_COOLDOWN_MS = 24 * 60 * 60 * 1000

export function getUniqueUserId(): string | null {
  return localStorage.getItem(UNIQUE_USER_ID_KEY)
}

export function setUniqueUserId(id: string): void {
  localStorage.setItem(UNIQUE_USER_ID_KEY, id)
}

export function isGuestOnly(): boolean {
  return localStorage.getItem(GUEST_ONLY_KEY) === 'true'
}

export function setGuestOnly(): void {
  localStorage.setItem(GUEST_ONLY_KEY, 'true')
}

export function getGuestCardCount(): number {
  return parseInt(localStorage.getItem(GUEST_CARD_COUNT_KEY) ?? '0', 10)
}

export function incrementGuestCardCount(): void {
  const current = getGuestCardCount()
  localStorage.setItem(GUEST_CARD_COUNT_KEY, (current + 1).toString())
}

export function getLastReminderShown(): string | null {
  return localStorage.getItem(LAST_REMINDER_SHOWN_KEY)
}

export function setLastReminderShown(): void {
  localStorage.setItem(LAST_REMINDER_SHOWN_KEY, new Date().toISOString())
}

export function shouldShowReEngagement(): boolean {
  if (getGuestCardCount() < REENGAGEMENT_THRESHOLD) return false
  const last = getLastReminderShown()
  if (!last) return true
  return Date.now() - new Date(last).getTime() >= REENGAGEMENT_COOLDOWN_MS
}
