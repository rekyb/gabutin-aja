import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const guestUid = searchParams.get('guest_uid')

  const redirectUri = `${env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID)
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', 'openid email profile')
  googleAuthUrl.searchParams.set('prompt', 'select_account')

  const response = NextResponse.redirect(googleAuthUrl.toString())

  if (guestUid) {
    response.cookies.set('gabutin_guest_link', guestUid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })
  }

  return response
}
