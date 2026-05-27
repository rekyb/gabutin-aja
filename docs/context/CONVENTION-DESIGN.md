# Design System & Copy Conventions — CONVENTION-DESIGN.md

## 1. Aesthetic Laws (Neo-Brutalist Dark)
- **Source of Truth:** Always refer to [`docs/design-system.md`](docs/design-system.md) for detail layouts.
- **Visual Feel:** Heavy borders, flat 0px rounded edges, primary black hard-shadow depths, high-vibe dark colors, Lora italics, and Montserrat muscles.
- **Absolutely 0px Border Radius:** Strictly **no `rounded-*` CSS classes** allowed anywhere on buttons, inputs, list items, cards, badges, or loading skeleton bars. All elements must feature hard, flat-cut edges.
- **No Soft Shadows:** Soft blurs or box-shadow layers are banned. Use only standard hard shadows: `--shadow-brutal` (`shadow-[4px_4px_0px_0px_black]`) or pressed variants (`shadow-[2px_2px_0px_0px_black]`).
- **Color System Map (OKLCH):**
 - Page Background: dark navy `bg-background` (`oklch(0.1649 0.0308 162.2739)`)
 - Body Text: `text-foreground` (`oklch(0.9809 0.0260 91.6197)`)
 - Primary / CTAs / Correct Flash: teal `bg-primary` (`oklch(0.8484 0.2275 151.1487)`)
 - Secondary / Wrong Flash / skips: orange `bg-secondary` (`oklch(0.6489 0.2370 26.9728)`)
 - Accent / Streaks / Gold: gold `bg-accent` (`oklch(0.7951 0.1631 68.6392)`)
 - Borders: pure black `border-border` (`oklch(0 0 0)`)
- **Central Token Dictionary:** Import standard class groups from `src/lib/design-tokens.ts` (e.g. `SHADOW_HARD`, buttons, card styles). Never hardcode these styling strings inside components.

---

## 2. Typography Rules
- **Headers, questions, MCQ buttons, badge titles:** Montserrat (`font-bold` or `font-black tracking-wide`).
- **User IDs, source URL links, metadata details, XP numbers:** Space Mono (`font-mono`).
- **Card fact excerpts, Lora accents, flavor text explanations:** Lora italic (`font-serif italic`).

---

## 3. Copy & Localized Tone (Bahasa Indonesia Register)
- **Language Register:** Casual Bahasa Indonesia with casual English mixed in ("lo/gue" - never "kamu/saya"). Informative, energetic, and internet-native.
- **Strict Emoji Ban:** Emojis are strictly banned everywhere in the codebase (including user-facing UI copy, source code, comments, logs, and markdown documents). Use standard SVGs for icons and simple textual feedback instead.
- **Icon Usage:** Use Lucide React icons at `h-5 w-5` for all functional UI layouts (e.g. `Home`, `Trophy`, `User2`, `AlertTriangle`). Never use emoji as functional navigation icons.

---

## 4. Copy Reference Dictionary (Emoji-Free)
- **Welcome:** "Halo! Lagi gabut? Yuk ubah jadi sesuatu yang berguna"
- **Save Progress:** "Simpan progress lo biar nggak ilang!"
- **Correct Answer:** "Benerr! Lo emang pinter"
- **Wrong Answer:** "Yahhh salah! Tapi gapapa, belajar dari situ"
- **Timer Expired:** "Waktunya habis! Yuk fokus dikit"
- **Level Up:** "Level up! Lo makin pinter nih"
- **Re-engagement Card:** "Lo udah jawab 15+ soal. Jangan sampe ilang — simpan progress lo dalam 10 detik."
- **Guest Banner Warning:** "Main sebagai tamu — progress bisa ilang kalau lo hapus cache"
