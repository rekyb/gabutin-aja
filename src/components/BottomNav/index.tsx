'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, User2 } from 'lucide-react'
import type { FC } from 'react'

interface BottomNavProps {
  className?: string
}

const links = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User2 },
]

export const BottomNav: FC<BottomNavProps> = ({ className }) => {
  const pathname = usePathname()

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 bg-background border-t-2 border-border ${className ?? ''}`}
    >
      <ul className="flex h-20 items-center justify-around">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 px-4 py-2 text-xs font-bold transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
