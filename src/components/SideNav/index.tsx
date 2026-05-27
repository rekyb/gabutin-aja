'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, User2 } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { FC } from 'react'

interface SideNavProps {
  className?: string
}

const links = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User2 },
]

export const SideNav: FC<SideNavProps> = ({ className }) => {
  const pathname = usePathname()

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 w-1/4 z-40 bg-background border-r-2 border-border flex-col justify-between ${className ?? ''}`}
    >
      <div className="flex flex-col flex-1 p-4">
        <div className="mb-8 p-2">
          <span className="font-black text-xl tracking-widest text-foreground">GABUTIN</span>
        </div>

        <nav>
          <ul className="space-y-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2 font-bold text-sm transition-colors border-2 ${
                      active
                        ? 'bg-primary text-primary-foreground border-border shadow-[2px_2px_0px_0px_black]'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
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

        <div className="mt-4 p-3 border-2 border-border bg-muted">
          <p className="text-xs text-muted-foreground font-mono">XP · Level</p>
          <p className="text-sm font-bold text-foreground">— placeholder —</p>
        </div>
      </div>

      <div className="p-4 border-t-2 border-border">
        <ThemeToggle />
      </div>
    </aside>
  )
}
