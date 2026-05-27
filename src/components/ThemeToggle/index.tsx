'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import type { FC } from 'react'

export const ThemeToggle: FC = () => {
  const { theme, setTheme } = useTheme()
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2"
      aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
