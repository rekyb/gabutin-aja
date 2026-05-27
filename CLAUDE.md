# Gabutin — Project CLAUDE.md

> **TOKEN OPTIMIZATION SYSTEM:** All heavy context is split into files under `docs/context/`. To save 60-90% on session tokens, **never read all context files together**. Only read the context file(s) relevant to your active task.

---

## Mandatory Beginning Step

Before writing any code or initiating any epic/feature work, you MUST execute these steps:
1. **Identify the Task Domain:** Determine if your current task is **Frontend (FE)**, **Backend (BE)**, **QA / Testing (QA)**, **Design (DESIGN)**, or **Planning/Workflow (WORKFLOW)**.
2. **Read Session Memory:** Open and read [`docs/context/MEMORY.md`](docs/context/MEMORY.md) to inspect the latest session state, discoveries, and anti-patterns.
3. **Read Specific Context:** Open and read only the context file(s) matching your task domain:
  - **Frontend (FE):** Read [`docs/context/CONVENTION-FE.md`](docs/context/CONVENTION-FE.md) & [`docs/context/CONVENTION-DESIGN.md`](docs/context/CONVENTION-DESIGN.md)
  - **Backend (BE):** Read [`docs/context/CONVENTION-BE.md`](docs/context/CONVENTION-BE.md)
  - **QA / Testing:** Read [`docs/context/CONVENTION-QA.md`](docs/context/CONVENTION-QA.md)
  - **Workflow / Git / Setup:** Read [`docs/context/WORKFLOW.md`](docs/context/WORKFLOW.md)
4. **Self-Assess Confidence:** Ensure you meet the **Confidence Gate (90%+)**. Stop and ask targeted questions if anything is ambiguous.

---

## Required Developer Skills & Commands

Always invoke the correct community skill or slash command to perform your tasks:

| Domain | Command / Skill to Invoke | Focus |
|---|---|---|
| **Frontend (FE)** | **`/frontend-design`** or **`/ui-ux-pro-max`** | UI layout, navigation, responsive offsets, accessibility |
| **Backend (BE)** | **`/backend-development`** | Database models, Server Actions named contracts, Gemini APIs |
| **QA / Testing** | **`/test-driven-development`** & **`/verification-before-completion`** | Vitest testing, 80% coverage limits, PR checklists |
| **Troubleshooting** | **`/debugging`** or **`/systematic-debugging`** | Diagnostics, error logs tracing, Mongoose troubleshooting |

> **Auto-Installation:** If any required slash command, developer skill, or plugin is not available in the current environment, automatically attempt to install it and immediately prompt the user explaining its purpose.

---

## Core CLI & Development Commands (RTK Wrapper)

Always prefix development commands with `rtk` (Rust Token Killer) to maximize token savings.

```bash
# Dependencies
rtk pnpm install       # Install dependencies

# Development & Build
rtk pnpm dev         # Start Next.js dev server (Turbopack)
rtk next build        # Verify production build + standalone output
rtk next lint        # Run ESLint

# Testing
rtk vitest run        # Run all unit tests (failures only)
rtk vitest run --coverage  # Run tests + coverage report
rtk playwright test     # Run E2E integration tests

# Docker (E10)
docker build -t gabutin .
docker run -p 3000:3000 --env-file .env.local gabutin

# Token Savings Analytics
rtk gain           # Show token savings statistics
rtk gain --history      # Show command history + savings
rtk discover         # Find missed RTK usage in sessions
```

---

## Design Conventions (Critical Rules)

- **Theme:** Dark/light toggle via `next-themes`. Default: `dark`. Never hardcode `className="dark"` on `<html>` — `ThemeProvider` handles it. Always add `suppressHydrationWarning` to `<html>`.
- **0px border-radius everywhere.** No `rounded-*` classes. Ever.
- **Hard shadows only:** `shadow-[4px_4px_0px_0px_black]`. Import named constants from `@/lib/design-tokens` — do not repeat inline strings.
- **Semantic tokens only:** `bg-background`, `text-foreground`, `bg-card`, `border-border`, etc. No hardcoded oklch or hex. This is what makes light mode work automatically.
- **Fonts:** Montserrat (headings/questions), Space Mono (IDs/numbers), Lora italic (flavor text).
- **Icons:** Lucide React at `h-5 w-5` for UI actions. Emojis allowed only in achievement badge definitions.
- **Component shells:** All shared components are scaffolded in E01. Check the Global Component Registry in `docs/implementation-overview.md` before creating any component file.

---

## Commit & Git Conventions

- **Branch Naming:** `type/e[XX]-short-description` (e.g. `feat/e01-project-foundation`).
- **Commit Format:** Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`). One logical change per commit.
- **Pull Requests:** Check remote `main` branch, run strict QA checks, push branch, open PR, and close issue via GitHub MCP.
- **CI Protection:** Protected `main` branch requires TypeScript, Unit Tests, and Coverage (≥80%) GHA checks to pass.

---

## Mandatory End-of-Session Memory Update

Once your work passes **Gate 3 (QA Verification)** and before closing the task/session:
1. Open [`docs/context/MEMORY.md`](docs/context/MEMORY.md).
2. Append a new chronological entry at the top, summarizing:
  - **Task/Epic Name & Status**
  - **What was Implemented**
  - **Discoveries & Technical Insights**
  - **Corrections Made**
  - **Patterns** (what worked well)
  - **Anti-Patterns to Avoid**
