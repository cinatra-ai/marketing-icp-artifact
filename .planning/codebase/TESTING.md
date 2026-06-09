# Testing Patterns

**Analysis Date:** 2026-06-09

## Test Framework

**Runner:**
- Not detected — no test framework is installed or configured in this repo
- No `jest.config.*`, `vitest.config.*`, or equivalent found
- No `test` script in `package.json`

**Assertion Library:**
- Not applicable

**Run Commands:**
```bash
# No test script defined in package.json
# CI uses: corepack pnpm test --if-present  (which is a no-op for this repo)
```

## Why Tests Are Absent

This is a **source-mirror repo** — a Cinatra artifact extension that declares `@cinatra-ai/sdk-extensions` as an optional peer dependency. Per the CI contract in `.github/workflows/ci.yml`:

> "Host-internal @cinatra-ai/* peers can't run their tests standalone (the tests import @cinatra-ai/* sources that resolve only in the monorepo); the monorepo runs them."

The CI `Test` step explicitly skips when `first_party=1` (any `@cinatra-ai/*` optional peer is present). All integration and unit tests live in the Cinatra monorepo, not here.

## What CI Does Validate

CI (`ci.yml`) runs these checks as a substitute for unit tests:

1. **Dependency shape gate** — inline `node -e` script validates `package.json` structure:
   - First-party packages not leaked into `dependencies`/`devDependencies`
   - All first-party peers marked `peerDependenciesMeta.optional: true`

2. **Typecheck** — skipped for this repo (first-party peer present); done in monorepo

3. **Pack dry-run** — `npm pack --dry-run` validates package shape and publish payload without resolving peers

4. **Kind-specific gate** — for `artifact` kind, no additional gate is applied (placeholder step confirms this)

## Test File Organization

**Location:** No test files exist in this repo.

**Naming:** Not applicable.

## Mocking

**Framework:** Not applicable.

**Patterns:** Not applicable.

## Fixtures and Factories

**Test Data:** Not applicable.

**Location:** Not applicable.

## Coverage

**Requirements:** Not enforced in this repo (deferred to monorepo).

**View Coverage:** Not applicable.

## Test Types

**Unit Tests:** None in this repo; run by the Cinatra monorepo.

**Integration Tests:** None in this repo; run by the Cinatra monorepo.

**E2E Tests:** Not used in this repo.

## Parity Contract (Manifest Mirroring)

The source comment in `src/index.ts` documents an important correctness invariant:

> "The manifest is mirrored in package.json `cinatra.artifact`; this typed export is the developer-ergonomic source of truth that `parseSemanticArtifactManifest` accepts. The pack's parity test pins the two byte-equal so they cannot drift."

This **parity test** is owned by the monorepo and verifies that `src/index.ts` `marketingIcpArtifactManifest` and `package.json` `cinatra.artifact` stay in sync. When making changes, both locations must be updated together.

## What to Test When Adding Logic

If this repo ever gains standalone TypeScript logic (no first-party peer dependency):

- CI will automatically run `corepack pnpm test --if-present` (already wired)
- Add a `test` script to `package.json`
- Choose Vitest (preferred for ESM/bundler-resolution projects) or Jest with ESM config
- Place test files co-located as `src/*.test.ts` or in `src/__tests__/`
- No mocking framework needed for manifest-shape assertions; use plain `assert` or `expect`

---

*Testing analysis: 2026-06-09*
