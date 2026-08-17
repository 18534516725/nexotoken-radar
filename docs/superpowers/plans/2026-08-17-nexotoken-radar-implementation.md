# NexoToken Radar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the complete `radar.nexotoken.net` provider directory, benchmark, API compatibility tester, submission/claim workflow, public data product, administration console, and Agent Doctor acquisition surface.

**Architecture:** A single Next.js App Router repository serves indexable public pages and authenticated administration routes. MySQL repositories use dedicated `radar_` tables in the existing database instance; a second process from the same Docker image leases probe jobs and computes aggregates. Credentials supplied to the Doctor stay in request memory and all outbound calls pass through DNS-aware SSRF controls.

**Tech Stack:** Next.js, React, TypeScript, mysql2, Zod, Vitest, Playwright, CSS Modules/global CSS, Docker Compose, MySQL 8.

---

## File map

- `src/app/`: public, API, policy, report, submission, claim and admin routes.
- `src/components/`: reusable layout, tables, filters, charts, forms and test result UI.
- `src/lib/db/`: MySQL pool and feature-scoped repositories.
- `src/lib/probe/`: URL safety, protocol adapters, benchmark runner, scoring and redaction.
- `src/lib/auth/`: admin sessions and provider claim verification.
- `src/lib/seo/`: metadata, JSON-LD, sitemap and feeds.
- `src/lib/validation/`: Zod request schemas.
- `src/worker/`: database queue lease, scheduled probes and daily/monthly aggregation.
- `migrations/`: ordered, reversible SQL migrations.
- `tests/`: unit, integration, security and Playwright tests.
- `deploy/`: Docker, Compose, Nginx and production runbook.

### Task 1: Application foundation

**Files:** `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `tests/unit/smoke.test.ts`

- [ ] Write `tests/unit/smoke.test.ts` asserting the product constants are `NexoToken Radar`, `https://radar.nexotoken.net`, and the disclosure names NexoToken.
- [ ] Run `pnpm test tests/unit/smoke.test.ts` and verify failure because the constants do not exist.
- [ ] Add the Next.js application, strict TypeScript configuration, scripts for `lint`, `typecheck`, `test`, `test:e2e`, `build`, `worker`, and `migrate:check`.
- [ ] Implement `src/lib/product.ts` and the root layout metadata.
- [ ] Run unit tests, typecheck and build; commit `chore: scaffold NexoToken Radar application`.

### Task 2: Brand design system and responsive shell

**Files:** `src/app/globals.css`, `src/components/layout/SiteHeader.tsx`, `SiteFooter.tsx`, `DataTicker.tsx`, `LanguageSwitch.tsx`, `tests/unit/layout.test.tsx`, `tests/e2e/navigation.spec.ts`

- [ ] Write failing tests for brand disclosure, navigation landmarks, keyboard focus, language links and mobile menu.
- [ ] Implement the warm-paper/editorial-lab token system, typography, layout rhythm, accessible focus and reduced-motion behavior.
- [ ] Implement desktop and mobile navigation for Overview, Providers, Models, Benchmarks, Compatibility, Doctor, Methodology and Submit.
- [ ] Verify at 390, 768, 1280 and 1536 pixel widths; commit `feat: add Radar brand shell`.

### Task 3: Database contract and migrations

**Files:** `migrations/001_radar_core.sql`, `002_radar_workflows.sql`, `003_radar_reporting.sql`, `migrations/rollback/*.sql`, `src/lib/db/pool.ts`, `src/lib/db/types.ts`, `scripts/check-migrations.ts`, `tests/unit/migrations.test.ts`

- [ ] Write failing tests that parse migrations and require every table to use the `radar_` prefix, every migration to have a rollback, and no destructive statement without a scoped predicate.
- [ ] Define providers, models, provider models, price snapshots, schedules, jobs, runs, results, daily stats, public reports, submissions, claims, corrections, alerts, sponsorships, monthly reports and audit events.
- [ ] Add indexes for provider/model/window lookups, unique slugs, leases, review queues and public IDs.
- [ ] Implement a least-privilege connection pool with UTC storage and explicit Asia/Shanghai presentation.
- [ ] Run migration validation without changing a database; commit `feat: define Radar database schema`.

### Task 4: Repository layer and seed fixtures

**Files:** `src/lib/db/providers.ts`, `models.ts`, `benchmarks.ts`, `workflows.ts`, `reports.ts`, `tests/integration/repositories.test.ts`, `fixtures/providers.json`

- [ ] Write integration tests for provider creation, model mappings, price snapshots, filtered listings, history windows and state transitions.
- [ ] Implement parameterized SQL repositories and transaction helpers.
- [ ] Add non-production fixtures with five synthetic providers; never seed live rankings with fabricated statistics.
- [ ] Run repository tests against the disposable test database; commit `feat: add Radar repositories`.

### Task 5: Provider and model public pages

**Files:** `src/app/providers/page.tsx`, `src/app/providers/[slug]/page.tsx`, `src/app/models/page.tsx`, `src/app/models/[slug]/page.tsx`, `src/components/provider/*`, `tests/e2e/providers.spec.ts`

