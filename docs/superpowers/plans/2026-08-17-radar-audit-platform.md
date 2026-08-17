# Radar Audit Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build protocol-aware, model-aware quick/full diagnostics whose standardized scores drive reports, history, public APIs and evidence-gated rankings.

**Architecture:** Keep probe planning, endpoint normalization, execution and scoring as independent pure modules. The web route orchestrates the bounded transport; persistence consumes only sanitized summaries and remains opt-in.

**Tech Stack:** Next.js 16, TypeScript, Zod, MySQL 8, Vitest, Docker Compose.

---

### Task 1: Endpoint normalization

**Files:** Create `src/lib/probe/endpoint.ts`; test `tests/unit/endpoint.test.ts`; modify `DoctorClient.tsx`.

- [ ] Write failing tests for bare domains, `/v1`, complete endpoints and cross-host rejection.
- [ ] Implement same-host protocol path normalization and endpoint preview.
- [ ] Run `pnpm test tests/unit/endpoint.test.ts` and commit.

### Task 2: Dynamic probe plan

**Files:** Create `src/lib/probe/plan.ts`; test `tests/unit/probePlan.test.ts`; modify `diagnostic.ts`.

- [ ] Write failing tests for quick/full mode and protocol/model capability differences.
- [ ] Implement typed probe definitions with applicability, request cost and score weight.
- [ ] Run focused tests and commit.

### Task 3: Coverage-aware scoring

**Files:** Modify `src/lib/benchmark/score.ts`; test `tests/unit/benchmark.test.ts`.

- [ ] Write failing tests proving N/A dimensions do not lower score and missing probes lower coverage.
- [ ] Implement normalized score, coverage and confidence calculation.
- [ ] Run focused tests and commit.

### Task 4: Diagnostic execution and UI

**Files:** Modify `diagnostic.ts`, `DoctorClient.tsx`, `i18n.ts`, API route and diagnostic tests.

- [ ] Write failing protocol/mode execution tests.
- [ ] Execute the generated plan with bounded sequential requests and sanitized outcomes.
- [ ] Render mode selection, endpoint preview, estimated request count, score and coverage.
- [ ] Run lint, typecheck, tests and build.

### Task 5: History and public reports

**Files:** Create migration `004_radar_audit_platform.sql`, repositories, `/reports/[publicId]` and read-only API routes.

- [ ] Present exact migration SQL and obtain production execution approval.
- [ ] Write repository and route tests before implementation.
- [ ] Persist only opt-in sanitized summaries with revocation support.

### Task 6: Evidence-gated rankings

**Files:** Modify aggregation worker, ranking repository and ranking pages.

- [ ] Write tests for 20-observation and coverage thresholds.
- [ ] Aggregate only public eligible observations.
- [ ] Display score, coverage, confidence, window and sample count.

### Task 7: Verification and deployment

- [ ] Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` and browser checks.
- [ ] Commit and push `main`.
- [ ] Deploy only `radar-web`; deploy `radar-worker` only when worker code changes.
- [ ] Verify health, Chinese/English views and unchanged unrelated containers.

