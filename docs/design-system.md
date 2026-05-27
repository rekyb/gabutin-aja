# Gabutin — Design System

> **Agent instruction:** Read this document before touching any UI file. All visual decisions are made here. Epics implement this spec — they do not invent their own.
>
> **Code-level tokens:** Tailwind class strings for shadows, borders, rarity colors, and XP bars are centralized in **`src/lib/design-tokens.ts`** (defined in E01). Import constants from there instead of repeating inline class strings in component files.

**Theme:** MX-Brutalist (installed via tweakcn) 
**Aesthetic:** Neo-Brutalist — sharp edges, heavy borders, teal/orange/gold, Montserrat muscle  
**Modes:** Dark (default) + Light — user-toggleable via `next-themes`. Borders and hard shadows stay pure black in both modes; only backgrounds and text flip.

---

## 1. Design Philosophy

Gabutin borrows TikTok's dopamine scroll but wraps it in a **brutalist frame** that feels intentionally raw and confident — not polished-corporate. Gen-Z Indonesia reads this as authenticity. The hardness of 0px borders and 4px shadows says "this isn't trying to be smooth, it's trying to be real."

Key contrasts to hold simultaneously:
- **Brutal structure + warm copy** — sharp edges, but "Lo emang pinter" not "Correct answer"
- **Dark + vivid** — near-black navy background makes teal and orange feel electric
- **Full-screen focus + clear escape** — feed is immersive, nav is always reachable

---

## 2. Color System

All colors are from the MX-Brutalist theme. **Never use raw hex or hardcoded oklch in components** — always use semantic token names (`bg-background`, `text-foreground`, etc.). This is what makes light/dark mode work automatically — the CSS variables swap, components don't need to change.

### Dark Mode (default)

| Token | oklch | Use |
|-------|-------|-----|
| `background` | `oklch(0.1649 0.0308 162.2739)` | Page background (dark navy) |
| `foreground` | `oklch(0.9809 0.0260 91.6197)` | Body text |
| `card` | `oklch(0.205 0 0)` | Card surfaces |
| `card-foreground` | `oklch(0.985 0 0)` | Card text |
| `primary` | `oklch(0.8484 0.2275 151.1487)` | Correct answer, CTA, active nav |
| `primary-foreground` | `oklch(0.985 0 0)` | Text on primary bg |
| `secondary` | `oklch(0.6489 0.2370 26.9728)` | Wrong answer indicator, skip |
| `accent` | `oklch(0.7951 0.1631 68.6392)` | Achievement gold, streak bonus |
| `muted` | `oklch(0.269 0 0)` | Subtle backgrounds |
| `muted-foreground` | `oklch(0.708 0 0)` | Placeholder, disabled text |
| `border` | `oklch(0 0 0)` | Pure black borders |
| `sidebar` | `oklch(0.1292 0.0270 165.3808)` | Side navigation background |

### Light Mode

| Token | oklch | Use |
|-------|-------|-----|
| `background` | `oklch(0.97 0.01 162)` | Page background (light teal-tinted white) |
| `foreground` | `oklch(0.165 0.031 162)` | Body text (near-black mirrors dark bg) |
| `card` | `oklch(1 0 0)` | Card surfaces (pure white) |
| `card-foreground` | `oklch(0.165 0.031 162)` | Card text |
| `primary` | `oklch(0.55 0.22 151)` | Correct answer, CTA — darker teal for contrast |
| `secondary` | `oklch(0.52 0.22 27)` | Wrong answer — darker orange for contrast |
| `accent` | `oklch(0.52 0.16 68)` | Achievement gold — darker for light bg |
| `muted` | `oklch(0.93 0.01 162)` | Subtle backgrounds (light grey) |
| `muted-foreground` | `oklch(0.45 0.02 162)` | Placeholder, disabled text |
| `border` | `oklch(0 0 0)` | Pure black borders — **unchanged** (core brutalist element) |
| `sidebar` | `oklch(0.93 0.015 162)` | Light sidebar background |

### What stays the same across modes

The MX-Brutalist identity is in the **borders and shadows**, not the background color. Both modes use:
- `border-border` → pure black (`oklch(0 0 0)`)
- `shadow-[4px_4px_0px_0px_black]` → pure black hard shadows
- Rarity colors (`text-blue-400`, `text-purple-400`, etc.) — legible in both modes
- `SHADOW_HARD`, `BORDER_CORRECT`, etc. from `src/lib/design-tokens.ts` → unchanged

### Semantic Usage Map

