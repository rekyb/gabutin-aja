'use client'
import { useTheme } from '@/lib/theme'
import { Sun, Moon } from 'lucide-react'
import { BUTTON_PRESS } from '@/lib/design-tokens'
import type { FC } from 'react'

export const ThemeToggle: FC = () => {
  const { theme, setTheme } = useTheme()
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      className={`${BUTTON_PRESS} w-full flex items-center justify-center gap-2 bg-muted px-4 py-3 font-bold text-sm hover:bg-primary hover:text-primary-foreground transition-colors`}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span>Ubah Tema</span>
    </button>
  )
}
