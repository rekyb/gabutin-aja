# Frontend Conventions — CONVENTION-FE.md

## 1. React & Components Rule
- **'use client' Restriction:** Use `'use client'` only on components requiring browser APIs, event handlers, or React state. Never set it at the page level.
- **Server Components by Default:** Keep page shells and read-only layouts as React Server Components (RSC).
- **Function/Component Length:** Keep modular UI logic and JSX well-structured. Break large components down into sub-components.
- **No Default Exports on Server Actions:** Always use named exports.
- **Co-location:** Co-locate all assets, styles, and test files under each component's directory: `src/components/[ComponentName]/[ComponentName].test.tsx`.

---

## 2. Responsive Navigation & Structure
- **Mobile Navigation (Default / < 1024px):** Fixed bottom nav bar (`src/components/BottomNav/`) with Tailwind class `lg:hidden`.
- **Desktop Navigation (lg / ≥ 1024px):** Fixed left side nav bar (`src/components/SideNav/`) with Tailwind class `hidden lg:flex`, `w-60` (240px wide).
- **Layout Offset:** The main `<main>` wrapper must have `className="flex-1 lg:pl-60 pb-20 lg:pb-0"` to clear the side nav and bottom nav bounds.
- **CSS-Only:** All media queries and nav toggles must rely on Tailwind breakpoint classes. Absolutely **no React state, JS hooks, or `useMediaQuery` triggers** for layout changes.

---

## 3. Shared & Global Components (Shell Pattern)
All global components are scaffolded as **empty shells in E01**. Do not create these from scratch. Import and replace their contents while keeping their interfaces unchanged:

| Component | Path | Shell Owner | Logic Owner |
|-----------|------|-------------|-------------|
| `BottomNav` | `src/components/BottomNav/` | E01 (complete) | — |
| `SideNav` | `src/components/SideNav/` | E01 (complete) | — |
| `GuestBanner` | `src/components/GuestBanner/` | E01 | E02 |
| `ReEngagementCard` | `src/components/ReEngagementCard/` | E01 | E02 |
| `CardFact` | `src/components/Card/CardFact.tsx` | E01 | E04 |
| `CardQuestion` | `src/components/Card/CardQuestion.tsx` | E01 | E04 |
| `CardResult` | `src/components/Card/CardResult.tsx` | E01 | E04 |
| `CardNext` | `src/components/Card/CardNext.tsx` | E01 | E04 |
| `AchievementToast` | `src/components/AchievementToast/` | E01 | E04 |
| `CountdownTimer` | `src/components/CountdownTimer/` | E01 | E04 |
| `CardSkeleton` | `src/components/CardSkeleton/` | E01 | E04 |
| `XpBar` | `src/components/XpBar/` | E01 | E08 |
| `ProfileClient` | `src/components/ProfileClient/` | E01 | E08 |

---

## 4. Styling, Tokens, & Utility Rules
- **Tailwind Utility Only:** Absolutely **no inline styles or CSS modules**. Base components must use shadcn/ui.
- **Centralized Design Token Usage:** Always import styling constants from `@/lib/design-tokens.ts` (e.g. shadow layers `SHADOW_HARD`, buttons, MCQ buttons). Never hardcode styling string variants inside component files.
- **Strict Keyboard Accessibility:** Ensure semantic HTML usage (e.g., `<button>` for action clicks, never `<div onClick>`), visible focus indicators (`focus-visible:ring-2`), and proper ARIA states.
