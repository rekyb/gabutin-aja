# E04-01 — UX Revamp & Instagram-Style Scrolling

This plan outlines the structural UX overhaul for the onboarding flow and the main feed page. It transitions the experience from a fixed TikTok-swipe card slider to an Instagram-style continuous scroll timeline, streamlines first-visit registration by removing the tutorial, and establishes a global dedicated login action header on both mobile and desktop views.

---

## 1. Global UI & Login Sequence Modal

### [NEW] `src/store/uiStore.ts`
- Managed via Zustand `useUiStore` to orchestrate programmatic UI states, specifically the visibility of the global neobrutalist login popup modal (`showLoginModal`, `openLoginModal()`, `closeLoginModal()`).

### [NEW] `src/components/LoginModal/index.tsx`
- A stunning neobrutalist modal (`z-50`, dark backdrop, thick black borders, `0px border-radius`, hard shadows) that overlays the viewport.
- Contains two primary buttons:
  - **Masuk pake Google**: A prominent white button with the Google SVG icon that redirects to `/api/auth/google?guest_uid=[uid]` to initiate full authenticated onboarding.
  - **Jadi tamu aja**: An outlined neobrutalist button that registers the user as `guestOnly` in local storage, closes the modal, and triggers the onboarding sequence by redirecting to `/welcome`.

### [MODIFY] `src/app/layout.tsx`
- Mounts the global `<LoginModal />` inside `<Providers>` at the root of the layout.

---

## 2. Header Actions ("Saran dong" & "Masuk" Buttons)

### [MODIFY] `src/components/AppBar/index.tsx`
- Updates the mobile header (`lg:hidden`) to display a top-right action group:
  - **Saran dong**: A small, clean button styled with an empty click handler (`href="#"`) for future PostHog/Google Form survey integrations.
  - **Masuk**: A prominent, small neobrutalist button that triggers `openLoginModal()`.
- Condition: The "Masuk" button dynamically hides if the user's browser session reveals they are already fully onboarded (database user record exists).

### [NEW] `src/components/DesktopHeader/index.tsx`
- Implements a lightweight, floating top-right action header (`hidden lg:flex fixed top-4 right-6 z-30 gap-3`) for desktop views.
- Houses the identical action buttons ("Saran dong" and the conditional "Masuk" button).

### [MODIFY] `src/app/layout.tsx`
- Renders the new `<DesktopHeader />` globally so it floats appropriately in the top-right over desktop page layouts.

---

## 3. Streamlined Onboarding & Registration (Welcome Page)

### [MODIFY] `src/app/welcome/WelcomeClient.tsx`
- **Remove Tutorial Sequence**: Removes the static tutorial cards, phase states for cards, and the interactive countdown timer from the welcome page.
- **Repurpose to Onboarding Only**: Directly renders the registration form prompting the user to enter their display name and select exactly 3 themes via `ThemePicker`.
- Submission calls `createUser(displayName, themes, uid)` and transitions the user to `/feed` as fully onboarded.
- Utilizes client-safe state for `uid` inside `useEffect` to prevent prerender/SSR compilation errors.

### [MODIFY] `src/app/ClientBootstrap.tsx`
- Removes the first-visit force-redirect to `/welcome`. New guest users will have a `uniqueUserId` generated in local storage and will remain on `/feed` instead of being intercepted.

---

## 4. Instagram-style Infinite Scroll Feed

### [MODIFY] `src/components/CardShell/index.tsx`
- Refactors the component styles to eliminate rigid full-height layout properties (`flex-1 min-h-0`, fixed percentage heights `h-[35%]`, etc.).
- Allows the card shell to flow with **natural heights** matching the content inside:
  - Image block: Fixed aspect ratio (`aspect-[16/10]`) at the top.
  - Content block: Natural padding and height expansion.

### [NEW] `src/components/Feed/FeedCard.tsx`
- A highly optimized card wrapper component that houses the internal state machine for each individual card in the feed:
  - `phase: 'fact' | 'question' | 'result'`
  - `selectedAnswer: number | null`
  - `timeLeft: number`
  - `response: SubmitAnswerResponse | null`
  - `wasTimeout: boolean`
- Renders sub-components dynamically inline based on the phase:
  - **STATE 1: Fact**: Wikipedia image on top, the fact text caption, source URL, and a **small, non-prominent neobrutalist button "Kuis!"** on the bottom actions panel.
  - **STATE 2: Question**: Displays the card question, the 10-second circular countdown timer, the four MCQ options, and a Skip button. Launches the local timer.
  - **STATE 3: Result**: Correct/wrong header badge, streak counter, XP delta indicator, blockquote explanation text, and Wikipedia source. If new achievements are unlocked (`response.newAchievements`), appends them to the global store's achievements toast queue.

### [MODIFY] `src/store/feedStore.ts`
- Redesigns the feed store to manage a list of cards `cards: CardDoc[]` rather than a single active card.
- Implements `loadInitialCards()` to load initial pre-populated content and `loadMoreCards()` to dynamically fetch and append next cards.
- Exposes `appendAchievements(newAchievements: AchievementDef[])` action to let local card result events populate the global achievements toast queue.

### [MODIFY] `src/components/FeedClient/index.tsx`
- Removes the up-down desktop scroll indicators, wheel/touch hijacking listeners, and full-viewport locked animations.
- Renders a normal vertical flex layout containing the list of active cards with custom heights.
- Implements an `IntersectionObserver` on the bottom to automatically trigger `loadMoreCards()` and lazy-load additional content infinitely.