| Context | Token | Tailwind class |
|---------|-------|----------------|
| Correct answer flash | `primary` | `bg-primary text-primary-foreground` |
| Wrong answer flash | `secondary` | `bg-secondary text-secondary-foreground` |
| Skip/timer | `muted` | `bg-muted text-muted-foreground` |
| Streak badge | `accent` | `bg-accent text-accent-foreground` |
| Achievement — Common | custom | `text-gray-400 border-gray-400` |
| Achievement — Rare | custom | `text-blue-400 border-blue-400` |
| Achievement — Epic | custom | `text-purple-400 border-purple-400` |
| Achievement — Mythic | custom | `text-yellow-400 border-yellow-400` |

---

## 3. Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Page heading | Montserrat | 800 | `text-3xl` → `text-5xl` |
| Card question | Montserrat | 700 | `text-xl` |
| Card fact | Montserrat | 400 | `text-base leading-relaxed` |
| MCQ option button | Montserrat | 600 | `text-sm` |
| Score delta | Montserrat | 800 | `text-2xl` |
| Badge title | Montserrat | 700 | `text-sm` |
| User ID, metadata | Space Mono | 400 | `text-xs` |
| Source URL | Space Mono | 400 | `text-xs` |
| XP numbers | Space Mono | 700 | `text-sm` |
| Serif accent (flavor text) | Lora | 400 italic | `text-sm italic` |

**Letter spacing:** `tracking-wide` (`0.04em`) on headings. Normal on body.

---

## 4. Spacing & Layout

### Base unit: `0.25rem` (4px)

| Usage | Value |
|-------|-------|
| Micro gap (icon to label) | `gap-2` (8px) |
| Component inner padding | `p-4` (16px) |
| Card padding | `p-6` (24px) |
| Section gap | `gap-6` (24px) |
| Page padding (mobile) | `px-4 py-6` |
| Page padding (desktop) | `px-8 py-8` |

### Content max-widths

| Context | Max width |
|---------|-----------|
| Feed card (mobile-first) | `max-w-md` (448px) — phone viewport feel |
| Profile / Achievements | `max-w-2xl` (672px) |
| Sidebar width | `w-60` (240px) |

---

## 5. Border & Shadow System

The MX-Brutalist hard-shadow system is the primary depth signal. No soft box-shadows.

```css
/* Standard brutalist shadow — use on all interactive cards */
--shadow-brutal: 4px 4px 0px 0px oklch(0 0 0);

/* Pressed state (on active/focus) */
--shadow-brutal-sm: 2px 2px 0px 0px oklch(0 0 0);

/* Accent shadow (achievements, streak) */
--shadow-brutal-accent: 4px 4px 0px 0px oklch(0.7951 0.1631 68.6392);
```

Tailwind usage:
```html
<!-- Standard card -->
<div class="border border-border shadow-[4px_4px_0px_0px_black]">

<!-- Correct answer result card -->
<div class="border-2 border-primary shadow-[4px_4px_0px_0px_oklch(0.8484_0.2275_151.1487)]">

<!-- Achievement badge -->
<div class="border border-yellow-400 shadow-[4px_4px_0px_0px_oklch(0.7951_0.1631_68.6392)]">
```

**No `rounded-*` anywhere.** `border-radius: 0px` is the law.

---

## 6. Navigation — Responsive Pattern

### Rule
- **Mobile (default → below `lg`):** Bottom navigation bar, fixed to bottom
- **Desktop (`lg:` and above, ≥1024px):** Side navigation, fixed to left, 240px wide

### Root Layout Structure

```tsx
// app/layout.tsx
<html lang="id" className={`dark ${fonts}`}>
 <body className="bg-background text-foreground antialiased">
  <div className="flex min-h-screen">
   {/* Side nav — desktop only */}
   <SideNav className="hidden lg:flex" />

   {/* Main content — offset for sidebar on desktop */}
   <main className="flex-1 lg:pl-60 pb-20 lg:pb-0">
    {children}
   </main>
  </div>

  {/* Bottom nav — mobile only */}
  <BottomNav className="lg:hidden" />
 </body>
</html>
```

### Bottom Navigation (`src/components/BottomNav/index.tsx`)

```

 [Feed icon] [Trophy icon] [User] 
  Feed    Achievements Profile 

```

