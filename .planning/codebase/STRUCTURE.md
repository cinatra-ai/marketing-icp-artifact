# Codebase Structure

**Analysis Date:** 2026-06-09

## Directory Layout

```
marketing-icp-artifact/
├── src/
│   └── index.ts              # Typed SemanticArtifactManifest export (sole TS source)
├── skills/
│   ├── marketing-icp-author/
│   │   └── SKILL.md          # LLM authoring skill prompt
│   └── marketing-icp-matcher/
│       └── SKILL.md          # LLM matcher/classifier skill prompt
├── .github/
│   └── workflows/
│       ├── ci.yml            # Build, typecheck, pack dry-run + kind gate
│       └── release.yml       # Release workflow
├── .planning/
│   └── codebase/             # GSD codebase map documents
├── package.json              # npm manifest + cinatra.artifact block (JSON manifest mirror)
├── tsconfig.json             # Standalone TypeScript config (targets src/, emits to dist/)
├── .npmrc                    # npm registry config (existence noted; contents not read)
├── LICENSE                   # Apache-2.0
└── README.md                 # Extension documentation
```

## Directory Purposes

**`src/`:**
- Purpose: TypeScript source — the single typed export of the artifact manifest.
- Contains: One file, `index.ts`, exporting `marketingIcpArtifactManifest`.
- Key files: `src/index.ts`

**`skills/`:**
- Purpose: LLM skill prompt files consumed by the Cinatra host platform.
- Contains: One subdirectory per skill, each containing a `SKILL.md`.
- Key files: `skills/marketing-icp-author/SKILL.md`, `skills/marketing-icp-matcher/SKILL.md`

**`skills/marketing-icp-author/`:**
- Purpose: Authoring skill — instructs the LLM how to gather inputs, compose ICP markdown, and emit via `artifact_authoring_emit`.
- Contains: `SKILL.md` only.

**`skills/marketing-icp-matcher/`:**
- Purpose: Matcher/classifier skill — instructs the LLM to return `{matches, confidence, rationale}` JSON for a candidate file.
- Contains: `SKILL.md` only.

**`.github/workflows/`:**
- Purpose: CI/CD automation. `ci.yml` validates dependency shape, typechecks (skipped for source mirrors), packs dry-run, and runs kind gates. `release.yml` handles publishing.
- Contains: `ci.yml`, `release.yml`.

**`.planning/codebase/`:**
- Purpose: GSD codebase map documents produced by `/gsd-map-codebase`.
- Generated: Yes (by tooling).
- Committed: Yes.

## Key File Locations

**Entry Points:**
- `src/index.ts`: Typed manifest export; consumed by Cinatra host's extension registry.
- `package.json` (`cinatra.artifact` key): JSON manifest mirror; consumed by Cinatra extension loader.

**Configuration:**
- `tsconfig.json`: TypeScript compiler config — standalone, targets `ES2023`, `ESNext` modules, emits to `dist/`, roots at `src/`.
- `package.json`: npm manifest, peer dependency declarations, Cinatra extension metadata.
- `.npmrc`: npm registry configuration (existence noted; contents not read).

**Core Logic:**
- `src/index.ts`: Sole TypeScript source. Declares accepted MIME types, skill references, and confidence threshold.
- `skills/marketing-icp-author/SKILL.md`: Authoring skill prompt with input contract, output schema, emit API call, and error catalog.
- `skills/marketing-icp-matcher/SKILL.md`: Classifier skill prompt with IS/IS-NOT taxonomy, confidence bands, and JSON output contract.

**CI/CD:**
- `.github/workflows/ci.yml`: Enforces first-party dependency shape, conditionally typechecks and tests, runs `npm pack --dry-run`, and invokes kind gates.
- `.github/workflows/release.yml`: Release automation.

## Naming Conventions

**Files:**
- Skill prompts: `SKILL.md` (uppercase) — one per skill directory.
- TypeScript source: `index.ts` (lowercase, kebab-case for directories).
- Skill directories: `<artifact-name>-<role>` pattern, e.g., `marketing-icp-author`, `marketing-icp-matcher`.

**Directories:**
- Skill directories: kebab-case, named `<domain>-<artifact>-<role>`.
- Source: `src/` (standard).
- Skills: `skills/` (Cinatra convention for LLM prompt files).

## Where to Add New Code

**New accepted MIME type:**
- Update `accepts.file.mimeTypes` array in both `src/index.ts` and `package.json` `cinatra.artifact.accepts.file.mimeTypes`. Keep both in sync (monorepo parity test will catch drift).

**New skill (e.g., a summarizer):**
- Create `skills/marketing-icp-<role>/SKILL.md`.
- Add the skill reference to the appropriate key (`authoring`, `matchers`, or a new key) in `src/index.ts` `skills` block and the matching `package.json` `cinatra.artifact.skills` block.

**New TypeScript utility:**
- Add under `src/` (e.g., `src/utils.ts`). The existing `tsconfig.json` already includes `src/**/*.ts`.

**Tests (if added to the monorepo):**
- Tests for this extension are owned by the host monorepo (standalone tests are skipped in CI for source mirrors). If a test runner is added here, place tests in a `test/` or `src/__tests__/` directory and add a `"test"` script to `package.json`.

## Special Directories

**`dist/`:**
- Purpose: TypeScript compiler output (`outDir` in `tsconfig.json`).
- Generated: Yes (by `tsc`).
- Committed: No (not tracked in the source mirror).

**`.planning/`:**
- Purpose: GSD planning and codebase map artifacts.
- Generated: Yes (by GSD tooling).
- Committed: Yes.

---

*Structure analysis: 2026-06-09*
