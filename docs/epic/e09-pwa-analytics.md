# E09 — PWA & Analytics

**Status:** [ ] Not started 
**Wave:** 3 (start after E01, E02; can run in parallel with E04–E08)

---

## Goal

Configure the app as an installable PWA and wire up PostHog event tracking for all 14 key events. This is infrastructure — it doesn't build visible features, but without it the app is un-installable and the hackathon validation data won't exist.

## Why

PWA enables "Add to Home Screen" on iOS and Android — critical for a mobile-first product. PostHog validates whether Gabutin actually delivers learning behavior and engagement. Both are required for the hackathon demo and post-hackathon iteration.

---

## Functional Requirements

### PWA

1. Install `next-pwa` and configure in `next.config.ts`
2. Create `public/manifest.json` with correct name, short name, icons, colors, display mode
3. Offline fallback page at `app/offline/page.tsx`: `"Ups, lo offline nih. Balik lagi ya biar streak lo tetap jalan "`
4. `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` in root layout
5. `<meta name="theme-color" content="#09090b">` (zinc-950, matches dark background) in root layout
6. Apple-specific PWA meta tags in root layout:
  - `<meta name="apple-mobile-web-app-capable" content="yes">`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
7. App icons: generate 192×192 and 512×512 PNG icons and place in `public/icons/`

### Analytics

8. Install `posthog-js` and `posthog-node`
9. Create `app/providers.tsx` (Client Component) that initializes PostHog with `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`
10. Wrap root `app/layout.tsx` children with `<Providers>`
11. Create `src/lib/analytics/events.ts` with named event-tracking wrappers
12. Track all 14 events listed below
13. `distinctId` = `uniqueUserId` from localStorage (set via `posthog.identify(uniqueUserId)` on first load)
14. Server-side events use `posthog-node` client in Server Actions

---

## Events to Track

| Event | Where | Properties |
|-------|-------|------------|
| `session_started` | `app/providers.tsx` on mount | `{ is_registered: boolean }` |
| `tutorial_started` | `/welcome` page load | — |
| `tutorial_completed` | After 3rd tutorial card answered | — |
| `onboarding_completed` | After `createUser` succeeds | `{ themes: string[] }` |
| `onboarding_skipped` | User clicks skip | — |
| `card_viewed` | STATE 1 mount | `{ theme, card_id }` |
| `card_answered` | After `submitAnswer` returns | `{ theme, result, xp_gained, streak, level }` |
| `card_skipped` | Timer expires or explicit skip | `{ theme, streak_lost }` |
| `level_up` | When `response.leveledUp === true` | `{ new_level, title }` |
| `achievement_unlocked` | When `response.newAchievements.length > 0` | `{ key, title, rarity }` |
| `badge_showcased` | After `pinBadge` succeeds | `{ key, position }` |
| `re_engagement_shown` | `ReEngagementCard` renders | `{ cards_answered }` |
| `re_engagement_converted` | User taps "Simpan Progress" on reminder card | — |

Note: `card_skipped` fires for both explicit skip button (if one exists) and timer expiry. `card_answered` fires for all answer results including skip — `card_skipped` is a redundant event for PostHog funnel analysis, not a replacement.

---

## API Contracts

```ts
// src/lib/analytics/events.ts

// Client-side (browser)
export function trackEvent(event: string, properties?: Record<string, unknown>): void
// Wraps posthog.capture() — no-ops if posthog not initialized

// Server-side (Server Actions)
export async function trackServerEvent(
 distinctId: string,
 event: string,
 properties?: Record<string, unknown>
): Promise<void>
// Uses posthog-node PostHogClient
```

Usage in components:
```ts
import { trackEvent } from '@/lib/analytics/events'
trackEvent('card_viewed', { theme: card.theme, card_id: card._id.toString() })
```

---

## PostHog Initialization

