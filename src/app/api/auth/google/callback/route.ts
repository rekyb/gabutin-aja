import { NextRequest, NextResponse } from 'next/server'
import type { HydratedDocument } from 'mongoose'
import { connectDB } from '@/db/connect'
import { User } from '@/db/models/User'
import type { IUser } from '@/db/models/User'
import { ThemeScore } from '@/db/models/ThemeScore'
import { createSession } from '@/lib/session'
import { generateUniqueUserId } from '@/utils/user-id'
import { env } from '@/env'

const DEFAULT_THEMES = ['sejarah_indonesia', 'sains', 'pop_culture']

async function patchReturningUser(user: HydratedDocument<IUser>, googleId: string, email: string, avatar: string) {
  let updated = false
  if (!user.googleId) { user.googleId = googleId; updated = true }
  if (!user.email) { user.email = email; updated = true }
  if (avatar && user.avatar !== avatar) { user.avatar = avatar; updated = true }
  if (updated) await user.save()
}

async function createUserFromGuestLink(guestUid: string, googleId: string, email: string, name: string, avatar: string) {
  const guestUser = await User.findOne({ uniqueUserId: guestUid })
  if (guestUser) {
    guestUser.googleId = googleId
    guestUser.email = email
    if (avatar) guestUser.avatar = avatar
    await guestUser.save()
    return guestUser
  }
  const user = await User.create({
    uniqueUserId: guestUid,
    displayName: name || `User-${guestUid}`,
    avatar, email, googleId,
    themes: DEFAULT_THEMES,
    xp: 0, level: 1, currentStreak: 0,
    consecutiveWrongs: 0, totalAnswers: 0, totalSkips: 0,
  })
  await ThemeScore.insertMany(DEFAULT_THEMES.map((theme) => ({ userId: user._id, theme, points: 0, seenCardIds: [] })))
  return user
}

async function createFreshGoogleUser(googleId: string, email: string, name: string, avatar: string) {
  const uniqueUserId = generateUniqueUserId()
  const user = await User.create({
    uniqueUserId,
    displayName: name || `User-${uniqueUserId}`,
    avatar, email, googleId,
    themes: DEFAULT_THEMES,
    xp: 0, level: 1, currentStreak: 0,
    consecutiveWrongs: 0, totalAnswers: 0, totalSkips: 0,
  })
  await ThemeScore.insertMany(DEFAULT_THEMES.map((theme) => ({ userId: user._id, theme, points: 0, seenCardIds: [] })))
  return user
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/welcome?error=missing_code`)
  }

  try {
    // 1. Exchange authorization code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}))
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/welcome?error=token_exchange_failed`)
    }

    const { access_token } = await tokenResponse.json()

    // 2. Fetch user profile from Google UserInfo endpoint
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!profileResponse.ok) {
      return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/welcome?error=profile_fetch_failed`)
    }

    const profile = await profileResponse.json()
    const { sub: googleId, email, name, picture: avatar } = profile

    await connectDB()

    // 3. Database user mapping / linking
    let user = await User.findOne({ $or: [{ googleId }, { email }] })
    let isNewUser = false
    const guestUid = request.cookies.get('gabutin_guest_link')?.value

    if (user) {
      await patchReturningUser(user, googleId, email, avatar)
    } else {
      isNewUser = true
      user = guestUid
        ? await createUserFromGuestLink(guestUid, googleId, email, name, avatar)
        : await createFreshGoogleUser(googleId, email, name, avatar)
    }

    // 4. Start session
    await createSession(user._id.toString())

    const destination = isNewUser
      ? `${env.NEXT_PUBLIC_APP_URL}/onboarding`
      : `${env.NEXT_PUBLIC_APP_URL}/feed?toast=google_returning`

    const response = NextResponse.redirect(destination)
    response.cookies.delete('gabutin_guest_link')

    return response
  } catch (error) {
    console.error('Google OAuth callback critical error:', error)
    return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/welcome?error=critical_error`)
  }
}
