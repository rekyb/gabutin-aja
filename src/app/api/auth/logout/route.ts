import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/session'
import { env } from '@/env'

async function handleLogout() {
  await deleteSession()
  return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/welcome`)
}

export async function GET() {
  return handleLogout()
}

export async function POST() {
  return handleLogout()
}
