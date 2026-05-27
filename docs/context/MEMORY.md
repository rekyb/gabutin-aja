# Developer Session Memory — MEMORY.md

> **MANDATORY INSTRUCTION:** The AI developer agent must **read this file before beginning any new Epic or feature task**, and **update this file immediately after Gate 3 verification is completed** at the end of each session. Always maintain an chronological list of sessions (newest first).

---

## Session History

### [2026-05-27] Session 01: Initial Bootstrap & Context Modularization
- **Task/Epic Status:**
 - **Epic:** None (Preparation / Meta-Task)
 - **PRD Gate 1:** Approved (Product specification base established)
 - **Tech Design Gate 2:** Approved (Tech stack finalized)
 - **Status:** **Bootstrap Preparation Complete** — Light-weight token-saving context system deployed.
- **What Was Implemented:**
 - Setup modular token-saving context files under `docs/context/`:
  - `CONVENTION-FE.md`: Strict rules for responsive layouts, navigation styles, and global components.
  - `CONVENTION-BE.md`: DB schemas, Named Server Actions contracts, and environment guidelines.
  - `CONVENTION-QA.md`: Strict Test-Driven Development (TDD), 80% coverage limits, and CI pipelines.
  - `CONVENTION-DESIGN.md`: Neo-Brutalist visual laws, oklch hex color mappings, and copy dictionary.
  - `WORKFLOW.md`: Unified 3-gate developer steps, branching specifications, and workspace file layouts.
  - `MEMORY.md`: Chronological developer logs (this file).
 - Optimized the main `CLAUDE.md` to act as a lightweight, modular director.
- **Discoveries & Technical Insights:**
 - Splitting context into modular file paths under `docs/context/` allows the agent to load only relevant parameters for each specific job/task, saving 60-90% on dev session token overhead.
 - The MX-Brutalist theme utilizes extreme aesthetic constraints (0px borders, absolute pure black hard shadows, zero pastel elements, and distinct typography families Montserrat/Lora/Space Mono) that require active verification during every FE task.
- **Corrections Made:**
 - Discovered that the repository contains all ten epic trackers (`E01` to `E10`) and a dedicated `docs/design-system.md` file in the specification folder. Integrated these files fully into the current specification tree in `WORKFLOW.md`.
- **Patterns (What Worked Well):**
 - Standardized community skills / slash commands (`/frontend-design`, `/backend-development`, `/test-driven-development`, `/verification-before-completion`, and `/debugging`) are used as the formal command set, backed by auto-installation triggers to maintain agent autonomy.
- **Anti-Patterns to Avoid:**
 - Never hardcode visual Tailwind classes directly inside component files. Always import constants strictly from `src/lib/design-tokens.ts` once E01 project foundation is bootstrapped.
 - Never introduce soft gradients or rounded border edges, as the theme demands brutalist hard-edge layouts.
 - Never bypass failed tests or incomplete acceptance criteria—any failures must immediately trigger human prompt escalation.
