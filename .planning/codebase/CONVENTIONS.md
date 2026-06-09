# Coding Conventions

**Analysis Date:** 2026-06-09

## Naming Patterns

**Files:**
- TypeScript source files use camelCase: `src/index.ts`
- Skill documents use kebab-case matching the skill name: `skills/marketing-icp-author/SKILL.md`, `skills/marketing-icp-matcher/SKILL.md`
- Skill directories use kebab-case: `skills/marketing-icp-author/`, `skills/marketing-icp-matcher/`
- Config files follow tool convention: `tsconfig.json`, `package.json`, `.npmrc`

**Exported Constants:**
- Use camelCase: `marketingIcpArtifactManifest` (see `src/index.ts`)

**Types:**
- Type imports use `import type { ... }` (verbatimModuleSyntax enforced via tsconfig)

## Code Style

**Formatting:**
- No Prettier or ESLint config detected in this repo. Formatting is deferred to the monorepo (this is a source-mirror repo).

**TypeScript:**
- Strict mode enabled (`strict: true` in `tsconfig.json`)
- `noImplicitAny: false` — implicit `any` is allowed as an escape hatch despite strict mode
- `verbatimModuleSyntax: true` — all type-only imports MUST use `import type`
- `isolatedModules: true` — each file must be independently compilable
- Target: ES2023, module: ESNext, moduleResolution: bundler

**Module System:**
- ESM (`"type": "module"` in `package.json`)
- No CommonJS; use `.js` extensions are not required (bundler resolution)

## Import Organization

**Order (observed in `src/index.ts`):**
1. Type imports from external packages (`import type { ... } from "@cinatra-ai/sdk-extensions"`)
2. No internal cross-file imports (single-file repo)

**Path Aliases:**
- Not detected; no path aliases configured in `tsconfig.json`

## Error Handling

**Patterns:**
- Not applicable at the TypeScript layer — `src/index.ts` is a manifest export only (no runtime logic, no error paths)
- Error-handling conventions are documented in skill prose: `skills/marketing-icp-author/SKILL.md` defines a named error-reason enum (`extension-not-found`, `mime-not-accepted`, `content-too-large`, `cycle`, `depth-cap-exceeded`, `parent-not-found`) that the authoring skill must handle explicitly

## Logging

**Framework:** Not applicable — no runtime code in this repo.

**Patterns:**
- Not applicable

## Comments

**When to Comment:**
- Module-level block comments explain architectural decisions and intentional omissions (see `src/index.ts` lines 3–23)
- Comments follow the pattern: "Why no X:" to document intentional absences
- Package-level comments in CI YAML (`ci.yml`) are extensive — every job step is explained

**JSDoc/TSDoc:**
- Not used; the single export is self-documenting via TypeScript type

## Function Design

**Size:** Not applicable — repo exports a single typed constant, no functions.

**Parameters:** Not applicable.

**Return Values:** Not applicable.

## Module Design

**Exports:**
- Single named export per entry point: `export const marketingIcpArtifactManifest` from `src/index.ts`
- No default exports
- `package.json` `main` and `types` both point to `./src/index.ts` (source-mirror pattern; monorepo resolves at build time)

**Barrel Files:**
- `src/index.ts` acts as the sole barrel/entry point

## Skill Document Conventions

**SKILL.md format:**
- YAML front-matter with `name` and `description` fields
- `##` headings for sections
- `-` for bullet lists
- Output contracts specified as fenced JSON blocks
- Explicit "What NOT to do" sections for guard rails
- No HTML, no tables-as-prose in ICP content (enforced in authoring skill)
- Front-matter is FORBIDDEN in artifact content (ICPs are content-only)

## Package Shape Rules

**Dependency constraints (enforced by CI):**
- First-party `@cinatra-ai/*` packages MUST be declared as optional `peerDependencies` only
- They MUST NOT appear in `dependencies`, `devDependencies`, or `optionalDependencies`
- All first-party peers MUST have `peerDependenciesMeta[pkg].optional: true`
- Violation causes CI to fail with exit code 2 (see `.github/workflows/ci.yml`)

---

*Convention analysis: 2026-06-09*
