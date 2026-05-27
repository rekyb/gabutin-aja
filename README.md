# Gabutin

> **Doomscroll TikTok/IG berjam-jam tapi nggak dapet apa-apa?**  
> Gabutin wraps the same short-form dopamine scroll mechanics into Indonesian educational trivia. Pure facts from Wikipedia + AI-generated 10-second MCQ challenges = real knowledge dopamine.

Designed specifically for **Indonesian Gen-Z (16–25)**, **Gabutin** uses a bold, raw **Neo-Brutalist Dark** UI, highly casual Bahasa Indonesia register ("lo/gue"), and immediate zero-friction guest play to make learning feel like social scrolling.

---

## Key Features

* **Zero-Friction Onboarding (Guest-First):** Play instantly. No password, no signup forms. Generates a local 9-digit ID with instant DiceBear pixel-art seeds.
* **Wikipedia → Gemini AI Pipeline:** No manual question writing. When theme pools run low, the background engine fetches random Indonesian Wikipedia articles and uses the **Google Gemini API** to generate high-quality casual MCQs.
* **Adaptive Weakness-Weighted Feed:** The algorithm calculates inverted theme points to serve cards weighted toward your weakest categories, keeping you constantly learning where it counts.
* **Dopamine Progression System:** 
  * XP level-ups with polynomial progression curves.
  * Casual Gen-Z Indonesian level titles (e.g., *Newbie Gabut*, *Penasaran*, *Anak Pintar*, *Sultan Ilmu*, *Dewa Gabut*).
  * Streak multipliers (+2 to +7 XP based on consecutive correct streaks).
* **Neo-Brutalist Showcase:** Grid of 17 decorative badges (from *Menyala Abangku!* to *Nyaris Kena Mental*). Pin up to 3 showcase badges directly to your profile.
* **100% PWA (Progressive Web App):** Installable on iOS/Android home screens with dedicated offline fallback support.

---

## Technology Stack

| Layer | Choice |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack, Standalone container builds) |
| **Language** | TypeScript (Strict) |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Theme** | Neo-Brutalist Dark (MX-Brutalist: 0px border-radius, pure black 4px shadows) |
| **Database** | MongoDB Atlas + Mongoose (Strict schemas, `.lean()` reader optimization) |
| **AI Question Engine** | Google Gemini API (`@google/genai`) |
| **Content Scraper** | Wikipedia REST API (`id.wikipedia.org`) |
| **Analytics & Surveys** | PostHog (Project tracking + native pop-up surveys) |
| **Testing** | Vitest + React Testing Library (Strict CI 80%+ coverage gate) |
| **Deployment** | Dockerized Alpine-Node standalone container on Google Cloud Run |

---

## How the Card Lifecycle Works

```
[STATE 1: Fact] 
   → Reads a 200-word Wikipedia excerpt in Indonesian 
   → Accesses original article link
   → Tap "Siap?" or auto-advance

[STATE 2: Question]
   → 10-second countdown timer starts
   → 4 MCQ options displayed
   → Timer expiry or skip = -1 theme point, streak reset to 0

[STATE 3: Result]
   → Instant Correct/Wrong/Skip visual flash
   → Theme points (+2 / -2) and XP (+2 to +7 based on streak) applied
   → Explanatory card (Lora Serif) giving additional context

[STATE 4: Next]
   → Swipe up or tap "Lanjut" to reload the next weighted card
```

---

## Documentation & Developer Context

This project uses a modular, token-optimized context structure. Rather than loading a massive unified instruction set, refer strictly to the files relevant to your active task domain.

### 1. Project Specifications (The Blueprints)
* **[Product Design Doc](docs/product-design.md):** Explains the high-level product vision, Indonesian Gen-Z target audience, gameplay loops, and register specifications.
* **[Design System Spec](docs/design-system.md):** Rigid visual standards, spacing parameters, typography tables, and responsive navigation pattern laws.
* **[Implementation Overview](docs/implementation-overview.md):** Canonical TypeScript shapes, shared database collections, and named Server Action contracts.

