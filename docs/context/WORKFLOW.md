# Workflow & Project Structure — WORKFLOW.md

## 1. Development Workflow (The Three Gates)
All feature development and bug fixes follow this structured workflow to ensure alignment, visual consistency, and zero regressions:

### Gate 1: Epic / Feature Alignment (PRD)
- **Location:** `docs/epic/e[XX]-[epic-name].md` or `docs/features/[feature-name]/prd.md`
- **Focus:** Align with product specifications, localized copy, and user stories. Ensure language register is Bahasa Campur ("lo/gue").
- **Approval:** Explicit human approval is required before writing any implementation details.

### Gate 2: Technical Design & Checklists
- **Location:** Update `docs/implementation-overview.md` (e.g. contracts, models, schemas).
- **Focus:** Match exact TypeScript signatures for Server Actions and database schemas.
- **Approval:** Explicit human approval required before writing implementation code.

### Confidence Gate (Self-Assessment)
Before presenting any implementation plan or code for review, self-assess confidence (0-100%):
- **90%+:** Present the proposal or run the verification report.
- **Below 90%:** STOP and ask targeted questions to resolve ambiguity or edge cases. Do not guess or propose arbitrary configurations.

### Gate 3: Integration & Verification Report (QA & Acceptance Verification)
- **Trigger:** Immediately after epic/feature development ends, prior to making a final commit or requesting merge approval.
- **Strict QA Testing:** **Always perform comprehensive QA testing** directly against the specific **Acceptance Criteria** documented inside the corresponding Epic markdown file (e.g. `docs/epic/e[XX]-[epic-name].md`).
- **Epic Document Updates:** Verify each criterion thoroughly. Once validated, **update the Epic markdown file** to mark all verified acceptance criteria checkboxes as checked (`[x]`).
- **Escalation Protocol:** If any acceptance criteria fail to verify or any testing blockages are encountered, **immediately halt and prompt the human developer** with a detailed diagnostics report of the issue. Do not attempt to bypass, skip, or merge with failing criteria.
- **Deliverables:** Provide a detailed report of the tests run (both automated via `rtk vitest`/`playwright` and manual verification logs) proving that all criteria are fully satisfied.
- **Approval:** Explicit human approval is required before merging.

---

## 2. Auto-Ticketing & Branching Workflow
To maintain clear synchronization between issues, branches, and documentation, the AI agent must strictly automate issue creation and branch management:

### 1. Epic Issue Creation (Before Gate 1)
- When starting a new Epic, **automatically create a GitHub Epic Issue** using the installed **GitHub MCP server**.
- **Data Source:** Pull metadata and specifications from [implementation-overview.md](docs/implementation-overview.md) and the corresponding epic markdown file.
- **Issue Properties:**
 - **Title:** `[Epic ID] Name` (e.g. `[E01] Project Foundation`)
 - **Description:** Comprehensive summary of the Epic, target deliverables, and integration checklist.
 - **Assignee:** Set to the user (`rekyb`).
 - **Labels/Tags:** Tag with the Epic ID (e.g. `E01`) and initial state tag `todo`.

### 2. Implementation & Branching (Gate 2 to Execution)
- Before writing any code, **always pull the latest remote changes** on `main` to avoid drift:
 ```bash
 rtk git checkout main && rtk git pull origin main
 ```
- **Create a clean feature branch** based on the Epic ID:
 ```bash
 rtk git checkout -b feat/e[XX]-[epic-name]
 ```
- **Ticket Update:** Automatically transition the GitHub issue by adding the label/tag `ongoing` and removing `todo`.

### 3. Verification & Pull Request (Gate 3 to Done)
- Once the code passes Gate 3 (Integration Checklist and `rtk next build` + `rtk vitest run` tests):
 - **Update Status:** Mark the epic as completed (DONE) in the Epic Registry of [implementation-overview.md](docs/implementation-overview.md).
 - **Create PR/MR:** Push the branch and create a GitHub Pull Request/Merge Request.
 - **Ticket Close:** Add the label `ready-to-mr` to the epic issue, post the PR/MR link as a comment, and **close the issue**.

---