- [ ] Write failing page tests for server-rendered names, source labels, observation windows, noindex on insufficient data and filters encoded in the URL.
- [ ] Implement directory filtering, sorting, pagination, price tables, compatibility matrices and history views.
- [ ] Add correction, claim and retest links to every provider page.
- [ ] Verify empty, sparse, normal and stale-data states; commit `feat: publish provider and model directories`.

### Task 6: Benchmark aggregation and ranking engine

**Files:** `src/lib/benchmark/aggregate.ts`, `confidence.ts`, `score.ts`, `price.ts`, `tests/unit/benchmark/*.test.ts`

- [ ] Write failing tests for success rate, median/P95/P99, 429/5xx rates, price normalization, confidence bands and the published weighted score.
- [ ] Implement deterministic decimal-safe calculations and version every aggregation formula.
- [ ] Exclude insufficient samples from definitive rankings while retaining raw observations.
- [ ] Commit `feat: add transparent benchmark aggregation` after red-green-refactor evidence.

### Task 7: Ranking, compatibility and benchmark pages

**Files:** `src/app/rankings/[kind]/page.tsx`, `src/app/compatibility/[tool]/page.tsx`, `src/app/benchmarks/page.tsx`, `src/app/benchmarks/[slug]/page.tsx`, `src/components/benchmark/*`, `tests/e2e/rankings.spec.ts`

- [ ] Write failing tests for Cheapest, Fastest, Reliable, Most Tested, Claude Code, Codex and Cursor views.
- [ ] Implement metric definitions beside every ranking and render sample size, region, window and freshness inline.
- [ ] Ensure sponsorship never changes ranking order.
- [ ] Commit `feat: add benchmark and compatibility rankings`.

### Task 8: SSRF-safe outbound request boundary

**Files:** `src/lib/probe/urlSafety.ts`, `dnsResolver.ts`, `safeFetch.ts`, `redact.ts`, `errors.ts`, `tests/security/ssrf.test.ts`, `tests/security/redaction.test.ts`

- [ ] Write failing tests for loopback, RFC1918, link-local, IPv6 local, metadata IP, encoded IP, userinfo, unsafe port, redirect and DNS rebinding cases.
- [ ] Implement HTTPS-only parsing, public-address DNS validation before each connection, redirect rejection, timeout, response-size and concurrency limits.
- [ ] Write secret canaries through every error path and prove logs/results never contain them.
- [ ] Commit `feat: secure outbound provider probes`.

### Task 9: Protocol adapters and compatibility probes

**Files:** `src/lib/probe/adapters/openai.ts`, `responses.ts`, `anthropic.ts`, `src/lib/probe/tests/*.ts`, `runner.ts`, `tests/unit/probe/*.test.ts`

- [ ] Write failing fixture tests for Chat Completions, Responses and Messages API success, SSE, tool calls, structured output, cache signals, context limits, usage accounting, retry and rate limits.
- [ ] Implement short bounded requests with normalized results and no response-content persistence.
- [ ] Add Claude Code, Codex, Cursor, generic OpenAI and generic Anthropic suites.
- [ ] Commit `feat: implement coding-agent compatibility probes`.

### Task 10: Public Doctor experience

**Files:** `src/app/doctor/page.tsx`, `src/app/api/doctor/run/route.ts`, `src/components/doctor/*`, `src/lib/rateLimit.ts`, `tests/e2e/doctor.spec.ts`

- [ ] Write failing tests for Base URL, API Key, model, protocol and target-tool validation; prove API Key is never returned or persisted.
- [ ] Implement progressive test UI, cancellation, timeout, categorized errors, privacy copy and rate limiting.
- [ ] Add opt-in anonymous metrics and opt-in share report controls, both unchecked by default.
- [ ] Commit `feat: add private one-time API Doctor`.

### Task 11: Shareable reports and public data

**Files:** `src/app/reports/[publicId]/page.tsx`, `src/app/data/page.tsx`, `src/app/api/v1/*`, `src/app/api/exports/[format]/route.ts`, `tests/integration/public-data.test.ts`

- [ ] Write failing tests that public reports omit secrets, prompts, completions and account identifiers.
- [ ] Implement opaque public IDs, revocation tokens, permanent URLs, CSV/JSON exports and documented read-only API endpoints.
- [ ] Attach data version, methodology version, source and license metadata.
- [ ] Commit `feat: publish safe reports and open benchmark data`.

### Task 12: Automatic scheduler, worker and history

**Files:** `src/worker/index.ts`, `lease.ts`, `scheduler.ts`, `aggregate.ts`, `monthly.ts`, `tests/integration/worker.test.ts`

- [ ] Write failing concurrency tests proving only one worker owns a lease and expired jobs recover safely.
- [ ] Implement hot/normal/cold schedules, bounded retries, dead-letter state, heartbeat, daily aggregation and monthly snapshots.
- [ ] Add probe budget controls by provider/model and short output limits.
- [ ] Commit `feat: automate benchmark collection`.

