'use client'
import type { FC } from 'react'
import type { ThemeName } from '@/types'
import { CARD_BASE, SHADOW_HARD } from '@/lib/design-tokens'

const THEME_LABELS: Record<ThemeName, string> = {
  sejarah_indonesia: '🇮🇩 Sejarah Indonesia',
  sains: '🔬 Sains',
  pop_culture: '🎬 Pop Culture',
  geografi: '🌍 Geografi',
  matematika: '🔢 Matematika',
  psikologi: '🧠 Psikologi',
  sejarah_dunia: '🌐 Sejarah Dunia',
  coding_tech: '💻 Coding & Tech',
  tutorial: '📖 Tutorial',
}

const SELECTABLE_THEMES = Object.keys(THEME_LABELS).filter(
  (t) => t !== 'tutorial',
) as ThemeName[]

export interface ThemePickerProps {
  selected: ThemeName[]
  onChange: (themes: ThemeName[]) => void
}

export const ThemePicker: FC<ThemePickerProps> = ({ selected, onChange }) => {
  const toggle = (theme: ThemeName) => {
    if (selected.includes(theme)) {
      onChange(selected.filter((t) => t !== theme))
    } else if (selected.length < 3) {
      onChange([...selected, theme])
    }
  }

  return (
    <div className="space-y-3">
      <p className="font-mono text-sm text-muted-foreground">
        Pilih tepat 3 tema yang lo suka ({selected.length}/3)
      </p>
      <div className="grid grid-cols-2 gap-3">
        {SELECTABLE_THEMES.map((theme) => {
          const isSelected = selected.includes(theme)
          const isDisabled = !isSelected && selected.length >= 3
          return (
            <button
              key={theme}
              onClick={() => toggle(theme)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              className={[
                'border-2 py-3 px-4 text-left font-sans font-bold text-sm transition-colors',
                isSelected
                  ? `bg-primary text-primary-foreground border-primary ${SHADOW_HARD}`
                  : 'bg-card text-foreground border-border hover:bg-primary/10',
                isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
              ].join(' ')}
            >
              {THEME_LABELS[theme]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
