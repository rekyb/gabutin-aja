'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { generateUniqueUserId } from '@/utils/user-id'
import { getUniqueUserId, setUniqueUserId, clearGuestOnly } from '@/lib/guest-state'
import { getUserByUniqueId } from '@/app/actions/user'
import { useFeedStore } from '@/store/feedStore'

export function ClientBootstrap() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    async function bootstrap() {
      try {
        // 1. Check for active server-side session
        const sessionRes = await fetch('/api/auth/session')
        const sessionData = await sessionRes.json()

        if (sessionData.authenticated && sessionData.user) {
          const serverUid = sessionData.user.uniqueUserId
          const localUid = getUniqueUserId()

          // Sync local storage uniqueUserId with server-side authenticated user ID
          if (localUid !== serverUid) {
            setUniqueUserId(serverUid)
          }

          // Sync feedStore's userId with server-side authenticated user ID if it is currently different
          if (useFeedStore.getState().userId !== serverUid) {
            useFeedStore.setState({ userId: serverUid })
          }

          // Clear guest-only status since user is authenticated
          clearGuestOnly()

          if (pathname === '/welcome') {
            router.replace('/feed')
          }
          return
        }
      } catch (err) {
        console.error('ClientBootstrap session fetch failed:', err)
      }

      // 2. Fall back to guest flow if not authenticated
      const uid = getUniqueUserId()

      if (!uid) {
        const newId = generateUniqueUserId()
        setUniqueUserId(newId)
        // Also sync feedStore's userId
        useFeedStore.setState({ userId: newId })
        return
      }

      // Also sync feedStore's userId for returning guest
      if (useFeedStore.getState().userId !== uid) {
        useFeedStore.setState({ userId: uid })
      }

      // Returning user on /welcome: redirect to /feed if fully registered in DB
      if (pathname === '/welcome') {
        const user = await getUserByUniqueId(uid)
        if (user) {
          router.replace('/feed')
        }
      }
    }

    bootstrap()
  }, [pathname, router])

  return null
}
