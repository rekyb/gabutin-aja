import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { connectDB } from '@/db/connect'
import { User, type IUser } from '@/db/models/User'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null })
    }

    await connectDB()
    const user = await User.findById(session.userId).lean<IUser>()
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        _id: user._id.toString(),
        uniqueUserId: user.uniqueUserId,
        displayName: user.displayName,
        avatar: user.avatar || null,
        email: user.email || null,
        themes: user.themes,
        xp: user.xp,
        level: user.level,
      },
    })
  } catch (error) {
    console.error('Session retrieval error:', error)
    return NextResponse.json({ authenticated: false, user: null, error: 'Internal Server Error' }, { status: 500 })
  }
}