```tsx
// app/providers.tsx
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
 useEffect(() => {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
   api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
   capture_pageview: false, // manual control
  })
  const userId = localStorage.getItem('uniqueUserId')
  if (userId) posthog.identify(userId)
 }, [])

 return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

---

## manifest.json

```json
{
 "name": "Gabutin",
 "short_name": "Gabutin",
 "description": "Ubah waktu gabut jadi ilmu",
 "start_url": "/",
 "display": "standalone",
 "background_color": "#09090b",
 "theme_color": "#09090b",
 "orientation": "portrait",
 "icons": [
  { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
  { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
 ]
}
```

---

## next.config.ts

```ts
import withPWA from 'next-pwa'

const nextConfig = withPWA({
 dest: 'public',
 disable: process.env.NODE_ENV === 'development',
 fallbacks: {
  document: '/offline',
 },
})({
 // existing Next.js config
})

export default nextConfig
```

---

## Acceptance Criteria

- [ ] Chrome DevTools → Application → Manifest shows correct name, icons, theme color
- [ ] "Add to Home Screen" prompt appears on mobile Chrome/Safari
- [ ] Offline fallback page renders when network is disconnected (test with DevTools → Network → Offline)
- [ ] `posthog.capture('tutorial_started')` fires on first `/welcome` load (verify in PostHog Live Events)
- [ ] `posthog.capture('card_answered', { theme, result, xp_gained, streak, level })` fires with all 5 properties
- [ ] `posthog.identify(uniqueUserId)` called on app load when `uniqueUserId` is in localStorage
- [ ] No PII in any PostHog event properties (no display name, no email)
- [ ] `trackEvent` is a no-op if posthog is not initialized (does not throw)
- [ ] `pnpm build` still passes with next-pwa added

---

## Tests

Analytics wrappers must be no-ops when PostHog is not initialized (no throws in test environment).

### `src/lib/analytics/events.test.ts`
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// PostHog is not initialized in test environment
vi.mock('posthog-js', () => ({
 default: { capture: vi.fn(), identify: vi.fn() },
}))

describe('trackEvent', () => {
 beforeEach(() => { vi.clearAllMocks() })

 it('calls posthog.capture with event name and properties', async () => {
  const posthog = (await import('posthog-js')).default
  const { trackEvent } = await import('@/lib/analytics/events')
  trackEvent('card_answered', { theme: 'sains', result: 'correct' })
  expect(posthog.capture).toHaveBeenCalledWith('card_answered', { theme: 'sains', result: 'correct' })
 })

 it('does not throw when called without properties', async () => {
  const { trackEvent } = await import('@/lib/analytics/events')
  expect(() => trackEvent('tutorial_started')).not.toThrow()
 })
})
```

Run: `rtk vitest run src/lib/analytics/events.test.ts`

---

## In Scope

- `next-pwa` configuration (`next.config.ts`)
- `public/manifest.json`
- `public/icons/icon-192.png` and `icon-512.png` (placeholder icons are fine for hackathon)
- `app/offline/page.tsx`
- Viewport + Apple PWA meta tags in `app/layout.tsx`
- `app/providers.tsx` (PostHog initialization)
- `src/lib/analytics/events.ts` (event tracking wrappers)
- All 14 events wired into their respective components (coordinate with E02/E04/E06/E08 epics)

---

## Out of Scope / Guardrails

- PostHog survey configuration is dashboard-only — no code changes needed
- No custom service worker beyond `next-pwa` defaults
- Analytics calls must never throw (wrap in try/catch or no-op pattern)
- Do not block any user interaction waiting for an analytics call to complete
- `capture_pageview: false` — do not use PostHog's auto-pageview (manual events only)

---

## Dependencies

- **E01** — root layout (`app/layout.tsx`), `src/env.ts` for `NEXT_PUBLIC_POSTHOG_*` vars
- **E02** — `uniqueUserId` in localStorage (needed for `posthog.identify`)

---

## Coordination Notes

This epic places `trackEvent` calls inside components owned by E02, E04, E06. Coordinate with those agents to either:
- Have them call `trackEvent` directly in their components, OR
- Add tracking calls in this epic after those epics ship

Recommended: track in each component where the event naturally occurs. This epic provides the `trackEvent` utility; other epics use it.

---

## References

- [implementation-overview.md](../implementation-overview.md) — env vars, `NEXT_PUBLIC_POSTHOG_*`
- [product-design.md §14](../product-design.md) — Analytics & Validation (full event list)
- [product-design.md §16](../product-design.md) — PWA Configuration
- PostHog Next.js docs: `posthog-js/react` + `posthog-node`
- next-pwa: `npm i next-pwa`