- Fixed: `fixed bottom-0 left-0 right-0 z-50`
- Background: `bg-sidebar border-t-2 border-border`
- Height: `h-16` (64px)
- Content: `pb-safe` (safe area inset for iPhone notch)
- Active item: `text-primary` + bold underline
- Inactive item: `text-muted-foreground`
- Icons: Lucide — `Home`, `Trophy`, `User2` at `h-5 w-5`

### Side Navigation (`src/components/SideNav/index.tsx`)

```

 GABUTIN         ← Logo/wordmark, Montserrat 800
   ← border
             
  Feed          ← active: primary color, 2px left border
  Achievements     
  Profile       
             
  
 Level 7 · Penasaran   ← user quick-stat (if registered)
  243/316 XP    ← mini XP bar

```

- Fixed: `fixed left-0 top-0 h-screen w-60 z-40`
- Background: `bg-sidebar border-r-2 border-border`
- Active item: `border-l-4 border-primary bg-primary/10 text-primary font-bold`
- Inactive item: `text-foreground hover:bg-muted/50`
- Padding: `px-4 py-6`
- Logo: Montserrat 800, `text-2xl tracking-wide`

---

## 7. Feed Layout — Mobile vs Desktop

On mobile, the feed is full-screen immersive. On desktop, it's a phone-width column centered (or left-aligned with sidebar), echoing TikTok Web.

```
Mobile:             Desktop (lg+):
       
                      [max-w-md centered]   
  Card (full          SideNav    
  screen)                   Card content    
                                 
                        
                         
 BottomNav          

```

Feed card container on desktop:
```tsx
<div className="flex justify-center lg:justify-start lg:pl-8 pt-6">
 <div className="w-full max-w-md">
  {/* card */}
 </div>
</div>
```

Feed card height:
- Mobile: `min-h-[calc(100dvh-64px)]` (full viewport minus bottom nav)
- Desktop: `min-h-[calc(100dvh-48px)]` (full height, no bottom nav offset)

---

## 8. Card Component Design

Each card state follows this visual language:

### Base Card Shell
```html
<div class="
 bg-card border-2 border-border
 shadow-[4px_4px_0px_0px_black]
 p-6 flex flex-col gap-4
 w-full max-w-md
">
```

### STATE 1 — Fact Card
- Fact text: `text-base leading-relaxed font-normal`
- Source link: `font-mono text-xs text-muted-foreground underline`
- "Siap?" button: full-width, `bg-primary text-primary-foreground font-bold py-3 border-2 border-border shadow-[2px_2px_0px_0px_black] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]`

### STATE 2 — Question Card
- Question: `text-xl font-bold leading-tight mb-4`
- MCQ option button: 
 ```html
 border-2 border-border bg-card hover:bg-primary/10 
 font-semibold py-3 px-4 text-left w-full
 active:bg-primary/20 cursor-pointer
 transition-colors duration-150
 ```
- Selected (pending): `bg-primary/20 border-primary`
- Timer bar: horizontal progress bar across top of card, `h-1 bg-primary` shrinking left to right

### STATE 3 — Result Card
- **Correct:** card gets `border-primary shadow-[4px_4px_0px_0px_oklch(0.8484_0.2275_151.1487)]`
- **Wrong:** card gets `border-secondary shadow-[4px_4px_0px_0px_oklch(0.6489_0.2370_26.9728)]`
- **Skip:** card gets `border-muted shadow-[4px_4px_0px_0px_oklch(0.269_0_0)]`
- Delta display: `text-3xl font-black` — `+2` in primary or `-2` in secondary
- Explanation text: Lora italic `text-sm`

### STATE 4 — Next Card
- "Lanjut →" button: same as "Siap?" but outlined variant
- Swipe hint text: `text-xs text-muted-foreground` — "atau swipe ke atas"

---

## 9. Achievement Badge Design

```

  Gak Ada Obat!   ← icon + title
 5 streak berturut   ← description
 [RARE]        ← rarity pill, color-coded

```

- Badge card: `border-2 border-[rarity-color] shadow-[4px_4px_0px_0px_rarity-color] p-4`
- Icon: text emoji rendered at `text-3xl` (emoji IS acceptable for achievement badges — these are decorative identity elements, not functional UI icons)
- Locked badge: `opacity-30 grayscale` with progress hint overlay
- Rarity pill: `text-[10px] font-black tracking-widest px-2 py-0.5 border border-current`

---

## 10. XP Bar Component

```
Level 7     Penasaran
 243 / 316 XP
```

- Container: `flex flex-col gap-1`
- Track: `w-full h-2 bg-muted border border-border`
- Fill: `h-full bg-primary transition-[width] duration-500`
- Fill element must have `data-testid="xp-progress"` for tests
- Text: Space Mono `text-xs` for numbers, Montserrat `text-sm font-bold` for title

