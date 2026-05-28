'use client'
import { useTheme } from '@/lib/theme'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/Button'
import type { FC } from 'react'

export const ThemeToggle: FC = () => {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      variant="ghost"
      fullWidth
      className="bg-muted px-4 py-3 hover:bg-primary hover:text-primary-foreground transition-colors"
      leftIcon={theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    >
      Ubah Tema
    </Button>
  )
}

