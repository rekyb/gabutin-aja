import { connectDB } from '@/db/connect'
import { Session } from '@/db/models/Session'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'gabutin_session'
const SESSION_EXPIRY_DAYS = 30

/**
 * Creates a secure session in MongoDB and sets the cookie in Next.js response.
 */
export async function createSession(userId: string): Promise<string> {
  await connectDB()

  const sessionToken = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS)

  await Session.create({
    userId,
    sessionToken,
    expiresAt,
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  return sessionToken
}

/**
 * Retrieves the session and verifies validity.
 */
export async function getSession(): Promise<{ userId: string } | null> {
  await connectDB()

  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!sessionToken) return null

  const session = await Session.findOne({ sessionToken }).populate('userId')
  if (!session) return null

  // Double check expiration (TTL index runs periodically, so we do an explicit check too)
  if (new Date() > session.expiresAt) {
    return null
  }

  // Guard: populate returns null if the referenced User doc was deleted (orphaned session)
  if (!session.userId) {
    return null
  }

  return { userId: (session.userId as { _id: { toString(): string } })._id.toString() }
}

/**
 * Deletes the session from DB and clears the cookie.
 */
export async function deleteSession(): Promise<void> {
  await connectDB()

  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionToken) {
    await Session.deleteOne({ sessionToken })
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}
