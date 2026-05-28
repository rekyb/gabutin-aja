'use client'
import { FC, useEffect, useState } from 'react'
import { getUniqueUserId } from '@/lib/guest-state'
import { getUserByUniqueId } from '@/app/actions/user'
import { CARD_BASE, BUTTON_PRESS, XP_BAR_TRACK, XP_BAR_FILL } from '@/lib/design-tokens'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ShieldCheck, LogOut, AlertTriangle } from 'lucide-react'

interface UserSessionData {
  authenticated: boolean
  user: {
    _id: string
    uniqueUserId: string
    displayName: string
    avatar: string | null
    email: string | null
    themes: string[]
    xp: number
    level: number
  } | null
}

type DisplayUser = {
  displayName: string
  uniqueUserId: string
  avatar: string | null
  email: string | null
  xp: number
  level: number
}

function getDisplayUser(session: UserSessionData, guestDbUser: DisplayUser | null): DisplayUser {
  if (session.authenticated && session.user !== null) return session.user
  if (guestDbUser) {
    return {
      displayName: guestDbUser.displayName,
      uniqueUserId: guestDbUser.uniqueUserId,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${guestDbUser.uniqueUserId}`,
      email: null,
      xp: guestDbUser.xp,
      level: guestDbUser.level,
    }
  }
  const uid = getUniqueUserId() || '000000000'
  return {
    displayName: 'Guest User',
    uniqueUserId: uid,
    avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${uid}`,
    email: null,
    xp: 0,
    level: 1,
  }
}

function handleLogout() {
  globalThis.location.href = '/api/auth/logout'
}

function handleGoogleConnect(uniqueUserId: string) {
  globalThis.location.href = `/api/auth/google?guest_uid=${uniqueUserId}`
}

export const ProfileClient: FC = () => {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<UserSessionData>({ authenticated: false, user: null })
  const [guestDbUser, setGuestDbUser] = useState<any>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        // 1. Fetch server session first
        const res = await fetch('/api/auth/session')
        const data: UserSessionData = await res.json()
        setSession(data)

        if (data.authenticated && data.user) {
          setLoading(false)
          return
        }

        // 2. If not authenticated, check guest ID in local storage
        const localUid = getUniqueUserId()
        if (localUid) {
          const dbUser = await getUserByUniqueId(localUid)
          if (dbUser) {
            setGuestDbUser(dbUser)
          }
        }
      } catch (err) {
        console.error('Failed to load profile session:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className={`${CARD_BASE} animate-pulse h-48`} />
      </div>
    )
  }

  const isGoogleUser = session.authenticated && session.user !== null
  const displayUser = getDisplayUser(session, guestDbUser)

  // Flat 100 XP per level as defined in validators/formulas
  const currentXp = displayUser.xp % 100
  const xpProgressPercent = currentXp

  return (
    <div className="space-y-6">
      {/* Profile Card Header */}
      <div className={`${CARD_BASE} relative space-y-6`}>
        {/* Dark/Light toggle on mobile */}
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUser.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${displayUser.uniqueUserId}`}
            alt="Profile Avatar"
            className="w-20 h-20 border-2 border-border shrink-0 bg-background"
          />
          <div className="space-y-1 w-full min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-sans font-black text-2xl truncate max-w-full">
                {displayUser.displayName}
              </h2>
              {isGoogleUser ? (
                <span className="bg-primary/20 text-primary border border-primary px-2.5 py-0.5 font-mono text-[10px] font-bold flex items-center gap-1 uppercase">
                  <ShieldCheck className="h-3 w-3" /> VERIFIED
                </span>
              ) : (
                <span className="bg-secondary/20 text-secondary border border-secondary px-2.5 py-0.5 font-mono text-[10px] font-bold flex items-center gap-1 uppercase">
                  <AlertTriangle className="h-3 w-3" /> TAMU
                </span>
              )}
            </div>
            <p className="font-mono text-xs text-muted-foreground select-all">
              ID: #{displayUser.uniqueUserId}
            </p>
            {isGoogleUser && displayUser.email && (
              <p className="font-mono text-xs text-muted-foreground truncate">
                {displayUser.email}
              </p>
            )}
          </div>
        </div>

        {/* Level and XP progress */}
        <div className="space-y-2 pt-2 border-t-2 border-border/10">
          <div className="flex justify-between items-end font-mono text-xs">
            <span className="font-black text-foreground">LEVEL {displayUser.level}</span>
            <span className="text-muted-foreground">{currentXp} / 100 XP</span>
          </div>
          <div className={XP_BAR_TRACK}>
            <div
              className={XP_BAR_FILL}
              style={{ width: `${xpProgressPercent}%` }}
              data-testid="xp-progress"
            />
          </div>
        </div>

        {/* Interactive Actions block */}
        <div className="pt-2 flex flex-col gap-3">
          {isGoogleUser ? (
            <button
              onClick={handleLogout}
              className={`${BUTTON_PRESS} w-full bg-secondary text-secondary-foreground font-mono font-bold py-3 border-2 border-border flex items-center justify-center gap-2`}
            >
              <LogOut className="h-4 w-4" /> Keluar (Logout)
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-secondary/10 border border-secondary/30 p-4 font-mono text-xs text-secondary leading-relaxed flex gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0 text-secondary" />
                <p>
                  Lo main sebagai <strong>tamu</strong>. Progress, XP, dan lencana lo bisa hilang kalau
                  lo hapus cache browser. Simpan progres lo biar aman!
                </p>
              </div>
              <button
                onClick={() => handleGoogleConnect(displayUser.uniqueUserId)}
                className={`${BUTTON_PRESS} w-full bg-primary text-primary-foreground font-mono font-bold py-2.5 px-4 border-2 border-border flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors`}
              >
                {/* Circular White Wrapper for Google SVG */}
                <div className="bg-white rounded-full p-1 shrink-0 flex items-center justify-center w-7 h-7">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                </div>
                Simpen pake Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
