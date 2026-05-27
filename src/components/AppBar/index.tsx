'use client'
import { Logo } from '@/components/Logo'

interface AppBarProps {
  className?: string
}

export function AppBar({ className }: Readonly<AppBarProps>) {
  return (
    <header className={`fixed top-0 left-0 right-0 z-30 h-16 bg-sidebar border-b-2 border-border flex items-center gap-3 px-4 ${className ?? ''}`}>
      <Logo size={32} />
      <span className="font-black text-lg tracking-widest text-foreground">GABUTIN</span>
    </header>
  )
}
