// Card surfaces
export const CARD_BASE = 'bg-card border-2 border-border shadow-[4px_4px_0px_0px_black] p-6' as const
export const CARD_LIGHT_BORDER = 'border border-border p-3' as const

// Shadows (hard-edged, 0px blur — brutalist)
export const SHADOW_HARD = 'shadow-[4px_4px_0px_0px_black]' as const
export const SHADOW_MEDIUM = 'shadow-[2px_2px_0px_0px_black]' as const

// Button pressed effect (active state)
export const BUTTON_PRESS = 'shadow-[2px_2px_0px_0px_black] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]' as const

// Result card border+shadow states (correct / wrong / skip)
export const BORDER_CORRECT = 'border-2 border-primary shadow-[4px_4px_0px_0px_hsl(var(--primary))]' as const
export const BORDER_WRONG = 'border-2 border-secondary shadow-[4px_4px_0px_0px_hsl(var(--secondary))]' as const
export const BORDER_SKIP = 'border-2 border-muted-foreground shadow-[4px_4px_0px_0px_hsl(var(--muted-foreground))]' as const

// Achievement rarity text colors
export const RARITY_COLORS: Record<string, string> = {
  Common: 'text-muted-foreground',
  Rare: 'text-blue-400',
  Epic: 'text-purple-400',
  Mythic: 'text-yellow-400',
}

// XP bar
export const XP_BAR_TRACK = 'h-2 bg-muted border border-border w-full' as const
export const XP_BAR_FILL = 'h-full bg-primary transition-[width] duration-500' as const

// MCQ answer option button
export const MCQ_OPTION = 'border-2 border-border py-3 px-4 text-left cursor-pointer transition-colors duration-150 hover:bg-primary/10 w-full' as const

// Showcase badge slot
export const SHOWCASE_SLOT = 'border-2 border-border shadow-[4px_4px_0px_0px_black] p-4' as const
export const SHOWCASE_SLOT_EMPTY = 'bg-muted text-muted-foreground text-center text-sm' as const

// Timer bar (drains over 10s)
export const TIMER_BAR_TRACK = 'h-1 w-full bg-muted' as const
export const TIMER_BAR_FILL = 'h-full bg-primary' as const

// Achievement toast position
export const TOAST_POSITION = 'fixed bottom-24 lg:bottom-8 left-4 right-4 lg:left-auto lg:right-8 lg:w-80 z-50' as const