### 2. Architectural Guidelines (Domain Constraints)
* **[Frontend Conventions](docs/context/CONVENTION-FE.md):** Rules for React Server Components (RSC) vs Client Components, layout bounds, asset co-location, and global UI shells.
* **[Backend Conventions](docs/context/CONVENTION-BE.md):** Schema validations, `.lean()` read optimizations, server-side data boundaries, and startup environment validation.
* **[Design & Copy Conventions](docs/context/CONVENTION-DESIGN.md):** Flat shadow styles, 0px border radius constraints, Bahasa Indonesia registers, and the **strict emoji ban** rule.

### 3. Quality & Workflow Gates (Process Controls)
* **[Workflow & Branching Rules](docs/context/WORKFLOW.md):** Detailed explanations of the 3-Gate developer workflow, automated issue tracking, and repository architecture.
* **[QA & Testing Standards](docs/context/CONVENTION-QA.md):** Detailed guidelines for the Test-Driven Development (TDD) loop, Vitest suites, and GHA workflows requiring a **>= 80% coverage gate**.
* **[Developer Session Memory](docs/context/MEMORY.md):** Chronological logging of session outcomes, discoveries, patterns to replicate, and anti-patterns to avoid.

---

## Development & Quickstart

Always use the **RTK (Rust Token Killer)** proxy to execute commands for optimized local workflow performance:

### 1. Installation
Ensure Node.js 22 is installed.
```bash
# Clone the repository
git clone https://github.com/rekyb/gabutin-aja.git
cd gabutin-aja

# Install dependencies
rtk pnpm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
MONGODB_URI="mongodb+srv://..."
GEMINI_API_KEY="AIzaSy..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

### 3. Run Development Server
```bash
rtk pnpm dev
```

### 4. Running Quality Gates (Tests & Types)
```bash
# Run unit tests (Vitest)
rtk vitest run

# Run coverage report (Requires >= 80% coverage on new code)
rtk vitest run --coverage

# Type-check TypeScript
pnpm tsc --noEmit

# Build verification
rtk next build
```

---

## Architectural Roadmap & Epics

The codebase is engineered across 10 sequential epics:
* **E01:** [Project Foundation](docs/epic/e01-project-foundation.md) — Base monorepo, MongoDB connect, schemas, and CI gates. *(Wave 1)*
* **E02:** [Guest Identity & Onboarding](docs/epic/e02-guest-identity-onboarding.md) — Tutorial flow, UID generator, localStorage tracker. *(Wave 2)*
* **E03:** [Card Generation Pipeline](docs/epic/e03-card-generation-pipeline.md) — Wikipedia REST to Gemini MCQ generator. *(Wave 2)*
* **E04:** [Feed & Card Lifecycle](docs/epic/e04-feed-card-lifecycle.md) — Swipe feed, card states, countdowns. *(Wave 3)*
* **E05:** [Scoring Engine](docs/epic/e05-scoring-engine.md) — XP calculations, streak bonuses, leveling curves. *(Wave 2)*
* **E06:** [Achievement System](docs/epic/e06-achievement-system.md) — Badge unlockers, badge pinnings. *(Wave 3)*
* **E07:** [Adaptive Feed Algorithm](docs/epic/e07-adaptive-feed-algorithm.md) — Weakness-weighted card distributor. *(Wave 3)*
* **E08:** [Profile Page](docs/epic/e08-profile-page.md) — Stats display, pinned badges showcase. *(Wave 4)*
* **E09:** [PWA & Analytics](docs/epic/e09-pwa-analytics.md) — Manifest configurations, PostHog surveys. *(Wave 3)*
* **E10:** [Deployment](docs/epic/e10-deployment.md) — Production dockerization on Google Cloud Run. *(Wave 5)*
