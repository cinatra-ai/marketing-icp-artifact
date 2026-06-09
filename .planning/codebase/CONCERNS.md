# Codebase Concerns

**Analysis Date:** 2026-06-09

## Tech Debt

**Source mirror cannot be typechecked or tested standalone:**
- Issue: `src/index.ts` imports `@cinatra-ai/sdk-extensions` which is declared as an optional peer dependency only. The package is not published to any public registry and resolves only inside the cinatra monorepo. CI explicitly skips install, typecheck, and test for this reason.
- Files: `src/index.ts`, `package.json`, `.github/workflows/ci.yml`
- Impact: Type regressions in `src/index.ts` (e.g., changes to `SemanticArtifactManifest`) are invisible until the monorepo runs its own typecheck. The extracted repo provides no safety net on its own.
- Fix approach: Either publish a minimal `@cinatra-ai/sdk-extensions` stub to a scoped registry that CI can reach, or restructure `src/index.ts` to inline the type locally so the file is self-contained and typecheckable without the peer.

**Manifest duplication between `package.json` and `src/index.ts`:**
- Issue: The `cinatra.artifact` block in `package.json` and the `marketingIcpArtifactManifest` export in `src/index.ts` carry identical data. The comment in `src/index.ts` notes a "parity test pins the two byte-equal so they cannot drift", but no such test exists in this repo — the monorepo owns it.
- Files: `package.json`, `src/index.ts`
- Impact: Silent drift is possible if one is edited without the other, and the parity gate only runs in the monorepo context.
- Fix approach: Add a lightweight self-contained parity test (plain Node, no @cinatra-ai deps) that compares the JSON blob in `package.json` against the compiled manifest object, runnable in CI without peer resolution.

**No lockfile committed:**
- Issue: The repo ships no `pnpm-lock.yaml`. The CI install step explicitly passes `--no-frozen-lockfile`. This is intentional for source mirrors but means dependency resolution is non-deterministic for any future standalone use.
- Files: `package.json`, `.github/workflows/ci.yml`
- Impact: Low today (no deps are installed for source mirrors), but becomes a risk if the repo is ever converted to a standalone installable package.
- Fix approach: When/if the peer is made resolvable, commit a lockfile and enforce `--frozen-lockfile`.

## Known Bugs

Not detected. The codebase is minimal (one `src/index.ts` export + two SKILL.md files) with no runtime logic subject to bugs in this repo.

## Security Considerations

**`.npmrc` contains global peer install flag only:**
- Risk: `.npmrc` is committed and sets `auto-install-peers=false`. No auth tokens or registry credentials are in this file.
- Files: `.npmrc`
- Current mitigation: The committed `.npmrc` contains no secrets. However, any CI-injected `.npmrc` overlay (e.g., from `actions/setup-node` with `registry-url`) could silently override this file.
- Recommendations: Document that `NODE_AUTH_TOKEN` is never needed for this repo since no install step runs for source mirrors.

**Release workflow depends on an org secret and reusable workflow that do not yet exist:**
- Risk: `release.yml` calls `cinatra-ai/.github/.github/workflows/reusable-extension-release.yml@main` with `secrets: inherit`. If the reusable workflow or `CINATRA_MARKETPLACE_VENDOR_TOKEN` org secret is misconfigured, a release event could fail silently or expose secrets to a malicious reusable workflow update.
- Files: `.github/workflows/release.yml`
- Current mitigation: The workflow comment explicitly notes it is "dormant until the org infra exists."
- Recommendations: Pin the reusable workflow to a SHA rather than `@main` once it exists, to prevent supply-chain risk from an unreviewed update to the shared workflow.

## Performance Bottlenecks

Not applicable. This repo contains no runtime execution code — it exports a static manifest object and two SKILL.md prompt files.

## Fragile Areas

**`matcherConfidenceThreshold: 0.7` is hardcoded in two places:**
- Files: `package.json` (`cinatra.artifact.matcherConfidenceThreshold`), `src/index.ts` (`marketingIcpArtifactManifest.matcherConfidenceThreshold`)
- Why fragile: The threshold value must be kept in sync manually between the two files. The matcher SKILL.md defines confidence bands (0.50–0.69 = borderline, 0.70–0.84 = clear ICP framing) but the threshold is not referenced there — a threshold change would require updating three separate files.
- Safe modification: Change both `package.json` and `src/index.ts` together, and verify the parity test passes in the monorepo.
- Test coverage: The parity test lives in the monorepo, not here. No local test guards this value.

**Matcher skill boundary ambiguity:**
- Files: `skills/marketing-icp-matcher/SKILL.md`
- Why fragile: The skill instructs the classifier to return `matches:false` when ICP material is mixed with "substantial OTHER material," with the qualifier "the more specific type wins for the dominant content." "Dominant content" and "substantial" are not defined quantitatively, leaving the boundary fuzzy and classifier behavior inconsistent across models or prompt versions.
- Safe modification: Add quantitative guidance (e.g., "if ICP sections constitute <40% of the document by token count, return false").
- Test coverage: No evaluation harness for the matcher skill exists in this repo.

**Author skill MIME constraint is underdocumented in the manifest:**
- Files: `skills/marketing-icp-author/SKILL.md`, `src/index.ts`
- Why fragile: The author skill explains that `application/pdf` is accepted by the upload route but is NOT chat-authorable. This distinction is not captured in the manifest type (`SemanticArtifactManifest`); it relies on a server-side `authorableMimes` concept that is separate from `accepts.file.mimeTypes`. If a future author forgets this split, they may add `application/pdf` to authoring paths incorrectly.
- Safe modification: Add a comment in `src/index.ts` adjacent to the `mimeTypes` array explaining which MIMEs are upload-only vs. chat-authorable.

## Scaling Limits

Not applicable. This repo exports a static manifest and prompt content; there is no runtime service to scale.

## Dependencies at Risk

**`@cinatra-ai/sdk-extensions` is an unversioned optional peer:**
- Risk: The peer is declared as `"*"` (any version). If the monorepo bumps `SemanticArtifactManifest` in a breaking way, `src/index.ts` will silently fail to typecheck until the monorepo catches it.
- Impact: Breaking changes to the SDK type are invisible in this repo's CI.
- Migration plan: Pin to a minimum version (e.g., `">=0.x.y"`) and update the constraint when the SDK stabilizes.

## Missing Critical Features

**No local test for manifest parity:**
- Problem: The comment in `src/index.ts` says "the pack's parity test pins the two byte-equal so they cannot drift" but that test does not exist in this repo.
- Blocks: Confidence that `package.json` and `src/index.ts` stay in sync when edited outside the monorepo context.

**No matcher evaluation harness:**
- Problem: The matcher SKILL.md defines a JSON output contract and confidence bands but there are no fixture documents or golden-output tests to validate classifier behavior.
- Blocks: Regression detection when the skill prompt is edited (e.g., adding/removing boundary examples changes classifier behavior silently).

## Test Coverage Gaps

**All test coverage deferred to monorepo:**
- What's not tested: Manifest parity, TypeScript types, matcher output contract, author emit flow.
- Files: `src/index.ts`, `skills/marketing-icp-matcher/SKILL.md`, `skills/marketing-icp-author/SKILL.md`
- Risk: Changes to any file in this repo are untested locally. Regressions surface only when the monorepo runs its full suite.
- Priority: Medium — the repo is content-light today, but as skills evolve the lack of any local gate increases the risk of silent regressions.

---

*Concerns audit: 2026-06-09*
