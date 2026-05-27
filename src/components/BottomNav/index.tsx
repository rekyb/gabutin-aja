'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, User } from 'lucide-react'
import type { FC } from 'react'

interface BottomNavProps {
  className?: string
}

const links = [
  { href: '/feed', label: 'FYP', icon: Home },
  { href: '/achievements', label: 'Flex', icon: Trophy },
  { href: '/profile', label: 'Profil', icon: User },
]

export const BottomNav: FC<BottomNavProps> = ({ className }) => {
  const pathname = usePathname()

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 h-16 bg-sidebar ${className ?? ''}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex h-full">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <li key={href} className="flex-1 h-full">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center h-full gap-1 font-bold transition-colors ${
                  active ? 'text-primary opacity-100' : 'text-foreground opacity-60'
                }`}
                style={{ fontSize: '0.65rem' }}
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
