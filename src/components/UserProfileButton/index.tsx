'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserByUniqueId } from '@/app/actions/user'
import { getUniqueUserId, getGuestProgress } from '@/lib/guest-state'
import { BUTTON_PRESS, XP_BAR_TRACK, XP_BAR_FILL } from '@/lib/design-tokens'
import { getXpProgress, getLevelFromXp } from '@/utils/xp'

interface UserData {
  displayName: string
  level: number
  xp: number
}

const GUEST: UserData = { displayName: 'Tamu', level: 1, xp: 0 }

export function UserProfileButton() {
  const router = useRouter()
  const [user, setUser] = useState<UserData>(GUEST)
  const [uid, setUid] = useState('guest')

  useEffect(() => { (async () => {
    const id = getUniqueUserId() ?? ''
    setUid(id || 'guest')

    if (!id) {
      const progress = getGuestProgress()
      setUser({ displayName: 'Tamu', xp: progress.xp, level: getLevelFromXp(progress.xp) })
      return
    }

    try {
      const data = await getUserByUniqueId(id)
      if (data) {
        setUser({ displayName: data.displayName, level: data.level, xp: data.xp })
      } else {
        const progress = getGuestProgress()
        setUser({ displayName: 'Tamu', xp: progress.xp, level: getLevelFromXp(progress.xp) })
      }
    } catch (err) {
      console.error('[UserProfileButton] failed to load user:', err)
      const progress = getGuestProgress()
      setUser({ displayName: 'Tamu', xp: progress.xp, level: getLevelFromXp(progress.xp) })
    }
  })() }, [])

  const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${uid}`
  const { current, required, percent } = getXpProgress(user.xp)

  return (
    <button
      onClick={() => router.push('/profile')}
      className={`${BUTTON_PRESS} w-full flex items-center gap-3 bg-muted p-3 hover:bg-card transition-colors`}
    >
      {/* Avatar */}
      <div
        style={{ width: 40, height: 40, overflow: 'hidden', flexShrink: 0 }}
        className="bg-background"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt={user.displayName} width={40} height={40} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Name + Level + XP bar */}
      <div className="flex-1 min-w-0 text-left overflow-hidden">
        <p className="font-bold text-sm text-foreground truncate leading-none mb-0.5">{user.displayName}</p>
        <p className="font-mono text-xs text-muted-foreground truncate mb-1.5">Level {user.level} · {current}/{required} XP</p>
        <div className={XP_BAR_TRACK}>
          <div className={XP_BAR_FILL} style={{ width: `${percent}%` }} />
        </div>
      </div>
    </button>
  )
}