### Task 13: Provider submission, correction and retest

**Files:** `src/app/submit/page.tsx`, `src/app/corrections/page.tsx`, `src/app/api/submissions/route.ts`, `src/app/api/corrections/route.ts`, `src/app/api/retests/route.ts`, `tests/e2e/submission.spec.ts`

- [ ] Write failing tests for all documented fields, spam protection, duplicate detection and pending review state.
- [ ] Implement accessible forms and server-side validation without automatically publishing submitted claims.
- [ ] Add review receipts and status lookup tokens.
- [ ] Commit `feat: add provider submission and corrections`.

### Task 14: Provider claim workflow

**Files:** `src/app/claim/[providerSlug]/page.tsx`, `src/lib/auth/domainClaim.ts`, `src/app/api/claims/*`, `tests/integration/claims.test.ts`

- [ ] Write failing state-machine tests for pending, verified, rejected, expired and revoked claims.
- [ ] Implement DNS TXT, well-known file and official-domain-email verification.
- [ ] Restrict claimed fields to description, logo, public links, model declarations and published prices.
- [ ] Commit `feat: add auditable provider claims`.

### Task 15: Admin console and sponsorship separation

**Files:** `src/app/admin/*`, `src/lib/auth/adminSession.ts`, `src/middleware.ts`, `tests/e2e/admin.spec.ts`

- [ ] Write failing tests for signed admin sessions, CSRF protection, role checks and audit events.
- [ ] Implement review queues, provider/model editing, probe scheduling, report publishing and system health.
- [ ] Implement sponsored placements as separately labelled inventory that cannot enter score queries.
- [ ] Commit `feat: add Radar administration console`.

### Task 16: Alerts and monthly reports

**Files:** `src/app/api/alerts/route.ts`, `src/lib/alerts/*`, `src/app/reports/monthly/[month]/page.tsx`, `tests/integration/alerts.test.ts`

- [ ] Write failing tests for double opt-in, unsubscribe, deduplication and threshold triggering.
- [ ] Implement email alert outbox and monthly report generation from immutable snapshots.
- [ ] Commit `feat: add alerts and monthly reliability reports`.

### Task 17: Agent Doctor acquisition page

**Files:** `src/app/agent-doctor/page.tsx`, `src/lib/github/releases.ts`, `tests/e2e/agent-doctor.spec.ts`

- [ ] Write failing tests requiring the official `18534516725/Agent-Doctor` source and release links.
- [ ] Implement supported-platform cards, checksum guidance, privacy distinction between local Doctor and web test, and version freshness handling.
- [ ] Commit `feat: integrate Agent Doctor downloads`.

### Task 18: SEO, GEO and policy surface

**Files:** `src/lib/seo/*`, `src/app/sitemap.ts`, `robots.ts`, `feed.xml/route.ts`, `llms.txt/route.ts`, `src/app/methodology/page.tsx`, policy pages, `tests/unit/seo.test.ts`

- [ ] Write failing tests for unique metadata, canonical, hreflang, visible-text-matching JSON-LD, sitemap inclusion rules and noindex behavior.
- [ ] Implement bilingual public routes, internal links, Dataset downloads, Organization/SoftwareApplication/Breadcrumb schemas and IndexNow notifications.
- [ ] Publish privacy, terms, methodology, corrections, sponsorship and API/data-license pages.
- [ ] Commit `feat: complete Radar discovery and governance`.

### Task 19: Production packaging

**Files:** `Dockerfile`, `docker-compose.production.yml`, `deploy/nginx-radar.conf`, `deploy/install.sh`, `deploy/healthcheck.sh`, `.env.example`, `.github/workflows/ci.yml`, `tests/deploy/config.test.ts`

- [ ] Write failing tests for secret-free committed config, service isolation, health checks and no restart of payment platform services.
- [ ] Build one image with `web` and `worker` commands and a Compose project containing only those services.
- [ ] Add CI for frozen pnpm install, lint, typecheck, unit/integration/security tests, build and Playwright.
- [ ] Commit `chore: package Radar for isolated production deployment`.

### Task 20: Verification, migration approval and deployment

**Files:** `docs/deployment/runbook.md`, `docs/test-reports/release-*.md`

- [ ] Run `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`, migration dry-run and Docker build.
- [ ] Scan tracked files and rendered errors for credentials and internal infrastructure disclosures.
- [ ] Present the exact migration SQL and wait for explicit database execution approval.
- [ ] Create/push `18534516725/NexoToken-Radar` main without force.
- [ ] On the server, verify clean target repository, pull with `--ff-only`, apply the approved migration, build and update only Radar services.
- [ ] Install the Nginx virtual host and TLS for `radar.nexotoken.net` after DNS resolves.
- [ ] Verify public pages, Doctor safety controls, worker heartbeat, database health, sitemap, structured data and unchanged payment-platform containers.
- [ ] Record commit SHA, migration checksum, container IDs, health results and remaining risks.