---

## 11. Animation Guidelines

| Situation | Animation | Duration |
|-----------|-----------|----------|
| Card state transitions | `transition-opacity duration-200` | 200ms |
| Answer button hover | `transition-colors duration-150` | 150ms |
| Achievement toast entry | `translate-y-full → translate-y-0` | 300ms ease-out |
| Toast exit | `opacity-100 → opacity-0` | 200ms |
| Level-up flash | `animate-pulse` for 1s then stop | 1000ms |
| XP bar fill | `transition-[width] duration-500` | 500ms ease-out |
| Timer bar drain | CSS linear `transition` synced to 10s countdown | 10000ms linear |
| Loading skeleton | `animate-pulse` | continuous (loading only) |

**No bouncing, no spinning decorative elements.** Respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
 *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
```

---

## 12. Loading Skeleton Design

```tsx
// CardSkeleton — matches card proportions
<div className="w-full max-w-md border-2 border-border shadow-[4px_4px_0px_0px_black] p-6 space-y-4">
 <div className="h-4 bg-muted animate-pulse w-3/4" />
 <div className="h-4 bg-muted animate-pulse w-full" />
 <div className="h-4 bg-muted animate-pulse w-5/6" />
 <div className="h-4 bg-muted animate-pulse w-2/3" />
 <div className="mt-6 h-12 bg-muted animate-pulse w-full" />
</div>
```

Skeleton bars have **no border-radius** (matches brutalist theme).

---

## 13. Guest Banner Design

Persistent, non-dismissible banner across the top of every page (below the sidenav header on desktop, above content on mobile):

```

 WARNING: Main sebagai tamu — progress bisa ilang kalau lo  
   hapus cache [Simpan Progress →]          

```

- Style: `bg-secondary/20 border-b-2 border-secondary px-4 py-2 flex items-center justify-between`
- Warning icon: Lucide `AlertTriangle` at `h-4 w-4 text-secondary`
- CTA button: small, `border border-secondary text-secondary text-xs font-bold px-3 py-1`

---

## 14. Responsive Breakpoints

| Breakpoint | Width | Navigation | Feed card | Content |
|------------|-------|------------|-----------|---------|
| default (mobile) | < 1024px | Bottom nav | Full width, `max-w-md` | `px-4` |
| `lg` | ≥ 1024px | Side nav (240px) | `max-w-md`, offset left | `pl-8` |
| `xl` | ≥ 1280px | Side nav | `max-w-md`, more breathing room | `pl-12` |

No design changes needed between `md` (768px) and `lg` (1024px) — the navigation breakpoint is `lg` only.

**Main content always has**: `lg:pl-60` to account for the 240px sidebar.

---

## 15. Accessibility

- All interactive elements have visible focus rings: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background`
- Color is never the sole indicator — correct/wrong also shown with text "Benerr!" / "Yahhh salah!"
- MCQ options are `<button>` elements (not `<div>`)
- Timer expiry announced via `aria-live="polite"` region
- DiceBear avatar has `alt={displayName}`
- Bottom nav links have `aria-label` e.g., `aria-label="Feed"`

---

## 16. Icon Usage

**Rule:** Use [Lucide React](https://lucide.dev/) icons at `h-5 w-5` consistently. Never use emoji as UI navigation icons.

| Location | Icon | Lucide name |
|----------|------|-------------|
| Feed nav item | `Home` | `Home` |
| Achievements nav item | `Trophy` | `Trophy` |
| Profile nav item | `User` | `User2` |
| Guest banner warning | `AlertTriangle` | `AlertTriangle` |
| Skip button | `FastForward` | `FastForward` |
| Source URL | `ExternalLink` | `ExternalLink` |
| Streak indicator | `Flame` | `Flame` |
| Level up | `TrendingUp` | `TrendingUp` |

Achievement badges use **emoji** (  etc.) at `text-3xl` — these are decorative identity icons, not navigation. This is the one emoji exception.

---

## References

- [implementation-overview.md](./implementation-overview.md) — shared types, file tree
- [product-design.md §5](./product-design.md) — UI Aesthetic, Copy examples
- [product-design.md §15](./product-design.md) — Routes, Card Lifecycle
- MX-Brutalist theme: `https://tweakcn.com/r/themes/cmllfu8oc000004l1a0tidj2g`
- Lucide React: `https://lucide.dev/icons/`
