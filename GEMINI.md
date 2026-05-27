# Gabutin — Project GEMINI.md

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

## Core CLI & Development Commands (RTK Wrapper)

Always prefix development commands with `rtk` (Rust Token Killer) to maximize token savings.

```bash
# Dependencies
rtk pnpm install       # Install dependencies

# Development & Build
rtk pnpm dev           # Start Next.js dev server (Turbopack)
rtk next build         # Verify production build + standalone output
rtk next lint          # Run ESLint

# Testing
rtk vitest run         # Run all unit tests (failures only)
rtk vitest run --coverage  # Run tests + coverage report
rtk playwright test    # Run E2E integration tests

# Docker (E10)
docker build -t gabutin .
docker run -p 3000:3000 --env-file .env.local gabutin

# Token Savings Analytics
rtk gain               # Show token savings statistics
rtk gain --history     # Show command history + savings
rtk discover           # Find missed RTK usage in sessions
```

---

## Commit & Git Conventions

- **Branch Naming:** `type/e[XX]-short-description` (e.g. `feat/e01-project-foundation`).
- **Commit Format:** Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`). One logical change per commit.
- **Pull Requests:** Check remote `main` branch, run strict QA checks, push branch, open PR, and close issue.
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
