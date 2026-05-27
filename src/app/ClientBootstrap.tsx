'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { generateUniqueUserId } from '@/utils/user-id'
import { getUniqueUserId, setUniqueUserId } from '@/lib/guest-state'
import { getUserByUniqueId } from '@/app/actions/user'

export function ClientBootstrap() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    async function bootstrap() {
      const uid = getUniqueUserId()

      if (!uid) {
        const newId = generateUniqueUserId()
        setUniqueUserId(newId)
        if (pathname !== '/welcome') {
          router.replace('/welcome')
        }
        return
      }

      // Returning user: if they land on /welcome but already have a DB record, skip to /feed
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
