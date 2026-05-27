# QA & Testing Conventions — CONVENTION-QA.md

## 1. Test-Driven Development (TDD) Rules
- **TDD Workflow:** Red → Green → Refactor. Write a failing test first, write minimal code to pass, then refactor.
- **Coverage Gate:** Enforce strict **80% code coverage thresholds** (lines, functions, branches) on all new or updated files.
- **Exclusion Boundaries:** Unit test coverage thresholds focus strictly on `src/lib/` and `src/components/`. Exclude `src/app/**` (app router routes) and `src/db/**` (Mongoose infrastructure models) from the threshold limits.
- **Behavior-Focused:** Tests must describe visual/functional behavior, not execution details.
- **Clean Patterns:** Use parameterized testing (`it.each`) for repetitive test cases to avoid duplicate code block smells.
- **Testing Scripts:**
 - Run all tests: `rtk vitest run`
 - Run test coverage: `rtk vitest run --coverage`

---

## 2. Integration Checklist (QA Pass criteria before Deployment)
Before passing Gate 3 or requesting a merge, verify:
- [ ] All 5 Mongoose models importable without TypeScript compilation errors.
- [ ] `rtk next build` succeeds with zero errors or SSR warnings.
- [ ] `submitAnswer` returns correct `SubmitAnswerResponse` (not stub).
- [ ] `getNextCard` feeds real cards from the database instead of hardcoded placeholders.
- [ ] Achievement toasts fire on first correct answer.
- [ ] Level-up pulse animations fire correctly when XP thresholds are crossed.
- [ ] No cards are repeated or shown twice to the same user.
- [ ] Guest warning banner is visible when there is no database user record.
- [ ] `/profile` is loaded and rendered without any client-side data fetches.
- [ ] PostHog events are sent with required metadata properties.
- [ ] PWA manifest is fully validated.

---

## 3. CI Pipeline & Branch Protection
- **CI Configuration:** Located in `.github/workflows/ci.yml`.
- **Three-Job Gate:**
 1. **TypeScript compilation check** (passes `rtk tsc` checks).
 2. **Unit Tests run** (passes `rtk vitest` suites).
 3. **Coverage Gate** (validates coverage is ≥80%).
- **Branch Protection:** Merges to `main` are strictly blocked if any GHA job fails. Never bypass or force merge.
