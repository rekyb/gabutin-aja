import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { connectDB } from '@/db/connect'
import { User, type IUser } from '@/db/models/User'
import { OnboardingClient } from './OnboardingClient'

export default async function OnboardingPage() {
  const session = await getSession()
  if (!session) redirect('/welcome')

  await connectDB()
  const user = await User.findById(session.userId).lean<IUser>()
  if (!user) redirect('/welcome')

  return (
    <OnboardingClient
      userId={session.userId}
      defaultDisplayName={user.displayName}
      uniqueUserId={user.uniqueUserId}
    />
  )
}