## 3. Project Structure Blueprint
```
gabutin-aja/
 .github/
  workflows/
    ci.yml          # Three-job CI: TypeScript + Unit Tests + Coverage Gate (E01)
 docs/               # Specification & planning (read before implementing)
  context/           # Lightweight modular token-saving context files
    CONVENTION-FE.md     # Frontend conventions & registry table
    CONVENTION-BE.md     # Mongoose rules, action contracts, env
    CONVENTION-QA.md     # Test rules, coverage parameters, integration list
    CONVENTION-DESIGN.md   # OKLCH colors, typographies, spacing, copy refs
    WORKFLOW.md        # Workflow gates, branching rules, folder tree (this file)
    MEMORY.md         # Session records, anti-patterns, discoveries
  epic/             # One file per epic (E01–E10)
    e01-project-foundation.md
    e02-guest-identity-onboarding.md
    e03-card-generation-pipeline.md
    e04-feed-card-lifecycle.md
    e05-scoring-engine.md
    e06-achievement-system.md
    e07-adaptive-feed-algorithm.md
    e08-profile-page.md
    e09-pwa-analytics.md
    e10-deployment.md
  design-system.md       # Visual standards, oklch tokens, MX-Brutalist rules
  implementation-overview.md  # Canonical types, models, Server Action contracts
  product-design.md       # Problem statement, language tone, tech stack
 public/              # PWA icons, manifest.json, offline fallback SW
 scripts/
  seed-tutorial.ts       # Tutorial card seed script (E02)
 src/
  app/             # Next.js App Router — pages, layout, providers
    layout.tsx        # Root layout: dark mode, fonts, BottomNav + SideNav
    page.tsx         # Redirects → /welcome or /feed
    welcome/
     page.tsx       # Tutorial flow + name/theme registration (E02)
    feed/
     page.tsx       # Swipeable card feed shell (E04)
    achievements/
     page.tsx       # Badge grid + showcase editor (E06)
    profile/
     page.tsx       # User profile stats (E08)
    providers.tsx       # PostHog client provider (E09)
    actions/         # Server Actions — mutations only, named exports
      user.ts        # createUser, getUserByUniqueId (E02)
      answer.ts       # submitAnswer (E05)
      feed.ts        # getNextCard (E07)
      achievements.ts    # pinBadge, unpinBadge, getUserAchievements (E06)
      profile.ts      # getUserProfile (E08)
  components/          # UI components — co-located tests, named exports
    BottomNav/        # Mobile nav (lg:hidden) — implemented E01
    SideNav/         # Desktop nav (hidden lg:flex) — implemented E01
    GuestBanner/       # Guest state banner — shell E01, logic E02
    ReEngagementCard/    # Feed re-engagement card — shell E01, logic E02
    Card/
     CardFact.tsx     # STATE 1: fact display — shell E01, logic E04
     CardQuestion.tsx   # STATE 2: MCQ + timer — shell E01, logic E04
     CardResult.tsx    # STATE 3: result deltas — shell E01, logic E04
     CardNext.tsx     # STATE 4: next trigger — shell E01, logic E04
    AchievementToast/     # Achievement notification — shell E01, logic E04
    CountdownTimer/     # 10s question timer — shell E01, logic E04
    CardSkeleton/      # Loading skeleton — shell E01, logic E04
    FeedClient/       # Feed page client wrapper (E04)
    XpBar/          # XP progress bar — shell E01, logic E08
    ProfileClient/      # Profile page client wrapper — shell E01, logic E08
  db/              # Mongoose connection + canonical schemas
    connect.ts        # Singleton connection pool (E01)
    models/          # All epics import from here — never redefine
      User.ts
      ThemeScore.ts
      Card.ts
      Answer.ts
      UserAchievement.ts
  lib/             # Pure logic + centralized design tokens
    design-tokens.ts     # MX-Brutalist Tailwind class strings (E01)
    theme-labels.ts      # ThemeName → display label (E08)
    scoring/
     formulas.ts      # xpRequiredForLevel, calcXpDelta (E05)
    achievements/
     definitions.ts    # 17 achievement configs (E06)
     check.ts       # Condition evaluator (E06)
    feed/
     algorithm.ts     # Weighted weakest-theme selection (E07)
    pipeline/
     generate-card.ts   # Wikipedia → Gemini → DB orchestrator (E03)
     wikipedia.ts     # Wikipedia REST client (E03)
     gemini.ts       # Gemini MCQ generator (E03)
    analytics/
      events.ts       # PostHog wrapper (E09)
  test/             # Vitest infrastructure
    setup.ts         # @testing-library/jest-dom import
    setup.test.ts       # Smoke test — verifies test env works
    utils.tsx         # Custom render wrapper + providers
  types/
    index.ts         # Canonical shared types — ThemeName, SubmitAnswerResponse
  utils/
    user-id.ts        # 9-digit uniqueUserId generator (E02)
  env.ts            # Zod env validation — crashes fast on missing vars
 .dockerignore
 .env.example           # All 5 env vars with placeholder values (no secrets)
 CLAUDE.md             # Main Lightweight Instruction Spec
 Dockerfile            # node:22-alpine, standalone Next.js output (E10)
 next.config.ts          # output: 'standalone', withPWA wrapper (E09 + E10)
 package.json
 pnpm-lock.yaml
 tsconfig.json           # strict mode, @/ alias → src/
 vitest.config.ts         # jsdom, 80% coverage thresholds on lib/ + components/
```
