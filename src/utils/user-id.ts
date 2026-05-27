export function generateUniqueUserId(): string {
  return Math.floor(100_000_000 + Math.random() * 900_000_000).toString()
}
