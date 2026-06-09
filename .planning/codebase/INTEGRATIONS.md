# External Integrations

**Analysis Date:** 2026-06-09

## APIs & External Services

**Cinatra Platform (internal):**
- Cinatra AI SDK Extensions - provides the `SemanticArtifactManifest` runtime contract
  - SDK/Client: `@cinatra-ai/sdk-extensions` (optional peer, resolved in Cinatra monorepo)
  - Auth: Managed by the Cinatra platform host; not configured in this package

**Cinatra Marketplace:**
- Extension submission via MCP proxy (`extension-submit-for-review` → approve → promotion saga)
  - Auth: `CINATRA_MARKETPLACE_VENDOR_TOKEN` org secret (GitHub Actions)
  - Publish target: `registry.cinatra.ai`
  - Workflow: `.github/workflows/release.yml` delegates to `cinatra-ai/.github/.github/workflows/reusable-extension-release.yml@main`

**Cinatra Agent Integrations (declared in SKILL.md):**
- `web-scrape-agent` - optionally dispatched by the `marketing-icp-author` skill to fetch company website context when authoring an ICP; requires explicit user consent before dispatch
- `artifact_extension_search` / `artifact_extension_get` / `artifact_authoring_emit` - Cinatra platform tool calls invoked by the authoring skill to classify, retrieve, and emit the artifact

## Data Storage

**Databases:**
- Not applicable - this package defines an artifact type and its skills; it has no direct database access

**File Storage:**
- Artifact content (ICP markdown) is stored by the Cinatra platform after `artifact_authoring_emit` is called
- Accepted file upload MIMEs: `text/markdown`, `text/plain`, `application/pdf`

**Caching:**
- Not applicable

## Authentication & Identity

**Auth Provider:**
- Cinatra platform host - authentication is handled entirely by the Cinatra workspace runtime; this artifact extension declares no auth logic

## Monitoring & Observability

**Error Tracking:**
- Not detected - no error-tracking SDK integrated

**Logs:**
- Not applicable at this package level; logging is handled by the Cinatra platform runtime

## CI/CD & Deployment

**Hosting:**
- `registry.cinatra.ai` - Cinatra Marketplace extension registry

**CI Pipeline:**
- GitHub Actions
  - `.github/workflows/ci.yml` - runs on push/PR to `main`; validates package shape, skips standalone install/typecheck/test for source-mirror repos (those with `@cinatra-ai/*` optional peers); runs `npm pack --dry-run` for shape validation
  - `.github/workflows/release.yml` - triggers on GitHub Release publish or manual `workflow_dispatch`; delegates all build/pack/gate/submit logic to the org-level reusable workflow

**Build Provenance:**
- GitHub OIDC id-token used for build-provenance attestation during release (`id-token: write`, `attestations: write` permissions)

## Environment Configuration

**Required env vars:**
- None required by the package itself at runtime
- CI/release requires `CINATRA_MARKETPLACE_VENDOR_TOKEN` org secret (GitHub Actions, inherited via `secrets: inherit`)

**Secrets location:**
- GitHub Actions org secrets (`cinatra-ai` org level)

## Webhooks & Callbacks

**Incoming:**
- Not applicable - no webhook endpoints defined in this package

**Outgoing:**
- `artifact_authoring_emit` tool call - emits the authored ICP artifact to the Cinatra platform upon completion (called by the `marketing-icp-author` skill)
- `web-scrape-agent` dispatch - outgoing agent call to fetch website content for grounding (user-consent required, declared in `skills/marketing-icp-author/SKILL.md`)

## Artifact Manifest

The package declares a `cinatra.artifact` manifest block in `package.json` (mirrored as a typed export in `src/index.ts`):
- `accepts.file.mimeTypes`: `text/markdown`, `text/plain`, `application/pdf`
- `skills.authoring`: `@cinatra-ai/marketing-icp-artifact:marketing-icp-author`
- `skills.matchers`: `@cinatra-ai/marketing-icp-artifact:marketing-icp-matcher`
- `matcherConfidenceThreshold`: 0.7

---

*Integration audit: 2026-06-09*
