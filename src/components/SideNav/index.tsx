'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { UserProfileButton } from '@/components/UserProfileButton'
import type { FC } from 'react'

interface SideNavProps {
  className?: string
}

const links = [
  { href: '/feed', label: 'FYP', icon: Home },
  { href: '/achievements', label: 'Flexing', icon: Trophy },
]

export const SideNav: FC<SideNavProps> = ({ className }) => {
  const pathname = usePathname()

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 w-[20%] z-40 bg-sidebar flex flex-col justify-between px-4 py-6 ${className ?? ''}`}
    >
      {/* ── Top: logo + links ── */}
      <div className="flex flex-col gap-0">
        {/* Logo */}
        <div className="flex items-center gap-3 pb-4 mb-8">
          <Logo size={40} />
          <span className="font-black text-2xl tracking-widest text-foreground">GABUTIN</span>
        </div>

        {/* Nav links */}
        <nav>
          <ul className="flex flex-col gap-3">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 px-4 py-3 font-bold text-sm border-2 transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground border-border shadow-[2px_2px_0px_0px_var(--color-shadow)]'
                        : 'border-transparent text-foreground hover:bg-muted'
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
      </div>

      {/* ── Footer: profile ── */}
      <div className="flex flex-col gap-4 pt-4">
        <UserProfileButton />
      </div>
    </aside>
  )
}
