# Technology Stack

**Analysis Date:** 2026-06-09

## Languages

**Primary:**
- TypeScript (ES2023 target) - `src/index.ts`, `tsconfig.json`

**Secondary:**
- YAML - GitHub Actions workflow definitions in `.github/workflows/`
- Markdown - Skill definitions in `skills/*/SKILL.md`, `README.md`

## Runtime

**Environment:**
- Node.js 24 (as declared in `.github/workflows/ci.yml` `node-version: "24"`)

**Package Manager:**
- pnpm (via corepack) - used in CI steps (`corepack pnpm install`)
- Lockfile: Not committed (CI uses `--no-frozen-lockfile`)

## Frameworks

**Core:**
- Cinatra AI SDK - `@cinatra-ai/sdk-extensions` (optional peer dependency) - provides `SemanticArtifactManifest` type and the artifact extension runtime contract

**Testing:**
- Not applicable - no test runner configured; tests run within the Cinatra monorepo context

**Build/Dev:**
- TypeScript compiler (`tsc`) - transpiles `src/` to `dist/` per `tsconfig.json`
- npm pack - used in CI for dry-run package shape validation

## Key Dependencies

**Critical:**
- `@cinatra-ai/sdk-extensions` - provides `SemanticArtifactManifest` type imported in `src/index.ts`; declared as an optional peerDependency (resolved only inside the Cinatra monorepo, never published to an external registry)

**Infrastructure:**
- None - zero runtime or devDependencies declared in `package.json`

## Configuration

**Environment:**
- No `.env` files detected
- No runtime environment variables required by this package itself; environment config is managed by the Cinatra platform host

**Build:**
- `tsconfig.json` - standalone strict TypeScript config; targets ES2023, ESNext modules, bundler module resolution, outputs to `dist/`, sources from `src/`
- `.npmrc` - present (existence noted; contents not read)
- `package.json` - defines the `cinatra` extension manifest block alongside standard npm fields

## TypeScript Configuration Details

- `target`: ES2023
- `module`: ESNext
- `moduleResolution`: bundler
- `jsx`: react-jsx
- `strict`: true, `noImplicitAny`: false
- `isolatedModules`: true
- `verbatimModuleSyntax`: true
- Output: `dist/` (with declarations + declaration maps + source maps)

## Platform Requirements

**Development:**
- Node.js 24+, corepack/pnpm
- Must be installed inside the Cinatra monorepo workspace for full typecheck and test; standalone install is not supported due to unpublished `@cinatra-ai/*` peer dependencies

**Production:**
- Published to `registry.cinatra.ai` via the Cinatra Marketplace submission pipeline (not npm/Verdaccio)
- Release triggered by GitHub Release tags matching `v<package.json.version>`

---

*Stack analysis: 2026-06-09*
